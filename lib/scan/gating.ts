import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { ScanType, ScanGateReason } from './types'

// Free tier limits
const LIMITS = {
  fridge: { count: 3, period: 'week' as const },
  menu: { count: 3, period: 'month' as const },
  food: null, // unlimited
}

function getWindowStart(period: 'week' | 'month'): string {
  const now = new Date()
  if (period === 'week') {
    const day = now.getDay() // 0 = Sunday
    const diff = now.getDate() - day
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString()
  } else {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    firstOfMonth.setHours(0, 0, 0, 0)
    return firstOfMonth.toISOString()
  }
}

function gateReasonFor(type: ScanType): ScanGateReason {
  return type === 'fridge' ? 'fridge_weekly_limit' : 'menu_monthly_limit'
}

/**
 * Check if the user is within their scan usage limit.
 * If within limit, increment the counter and return null (allowed).
 * If over limit, return the gate reason without incrementing.
 *
 * NOTE: For Plus users, all limits are bypassed (pass isPlusMember=true).
 */
export async function checkAndIncrementScanUsage(
  userId: string,
  type: ScanType,
  isPlusMember = false
): Promise<ScanGateReason> {
  // Plus members have no limits
  if (isPlusMember) return null

  const limit = LIMITS[type]
  // Food scans are unlimited for everyone
  if (!limit) return null

  const supabase = createSupabaseServiceClient()
  const windowStart = getWindowStart(limit.period)

  // Count existing scans in the current window
  const { count, error: countError } = await supabase
    .from('scan_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('scan_type', type)
    .gte('created_at', windowStart)

  if (countError) {
    console.error('[scan/gating] count error:', countError)
    return gateReasonFor(type)
  }

  const used = count ?? 0

  if (used >= limit.count) {
    return gateReasonFor(type)
  }

  // Increment usage
  const { error: insertError } = await supabase.from('scan_usage').insert({
    user_id: userId,
    scan_type: type,
  })

  if (insertError) {
    console.error('[scan/gating] insert error:', insertError)
    return gateReasonFor(type)
  }

  return null
}
