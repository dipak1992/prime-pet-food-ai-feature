'use client'

import { useBudgetStore } from '@/stores/budgetStore'
import { ArrowRight, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Color helpers ────────────────────────────────────────────────────────────

function alertColors(level: 'safe' | 'caution' | 'over') {
  switch (level) {
    case 'over':
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500',
      }
    case 'caution':
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500',
      }
    default:
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-500',
      }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetBar() {
  const hydrated = useBudgetStore((s) => s.hydrated)
  const plan = useBudgetStore((s) => s.plan)
  const settings = useBudgetStore((s) => s.settings)
  const weekSpent = useBudgetStore((s) => s.weekSpent)
  const percentUsed = useBudgetStore((s) => s.percentUsed)
  const alertLevel = useBudgetStore((s) => s.alertLevel)
  const openSetupModal = useBudgetStore((s) => s.openSetupModal)
  const openDrawer = useBudgetStore((s) => s.openDrawer)

  if (!hydrated) return null

  // ── Gated state (free plan) ──────────────────────────────────────────────
  if (plan === 'free') {
    return (
      <button
        onClick={openSetupModal}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-[#D97757]/5 hover:bg-[#D97757]/10 ring-1 ring-[#D97757]/20 px-4 py-3 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Wallet className="w-4 h-4 text-[#D97757]" />
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Budget tracking unlocks with Plus
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-[#D97757]" />
      </button>
    )
  }

  // ── Unset state ──────────────────────────────────────────────────────────
  if (settings.weeklyLimit == null) {
    return (
      <button
        onClick={openSetupModal}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800 px-4 py-3 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span aria-hidden>💰</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Set a weekly budget to track spending
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-neutral-500" />
      </button>
    )
  }

  // ── Active state ─────────────────────────────────────────────────────────
  const colors = alertColors(alertLevel)
  const pct = Math.min(percentUsed, 100)

  return (
    <button
      onClick={openDrawer}
      className="w-full text-left rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-4 py-3 hover:ring-[#D97757]/40 transition-all group"
      aria-label="Open budget details"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden>💰</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            This week
          </span>
          <span className={colors.text}>
            ${weekSpent.toFixed(0)} of ${settings.weeklyLimit}
          </span>
          {alertLevel === 'caution' && <span aria-label="Warning">⚠️</span>}
          {alertLevel === 'over' && <span aria-label="Over budget">🚨</span>}
        </div>
        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#D97757] group-hover:translate-x-0.5 transition-all" />
      </div>
      <div
        className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of weekly budget used`}
      >
        <div
          className={cn('h-full transition-all duration-500', colors.bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  )
}
