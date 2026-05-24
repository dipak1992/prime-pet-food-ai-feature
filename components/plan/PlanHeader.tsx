'use client'

import { ChevronLeft, ChevronRight, ShoppingCart, BarChart2 } from 'lucide-react'
import { usePlanStore } from '@/stores/planStore'
import { cn } from '@/lib/utils'

type Props = {
  onOpenGrocery: () => void
}

export function PlanHeader({ onOpenGrocery }: Props) {
  const plan = usePlanStore((s) => s.plan)
  const navigateWeek = usePlanStore((s) => s.navigateWeek)

  if (!plan) return null

  const { stats, weekStart, weekEnd } = plan

  // Format "Apr 21 – Apr 27"
  const fmt = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

  const weekLabel = `${fmt(weekStart)} – ${fmt(weekEnd)}`

  // Is this the current week?
  const todayIso = new Date().toISOString().slice(0, 10)
  const isCurrentWeek = weekStart <= todayIso && todayIso <= weekEnd

  return (
    <div className="space-y-3">
      {/* Week navigation row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigateWeek(-1)}
          aria-label="Previous week"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {weekLabel}
          </p>
          {isCurrentWeek && (
            <span className="text-[10px] font-medium text-[#D97757] uppercase tracking-wide">
              This week
            </span>
          )}
        </div>

        <button
          onClick={() => navigateWeek(1)}
          aria-label="Next week"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Stats + actions row */}
      <div className="flex items-center justify-between gap-3">
        {/* Progress pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill
            value={stats.plannedCount}
            label="planned"
            color="neutral"
          />
          {stats.cookedCount > 0 && (
            <StatPill
              value={stats.cookedCount}
              label="cooked"
              color="emerald"
            />
          )}
          {stats.emptyCount > 0 && (
            <StatPill
              value={stats.emptyCount}
              label="empty"
              color="amber"
            />
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Budget summary */}
          {stats.totalEstimatedCost > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="font-medium tabular-nums">
                ~${stats.totalEstimatedCost.toFixed(0)}
              </span>
            </div>
          )}

          {/* Grocery list button */}
          <button
            onClick={onOpenGrocery}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-colors',
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grocery list</span>
          </button>
        </div>
      </div>

      {/* Completion bar */}
      {stats.plannedCount > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#D97757] transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-neutral-400 text-right tabular-nums">
            {stats.completionPercentage}% complete
          </p>
        </div>
      )}
    </div>
  )
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: 'neutral' | 'emerald' | 'amber'
}) {
  const classes = {
    neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
        classes[color],
      )}
    >
      <span className="font-bold tabular-nums">{value}</span>
      {label}
    </span>
  )
}
