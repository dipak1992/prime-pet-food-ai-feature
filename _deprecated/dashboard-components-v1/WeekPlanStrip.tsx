'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Circle, ChevronRight, Sparkles } from 'lucide-react'
import { CardShell } from './shared/CardShell'
import { useDashboardStore } from '@/stores/dashboardStore'
import { cn } from '@/lib/utils'
import type { DayPlan } from '@/lib/dashboard/types'

export function WeekPlanStrip() {
  const weekPlan = useDashboardStore((s) => s.weekPlan)
  if (!weekPlan) return null

  const hasPlan = weekPlan.days.some((d) => d.recipe)

  if (!hasPlan) {
    return (
      <CardShell className="p-6 md:p-8 text-center bg-gradient-to-br from-[#FDF6F1] to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="text-3xl mb-3" aria-hidden>📅</div>
        <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Plan your whole week in one tap
        </h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
          Generate your first week with Autopilot — personalised to your household and budget.
        </p>
        <Link
          href="/planner?autopilot=true"
          className="mt-5 inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Run Autopilot
        </Link>
      </CardShell>
    )
  }

  return (
    <CardShell className="p-5 md:p-6" ariaLabel="This week's meal plan">
      <header className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2">
          <span aria-hidden>📅</span>
          <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
            This week
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {weekPlan.completionPercentage}% complete
          </span>
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#D97757] hover:text-[#C86646] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Autopilot
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {weekPlan.days.map((d) => (
          <DayCell key={d.id} day={d} />
        ))}
      </div>

      {/* Progress */}
      <div className="mt-5 space-y-2">
        <div
          className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={weekPlan.completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${weekPlan.completionPercentage}% of week cooked`}
        >
          <div
            className="h-full bg-[#D97757] transition-all duration-500"
            style={{ width: `${weekPlan.completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{weekPlan.completionPercentage}% cooked</span>
          <span>Est. ${weekPlan.estimatedTotalCost.toFixed(0)} this week</span>
        </div>
      </div>
    </CardShell>
  )
}

function DayCell({ day }: { day: DayPlan }) {
  const href = day.recipe ? `/planner?day=${day.id}` : `/planner?day=${day.id}`

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors',
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
      )}
      aria-label={`${day.dayAbbrev} ${day.date}: ${day.recipe?.name ?? 'empty'}`}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        {day.dayAbbrev}
      </div>
      <div className="text-xs text-neutral-400">{day.date}</div>

      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200/60 dark:ring-neutral-700/60">
        {day.recipe ? (
          <Image
            src={day.recipe.image}
            alt=""
            fill
            sizes="(max-width: 768px) 14vw, 100px"
            className="object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700">
            <Circle className="w-4 h-4" />
          </div>
        )}

        {day.status === 'cooked' && (
          <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {day.recipe && (
        <div className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
          ${day.recipe.costTotal.toFixed(0)}
        </div>
      )}
    </Link>
  )
}
