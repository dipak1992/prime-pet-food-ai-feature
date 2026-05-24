'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, RefreshCw, ShoppingCart, Flame } from 'lucide-react'
import posthog from 'posthog-js'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useDailySwapLimit } from '@/lib/paywall/use-daily-swap-limit'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { showRewardToast } from '@/lib/reward-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  decideMeal,
  sendSignal,
  householdFromMembers,
  fallbackHousehold,
} from '@/lib/decide/client'
import type { SmartMealResult } from '@/lib/engine/types'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { ShareMealButton } from '@/components/content/ShareMealButton'

// ── Daily cache helpers ──────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadDailyCache(): { lunch: SmartMealResult; dinner: SmartMealResult } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`mealease-daily-${getTodayKey()}`)
    return raw ? (JSON.parse(raw) as { lunch: SmartMealResult; dinner: SmartMealResult }) : null
  } catch { return null }
}

function saveDailyCache(lunch: SmartMealResult, dinner: SmartMealResult) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`mealease-daily-${getTodayKey()}`, JSON.stringify({ lunch, dinner }))
  } catch {}
}

function clearDailyCache() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`mealease-daily-${getTodayKey()}`)
  } catch {}
}

interface Props {
  refreshKey: number
}

export function TonightRecommendation({ refreshKey }: Props) {
  const router = useRouter()
  const [lunchMeal, setLunchMeal] = useState<SmartMealResult | null>(null)
  const [dinnerMeal, setDinnerMeal] = useState<SmartMealResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [swappingLunch, setSwappingLunch] = useState(false)
  const [swappingDinner, setSwappingDinner] = useState(false)
  const [cookedMealId, setCookedMealId] = useState<string | null>(null)
  const [groceryMeal, setGroceryMeal] = useState<SmartMealResult | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallCopy, setPaywallCopy] = useState({
    title: 'Unlock full recipes with Plus',
    description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
  })
  const shownIdsRef = useRef<string[]>([])

  const { state: { members } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const { getBoosts, recordLike, recordReject } = useLearningStore()
  const { addCustomItem } = useWeeklyPlanStore()
  const { status: paywallStatus } = usePaywallStatus()
  const swaps = useDailySwapLimit(paywallStatus, 'today-picks')

  const getHousehold = useCallback(() =>
    members?.length
      ? householdFromMembers(members)
      : fallbackHousehold(light.householdType, light.hasKids, light.kidsAgeGroup),
    [members, light.householdType, light.hasKids, light.kidsAgeGroup])

  const buildBody = useCallback(() => ({
    household: getHousehold(),
    cuisinePreferences: light.cuisines,
    lowEnergy: true,
    maxCookTime: light.cookingTimeMinutes || 25,
    excludeIds: shownIdsRef.current,
    learnedBoosts: getBoosts() ?? undefined,
    pickyEater: light.pickyEater
      ? { active: true, dislikedFoods: light.dislikedFoods }
      : undefined,
  }), [getHousehold, light.cuisines, light.cookingTimeMinutes, light.pickyEater, light.dislikedFoods, getBoosts])

  const fetchPair = useCallback(async (opts: { swap?: boolean } = {}) => {
    if (!opts.swap) {
      const cached = loadDailyCache()
      if (cached) {
        setLunchMeal(cached.lunch)
        setDinnerMeal(cached.dinner)
        setLoading(false)
        return
      }
    }
    setLoading(true)
    try {
      const body = buildBody()
      const [lunchRes, dinnerRes] = await Promise.all([
        decideMeal({ ...body, mode: 'surprise' }),
        decideMeal({ ...body, mode: 'tonight' }),
      ])
      setLunchMeal(lunchRes.meal)
      setDinnerMeal(dinnerRes.meal)
      shownIdsRef.current = [
        ...shownIdsRef.current,
        lunchRes.meal.id,
        dinnerRes.meal.id,
      ].slice(-15)
      saveDailyCache(lunchRes.meal, dinnerRes.meal)
    } catch {
      setLunchMeal(null)
      setDinnerMeal(null)
    } finally {
      setLoading(false)
    }
  }, [buildBody])

  useEffect(() => {
    void fetchPair()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const handleCook = useCallback((meal: SmartMealResult) => {
    if (!paywallStatus.isPro) {
      setPaywallCopy({
        title: 'Unlock full recipes with Plus',
        description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
      })
      setPaywallOpen(true)
      return
    }
    recordLike(meal)
    sendSignal(meal.id, 'cooked', { mode: 'tonight' })
    posthog.capture('meal_cooked', { meal_id: meal.id, meal_name: meal.title, mode: 'tonight' })
    showRewardToast('mealCooked')
    sessionStorage.setItem('tonight-meal', JSON.stringify(meal))
    sessionStorage.setItem('recipe-source', 'tonight')
    setCookedMealId(meal.id)
    setGroceryMeal(meal)
  }, [recordLike, paywallStatus.isPro])

  const handleSwapLunch = useCallback(async () => {
    if (!lunchMeal) return
    if (!swaps.recordSwap()) {
      setPaywallCopy({
        title: 'You’ve used your free meal changes today.',
        description: 'Free includes 3 meal swaps per day. Upgrade to Plus for unlimited meal swaps, personalized picks, and full Cook This recipes.',
      })
      setPaywallOpen(true)
      return
    }
    recordReject(lunchMeal)
    sendSignal(lunchMeal.id, 'swapped', { slot: 'lunch' })
    clearDailyCache()
    setSwappingLunch(true)
    try {
      const body = buildBody()
      const res = await decideMeal({ ...body, mode: 'surprise' })
      setLunchMeal(res.meal)
      shownIdsRef.current = [...shownIdsRef.current, res.meal.id].slice(-15)
      if (dinnerMeal) saveDailyCache(res.meal, dinnerMeal)
    } finally {
      setSwappingLunch(false)
    }
  }, [lunchMeal, dinnerMeal, recordReject, buildBody, swaps])

  const handleSwapDinner = useCallback(async () => {
    if (!dinnerMeal) return
    if (!swaps.recordSwap()) {
      setPaywallCopy({
        title: 'You’ve used your free meal changes today.',
        description: 'Free includes 3 meal swaps per day. Upgrade to Plus for unlimited meal swaps, personalized picks, and full Cook This recipes.',
      })
      setPaywallOpen(true)
      return
    }
    recordReject(dinnerMeal)
    sendSignal(dinnerMeal.id, 'swapped', { slot: 'dinner' })
    clearDailyCache()
    setSwappingDinner(true)
    try {
      const body = buildBody()
      const res = await decideMeal({ ...body, mode: 'tonight' })
      setDinnerMeal(res.meal)
      shownIdsRef.current = [...shownIdsRef.current, res.meal.id].slice(-15)
      if (lunchMeal) saveDailyCache(lunchMeal, res.meal)
    } finally {
      setSwappingDinner(false)
    }
  }, [dinnerMeal, lunchMeal, recordReject, buildBody, swaps])

  const handleOrder = useCallback((meal: SmartMealResult) => {
    sendSignal(meal.id, 'accepted', { intent: 'order_ingredients' })
    posthog.capture('meal_order', { meal_id: meal.id, meal_name: meal.title })
    for (const item of meal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit,
        category: item.category,
      })
    }
    router.push('/grocery-list')
  }, [addCustomItem, router])

  const handleAddToGrocery = useCallback(() => {
    if (!groceryMeal) return
    for (const item of groceryMeal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit,
        category: item.category,
      })
    }
    setGroceryMeal(null)
    sessionStorage.setItem('recipe-back', '/dashboard')
    router.push('/tonight/recipe')
  }, [groceryMeal, addCustomItem, router])

  const handleSkipGrocery = useCallback(() => {
    setGroceryMeal(null)
    sessionStorage.setItem('recipe-back', '/dashboard')
    router.push('/tonight/recipe')
  }, [router])

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Today&apos;s picks
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-border/60 p-6">
                <div className="h-5 w-2/3 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-muted/60 rounded-lg animate-pulse mt-3" />
                <div className="flex gap-2 mt-4">
                  <div className="h-7 w-16 bg-muted/40 rounded-full animate-pulse" />
                  <div className="h-7 w-20 bg-muted/40 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="pair"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Lunch card */}
            <MealSlot
              label="🌤 Lunch"
              meal={lunchMeal}
              swapping={swappingLunch}
              cooked={cookedMealId === lunchMeal?.id}
              onCook={() => lunchMeal && handleCook(lunchMeal)}
              onSwap={() => void handleSwapLunch()}
              onOrder={() => lunchMeal && handleOrder(lunchMeal)}
            />
            {/* Dinner card */}
            <MealSlot
              label="🌙 Dinner"
              meal={dinnerMeal}
              swapping={swappingDinner}
              cooked={cookedMealId === dinnerMeal?.id}
              onCook={() => dinnerMeal && handleCook(dinnerMeal)}
              onSwap={() => void handleSwapDinner()}
              onOrder={() => dinnerMeal && handleOrder(dinnerMeal)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grocery prompt after Cook */}
      <Dialog open={!!groceryMeal} onOpenChange={(open) => { if (!open) setGroceryMeal(null) }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Add to grocery list? 🛒</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              We can add the ingredients for <span className="font-semibold">{groceryMeal?.title}</span> to your grocery list.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handleAddToGrocery}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold py-3 text-sm hover:from-emerald-600 hover:to-green-600 transition-all"
            >
              Yes, add ingredients
            </button>
            <button
              onClick={handleSkipGrocery}
              className="w-full text-sm text-muted-foreground py-2"
            >
              Skip, show me the recipe
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title={paywallCopy.title}
        description={paywallCopy.description}
        isAuthenticated={paywallStatus.isAuthenticated}
        redirectPath="/dashboard"
      />
    </section>
  )
}

// ── MealSlot sub-component ───────────────────────────────────

interface MealSlotProps {
  label: string
  meal: SmartMealResult | null
  swapping: boolean
  cooked: boolean
  onCook: () => void
  onSwap: () => void
  onOrder: () => void
}

function MealSlot({ label, meal, swapping, cooked, onCook, onSwap, onOrder }: MealSlotProps) {
  if (!meal) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white p-6 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">Couldn&apos;t load a suggestion.</p>
      </div>
    )
  }

  return (
    <motion.div
      key={meal.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white border border-border/60 overflow-hidden shadow-sm"
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1">
          <SaveMealButton meal={meal} source="tonight" className="h-7 w-7" />
          <ShareMealButton meal={meal} className="h-7 w-7" />
          <button
            onClick={onSwap}
            disabled={swapping}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-40 px-1"
          >
            <RefreshCw className={`h-3 w-3 ${swapping ? 'animate-spin' : ''}`} />
            Swap
          </button>
        </div>
      </div>

      <div className="p-4 pt-2">
        <h3 className="text-lg font-bold text-foreground leading-snug">
          {meal.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {meal.tagline}
        </p>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/[0.06] text-primary border border-primary/15 rounded-full px-2.5 py-1">
            <Clock className="h-3 w-3" />
            {meal.totalTime}m
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-muted-foreground rounded-full px-2.5 py-1 capitalize">
            <ChefHat className="h-3 w-3" />
            {meal.difficulty}
          </span>
          {meal.tags?.includes('kid-friendly') && (
            <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full px-2.5 py-1">
              👶 Kid-friendly
            </span>
          )}
          {meal.meta.pantryUtilization > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-2.5 py-1">
              <Flame className="h-3 w-3" />
              {Math.round(meal.meta.pantryUtilization * 100)}% pantry
            </span>
          )}
        </div>

        {/* Selection reason */}
        {meal.meta.selectionReason && (
          <p className="mt-3 text-xs text-muted-foreground/80 italic leading-relaxed">
            &ldquo;{meal.meta.selectionReason}&rdquo;
          </p>
        )}
      </div>

      {/* Action buttons */}
      {cooked ? (
        <div className="border-t border-border/60 py-3.5 text-center">
          <p className="text-sm font-medium text-primary">Enjoy your meal! ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 border-t border-border/60">
          <button
            onClick={onCook}
            className="flex items-center justify-center gap-2 py-3.5 hover:bg-primary/[0.04] transition-colors"
          >
            <ChefHat className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Cook this</span>
          </button>
          <button
            onClick={onOrder}
            className="flex items-center justify-center gap-2 py-3.5 border-l border-border/60 hover:bg-blue-50/50 transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Order</span>
          </button>
        </div>
      )}
    </motion.div>
  )
}
