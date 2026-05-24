'use client'

import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useLearningStore } from '@/lib/learning/store'
import {
  Clock, ChefHat, DollarSign, Users, ShieldCheck, Sparkles, ChevronDown,
  ChevronRight, Lock, Leaf, RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle,
  Brain,
} from 'lucide-react'
import { BLURRED_PLAN_PREVIEW } from '@/lib/tonight-meals'
import { SmartInput } from '@/components/dashboard/SmartInput'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { ShareMealButton } from '@/components/content/ShareMealButton'
import type { SmartMealResult } from '@/lib/engine/types'

const TONIGHT_SWIPE_STORAGE_KEY = 'nutrinest-tonight-swipes'
const GUEST_SWIPE_STORAGE_KEY = 'nutrinest-guest-tonight'
const GUEST_SWIPE_LIMIT = 3

function readGuestSwipeCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(GUEST_SWIPE_STORAGE_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as { date?: string; count?: number }
    if (parsed.date !== getTodayKey()) return 0
    return parsed.count ?? 0
  } catch {
    return 0
  }
}

function writeGuestSwipeCount(count: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    GUEST_SWIPE_STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), count }),
  )
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function readSwipeCount() {
  if (typeof window === 'undefined') return 0

  try {
    const raw = window.localStorage.getItem(TONIGHT_SWIPE_STORAGE_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as { date?: string; count?: number }
    if (parsed.date !== getTodayKey()) return 0
    return parsed.count ?? 0
  } catch {
    return 0
  }
}

function writeSwipeCount(count: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    TONIGHT_SWIPE_STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), count }),
  )
}

// ── Shimmer Loading Phase ──

const LOADING_STEPS: Record<string, string[]> = {
  quick: [
    'Finding something great for tonight…',
    'Personalizing it for your family…',
    'Adding the finishing touches…',
    'Your dinner idea is ready! ✨',
  ],
  tired: [
    'No decisions needed — we\'ve got this…',
    'Picking the simplest, tastiest option…',
    'Almost done. You can relax…',
    'Here\'s your effortless dinner! 😴',
  ],
  pantry: [
    'Checking what works with your ingredients…',
    'Finding a meal from what you have…',
    'Making sure it works for the whole family…',
    'Found the perfect use for your ingredients! 🥫',
  ],
  inspiration: [
    'Exploring flavors and ideas…',
    'Finding something exciting for tonight…',
    'Adding creative touches…',
    'Here\'s your inspired dinner! ✨',
  ],
}

const LEARNING_LOADING_STEPS: Record<string, string[]> = {
  quick: [
    'Checking what you\'ve loved before…',
    'Matching to your taste preferences…',
    'Picking a meal you\'ll love…',
    'Personalized dinner ready! 🧠',
  ],
  tired: [
    'We know what you like — no thinking needed…',
    'Finding your easiest favorites…',
    'Almost done. You can relax…',
    'Your perfect easy dinner! 😴',
  ],
  pantry: [
    'Remembering your flavor preferences…',
    'Finding a meal you\'ll actually enjoy…',
    'Making sure it works for everyone…',
    'Personalized pantry meal ready! 🧠',
  ],
  inspiration: [
    'Blending your favorites with new ideas…',
    'Finding something exciting you\'ll love…',
    'Adding your preferred flavors…',
    'Inspired & personalized! ✨🧠',
  ],
}

function LoadingPhase({ onComplete, mode, hasLearning }: { onComplete: () => void; mode: string; hasLearning: boolean }) {
  const [step, setStep] = useState(0)
  const steps = hasLearning
    ? (LEARNING_LOADING_STEPS[mode] ?? LEARNING_LOADING_STEPS.quick)
    : (LOADING_STEPS[mode] ?? LOADING_STEPS.quick)

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => {
        setStep(i)
        if (i === steps.length - 1) setTimeout(onComplete, 500)
      }, i * 500)
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="mb-8"
      >
        <Sparkles className="h-12 w-12 text-primary" />
      </motion.div>
      <div className="space-y-3 text-center">
        {steps.map((text, i) => (
          <motion.p
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-sm sm:text-base transition-colors ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'} ${i === step ? 'text-primary' : ''}`}
          >
            {i < step ? '✓ ' : i === step ? '● ' : '○ '}{text}
          </motion.p>
        ))}
      </div>
      <div className="mt-8 w-48 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  )
}

// ── Variation Card ──

interface VariationProps {
  emoji: string
  label: string
  title: string
  modifications: string[]
  safetyNotes: string[]
  servingTip: string
}

function VariationCard({ variation, index }: { variation: VariationProps; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.15 }}
      className="glass-card rounded-xl border border-border/60 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{variation.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{variation.label}</p>
            <p className="text-xs text-muted-foreground">{variation.title}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Modifications</p>
                <ul className="space-y-1">
                  {variation.modifications.map((m) => (
                    <li key={m} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              {variation.safetyNotes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Safety Notes
                  </p>
                  <ul className="space-y-1">
                    {variation.safetyNotes.map((n) => (
                      <li key={n} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">💡 {variation.servingTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Blurred Plan Upsell ──

function BlurredPlanPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 }}
      className="mt-12 relative"
    >
      <div className="text-center mb-6">
        <Badge variant="outline" className="mb-3">
          <Sparkles className="mr-1.5 h-3 w-3" /> Full Weekly Plan
        </Badge>
        <h3 className="text-xl sm:text-2xl font-bold">
          Imagine this for{' '}
          <span className="text-gradient-sage">every night of the week</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Each meal personalized for your whole family — with safety checks built in.
        </p>
      </div>

      <div className="relative">
        {/* The blurred plan preview */}
        <div className="grid gap-2 filter blur-[6px] select-none pointer-events-none" aria-hidden>
          {BLURRED_PLAN_PREVIEW.map((day) => (
            <div key={day.day} className="glass-card rounded-lg p-3 border border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-primary w-20">{day.day}</span>
                <span className="text-sm font-medium">{day.meal}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-xs bg-muted rounded px-1.5 py-0.5">🧑</span>
                <span className="text-xs bg-muted rounded px-1.5 py-0.5">👦</span>
                <span className="text-xs bg-muted rounded px-1.5 py-0.5">👶</span>
                <span className="text-xs bg-muted rounded px-1.5 py-0.5">🍼</span>
              </div>
            </div>
          ))}
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-xl">
          <Lock className="h-8 w-8 text-primary mb-3" />
          <h4 className="font-bold text-lg mb-1">Unlock Your Full Weekly Plan</h4>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Get 7 days of personalized meals with family-safe variations, grocery lists, and nutrition insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/signup">
                Create free account <ChevronRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/upgrade">See Plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// ── Main Tonight Page ──

function TonightPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'quick' | 'tired' | 'pantry' | 'inspiration') || 'quick'
  const needsInput = mode === 'pantry' || mode === 'inspiration'
  const [loading, setLoading] = useState(!needsInput)
  const [authRequired, setAuthRequired] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [inputSubmitted, setInputSubmitted] = useState(false)
  const { status, loading: paywallLoading } = usePaywallStatus()
  const [swipesUsed, setSwipesUsed] = useState(0)
  const [guestSwipesUsed, setGuestSwipesUsed] = useState(0)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const seenIdsRef = useRef<string[]>([])
  const animationDoneRef = useRef(false)
  const fetchPendingRef = useRef(false)
  const { getBoosts } = useLearningStore()
  const hasLearning = !!getBoosts()?.cuisineBoost && Object.keys(getBoosts()?.cuisineBoost ?? {}).length > 0

  useEffect(() => {
    // Restore seen IDs from session storage for variety across navigations
    try {
      const stored = sessionStorage.getItem('tonight-seen-ids')
      if (stored) seenIdsRef.current = JSON.parse(stored)
    } catch {}
    setSwipesUsed(readSwipeCount())
    setGuestSwipesUsed(readGuestSwipeCount())
  }, [])

  const fetchMeal = useCallback(async (ingredientText?: string, countsAsTonightSwap = false) => {
    setLoading(true)
    setAuthRequired(false)
    animationDoneRef.current = false
    fetchPendingRef.current = true
    try {
      const isGuest = !status.isAuthenticated

      let res: Response
      if (isGuest) {
        res = await fetch('/api/guest-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ excludeIds: seenIdsRef.current }),
        })
      } else {
        const boosts = getBoosts()
        const body: Record<string, unknown> = {
          household: { adultsCount: 2, kidsCount: 1, toddlersCount: 0, babiesCount: 0 },
          lowEnergy: mode === 'tired',
          maxCookTime: mode === 'quick' ? 30 : mode === 'tired' ? 20 : undefined,
          excludeIds: seenIdsRef.current,
          mode: countsAsTonightSwap ? 'tonight-swap' : 'tonight',
          ...(boosts ? { learnedBoosts: boosts } : {}),
        }
        if (mode === 'pantry' && ingredientText) {
          body.pantryItems = ingredientText.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
        if (mode === 'inspiration' && ingredientText) {
          body.inspirationMeal = ingredientText
        }
        res = await fetch('/api/smart-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        const data = await res.json() as SmartMealResult
        setMeal(data)
        seenIdsRef.current = [...seenIdsRef.current, data.id]
        try { sessionStorage.setItem('tonight-seen-ids', JSON.stringify(seenIdsRef.current)) } catch {}
        fetchPendingRef.current = false
        if (animationDoneRef.current) setLoading(false)
      } else {
        fetchPendingRef.current = false
        setLoading(false)
        if (res.status === 402) {
          setPaywallOpen(true)
        }
      }
    } catch {
      fetchPendingRef.current = false
      setLoading(false)
    }
  }, [mode, getBoosts, status.isAuthenticated])

  // Fetch once auth state is known and mode doesn't need text input
  useEffect(() => {
    if (!needsInput && !paywallLoading) {
      fetchMeal()
    }
  }, [mode, needsInput, paywallLoading, status.isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputSubmit = useCallback((value: string) => {
    setUserInput(value)
    setInputSubmitted(true)
    fetchMeal(value)
  }, [fetchMeal])

  const modeLabels: Record<string, { title: string; emoji: string; tagline: string; badgeClass: string }> = {
    quick: { title: 'Quick Pick', emoji: '✨', tagline: 'A great dinner idea, ready in seconds', badgeClass: '' },
    tired: { title: 'No-Think Dinner', emoji: '😴', tagline: 'Simple, easy, zero decisions required', badgeClass: 'border-amber-300 text-amber-700 bg-amber-50' },
    pantry: { title: 'Use What You Have', emoji: '🥫', tagline: 'Tell us what\'s in your fridge', badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    inspiration: { title: 'Get Inspired', emoji: '✨', tagline: 'Tell us what you\'re craving', badgeClass: 'border-pink-300 text-pink-700 bg-pink-50' },
  }

  const currentMode = modeLabels[mode] || modeLabels.quick

  const handleAnotherMeal = useCallback(() => {
    // Guest (not signed in) — soft gate after free limit
    if (!status.isAuthenticated) {
      const nextGuestCount = guestSwipesUsed + 1
      if (nextGuestCount > GUEST_SWIPE_LIMIT) {
        setAuthRequired(true)
        return
      }
      writeGuestSwipeCount(nextGuestCount)
      setGuestSwipesUsed(nextGuestCount)
      fetchMeal(userInput || undefined, true)
      return
    }

    if (status.isPro) {
      fetchMeal(userInput || undefined, true)
      return
    }

    const nextSwipeCount = swipesUsed + 1
    if (nextSwipeCount > status.freeTonightSwipeLimit) {
      setPaywallOpen(true)
      return
    }

    writeSwipeCount(nextSwipeCount)
    setSwipesUsed(nextSwipeCount)
    fetchMeal(userInput || undefined, true)
  }, [status.isAuthenticated, status.freeTonightSwipeLimit, status.isPro, swipesUsed, guestSwipesUsed, fetchMeal, userInput])

  const swipesRemaining = status.isPro
    ? null
    : Math.max(status.freeTonightSwipeLimit - swipesUsed, 0)

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
              } else {
                router.push('/dashboard')
              }
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <span className="text-gradient-sage">MealEase</span>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <AnimatePresence mode="sync">
          {needsInput && !inputSubmitted ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Badge variant="outline" className={`mb-3 ${currentMode.badgeClass}`}>
                {currentMode.emoji} {currentMode.title}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                {mode === 'pantry' ? 'What\u2019s in your fridge?' : 'What are you craving?'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {mode === 'pantry'
                  ? 'Snap a photo or type what you have \u2014 we\u2019ll find the perfect meal.'
                  : 'Describe a dish or vibe and we\u2019ll find something you\u2019ll love.'}
              </p>
              <div className="max-w-md mx-auto">
                <SmartInput
                  mode={mode === 'pantry' ? 'ingredients' : 'inspiration'}
                  placeholder={
                    mode === 'pantry'
                      ? 'e.g. chicken, broccoli, garlic, pasta\u2026'
                      : 'e.g. creamy pasta with mushrooms\u2026'
                  }
                  onSubmit={(value) => handleInputSubmit(value)}                  allowPhoto={status.isPro}
                  onPhotoBlocked={() => setPaywallOpen(true)}                />
              </div>
            </motion.div>
          ) : loading ? (
            <LoadingPhase key="loading" onComplete={() => { animationDoneRef.current = true; if (!fetchPendingRef.current) setLoading(false) }} mode={mode} hasLearning={hasLearning} />
          ) : meal ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Mode Badge + Title */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <Badge variant="outline" className={`mb-3 ${currentMode.badgeClass}`}>
                  {currentMode.emoji} {currentMode.title}
                </Badge>
                {hasLearning && (
                  <Badge variant="outline" className="mb-3 ml-2 border-purple-300 text-purple-700 bg-purple-50">
                    <Brain className="mr-1 h-3 w-3" /> Based on your preferences
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mb-3">{currentMode.tagline}</p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                  {meal.title}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg">{meal.tagline}</p>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8"
              >
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {meal.prepTime + meal.cookTime} min total
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ChefHat className="h-4 w-4 text-primary" />
                  {meal.difficulty}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />
                  ~${meal.estimatedCost.toFixed(0)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Serves {meal.servings}
                </div>
              </motion.div>

              {/* Guest personalisation nudge */}
              {!status.isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 mb-8"
                >
                  ✨ Results are generic.{' '}
                  <Link href={`/login?redirect=/tonight%3Fmode%3D${mode}`} className="underline font-medium">
                    Sign in free
                  </Link>{' '}
                  for personalized meals matched to your family.
                </motion.div>
              )}

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-1.5 mb-10"
              >
                {meal.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card rounded-xl border border-border/60 p-5 sm:p-6 mb-8"
              >
                <p className="text-muted-foreground leading-relaxed">{meal.description}</p>
                {meal.leftoverTip && (
                  <p className="mt-3 text-xs text-muted-foreground/80 italic border-t border-border/40 pt-3">
                    💡 Leftover tip: {meal.leftoverTip}
                  </p>
                )}
              </motion.div>

              {/* Ingredients */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-8"
              >
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <ShoppingBagIcon className="h-5 w-5 text-primary" />
                  Ingredients
                </h2>
                <div className="glass-card rounded-xl border border-border/60 divide-y divide-border/40">
                  {meal.ingredients.map((ing) => (
                    <div key={ing.name} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm">
                        {ing.name}
                        {ing.note && <span className="text-muted-foreground ml-1">({ing.note})</span>}
                      </span>
                      <span className="text-sm text-muted-foreground font-mono">{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mb-10"
              >
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  How to Make It
                </h2>
                <div className="space-y-2">
                  {meal.steps.map((step, i) => (
                    <div key={i} className="glass-card rounded-lg border border-border/40 p-3 flex items-start gap-3">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Family Variations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mb-4"
              >
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Family-Safe Variations
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  One meal, adapted for every member of your family
                </p>
                <div className="grid gap-2">
                  {meal.variations.map((v, i) => (
                    <VariationCard key={v.stage} variation={v} index={i} />
                  ))}
                </div>
              </motion.div>

              {/* Try Another Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-center mt-8"
              >
                <div className="flex items-center justify-center gap-2">
                  <SaveMealButton meal={meal} source="tonight" className="h-9 w-9 rounded-md border border-border/60" />
                  <ShareMealButton meal={meal} className="h-9 w-9 rounded-md border border-border/60" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnotherMeal}
                    className="gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Try a different meal
                  </Button>
                </div>
                {!status.isAuthenticated && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {GUEST_SWIPE_LIMIT - guestSwipesUsed > 0
                      ? `${GUEST_SWIPE_LIMIT - guestSwipesUsed} free try${GUEST_SWIPE_LIMIT - guestSwipesUsed === 1 ? '' : 's'} left today.`
                      : 'Free tries used up for today.'}
                  </p>
                )}
              {status.isAuthenticated && swipesRemaining !== null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {swipesRemaining > 0
                      ? `${swipesRemaining} free swipe${swipesRemaining === 1 ? '' : 's'} left today after this preview.`
                      : 'Free swipes used. Plus unlocks unlimited inspiration.'}
                  </p>
                )}
              </motion.div>

              {/* Blurred Plan Preview / Upsell */}
              <BlurredPlanPreview />

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="mt-16 text-center pb-8"
              >
                <h3 className="text-xl font-bold mb-2">Ready to plan your whole week?</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  Get personalized meals for your entire family — with grocery lists, pantry tracking, and nutrition insights.
                </p>
                <Button asChild size="lg" className="shadow-lg px-8">
                  <Link href="/signup">
                    Get started free <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">Free plan · No credit card required</p>
              </motion.div>
            </motion.div>
          ) : authRequired ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-xl font-bold mb-2">You&apos;ve had {GUEST_SWIPE_LIMIT} free tries today!</p>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Sign in free to unlock unlimited personalized meal suggestions tailored for your family.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button asChild size="lg">
                  <Link href={`/login?redirect=/tonight%3Fmode%3D${mode}`}>Sign in free →</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup">Create account</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-muted-foreground mb-4">Couldn&apos;t load a meal right now. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => fetchMeal()} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <PaywallDialog
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          feature="guided_cooking"
          title="You’ve used your free Tonight swipes"
          description="Keep the instant preview, then unlock unlimited swipes, the full weekly planner, grocery list, and advanced family tools with Plus."
          isAuthenticated={status.isAuthenticated}
          redirectPath={`/tonight?mode=${mode}`}
        />
      </main>
    </div>
  )
}

export default function TonightPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Sparkles className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Finding your dinner idea…</p>
      </div>
    }>
      <TonightPageInner />
    </Suspense>
  )
}

// Simple shopping bag icon (no extra dep needed)
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
