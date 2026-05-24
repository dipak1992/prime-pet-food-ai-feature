import type { User } from '@supabase/supabase-js'
import type { SubscriptionTier } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import {
  FREE_PLAN_PREVIEW_DAYS,
  FREE_TONIGHT_SWIPE_LIMIT,
  FREE_DAILY_GENERATIONS,
  isProTier,
  normalizeTier,
} from '@/lib/paywall/config'
export interface PaywallStatus {
  isAuthenticated: boolean
  tier: SubscriptionTier
  isPro: boolean
  isTempPro: boolean
  effectivePlanPreviewDays: number
  freePlanPreviewDays: number
  freeTonightSwipeLimit: number
  freeDailyGenerations: number
  bonusDays: number
  tempProUntil: string | null
}

async function ensureProfile(user: User): Promise<{
  tier: SubscriptionTier
  bonusDays: number
  tempProUntil: string | null
}> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier, plan, bonus_days, temp_pro_until')
    .eq('id', user.id)
    .maybeSingle()

  if (data?.subscription_tier || data?.plan) {
    const tier = normalizeTier(data.subscription_tier) === 'pro'
      ? 'pro'
      : normalizeTier(data.plan)
    return {
      tier,
      bonusDays: data.bonus_days ?? 0,
      tempProUntil: data.temp_pro_until ?? null,
    }
  }

  const fallbackTier: SubscriptionTier = 'free'
  const serviceClient = createSupabaseServiceClient()
  await serviceClient.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      subscription_tier: fallbackTier,
    },
    { onConflict: 'id' },
  )

  return { tier: fallbackTier, bonusDays: 0, tempProUntil: null }
}

export async function getPaywallStatus(): Promise<PaywallStatus> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      isAuthenticated: false,
      tier: 'free',
      isPro: false,
      isTempPro: false,
      effectivePlanPreviewDays: FREE_PLAN_PREVIEW_DAYS,
      freePlanPreviewDays: FREE_PLAN_PREVIEW_DAYS,
      freeTonightSwipeLimit: FREE_TONIGHT_SWIPE_LIMIT,
      freeDailyGenerations: FREE_DAILY_GENERATIONS,
      bonusDays: 0,
      tempProUntil: null,
    }
  }

  const { tier, bonusDays, tempProUntil } = await ensureProfile(user)

  const isTempPro = !!tempProUntil && new Date(tempProUntil) > new Date()
  const isPro = isProTier(tier) || isTempPro
  const effectivePlanPreviewDays = isPro
    ? 7
    : Math.min(FREE_PLAN_PREVIEW_DAYS + bonusDays, 7)

  return {
    isAuthenticated: true,
    tier,
    isPro,
    isTempPro,
    effectivePlanPreviewDays,
    freePlanPreviewDays: FREE_PLAN_PREVIEW_DAYS,
    freeTonightSwipeLimit: FREE_TONIGHT_SWIPE_LIMIT,
    freeDailyGenerations: FREE_DAILY_GENERATIONS,
    bonusDays,
    tempProUntil,
  }
}

export async function requireProStatus(): Promise<PaywallStatus> {
  return getPaywallStatus()
}
