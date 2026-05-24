import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import {
  REFERRAL_BONUS_DAYS_PER_INVITE,
  REFERRAL_MAX_BONUS_DAYS,
  REFERRAL_TEMP_PRO_THRESHOLD,
  REFERRAL_TEMP_PRO_DAYS,
} from '@/lib/referral/config'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface ReferralStats {
  code: string | null
  totalReferrals: number
  bonusDays: number
  tempProUntil: string | null
  isTempPro: boolean
  nextTempProIn: number   // referrals still needed for next Temp Pro grant
}

// ----------------------------------------------------------------
// Code generation
// ----------------------------------------------------------------

function generateCode(): string {
  // 8-char uppercase alphanumeric, no ambiguous chars (0,O,1,I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => chars[b % chars.length]).join('')
}

// ----------------------------------------------------------------
// Get or create a referral code for the current user
// ----------------------------------------------------------------

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.referral_code) return profile.referral_code

  // Keep trying until we land a unique code
  let code: string | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode()
    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: candidate })
      .eq('id', userId)
    if (!error) { code = candidate; break }
  }

  return code ?? userId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

// ----------------------------------------------------------------
// Referral stats for the current user
// ----------------------------------------------------------------

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, bonus_days, temp_pro_until')
    .eq('id', userId)
    .maybeSingle()

  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)

  const totalReferrals = count ?? 0
  const tempProUntil: string | null = profile?.temp_pro_until ?? null
  const isTempPro = !!tempProUntil && new Date(tempProUntil) > new Date()

  // How many more referrals until the next Temp Pro milestone?
  const positionInCycle = totalReferrals % REFERRAL_TEMP_PRO_THRESHOLD
  const nextTempProIn = positionInCycle === 0 && totalReferrals > 0
    ? REFERRAL_TEMP_PRO_THRESHOLD
    : REFERRAL_TEMP_PRO_THRESHOLD - positionInCycle

  return {
    code: profile?.referral_code ?? null,
    totalReferrals,
    bonusDays: profile?.bonus_days ?? 0,
    tempProUntil,
    isTempPro,
    nextTempProIn,
  }
}

// ----------------------------------------------------------------
// Apply a referral code when a new user signs up
// ----------------------------------------------------------------

export interface ApplyReferralResult {
  ok: boolean
  error?: string
  bonusDaysGranted?: number
  tempProGranted?: boolean
}

export async function applyReferralCode(
  code: string,
  refereeId: string,
): Promise<ApplyReferralResult> {
  const supabase = await createClient()

  // Find the referrer by code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, bonus_days, temp_pro_until')
    .eq('referral_code', code.toUpperCase().trim())
    .maybeSingle()

  if (!referrer) return { ok: false, error: 'Invalid referral code.' }
  if (referrer.id === refereeId) return { ok: false, error: 'Cannot refer yourself.' }

  // Check the referee hasn't already used a code
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referee_id', refereeId)
    .maybeSingle()

  if (existing) return { ok: false, error: 'Referral already applied.' }

  // Record the referral
  const { error: insertError } = await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referee_id: refereeId,
    code: code.toUpperCase().trim(),
    status: 'completed',
  })

  if (insertError) return { ok: false, error: insertError.message }

  // Count total completed referrals for the referrer (including this new one)
  const { count: totalAfter } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', referrer.id)

  const total = totalAfter ?? 1
  let bonusDaysGranted = 0
  let tempProGranted = false

  // Grant +1 bonus day (up to max)
  const currentBonusDays = referrer.bonus_days ?? 0
  if (currentBonusDays < REFERRAL_MAX_BONUS_DAYS) {
    bonusDaysGranted = REFERRAL_BONUS_DAYS_PER_INVITE
  }

  // Grant Temp Pro on each REFERRAL_TEMP_PRO_THRESHOLD milestone
  let newTempProUntil: Date | null = null
  if (total % REFERRAL_TEMP_PRO_THRESHOLD === 0) {
    const base = referrer.temp_pro_until
      ? Math.max(new Date(referrer.temp_pro_until).getTime(), Date.now())
      : Date.now()
    newTempProUntil = new Date(base + REFERRAL_TEMP_PRO_DAYS * 24 * 60 * 60 * 1000)
    tempProGranted = true
  }

  // Update referrer profile
  const updates: Record<string, unknown> = {}
  if (bonusDaysGranted > 0) {
    updates.bonus_days = currentBonusDays + bonusDaysGranted
  }
  if (newTempProUntil) {
    updates.temp_pro_until = newTempProUntil.toISOString()
  }

  if (Object.keys(updates).length > 0) {
    const serviceClient = createSupabaseServiceClient()
    await serviceClient.from('profiles').update(updates).eq('id', referrer.id)
  }

  return { ok: true, bonusDaysGranted, tempProGranted }
}
