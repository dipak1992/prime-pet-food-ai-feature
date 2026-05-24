import type { createClient } from '@/lib/supabase/server'
import { FREE_TONIGHT_SWIPE_LIMIT, normalizeTier } from '@/lib/paywall/config'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const TONIGHT_SWAP_FEATURE_KEY = 'tonight_meal_swap'

export async function isTonightSwapUnlimited(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, plan, temp_pro_until')
    .eq('id', userId)
    .maybeSingle()

  const tier = normalizeTier(profile?.subscription_tier) === 'pro'
    ? 'pro'
    : normalizeTier(profile?.plan)
  const isTempPro = !!profile?.temp_pro_until && new Date(profile.temp_pro_until) > new Date()

  return tier === 'pro' || isTempPro
}

export async function enforceTonightSwapQuota(supabase: SupabaseClient, userId: string) {
  if (await isTonightSwapUnlimited(supabase, userId)) return null

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('feature_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature_key', TONIGHT_SWAP_FEATURE_KEY)
    .eq('usage_date', today)
    .maybeSingle()

  if (error) {
    return Response.json(
      { success: false, error: 'Tonight swap quota unavailable. Please try again.' },
      { status: 503 },
    )
  }

  const used = data?.usage_count ?? 0
  if (used >= FREE_TONIGHT_SWIPE_LIMIT) {
    return Response.json(
      {
        success: false,
        error: `Free Tonight swap limit reached (${FREE_TONIGHT_SWIPE_LIMIT}/day). Upgrade for unlimited Tonight meal ideas.`,
        code: 'tonight_swap_quota_exceeded',
        quota: {
          used,
          limit: FREE_TONIGHT_SWIPE_LIMIT,
          period: 'day',
          feature: TONIGHT_SWAP_FEATURE_KEY,
        },
      },
      { status: 402 },
    )
  }

  return null
}

export async function incrementTonightSwapQuota(supabase: SupabaseClient) {
  await supabase.rpc('increment_feature_usage', {
    p_feature_key: TONIGHT_SWAP_FEATURE_KEY,
  })
}
