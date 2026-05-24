'use client'

import { useEffect, useState } from 'react'
import type { SubscriptionTier } from '@/types'
import { FREE_PLAN_PREVIEW_DAYS, FREE_TONIGHT_SWIPE_LIMIT, FREE_DAILY_GENERATIONS } from '@/lib/paywall/config'

export interface ClientPaywallStatus {
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

const DEFAULT_STATUS: ClientPaywallStatus = {
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

export function usePaywallStatus() {
  const [status, setStatus] = useState<ClientPaywallStatus>(DEFAULT_STATUS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/api/paywall/status', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load paywall status')
        return response.json() as Promise<ClientPaywallStatus>
      })
      .then((nextStatus) => {
        if (active) setStatus(nextStatus)
      })
      .catch(() => {
        if (active) setStatus(DEFAULT_STATUS)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { status, loading }
}
