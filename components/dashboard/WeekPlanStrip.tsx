'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Lock,
  RefreshCw,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { CardShell } from './shared/CardShell'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { buildGroceryList } from '@/lib/planner/grocery'
import { DAY_LABELS } from '@/lib/planner/types'
import { useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useDailySwapLimit } from '@/lib/paywall/use-daily-swap-limit'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { persistMealForRecipe } from '@/lib/recipes/canonical'
import { trackEvent } from '@/lib/analytics'
import type { SmartMealRequest, SmartMealResult } from '@/lib/engine/types'
import type { GroceryList, WeeklyPlan } from '@/lib/planner/types'

const FREE_UNLOCKED_DAYS = 3

type WeeklyPlanResponse = {
  meals: SmartMealResult[]
  groceryList: GroceryList | null
  isPreview: boolean
  previewDays: number
}

function formatDate(date: string) {
  const day = new Date(`${date}T12:00:00`)
  return day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function parseQuantity(value: string | number) {
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function isLockedDay(dayIndex: number, isPlusMember: boolean) {
  return !isPlusMember && dayIndex >= FREE_UNLOCKED_DAYS
}

export function WeekPlanStrip() {
  const router = useRouter()
  const user = useDashboardStore((s) => s.user)
  const budgetHydrated = useBudgetStore((s) => s.hydrated)
  const budgetPlan = useBudgetStore((s) => s.plan)
  const weeklyLimit = useBudgetStore((s) => s.settings.weeklyLimit)
  const weekSpent = useBudgetStore((s) => s.weekSpent)
  const alertLevel = useBudgetStore((s) => s.alertLevel)
  const openDrawer = useBudgetStore((s) => s.openDrawer)
  const plan = useWeeklyPlanStore((s) => s.plan)
  const setPlan = useWeeklyPlanStore((s) => s.setPlan)
  const groceryList = useWeeklyPlanStore((s) => s.groceryList)
  const setGroceryList = useWeeklyPlanStore((s) => s.setGroceryList)
  const clearGrocery = useWeeklyPlanStore((s) => s.clearGrocery)
  const storeFormat = useWeeklyPlanStore((s) => s.storeFormat)
  const isGeneratingWeek = useWeeklyPlanStore((s) => s.isGeneratingWeek)
  const setIsGeneratingWeek = useWeeklyPlanStore((s) => s.setIsGeneratingWeek)
  const addCustomItem = useWeeklyPlanStore((s) => s.addCustomItem)
  const {
    hasKids,
    pickyEater,
    dislikedFoods,
    cuisines,
    lowEnergy,
    country,
    cookingTimeMinutes,
    householdType,
  } = useLightOnboardingStore()
  const getBoosts = useLearningStore((s) => s.getBoosts)
  const { status } = usePaywallStatus()
  const swaps = useDailySwapLimit(status, 'weekly-section')

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [swappingDayIndex, setSwappingDayIndex] = useState<number | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const isPlusMember = status.isPro || user?.plan === 'plus'
  const plannedDays = plan.days.filter((day) => day.meal).length
  const hasPlan = plannedDays > 0
  const selectedDay = selectedDayIndex === null ? null : plan.days[selectedDayIndex] ?? null

  const showBudget = budgetHydrated && budgetPlan !== 'free' && weeklyLimit != null
  const budgetColorClass =
    alertLevel === 'over'
      ? 'text-red-600 dark:text-red-400'
      : alertLevel === 'caution'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-700 dark:text-emerald-400'

  const heading = isPlusMember
    ? 'Your week is ready'
    : hasPlan
      ? 'Next 3 dinners'
      : 'Plan the next 3 dinners'

  const subtext = isPlusMember
    ? 'Generate, swap, cook, and send meals to groceries from here.'
    : hasPlan
      ? 'Tap a day to cook, swap, or add ingredients.'
      : 'Start with a simple preview before planning the full week.'

  const primaryCta = isPlusMember
    ? hasPlan ? 'Refresh Week' : 'Generate Week'
    : hasPlan ? 'Refresh 3 Days' : 'Generate 3 Days'

  const selectedMeal = selectedDay?.meal ?? null

  const buildRequest = useCallback(
    (excludeIds?: string[]): SmartMealRequest => {
      const adultsCount =
        householdType === 'solo' ? 1 : householdType === 'couple' ? 2 : 2
      const kidsCount = hasKids ? 1 : 0
      return {
        household: { adultsCount, kidsCount, toddlersCount: 0, babiesCount: 0 },
        cuisinePreferences: cuisines.length > 0 ? cuisines : undefined,
        lowEnergy,
        locality: country || undefined,
        maxCookTime: cookingTimeMinutes > 0 ? cookingTimeMinutes : 45,
        pickyEater: pickyEater
          ? { active: true, dislikedFoods: dislikedFoods.length > 0 ? dislikedFoods : undefined }
          : undefined,
        excludeIds,
      }
    },
    [hasKids, pickyEater, dislikedFoods, cuisines, lowEnergy, country, cookingTimeMinutes, householdType],
  )

  useEffect(() => {
    trackEvent('weekly_section_viewed', {
      plan: isPlusMember ? 'plus' : 'free',
      planned_days: plannedDays,
    })
  }, [isPlusMember, plannedDays])

  const openLockedDay = useCallback((dayIndex: number) => {
    trackEvent('locked_day_clicked', { day_index: dayIndex })
    setPaywallOpen(true)
  }, [])

  const openDay = useCallback((dayIndex: number) => {
    if (isLockedDay(dayIndex, isPlusMember)) {
      openLockedDay(dayIndex)
      return
    }
    const day = plan.days[dayIndex]
    if (!day?.meal) {
      toast.message('Generate your plan first.', {
        description: isPlusMember ? 'Generate Week will fill all 7 days.' : 'Generate My 3 Days will fill your free preview.',
      })
      return
    }
    trackEvent('unlocked_day_opened', {
      day_index: dayIndex,
      meal_id: day.meal.id,
      plan: isPlusMember ? 'plus' : 'free',
    })
    setSelectedDayIndex(dayIndex)
  }, [isPlusMember, openLockedDay, plan.days])

  const handleGenerate = useCallback(async () => {
    const eventName = isPlusMember
      ? hasPlan ? 'week_refreshed' : 'plus_generate_week_clicked'
      : 'generate_3days_clicked'
    trackEvent(eventName, { source: 'dashboard_weekly_section' })

    setIsGeneratingWeek(true)
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseRequest: buildRequest(),
          learnedBoosts: getBoosts(),
          storeFormat,
          weekStart: plan.weekStart,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/dashboard')
          return
        }
        throw new Error(`Weekly plan failed: ${res.status}`)
      }

      const data = (await res.json()) as WeeklyPlanResponse
      const nextPlan: WeeklyPlan = {
        ...plan,
        days: plan.days.map((day, index) => ({
          ...day,
          meal: data.meals[index] ?? null,
        })),
        generatedAt: new Date().toISOString(),
      }
      setPlan(nextPlan)
      setSelectedDayIndex(0)

      if (data.groceryList) setGroceryList(data.groceryList)
      else clearGrocery()

      toast.success(isPlusMember ? 'Week generated.' : 'Your 3-day preview is ready.', {
        description: isPlusMember ? 'All 7 days are ready.' : 'Tap Mon, Tue, or Wed to use your meals.',
      })
    } catch {
      toast.error('Could not generate your week. Try again in a moment.')
    } finally {
      setIsGeneratingWeek(false)
    }
  }, [
    buildRequest,
    clearGrocery,
    getBoosts,
    hasPlan,
    isPlusMember,
    plan,
    router,
    setGroceryList,
    setIsGeneratingWeek,
    setPlan,
    storeFormat,
  ])

  const handleAddGroceries = useCallback((meal: SmartMealResult) => {
    const lines = meal.shoppingList?.length
      ? meal.shoppingList
      : meal.ingredients.filter((item) => !item.fromPantry)

    for (const item of lines) {
      addCustomItem({
        name: item.name,
        quantity: parseQuantity(item.quantity),
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Ingredients added to your grocery list.')
  }, [addCustomItem])

  const handleCook = useCallback((meal: SmartMealResult) => {
    if (!isPlusMember) {
      setPaywallOpen(true)
      return
    }
    persistMealForRecipe(meal, '/dashboard', 'weekly')
    sessionStorage.setItem('recipe-open-cook', 'true')
    router.push('/tonight/recipe')
  }, [isPlusMember, router])

  const handleSwap = useCallback(async (dayIndex: number) => {
    const currentMeal = plan.days[dayIndex]?.meal
    if (!currentMeal) return
    if (!isPlusMember && !swaps.recordSwap()) {
      setPaywallOpen(true)
      return
    }

    setSwappingDayIndex(dayIndex)
    try {
      const excludeIds = plan.days
        .map((day) => day.meal?.id)
        .filter((id): id is string => Boolean(id))
      const res = await fetch('/api/smart-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buildRequest(excludeIds),
          learnedBoosts: getBoosts(),
        }),
      })
      if (!res.ok) throw new Error('Swap failed')
      const meal = (await res.json()) as SmartMealResult
      const nextPlan: WeeklyPlan = {
        ...plan,
        days: plan.days.map((day) =>
          day.dayIndex === dayIndex ? { ...day, meal } : day,
        ),
      }
      setPlan(nextPlan)

      if (groceryList) {
        const grocery = buildGroceryList(
          nextPlan.days.filter((day) => day.meal).map((day) => day.meal!),
          groceryList.items.filter((item) => item.isInPantry).map((item) => item.name),
          storeFormat,
          plan.weekStart,
        )
        setGroceryList(grocery)
      }
      toast.success(`${DAY_LABELS[dayIndex]} swapped.`)
    } catch {
      toast.error('Could not swap this meal. Try again.')
    } finally {
      setSwappingDayIndex(null)
    }
  }, [
    buildRequest,
    getBoosts,
    groceryList,
    isPlusMember,
    plan,
    setGroceryList,
    setPlan,
    storeFormat,
    swaps,
  ])

  const upgradeBenefits = useMemo(() => [
    'all 7 dinners unlocked',
    'grocery list preview',
    'unlimited swaps',
  ], [])

  return (
    <>
      <CardShell className="overflow-hidden" ariaLabel="This week's meal plan">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/60 to-white dark:from-[#1e1208] dark:via-neutral-900 dark:to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,_rgba(217,119,87,0.12),_transparent)]" />

        <div className="relative z-10 p-5 md:p-6">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span aria-hidden>📅</span>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#D97757]">
                  Weekly Autopilot
                </p>
              </div>
              <h2 className="font-serif text-xl font-bold text-neutral-950 dark:text-neutral-50">
                {heading}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {subtext}
              </p>
            </div>

            {showBudget && (
              <button
                onClick={openDrawer}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold shadow-sm transition hover:bg-white',
                  budgetColorClass,
                )}
                aria-label="Open budget details"
              >
                <span aria-hidden>💰</span>
                <span>${weekSpent.toFixed(0)}/{weeklyLimit}</span>
              </button>
            )}
          </header>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plan.days.map((day) => {
              const locked = isLockedDay(day.dayIndex, isPlusMember)
              const active = selectedDayIndex === day.dayIndex
              return (
                <button
                  key={day.dayIndex}
                  type="button"
                  onClick={() => openDay(day.dayIndex)}
                  className={cn(
                    'min-w-[4.25rem] rounded-2xl border px-2.5 py-3 text-center transition',
                    active
                      ? 'border-[#D97757] bg-white shadow-md shadow-orange-200/50'
                      : 'border-white/70 bg-white/70 hover:bg-white',
                  )}
                  aria-label={`${DAY_LABELS[day.dayIndex]} ${locked ? 'locked' : 'unlocked'}`}
                >
                  <p className="text-xs font-bold text-neutral-900">{DAY_LABELS[day.dayIndex]}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{formatDate(day.date)}</p>
                  <div className={cn(
                    'mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full',
                    locked ? 'bg-orange-50 text-[#D97757]' : day.meal ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400',
                  )}>
                    {locked ? <Lock className="h-4 w-4" /> : <span aria-hidden>{day.meal ? '🔓' : '○'}</span>}
                  </div>
                  <p className="mt-2 truncate text-[10px] font-semibold text-neutral-600">
                    {locked ? 'Plus' : day.meal ? day.meal.title : 'Free'}
                  </p>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGeneratingWeek}
            className="mt-5 h-12 w-full rounded-2xl bg-[#D97757] text-sm font-bold text-white hover:bg-[#C86646]"
          >
            {isGeneratingWeek ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {primaryCta}
              </>
            )}
          </Button>

          {selectedDay && selectedMeal ? (
            <DayDetail
              dayLabel={DAY_LABELS[selectedDay.dayIndex]}
              meal={selectedMeal}
              isPlusMember={isPlusMember}
              isSwapping={swappingDayIndex === selectedDay.dayIndex}
              swapsRemaining={swaps.isUnlimited ? null : swaps.remaining}
              onBack={() => setSelectedDayIndex(null)}
              onAddGroceries={() => handleAddGroceries(selectedMeal)}
              onCook={() => handleCook(selectedMeal)}
              onSwap={() => void handleSwap(selectedDay.dayIndex)}
            />
          ) : (
            <div className="mt-5 rounded-2xl border border-white/70 bg-white/70 p-4">
              <p className="text-sm font-semibold text-neutral-900">
                {isPlusMember ? 'Plan all 7 dinners from here.' : 'Start with a 3-day preview.'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                {isPlusMember
                  ? 'Generate Week fills every day and keeps this section usable from the dashboard.'
                  : 'Generate 3 Days, then tap a meal to cook, swap, or send ingredients to groceries.'}
              </p>
            </div>
          )}
        </div>
      </CardShell>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={(open) => {
          if (!open) trackEvent('paywall_dismissed', { feature: 'weekly_autopilot' })
          setPaywallOpen(open)
        }}
        title="Unlock your full week with Plus"
        description={`Plus includes ${upgradeBenefits.join(', ')}.`}
        isAuthenticated={status.isAuthenticated}
        feature="weekly_autopilot"
        redirectPath="/dashboard"
      />
    </>
  )
}

function DayDetail({
  dayLabel,
  meal,
  isPlusMember,
  isSwapping,
  swapsRemaining,
  onBack,
  onAddGroceries,
  onCook,
  onSwap,
}: {
  dayLabel: string
  meal: SmartMealResult
  isPlusMember: boolean
  isSwapping: boolean
  swapsRemaining: number | null
  onBack: () => void
  onAddGroceries: () => void
  onCook: () => void
  onSwap: () => void
}) {
  return (
    <section className="mt-5 rounded-3xl border border-white/80 bg-white/88 p-4 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to week
      </button>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#D97757]">{dayLabel}</p>
          <h3 className="mt-1 text-lg font-bold leading-tight text-neutral-950">{meal.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{meal.tagline || meal.description}</p>
        </div>
        <SaveMealButton meal={meal} source="weekly" className="h-9 w-9 shrink-0 border border-orange-100 bg-orange-50" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#9f4f32]">
          <Clock className="h-3 w-3" />
          {meal.totalTime}m
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {meal.difficulty}
        </span>
        {meal.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
            {tag}
          </span>
        ))}
      </div>

      {meal.meta?.selectionReason && (
        <p className="mt-3 rounded-2xl bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">
          {meal.meta.selectionReason}
        </p>
      )}

      {!isPlusMember && swapsRemaining !== null && (
        <p className="mt-3 text-xs text-neutral-500">
          {swapsRemaining} swap{swapsRemaining === 1 ? '' : 's'} left today.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={onAddGroceries}
          variant="outline"
          className="h-11 rounded-2xl"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Groceries
        </Button>
        <Button
          type="button"
          onClick={onSwap}
          disabled={isSwapping}
          variant="outline"
          className="h-11 rounded-2xl"
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isSwapping && 'animate-spin')} />
          Swap
        </Button>
        <Button
          type="button"
          onClick={onCook}
          className="col-span-2 h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isPlusMember ? (
            <>
              <ChefHat className="mr-2 h-4 w-4" />
              Cook This
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Cook This with Plus
            </>
          )}
        </Button>
      </div>
    </section>
  )
}
