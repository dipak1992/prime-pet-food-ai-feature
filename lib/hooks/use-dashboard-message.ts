'use client'

import { useMemo } from 'react'
import { useLightOnboardingStore } from '@/lib/store'
import {
  getDashboardSupportMessage,
  dayKey,
  type DashboardMessage,
} from '@/lib/dashboard-messages'
import type { HouseholdType } from '@/lib/hooks/use-household-config'

// ── localStorage-backed dedup store ────────────────────────────────────────────

const LS_KEY = 'mealease_recent_support_lines'
const MAX_RECENT = 14

interface RecentEntry {
  line: string
  day: string
}

function getRecentLines(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const entries: RecentEntry[] = JSON.parse(raw)
    // Prune entries older than 14 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_RECENT)
    const cutoffStr = dayKey(cutoff)
    return entries.filter((e) => e.day >= cutoffStr).map((e) => e.line)
  } catch {
    return []
  }
}

function recordLine(line: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LS_KEY)
    const entries: RecentEntry[] = raw ? JSON.parse(raw) : []
    const today = dayKey()

    // Don't double-record same day
    if (entries.some((e) => e.day === today && e.line === line)) return

    entries.push({ line, day: today })

    // Keep last MAX_RECENT days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_RECENT)
    const cutoffStr = dayKey(cutoff)
    const pruned = entries.filter((e) => e.day >= cutoffStr)

    localStorage.setItem(LS_KEY, JSON.stringify(pruned))
  } catch {
    // Non-fatal
  }
}

function getMessageVariant(): 'control' | 'support-line' {
  // Keep the line visible for all users.
  // We preserve the variant field for compatibility with existing analytics payloads.
  return 'support-line'
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * useDashboardMessage()
 *
 * Returns a deterministic daily support message. Memoized per render —
 * only recomputes when household type or budget sensitivity changes.
 */
export function useDashboardMessage(): DashboardMessage {
  const householdType =
    (useLightOnboardingStore((s) => s.householdType) as HouseholdType) ?? 'solo'

  const budgetSensitive = useLightOnboardingStore(
    (s) => s.cookingTimeMinutes != null && s.cookingTimeMinutes <= 15,
  )

  const message = useMemo(() => {
    const variant = getMessageVariant()
    const recentLines = getRecentLines()
    const msg = getDashboardSupportMessage({
      householdType,
      recentLines,
      budgetSensitive,
    })
    recordLine(msg.supportLine)
    return {
      ...msg,
      supportLine: msg.supportLine,
      variant,
    }
  }, [householdType, budgetSensitive])

  return message
}
