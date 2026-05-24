'use client'

import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { CopilotSheet } from './CopilotSheet'
import { CopilotTrigger } from './CopilotTrigger'

/**
 * Copilot wrapper.
 * Free users get basic reactive Copilot; Plus unlocks voice, nudges,
 * memory, plan refinements, budget swaps, and grocery actions.
 */
export function Copilot() {
  const { status, loading } = usePaywallStatus()

  // Don't render anything while loading or if not authenticated
  if (loading || !status.isAuthenticated) return null

  return (
    <>
      <CopilotTrigger />
      <CopilotSheet isPlus={status.isPro} />
    </>
  )
}
