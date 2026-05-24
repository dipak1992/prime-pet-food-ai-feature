'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { buildGroceryList, mergeGroceryListsPreservingEdits } from '@/lib/planner/grocery'
import { DAY_FULL } from '@/lib/planner/types'
import posthog from 'posthog-js'
import { Analytics } from '@/lib/analytics'

import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { WeeklyPlannerGrid } from './WeeklyPlannerGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProPaywallCard } from '@/components/paywall/ProPaywallCard'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { getUpgradeFeatureCopy, type UpgradeFeature } from '@/lib/paywall/feature-copy'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sparkles,
  ShoppingCart,
  DollarSign,
  Brain,
  Heart,
  Loader2,
  CalendarDays,
  RefreshCcw,
  Globe,
} from 'lucide-react'
import type { SmartMealRequest, SmartMealResult } from '@/lib/engine/types'
import type { WeeklyPlan } from '@/lib/planner/types'

interface WeeklyPlanResponse {
  meals: SmartMealResult[]
  groceryList: ReturnType<typeof buildGroceryList> | null
  isPreview: boolean
  previewDays: number
}

// ── Request builder ───────────────────────────────────────────

function buildDateLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekStart + 'T00:00:00')
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

// ── Main component ────────────────────────────────────────────

export function WeeklyPlannerV2() {
  const router = useRouter()
  const { status, loading: paywallLoading } = usePaywallStatus()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallFeature, setPaywallFeature] = useState<UpgradeFeature>('weekly_autopilot')
  const [showPlannerLock, setShowPlannerLock] = useState(false)

  const {
    plan,
    selectedDayIndex,
    groceryList,
    storeFormat,
    isGeneratingWeek,
    generatingDayIndex,
    setPlan,
    setSelectedDayIndex,
    setGroceryList,
    setIsGeneratingWeek,
    setGeneratingDayIndex,
    clearPlan,
    clearGrocery,
  } = useWeeklyPlanStore()

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
  const feedbackHistory = useLearningStore((s) => s.feedbackHistory)
  const { state: { members } } = useOnboardingStore()
  const mealsPlanned = plan.days.filter((d) => d.meal !== null).length

  // ── Personalized paywall copy ─────────────────────────────
  const memberCount = members?.length || (householdType === 'solo' ? 1 : householdType === 'couple' ? 2 : 3)
  const savedMeals = (feedbackHistory ?? []).filter((f: { action?: string }) => f.action === 'save').length
  const likedMeals = (feedbackHistory ?? []).filter((f: { action?: string }) => f.action === 'like').length
  const avoidedMeals = (feedbackHistory ?? []).filter((f: { action?: string }) => f.action === 'reject').length
  const explored = (feedbackHistory ?? []).length
  const rememberedCuisine = (feedbackHistory ?? [])
    .map((f: { cuisineType?: string }) => f.cuisineType)
    .filter((v): v is string => Boolean(v))[0]

  const personalizedInlineTitle = memberCount > 1
    ? `Your free preview covers 3 dinners — but your family of ${memberCount} deserves the full week`
    : 'Your free preview stops after 3 dinners'

  const personalizedInlineDesc = savedMeals > 0
    ? `You've saved ${savedMeals} meal${savedMeals !== 1 ? 's' : ''} so far. Start a 7-day free trial to build a full week around them — with the grocery list and Pantry Magic included.`
    : 'You\'ve seen the value. Start a 7-day free trial to unlock every day, the full grocery list, and Pantry Magic.'

  const personalizedDialogTitle = memberCount > 1
    ? `${memberCount} mouths to feed — let MealEase handle the whole week`
    : 'Ready to stop thinking about dinner?'

  const personalizedDialogDesc = explored > 0
    ? `You've explored ${explored} meal${explored !== 1 ? 's' : ''}${savedMeals > 0 ? ` and saved ${savedMeals}` : ''}. Unlock 7 days of personalized meals, a smart grocery list, and Pantry Magic — for less than one takeout order.`
    : 'Unlock 7 days of personalized meals, a smart grocery list, and Pantry Magic — for less than one takeout order.'
  const activePaywallCopy = getUpgradeFeatureCopy(paywallFeature)
  const paywallTitle = paywallFeature === 'weekly_autopilot' ? personalizedDialogTitle : activePaywallCopy.title
  const paywallDescription = paywallFeature === 'weekly_autopilot' ? personalizedDialogDesc : activePaywallCopy.description

  useEffect(() => {
    if (!status.isPro && selectedDayIndex >= (status.effectivePlanPreviewDays ?? 3)) {
      setSelectedDayIndex(0)
    }
  }, [selectedDayIndex, setSelectedDayIndex, status.isPro])

  // ── Build SmartMealRequest from onboarding prefs ──────────
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
        pickyEater: pickyEater ? { active: true, dislikedFoods: dislikedFoods.length > 0 ? dislikedFoods : undefined } : undefined,
        excludeIds,
      }
    },
    [hasKids, pickyEater, dislikedFoods, cuisines, lowEnergy, country, cookingTimeMinutes, householdType],
  )

  // ── Generate full week ────────────────────────────────────
  const handleGenerateWeek = useCallback(async () => {
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
          toast.error('Log in to generate your weekly plan.')
          router.push('/login?redirect=/planner')
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const data = (await res.json()) as WeeklyPlanResponse

      const newPlan: WeeklyPlan = {
        ...plan,
        days: plan.days.map((day, i) => ({
          ...day,
          meal: data.meals[i] ?? null,
        })),
        generatedAt: new Date().toISOString(),
      }
      setPlan(newPlan)

      if (data.groceryList) {
        setGroceryList(mergeGroceryListsPreservingEdits(groceryList, data.groceryList))
      } else {
        clearGrocery()
      }

      if (data.isPreview) {
        setShowPlannerLock(true)
        setPaywallFeature('weekly_autopilot')
        setPaywallOpen(true)
        toast.success('3-day preview ready!', {
          description: 'Upgrade to Plus to unlock the full week and grocery list.',
        })
      } else {
        setShowPlannerLock(false)
        posthog.capture(Analytics.FAMILY_PLAN_GENERATED, {
          household_size: memberCount,
          planned_days: 7,
        })
        toast.success('Week planned!', { description: '7 meals + grocery list ready.' })
      }
    } catch {
      toast.error('Hmm, that didn\'t work. Give it another try?')
    } finally {
      setIsGeneratingWeek(false)
    }
  }, [
    plan,
    storeFormat,
    buildRequest,
    getBoosts,
    setPlan,
    setGroceryList,
    setIsGeneratingWeek,
    clearGrocery,
    groceryList,
    router,
  ])

  // ── Regenerate a single day ───────────────────────────────
  const handleRegenerateDay = useCallback(
    async (dayIndex: number) => {
      if (!status.isPro && dayIndex >= (status.effectivePlanPreviewDays ?? 3)) {
        setPaywallFeature('weekly_autopilot')
        setPaywallOpen(true)
        return
      }

      setGeneratingDayIndex(dayIndex)
      try {
        const existingIds = plan.days
          .filter((d) => d.meal !== null && d.dayIndex !== dayIndex)
          .map((d) => d.meal!.id)

        const res = await fetch('/api/smart-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...buildRequest(existingIds),
            learnedBoosts: getBoosts(),
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const meal: SmartMealResult = await res.json()

        const newPlan: WeeklyPlan = {
          ...plan,
          days: plan.days.map((d) =>
            d.dayIndex === dayIndex ? { ...d, meal } : d
          ),
        }
        setPlan(newPlan)

        // Rebuild grocery list if one already exists
        if (groceryList) {
          const allMeals = newPlan.days
            .filter((d) => d.meal !== null)
            .map((d) => d.meal!)
          const pantryNames = groceryList.items
            .filter((i) => i.isInPantry)
            .map((i) => i.name)
          const newGrocery = buildGroceryList(allMeals, pantryNames, storeFormat, plan.weekStart)
          setGroceryList(mergeGroceryListsPreservingEdits(groceryList, newGrocery))
        }

        toast.success(`${DAY_FULL[dayIndex]} updated!`)
      } catch {
        toast.error('That swap didn\'t go through — try once more.')
      } finally {
        setGeneratingDayIndex(null)
      }
    },
    [
      plan,
      groceryList,
      storeFormat,
      buildRequest,
      getBoosts,
      setPlan,
      setGroceryList,
      setGeneratingDayIndex,
      status.isPro,
    ],
  )

  // ── "Get everything" → ensure grocery list then navigate ─
  const handleGetEverything = useCallback(async () => {
    if (!status.isPro) {
      setPaywallFeature('grocery')
      setPaywallOpen(true)
      return
    }

    const mealsWithFood = plan.days.filter((d) => d.meal !== null)
    if (mealsWithFood.length === 0) {
      toast.error('Generate your week first!', {
        description: 'Tap "Generate Week" to plan your meals.',
      })
      return
    }
    if (!groceryList) {
      // Build grocery list from current meals on the fly
      const meals = mealsWithFood.map((d) => d.meal!)
      const list = buildGroceryList(meals, [], storeFormat, plan.weekStart)
      setGroceryList(list)
    }
    router.push('/grocery-list')
  }, [plan, groceryList, storeFormat, setGroceryList, router, status.isPro])

  // ── Publish plan as public shareable link ─────────────────
  const handlePublishPlan = useCallback(async () => {
    if (!status.isPro) {
      setPaywallFeature('weekly_autopilot')
      setPaywallOpen(true)
      return
    }

    if (mealsPlanned === 0) {
      toast.error('Generate your week first!')
      return
    }
    try {
      const res = await fetch('/api/content/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) throw new Error('Failed to publish')
      const { slug } = await res.json() as { slug: string }
      const url = `${window.location.origin}/share/plan/${slug}`
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Plan published! Link copied.', { description: url })
      } catch {
        toast.success('Plan published!', { description: `Share: ${url}` })
      }
    } catch {
      toast.error('Couldn\'t share right now — try again in a moment.')
    }
  }, [plan, mealsPlanned, status.isPro])

  const weekLabel = buildDateLabel(plan.weekStart)
  const plannedTotal = plan.days.reduce((sum, day) => sum + (day.meal?.estimatedCost ?? 0), 0)
  const budgetFriendlyCount = plan.days.filter((day) =>
    day.meal?.tags?.some((tag) => tag.toLowerCase().includes('budget') || tag.toLowerCase().includes('lower-cost')),
  ).length
  const lockedDayIndexes = !status.isPro && mealsPlanned > 0
    ? plan.days.slice(status.effectivePlanPreviewDays ?? 3).map((day) => day.dayIndex)
    : []

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-3xl border border-orange-100 bg-white/88 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="h-5 w-5 text-[#D97757]" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Planner &amp; Autopilot</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {weekLabel}
            {mealsPlanned > 0 && (
              <span className="ml-2">
                <Badge variant="secondary" className="text-xs">
                  {mealsPlanned}/7 planned
                </Badge>
              </span>
            )}
          </p>
          {!paywallLoading && !status.isPro && (
            <p className="mt-1 text-xs text-amber-700">
              Free includes instant previews, {status.freeTonightSwipeLimit} Tonight swipes, and {status.effectivePlanPreviewDays} planned dinners.
            </p>
          )}
        </div>

        <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {mealsPlanned > 0 && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" size="sm" className="text-muted-foreground" />}>
                <RefreshCcw className="h-4 w-4 mr-1.5" />
                Clear
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear this week&rsquo;s plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {mealsPlanned} planned meal{mealsPlanned !== 1 ? 's' : ''}. You can generate a new plan anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { clearPlan(); toast('Plan cleared.') }}>
                    Clear plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {mealsPlanned > 0 && (
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="sm" onClick={handlePublishPlan} />}>
                <Globe className="h-4 w-4 mr-1.5" />
                Publish plan
              </TooltipTrigger>
              <TooltipContent>Share a public link to your weekly plan</TooltipContent>
            </Tooltip>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleGenerateWeek}
            disabled={isGeneratingWeek || generatingDayIndex !== null}
          >
            {isGeneratingWeek ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-1.5" />{mealsPlanned > 0 ? 'Regenerate Week' : 'Generate Week'}</>
            )}
          </Button>

          <Button
            variant={mealsPlanned > 0 ? 'default' : 'outline'}
            size="sm"
            onClick={handleGetEverything}
            disabled={isGeneratingWeek}
            className={mealsPlanned > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Get everything for this week
            {groceryList && (
              <Badge
                className="ml-1.5 bg-white/20 text-white text-xs border-0 px-1.5 py-0"
              >
                {groceryList.items.filter((i) => !i.isInPantry).length}
              </Badge>
            )}
          </Button>
        </div>
        </TooltipProvider>
      </div>
      </div>

      <section className="rounded-2xl border border-orange-100 bg-white/88 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#D97757]">
            <Brain className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950">MealEase remembers</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                {savedMeals} saved meal{savedMeals === 1 ? '' : 's'}
              </span>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                {avoidedMeals} avoided pick{avoidedMeals === 1 ? '' : 's'}
              </span>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-[#9f4f32]">
                {likedMeals} liked dinner{likedMeals === 1 ? '' : 's'}
              </span>
              {rememberedCuisine && (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold capitalize text-sky-700">
                  repeats {rememberedCuisine}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Autopilot uses saved meals, dislikes, timing, and household preferences when it fills the week.
            </p>
          </div>
          <Heart className="ml-auto hidden h-4 w-4 text-rose-400 sm:block" />
        </div>
      </section>

      {mealsPlanned > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Estimated week so far: {plannedTotal > 0 ? `$${plannedTotal.toFixed(0)}` : 'calculating'}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {budgetFriendlyCount > 0
                    ? `${budgetFriendlyCount} budget-friendly dinner${budgetFriendlyCount === 1 ? '' : 's'} already in this plan.`
                    : 'Use Budget Intelligence to swap in lower-cost dinners before shopping.'}
                </p>
              </div>
            </div>
            {!status.isPro && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setPaywallFeature('budget')
                  setPaywallOpen(true)
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Unlock budget swaps
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Planner grid ── */}
      <WeeklyPlannerGrid
        days={plan.days}
        selectedDayIndex={selectedDayIndex}
        generatingDayIndex={generatingDayIndex}
        lockedDayIndexes={lockedDayIndexes}
        onSelectDay={setSelectedDayIndex}
        onLockedDayClick={() => {
          setPaywallFeature('weekly_autopilot')
          setPaywallOpen(true)
        }}
        onRegenerate={handleRegenerateDay}
      />

      {!paywallLoading && !status.isPro && (showPlannerLock || mealsPlanned > 0) && (
        <ProPaywallCard
          title={personalizedInlineTitle}
          description={personalizedInlineDesc}
          isAuthenticated={status.isAuthenticated}
          redirectPath="/planner"
          feature="weekly_autopilot"
        />
      )}

      {/* ── Empty state hint ── */}
      {mealsPlanned === 0 && !isGeneratingWeek && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p className="mb-2">No meals planned yet for this week.</p>
          <p>
            Tap <strong className="text-foreground">Generate Week</strong> to auto-plan 7 unique dinners
            based on your preferences.
          </p>
        </div>
      )}

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature={paywallFeature}
        title={paywallTitle}
        description={paywallDescription}
        isAuthenticated={status.isAuthenticated}
        redirectPath="/planner"
      />
    </div>
  )
}
