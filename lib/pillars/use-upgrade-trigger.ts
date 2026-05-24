'use client'

import { useMemo } from 'react'
import { useLearningStore } from '@/lib/learning/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { UPGRADE_TRIGGERS, hasAccess } from '@/lib/pillars/config'
import type { UpgradeTrigger } from '@/lib/pillars/config'

/**
 * Contextual upgrade trigger hook.
 *
 * Checks user behaviour signals against trigger conditions and returns
 * the most relevant upgrade prompt (if any) for the current tier.
 *
 * Triggers fire AFTER repeated actions — not on first use.
 */

interface UsageSignals {
  manualPlanCount: number
  budgetFilterCount: number
  householdEditCount: number
  snapCookCount: number
  triedMultiMember: boolean
}

const STORAGE_KEY = 'mealease-usage-signals'

function readSignals(): UsageSignals {
  if (typeof window === 'undefined') {
    return {
      manualPlanCount: 0,
      budgetFilterCount: 0,
      householdEditCount: 0,
      snapCookCount: 0,
      triedMultiMember: false,
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error('no data')
    return JSON.parse(raw) as UsageSignals
  } catch {
    return {
      manualPlanCount: 0,
      budgetFilterCount: 0,
      householdEditCount: 0,
      snapCookCount: 0,
      triedMultiMember: false,
    }
  }
}

export function incrementSignal(key: keyof Omit<UsageSignals, 'triedMultiMember'>) {
  const signals = readSignals()
  signals[key] = (signals[key] ?? 0) + 1
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals))
  }
}

export function setTriedMultiMember() {
  const signals = readSignals()
  signals.triedMultiMember = true
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals))
  }
}

export function useUpgradeTrigger(): UpgradeTrigger | null {
  const { status } = usePaywallStatus()
  const { feedbackHistory } = useLearningStore()

  return useMemo(() => {
    const signals = readSignals()
    const tier = status.tier

    // Check each trigger condition
    for (const trigger of UPGRADE_TRIGGERS) {
      // Skip if user already has access to the target tier
      if (hasAccess(tier, trigger.targetTier)) continue

      let shouldFire = false

      switch (trigger.id) {
        case 'repeated-manual-plans':
          shouldFire = signals.manualPlanCount >= 3
          break
        case 'budget-edits':
          shouldFire = signals.budgetFilterCount >= 3
          break
        case 'household-adjustments':
          shouldFire = signals.householdEditCount >= 3
          break
        case 'snap-cook-limit':
          shouldFire = signals.snapCookCount >= 5
          break
        case 'multi-member':
          shouldFire = signals.triedMultiMember
          break
      }

      if (shouldFire) return trigger
    }

    return null
  }, [status.tier, feedbackHistory])
}
