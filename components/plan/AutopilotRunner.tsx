'use client'

import { useState } from 'react'
import {
  Sparkles,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Leaf,
  DollarSign,
  Clock,
  Utensils,
  Zap,
  Globe,
  TrendingDown,
  Recycle,
} from 'lucide-react'
import { usePlanStore } from '@/stores/planStore'
import type { MealComplexity, LeftoverPriority } from '@/lib/plan/types'
import { cn } from '@/lib/utils'

// ─── Cuisine options ──────────────────────────────────────────────────────────

const CUISINE_OPTIONS = [
  { id: 'italian', label: 'Italian', emoji: '🇮🇹' },
  { id: 'mexican', label: 'Mexican', emoji: '🇲🇽' },
  { id: 'asian', label: 'Asian', emoji: '🥢' },
  { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'american', label: 'American', emoji: '🇺🇸' },
  { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { id: 'thai', label: 'Thai', emoji: '🇹🇭' },
  { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
]

const COMPLEXITY_OPTIONS: { value: MealComplexity; label: string; desc: string; icon: typeof Clock }[] = [
  { value: 'quick', label: 'Quick & Easy', desc: '≤25 min, minimal effort', icon: Zap },
  { value: 'balanced', label: 'Balanced', desc: 'Weekday-quick, weekend-involved', icon: Clock },
  { value: 'adventurous', label: 'Adventurous', desc: 'More involved recipes any day', icon: Utensils },
]

const LEFTOVER_OPTIONS: { value: LeftoverPriority; label: string; desc: string }[] = [
  { value: 'high', label: 'Use first', desc: 'Prioritize using leftovers' },
  { value: 'normal', label: 'When natural', desc: 'Use if they fit the plan' },
  { value: 'low', label: 'Variety first', desc: 'Prefer variety over reuse' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function AutopilotRunner() {
  const plan = usePlanStore((s) => s.plan)
  const isRunning = usePlanStore((s) => s.isRunningAutopilot)
  const progress = usePlanStore((s) => s.autopilotProgress)
  const lastSummary = usePlanStore((s) => s.lastAutopilotSummary)
  const runAutopilot = usePlanStore((s) => s.runAutopilot)
  const error = usePlanStore((s) => s.error)
  const preferences = usePlanStore((s) => s.autopilotPreferences)
  const setPreferences = usePlanStore((s) => s.setAutopilotPreferences)
  const dismissSummary = usePlanStore((s) => s.dismissSummary)

  const [overwriteAll, setOverwriteAll] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)

  if (!plan) return null

  const hasAny = plan.days.some((d) => d.recipe)
  const allFilled = plan.days.every((d) => d.recipe)

  async function handleRun() {
    await runAutopilot({
      overwriteEmptyOnly: !overwriteAll,
      respectLocked: true,
    })
  }

  function toggleCuisine(id: string) {
    const current = preferences.cuisinePreferences
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id]
    setPreferences({ cuisinePreferences: next })
  }

  // ── Running state ──────────────────────────────────────────────────────────
  if (isRunning) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-900 ring-1 ring-orange-200/60 dark:ring-neutral-800 px-5 py-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#D97757]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-[#D97757] border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#D97757]" />
          </div>
        </div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Planning your week
        </p>
        <p className="text-xs text-neutral-500 animate-pulse">{progress || 'Working on it…'}</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-6 h-1.5 rounded-full bg-[#D97757]/20 overflow-hidden"
            >
              <div
                className="h-full bg-[#D97757] rounded-full transition-all duration-700"
                style={{
                  width: progress.includes('Almost') ? '100%' :
                    progress.includes('Optimizing') ? '85%' :
                    progress.includes('budget') ? '70%' :
                    progress.includes('variety') ? '55%' :
                    progress.includes('seasonal') ? '45%' :
                    progress.includes('cuisine') ? '35%' :
                    progress.includes('pantry') ? '25%' :
                    '15%',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Summary state ──────────────────────────────────────────────────────────
  if (lastSummary) {
    return (
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800 overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Your week is ready ✨
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                  {lastSummary.daysGenerated} dinner{lastSummary.daysGenerated === 1 ? '' : 's'} planned
                  {' '}· ~${lastSummary.estimatedTotalCost.toFixed(0)} total
                </p>
              </div>
            </div>
            <button
              onClick={dismissSummary}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 flex-shrink-0"
            >
              Dismiss
            </button>
          </div>

          {/* Enhanced summary stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {lastSummary.cuisineSpread.length > 0 && (
              <SummaryStat
                icon={Globe}
                label="Cuisines"
                value={lastSummary.cuisineSpread.length.toString()}
                detail={lastSummary.cuisineSpread.slice(0, 3).join(', ')}
              />
            )}
            <SummaryStat
              icon={Utensils}
              label="Proteins"
              value={lastSummary.uniqueProteins.toString()}
              detail="unique varieties"
            />
            <SummaryStat
              icon={Clock}
              label="Avg cook"
              value={`${lastSummary.avgCookTime}m`}
              detail="per meal"
            />
            {lastSummary.leftoversUsed > 0 && (
              <SummaryStat
                icon={Recycle}
                label="Leftovers"
                value={lastSummary.leftoversUsed.toString()}
                detail="repurposed"
              />
            )}
            {lastSummary.pantryItemsUsed > 0 && (
              <SummaryStat
                icon={Leaf}
                label="Pantry"
                value={lastSummary.pantryItemsUsed.toString()}
                detail="items used"
              />
            )}
            {lastSummary.budgetSavings != null && lastSummary.budgetSavings > 0 && (
              <SummaryStat
                icon={TrendingDown}
                label="Savings"
                value={`$${lastSummary.budgetSavings.toFixed(0)}`}
                detail="under budget"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Default CTA with preferences ───────────────────────────────────────────
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[#D97757]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#D97757]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {hasAny ? 'Autopilot your week' : 'Plan your whole week in one tap'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
            {allFilled
              ? 'Refresh the plan while keeping your locked meals.'
              : hasAny
              ? "Fill the empty days — we'll keep what you've already picked."
              : 'Seven dinners personalized to your household, leftovers, budget, and season.'}
          </p>

          {/* Options row */}
          <div className="flex items-center gap-3 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={overwriteAll}
                onChange={(e) => setOverwriteAll(e.target.checked)}
                className="w-4 h-4 accent-[#D97757]"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Replace all non-locked
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.lowEnergyMode}
                onChange={(e) => setPreferences({ lowEnergyMode: e.target.checked })}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Low energy mode
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preferences toggle */}
      <button
        onClick={() => setShowPrefs(!showPrefs)}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800 transition-colors"
      >
        {showPrefs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showPrefs ? 'Hide preferences' : 'Customize preferences'}
      </button>

      {/* Preferences panel */}
      {showPrefs && (
        <div className="px-5 pb-4 space-y-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          {/* Meal complexity */}
          <div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Meal complexity
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COMPLEXITY_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = preferences.mealComplexity === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPreferences({ mealComplexity: opt.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center transition-all',
                      active
                        ? 'bg-[#D97757]/10 ring-1 ring-[#D97757]/40 text-[#D97757]'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Leftover priority */}
          <div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Leftover priority
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LEFTOVER_OPTIONS.map((opt) => {
                const active = preferences.leftoverPriority === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPreferences({ leftoverPriority: opt.value })}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-center transition-all',
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-300/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    )}
                  >
                    <span className="text-[11px] font-medium">{opt.label}</span>
                    <span className="text-[10px] opacity-70">{opt.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cuisine preferences */}
          <div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Favorite cuisines <span className="text-neutral-400 font-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CUISINE_OPTIONS.map((c) => {
                const active = preferences.cuisinePreferences.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCuisine(c.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                      active
                        ? 'bg-[#D97757]/10 text-[#D97757] ring-1 ring-[#D97757]/30'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    )}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Run button */}
      <div className="px-5 pb-4">
        <button
          onClick={handleRun}
          className="flex items-center justify-center gap-2 w-full bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors shadow-sm shadow-[#D97757]/20"
        >
          {hasAny ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {hasAny ? 'Run Autopilot' : 'Generate my week'}
        </button>
      </div>

      {error && (
        <p className="px-5 pb-4 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

// ─── Summary stat mini-card ───────────────────────────────────────────────────

function SummaryStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Check
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/60 dark:bg-neutral-800/40 px-2.5 py-2">
      <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 leading-none">
          {value}
        </p>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
          {detail}
        </p>
      </div>
    </div>
  )
}
