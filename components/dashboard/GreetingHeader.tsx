'use client'

import { useEffect, useState } from 'react'
import { getGreeting } from '@/lib/dashboard/greeting'
import { budgetColorClasses } from '@/lib/dashboard/budget'
import { StreakBadge } from '@/components/habit/StreakBadge'
import type { BudgetState } from '@/lib/dashboard/types'

type Props = {
  firstName: string
  budget: BudgetState | null
}

export function GreetingHeader({ firstName, budget }: Props) {
  // Initialize to null to avoid SSR/client time mismatch (React #185)
  const [g, setG] = useState<ReturnType<typeof getGreeting> | null>(null)

  useEffect(() => {
    const refresh = () => setG(getGreeting())
    const first = window.setTimeout(refresh, 0)
    const t = window.setInterval(refresh, 60_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(t)
    }
  }, [])

  const hasBudget = budget?.weeklyLimit != null
  const colors = hasBudget ? budgetColorClasses(budget!.alertLevel) : null

  return (
    <header className="mb-2 md:mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
              {g ? g.greeting : 'Hello'}, {firstName}{' '}
              <span aria-hidden>👋</span>
            </h1>
            <StreakBadge />
          </div>
          <p suppressHydrationWarning className="mt-1.5 text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-snug">
            {g ? (
              <>
                <span className="text-neutral-400 dark:text-neutral-500">{g.timeString}</span>
                <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                <span>{g.contextMessage}</span>
              </>
            ) : null}
            {hasBudget && colors && (
              <>
                <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                <span className={colors.text}>
                  ${budget!.weekSpent} of ${budget!.weeklyLimit} this week
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </header>
  )
}
