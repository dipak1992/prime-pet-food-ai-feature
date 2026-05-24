'use client'

import { useEffect, useState } from 'react'
import { getGreeting } from '@/lib/dashboard/greeting'
import { budgetColorClasses } from '@/lib/dashboard/budget'
import type { BudgetState } from '@/lib/dashboard/types'

type Props = {
  firstName: string
  budget: BudgetState | null
}

export function GreetingHeader({ firstName, budget }: Props) {
  const [g, setG] = useState(() => getGreeting())

  useEffect(() => {
    const t = setInterval(() => setG(getGreeting()), 60_000)
    return () => clearInterval(t)
  }, [])

  const hasBudget = budget?.weeklyLimit != null
  const colors = hasBudget ? budgetColorClasses(budget!.alertLevel) : null

  return (
    <header className="mb-6 md:mb-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
        {g.greeting}, {firstName}{' '}
        <span aria-hidden>👋</span>
      </h1>
      <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-400">
        It&rsquo;s {g.timeString} — {g.contextMessage}
        {hasBudget && colors && (
          <>
            <span className="mx-2 text-neutral-300 dark:text-neutral-700">|</span>
            <span className={colors.text}>
              This week: ${budget!.weekSpent} of ${budget!.weeklyLimit}
            </span>
          </>
        )}
      </p>
    </header>
  )
}
