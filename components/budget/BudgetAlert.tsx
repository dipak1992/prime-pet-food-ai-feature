'use client'

import { AlertTriangle, TrendingUp } from 'lucide-react'

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  level: 'safe' | 'caution' | 'over'
  spent: number
  limit: number | null
}

export function BudgetAlert({ level, spent, limit }: Props) {
  if (level === 'safe') return null

  const isOver = level === 'over'
  const overBy = limit != null ? spent - limit : 0

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${
        isOver
          ? 'bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-800'
          : 'bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-800'
      }`}
    >
      {isOver ? (
        <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        {isOver ? (
          <>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Over budget by ${overBy.toFixed(2)}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              Consider cheaper meal swaps for the rest of the week.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Approaching your limit
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              You&apos;ve used {limit != null ? Math.round((spent / limit) * 100) : 0}% of your weekly budget.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
