'use client'

import { Clock, HeartHandshake, UsersRound } from 'lucide-react'
import { useDashboardMessage } from '@/lib/hooks/use-dashboard-message'
import { useHouseholdConfig } from '@/lib/hooks/use-household-config'

export function DashboardSupportLine() {
  const message = useDashboardMessage()
  const household = useHouseholdConfig()

  const householdLabel =
    household.householdType === 'family'
      ? 'Family food rhythm'
      : household.householdType === 'couple'
        ? 'Shared dinner rhythm'
        : 'Personal dinner rhythm'

  return (
    <section
      aria-label="Daily MealEase support line"
      className="rounded-2xl border border-orange-100 bg-white/85 px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/80"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#D97757] ring-1 ring-orange-100 dark:bg-orange-950/20 dark:ring-orange-900/40">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
              {message.supportLine}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              A calmer food week starts with one clear next step.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 dark:bg-neutral-900">
            <UsersRound className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            {householdLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 dark:bg-neutral-900">
            <Clock className="h-3.5 w-3.5 text-[#D97757]" />
            {message.timeBlock}
          </span>
        </div>
      </div>
    </section>
  )
}
