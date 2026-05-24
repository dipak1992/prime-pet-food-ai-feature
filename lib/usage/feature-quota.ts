import type { createClient } from '@/lib/supabase/server'
import { apiError } from '@/lib/api-response'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type FeatureQuota = {
  key: string
  limit: number
  label: string
}

export async function enforceFeatureQuota(
  supabase: SupabaseClient,
  userId: string,
  quota: FeatureQuota,
) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('feature_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature_key', quota.key)
    .eq('usage_date', today)
    .maybeSingle()

  if (error) {
    console.error('[feature-quota] read failed:', error)
    return apiError('Usage quota unavailable. Please try again later.', 503)
  }

  const used = (data?.usage_count as number | undefined) ?? 0
  if (used >= quota.limit) {
    return apiError(`Daily ${quota.label} limit (${quota.limit}) reached. Try again tomorrow.`, 429)
  }

  return null
}

export async function incrementFeatureQuota(supabase: SupabaseClient, quota: FeatureQuota) {
  const { error } = await supabase.rpc('increment_feature_usage', {
    p_feature_key: quota.key,
  })

  if (error) {
    console.error('[feature-quota] increment failed:', error)
  }
}
