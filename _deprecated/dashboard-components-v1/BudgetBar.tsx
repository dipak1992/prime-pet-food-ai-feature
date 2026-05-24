'use client'

import { useDashboardStore } from '@/stores/dashboardStore'
import { budgetColorClasses } from '@/lib/dashboard/budget'
import { ArrowRight, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BudgetBar() {
  const budget = useDashboardStore((s) => s.budget)
  const user = useDashboardStore((s) => s.user)
  const open = useDashboardStore((s) => s.openBudgetDrawer)

  if (!budget || !user) return null

  // Gated for free users
  if (user.plan === 'free') {
    return (
      <button
        onClick={open}
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

  if (budget.weeklyLimit == null) {
    return (
      <button
        onClick={open}
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

  const colors = budgetColorClasses(budget.alertLevel)
  const pct = Math.min(budget.percentUsed, 100)

  return (
    <button
      onClick={open}
      className="w-full text-left rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-4 py-3 hover:ring-[#D97757]/40 transition-all group"
      aria-label="Open budget settings"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden>💰</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            This week
          </span>
          <span className={colors.text}>
            ${budget.weekSpent} of ${budget.weeklyLimit}
          </span>
          {budget.alertLevel === 'caution' && <span aria-label="Warning">⚠️</span>}
          {budget.alertLevel === 'over' && <span aria-label="Over budget">🚨</span>}
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
