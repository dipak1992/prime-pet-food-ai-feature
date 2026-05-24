'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChefHat, RefreshCw, ShoppingCart, Clock, Flame } from 'lucide-react'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useDailySwapLimit } from '@/lib/paywall/use-daily-swap-limit'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
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
  type DecideMode,
  type DecideResponse,
} from '@/lib/decide/client'
import type { SmartMealResult } from '@/lib/engine/types'
import { useWeeklyPlanStore } from '@/lib/planner/store'

interface Props {
  mode?: DecideMode
  title?: string
}

function formatTime(mins: number): string {
  if (mins <= 0) return '—'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function DifficultyDots({ difficulty }: { difficulty: 'easy' | 'moderate' | 'hard' }) {
  const filled = difficulty === 'easy' ? 1 : difficulty === 'moderate' ? 2 : 3
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulty: ${difficulty}`}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < filled ? 'bg-amber-500' : 'bg-muted'}`}
        />
      ))}
    </span>
  )
}

export function OneShotSuggestion({ mode = 'tonight', title }: Props) {
  const router = useRouter()
  const { state: { members } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const { getBoosts, recordLike, recordReject } = useLearningStore()
  const { addCustomItem } = useWeeklyPlanStore()

  const { status: paywallStatus } = usePaywallStatus()
  const swaps = useDailySwapLimit(paywallStatus, 'tonight-one-shot')

  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const [ctx, setCtx] = useState<DecideResponse['context'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [cookedFeedback, setCookedFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallCopy, setPaywallCopy] = useState({
    title: 'Unlock full recipes with Plus',
    description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
  })
  const [groceryPromptOpen, setGroceryPromptOpen] = useState(false)
  const shownIdsRef = useRef<string[]>([])

  const fetchMeal = useCallback(async (opts: { swap?: boolean } = {}) => {
    setError(null)
    if (opts.swap) setSwapping(true)
    else setLoading(true)

    try {
      const household = members?.length
        ? householdFromMembers(members)
        : fallbackHousehold(light.householdType, light.hasKids)

      const body = {
        mode: opts.swap ? ('swap' as const) : mode,
        household,
        cuisinePreferences: light.cuisines,
        lowEnergy: light.lowEnergy,
        maxCookTime: light.cookingTimeMinutes || undefined,
        excludeIds: shownIdsRef.current,
        learnedBoosts: getBoosts() ?? undefined,
        pickyEater: light.pickyEater
          ? { active: true, dislikedFoods: light.dislikedFoods }
          : undefined,
      }

      const res = await decideMeal(body)
      setMeal(res.meal)
      setCtx(res.context)
      shownIdsRef.current = [...shownIdsRef.current, res.meal.id].slice(-15)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setSwapping(false)
    }
  }, [members, light.householdType, light.hasKids, light.cuisines, light.lowEnergy, light.cookingTimeMinutes, light.pickyEater, light.dislikedFoods, mode, getBoosts])

  useEffect(() => {
    void fetchMeal()
    // intentional: fetch once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCook = () => {
    if (!meal) return
    if (!paywallStatus.isPro) {
      setPaywallCopy({
        title: 'Unlock full recipes with Plus',
        description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
      })
      setPaywallOpen(true)
      return
    }
    recordLike(meal)
    sendSignal(meal.id, 'cooked', { mode })
    // Store meal for the recipe page, then open grocery prompt
    sessionStorage.setItem('tonight-meal', JSON.stringify(meal))
    sessionStorage.setItem('recipe-source', 'tonight')
    setGroceryPromptOpen(true)
  }

  const handleFeedback = (rating: 'loved' | 'okay' | 'disliked') => {
    if (!meal) return
    sendSignal(meal.id, 'cooked', { mode, rating })
    setFeedbackGiven(true)
    // Show grocery prompt after brief confirmation, then navigate to recipe
    setTimeout(() => {
      setCookedFeedback(false)
      setGroceryPromptOpen(true)
    }, 1200)
  }

  const handleAddToGrocery = () => {
    if (!meal) return
    for (const item of meal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit,
        category: item.category,
      })
    }
    setGroceryPromptOpen(false)
    sessionStorage.setItem('recipe-back', '/tonight')
    sessionStorage.setItem('recipe-source', 'tonight')
    router.push('/tonight/recipe')
  }

  const handleSkipGrocery = () => {
    if (!meal) return
    setGroceryPromptOpen(false)
    // Store meal in sessionStorage for the recipe detail page
    sessionStorage.setItem('tonight-meal', JSON.stringify(meal))
    sessionStorage.setItem('recipe-back', '/tonight')
    sessionStorage.setItem('recipe-source', 'tonight')
    router.push('/tonight/recipe')
  }

  const handleSwap = () => {
    if (!meal) return
    if (!swaps.recordSwap()) {
      setPaywallCopy({
        title: 'You’ve used your free meal changes today.',
        description: 'Free includes 3 meal swaps per day. Upgrade to Plus for unlimited meal swaps, personalized picks, and full Cook This recipes.',
      })
      setPaywallOpen(true)
      return
    }
    recordReject(meal)
    sendSignal(meal.id, 'swapped', { mode })
    void fetchMeal({ swap: true })
  }

  const handleOrder = () => {
    if (!meal) return
    sendSignal(meal.id, 'accepted', { mode, intent: 'order_ingredients' })
    for (const item of meal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit,
        category: item.category,
      })
    }
    router.push('/grocery-list')
  }

  const headerTitle = title ?? (mode === 'surprise' ? 'Picked for you' : 'Tonight')
  const timeLabel = ctx?.isWeekend ? 'Tonight · weekend pick' : 'Tonight · quick pick'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fef7f0 0%, #f0fdf4 15%, #ffffff 40%, #ffffff 100%)' }}>
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-xs text-muted-foreground">{timeLabel}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{headerTitle}</p>
          <h1 className="text-2xl font-bold leading-tight mt-1">
            {loading ? 'Thinking…' : meal ? meal.title : 'No suggestion'}
          </h1>
          {meal && !loading && (
            <p className="text-sm text-muted-foreground mt-1">{meal.tagline}</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-border/60 bg-white p-6 h-56 animate-pulse"
            />
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-red-200 bg-red-50 p-6"
            >
              <p className="text-sm font-semibold text-red-900">Couldn&apos;t pick one.</p>
              <p className="text-xs text-red-700/80 mt-1">{error}</p>
              <button
                onClick={() => void fetchMeal()}
                className="mt-4 text-sm font-semibold text-red-900 underline"
              >
                Try again
              </button>
            </motion.div>
          ) : meal ? (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-3xl border border-border/60 bg-white overflow-hidden shadow-sm"
            >
              {/* Meal image */}
              <div className="relative w-full h-48 overflow-hidden">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-[15px] text-foreground/80 leading-relaxed">{meal.description}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(meal.totalTime)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-muted text-foreground/80 rounded-full px-3 py-1">
                    <DifficultyDots difficulty={meal.difficulty} />
                    <span className="capitalize">{meal.difficulty}</span>
                  </span>
                  {meal.meta.pantryUtilization > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1">
                      <Flame className="h-3 w-3" />
                      {Math.round(meal.meta.pantryUtilization * 100)}% pantry
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-border/60">
                <button
                  onClick={handleCook}
                  className="flex flex-col items-center justify-center gap-1 py-4 hover:bg-emerald-50 transition-colors group"
                >
                  <ChefHat className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">Cook</span>
                </button>
                <button
                  onClick={handleSwap}
                  disabled={swapping}
                  className="flex flex-col items-center justify-center gap-1 py-4 border-x border-border/60 hover:bg-muted transition-colors group disabled:opacity-60"
                >
                  <RefreshCw className={`h-5 w-5 text-foreground/70 ${swapping ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground">
                    {swapping ? 'Swapping…' : 'Swap'}
                  </span>
                </button>
                <button
                  onClick={handleOrder}
                  className="flex flex-col items-center justify-center gap-1 py-4 hover:bg-blue-50 transition-colors group"
                >
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800">Order</span>
                </button>
              </div>

              {/* Post-cook feedback row */}
              <AnimatePresence>
                {cookedFeedback && !feedbackGiven && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="border-t border-border/60 px-4 py-3"
                  >
                    <p className="text-xs text-center text-muted-foreground mb-2">How&apos;d it go?</p>
                    <div className="flex items-center justify-center gap-3">
                      {([['loved', '😍', 'Loved it'], ['okay', '👍', 'Pretty good'], ['disliked', '😬', 'Didn\'t work']] as const).map(([rating, emoji, label]) => (
                        <button
                          key={rating}
                          onClick={() => handleFeedback(rating)}
                          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-center hover:bg-muted transition-colors"
                        >
                          <span className="text-xl">{emoji}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {cookedFeedback && feedbackGiven && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-border/60 px-4 py-3 text-center"
                  >
                    <p className="text-xs text-emerald-700 font-semibold">Thanks! We&apos;ll keep learning 🙌</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {meal && !loading && !cookedFeedback && (
          <p className="text-[11px] text-muted-foreground text-center mt-4">
            {swaps.isUnlimited
              ? 'Not feeling it? Swap freely - we will keep learning.'
              : `${swaps.remaining} swap${swaps.remaining === 1 ? '' : 's'} left today.`}
          </p>
        )}
      </div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title={paywallCopy.title}
        description={paywallCopy.description}
        isAuthenticated={paywallStatus.isAuthenticated}
        redirectPath="/tonight"
      />

      {/* Grocery prompt after cook feedback */}
      <Dialog open={groceryPromptOpen} onOpenChange={setGroceryPromptOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Add to grocery list? 🛒</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              We can add the ingredients for <span className="font-semibold">{meal?.title}</span> to your grocery list.
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
    </div>
  )
}
