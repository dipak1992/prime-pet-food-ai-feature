'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from 'framer-motion'
import { Clock, ChefHat, Users, Heart, RefreshCw, Shuffle, Loader2, ThumbsUp, ThumbsDown, ShieldCheck, Zap, Brain, ChevronRight } from 'lucide-react'
import type { SmartMealRequest, SmartMealResult } from '@/lib/engine/types'
import { useLearningStore } from '@/lib/learning/store'
import { MealResultCard } from './MealResultCard'

// ─── Card style map by cuisine ───────────────────────────────────────────────

const CARD_STYLES: Record<string, { bg: string; emoji: string }> = {
  italian:       { bg: 'from-rose-500 via-orange-400 to-amber-300',      emoji: '🍝' },
  mexican:       { bg: 'from-amber-500 via-yellow-400 to-lime-300',       emoji: '🌮' },
  asian:         { bg: 'from-teal-600 via-emerald-500 to-green-400',      emoji: '🥢' },
  american:      { bg: 'from-orange-500 via-amber-400 to-yellow-300',     emoji: '🍔' },
  indian:        { bg: 'from-orange-600 via-amber-500 to-yellow-300',     emoji: '🍛' },
  mediterranean: { bg: 'from-sky-500 via-teal-400 to-emerald-300',        emoji: '🥗' },
  comfort:       { bg: 'from-emerald-500 via-teal-400 to-cyan-300',       emoji: '🫕' },
  global:        { bg: 'from-violet-500 via-purple-400 to-indigo-300',    emoji: '🌏' },
}

function getStyle(cuisine?: string) {
  const key = (cuisine?.toLowerCase() ?? '').split(' ')[0]
  return CARD_STYLES[key] ?? CARD_STYLES.comfort
}

// ─── Card face (shared visual layer) ─────────────────────────────────────────

function CardFace({ meal }: { meal: SmartMealResult }) {
  const style = getStyle(meal.cuisineType)
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} rounded-3xl overflow-hidden`}>
      {/* dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* big emoji */}
      <span
        className="absolute top-4 right-4 opacity-70 leading-none select-none pointer-events-none"
        style={{ fontSize: 88 }}
      >
        {style.emoji}
      </span>

      {/* bottom content overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-b-3xl p-5 pt-16">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium mb-1">
          {meal.cuisineType ?? 'Meal'}
        </p>
        <h2 className="text-white text-xl font-bold leading-tight mb-1">{meal.title}</h2>
        <p className="text-white/80 text-sm leading-snug line-clamp-2 mb-3">{meal.tagline}</p>

        {/* pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
            <Clock className="h-3 w-3" />
            {meal.totalTime}m
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium capitalize">
            <ChefHat className="h-3 w-3" />
            {meal.difficulty}
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
            <Users className="h-3 w-3" />
            {meal.servings}
          </div>
          {meal.variations.length > 0 && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
              <ShieldCheck className="h-3 w-3" />
              Kid-safe
            </div>
          )}
          {meal.meta?.simplifiedForEnergy && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
              <Zap className="h-3 w-3" />
              Low-effort
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Back (stacked) card ──────────────────────────────────────────────────────

function BackCard({ meal, pos }: { meal: SmartMealResult; pos: 1 | 2 }) {
  const yVal   = pos === 1 ? 14  : 26
  const scaleV = pos === 1 ? 0.965 : 0.93
  return (
    <motion.div
      key={meal.id}
      className="absolute inset-0 rounded-3xl"
      style={{ zIndex: pos === 1 ? 20 : 10 }}
      initial={{ y: pos === 1 ? 26 : 40, scale: pos === 1 ? 0.93 : 0.90, opacity: 0 }}
      animate={{ y: yVal, scale: scaleV, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
    >
      <CardFace meal={meal} />
    </motion.div>
  )
}

// ─── Draggable top card ───────────────────────────────────────────────────────

function DraggableCard({
  meal,
  onDismiss,
}: {
  meal: SmartMealResult
  onDismiss: () => void
}) {
  const y        = useMotionValue(0)
  const opacity  = useTransform(y, [-200, -80, 0, 80, 200], [0, 0.5, 1, 0.5, 0])
  const scale    = useTransform(y, [-200, 0, 200], [0.9, 1, 0.9])
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 1800)
    return () => clearTimeout(t)
  }, [])

  async function handleDragEnd(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) {
    const { offset, velocity } = info
    if (Math.abs(offset.y) > 80 || Math.abs(velocity.y) > 400) {
      const dir = offset.y < 0 ? -1 : 1
      await animate(y, dir * 700, { duration: 0.25, ease: 'easeIn' })
      onDismiss()
    } else {
      void animate(y, 0, { type: 'spring', stiffness: 350, damping: 28 })
    }
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl cursor-grab active:cursor-grabbing"
      style={{ y, opacity, scale, zIndex: 30 }}
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: -600, bottom: 600 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      <CardFace meal={meal} />

      {/* swipe hint badge */}
      <AnimatePresence>
        {hint && (
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Swipe to replace
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function buildRequest(
  mode: 'ingredients' | 'inspiration' | 'tired' | 'smart',
  input: string,
  excludeIds: string[],
): SmartMealRequest {
  return {
    household: { adultsCount: 2, kidsCount: 1, toddlersCount: 0, babiesCount: 0 },
    lowEnergy: mode === 'tired',
    pantryItems:
      mode === 'ingredients'
        ? input.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
    inspirationMeal: mode === 'inspiration' ? input.trim() || undefined : undefined,
    excludeIds,
  }
}

async function fetchMeal(req: SmartMealRequest & { learnedBoosts?: unknown }): Promise<SmartMealResult | null> {
  try {
    const res = await fetch('/api/smart-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.meal as SmartMealResult
  } catch {
    return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  mode: 'ingredients' | 'inspiration' | 'tired' | 'smart'
  input: string
}

export function MealSwipeStack({ mode, input }: Props) {
  const [meals, setMeals] = useState<SmartMealResult[]>([])
  const [topIdx, setTopIdx] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [feedbackFlash, setFeedbackFlash] = useState<'like' | 'reject' | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<SmartMealResult | null>(null)
  const seenIds = useRef<string[]>([])
  const shuffleCount = useRef(0)
  const { recordLike, recordReject, recordSave, getBoosts } = useLearningStore()

  async function loadMeals(count: number) {
    setLoading(true)
    const boosts = getBoosts()
    const reqs = Array.from({ length: count }, () =>
      fetchMeal({ ...buildRequest(mode, input, seenIds.current), ...(boosts ? { learnedBoosts: boosts } : {}) })
    )
    const results = await Promise.all(reqs)
    const fresh = results.filter((m): m is SmartMealResult => {
      if (!m) return false
      if (seenIds.current.includes(m.id)) return false
      seenIds.current.push(m.id)
      return true
    })
    // deduplicate by id within batch
    const unique = fresh.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
    setMeals(prev => [...prev, ...unique])
    setLoading(false)
  }

  // initial load
  useEffect(() => {
    loadMeals(5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // prefetch when running low
  const visibleRemaining = meals.length - topIdx
  useEffect(() => {
    if (!loading && visibleRemaining <= 3 && meals.length > 0) {
      loadMeals(3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleRemaining, loading])

  // auto-shuffle when exhausted (up to 2 times)
  useEffect(() => {
    if (!loading && meals.length > 0 && topIdx >= meals.length && shuffleCount.current < 2) {
      shuffleCount.current++
      seenIds.current = []
      setMeals([])
      setTopIdx(0)
      loadMeals(5)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topIdx, meals.length, loading])

  function handleDismiss() {
    setTopIdx(prev => prev + 1)
  }

  function handleShuffle() {
    seenIds.current = []
    shuffleCount.current = 0
    setMeals([])
    setTopIdx(0)
    loadMeals(5)
  }

  function toggleSave(id: string) {
    const meal = meals.find(m => m.id === id)
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (meal) recordSave(meal)
      }
      return next
    })
  }

  function handleLike() {
    const topMeal = meals[topIdx]
    if (!topMeal) return
    recordLike(topMeal)
    setFeedbackFlash('like')
    setTimeout(() => setFeedbackFlash(null), 600)
  }

  function handleReject() {
    const topMeal = meals[topIdx]
    if (!topMeal) return
    recordReject(topMeal)
    setFeedbackFlash('reject')
    setTimeout(() => {
      setFeedbackFlash(null)
      handleDismiss()
    }, 300)
  }

  // ─── states ────────────────────────────────────────────────────────────────

  if (loading && meals.length === 0) {
    const boosts = getBoosts()
    const hasLearning = boosts && Object.keys(boosts.cuisineBoost).length > 0
    const messages = hasLearning
      ? [
          'Learning what works for you…',
          'Matching to your taste preferences…',
          'Picking meals you\'ll love…',
        ]
      : [
          'Finding something easy for tonight…',
          'Matching meals to your kitchen…',
          'Picking something the whole family will love…',
        ]
    const msg = messages[Math.floor(Date.now() / 3000) % messages.length]
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[520px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{msg}</p>
        {hasLearning && (
          <span className="flex items-center gap-1.5 text-xs text-primary/70 bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
            <Brain className="h-3 w-3" /> Personalized for you
          </span>
        )}
      </div>
    )
  }

  if (topIdx >= meals.length && !loading && shuffleCount.current >= 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[520px]">
        <span className="text-5xl">🍽️</span>
        <p className="font-semibold text-foreground">That&apos;s all for now!</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          We&apos;re always adding new meals. Shuffle to see them again with fresh eyes.
        </p>
        <button
          onClick={handleShuffle}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Shuffle again
        </button>
      </div>
    )
  }

  const topMeal    = meals[topIdx]
  const secondMeal = meals[topIdx + 1]
  const thirdMeal  = meals[topIdx + 2]

  if (!topMeal) return null

  const isSaved = savedIds.has(topMeal.id)

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm mx-auto">
      {/* card stack */}
      <div
        className="relative w-full"
        style={{ height: 'min(65vh, 520px)' }}
      >
        <AnimatePresence>
          {thirdMeal && <BackCard key={thirdMeal.id} meal={thirdMeal} pos={2} />}
          {secondMeal && <BackCard key={secondMeal.id} meal={secondMeal} pos={1} />}
          <DraggableCard key={topMeal.id} meal={topMeal} onDismiss={handleDismiss} />
        </AnimatePresence>
      </div>

      {/* selection reason + learning badge */}
      {topMeal.meta?.selectionReason && (
        <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
          {topMeal.meta.selectionReason}
        </p>
      )}
      {(() => {
        const boosts = getBoosts()
        const hasLearning = boosts && Object.keys(boosts.cuisineBoost).length > 0
        return hasLearning ? (
          <p className="text-center text-xs text-primary/60 flex items-center justify-center gap-1 mt-1">
            <Brain className="h-3 w-3" /> Based on your preferences
          </p>
        ) : null
      })()}

      {/* Cook this — primary CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedMeal(topMeal)}
        className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl text-white font-semibold text-base"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.30)',
        }}
      >
        Cook this
        <ChevronRight className="h-4 w-4" />
      </motion.button>

      {/* action bar */}
      <div className="flex items-center justify-center gap-3">
        {/* Reject */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleReject}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-border bg-background text-muted-foreground hover:text-red-500 hover:border-red-300 text-xs font-medium transition-colors"
        >
          <ThumbsDown className="h-5 w-5" />
          Nope
        </motion.button>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => toggleSave(topMeal.id)}
          className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-colors text-xs font-medium ${
            isSaved
              ? 'bg-rose-50 border-rose-300 text-rose-600'
              : 'bg-background border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </motion.button>

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleLike}
          className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-colors text-xs font-medium ${
            feedbackFlash === 'like'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
              : 'bg-background border-border text-muted-foreground hover:text-emerald-500 hover:border-emerald-300'
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          Love it
        </motion.button>

        {/* Replace (dismiss top card) */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleDismiss}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-border bg-background text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Skip
        </motion.button>

        {/* Shuffle all */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleShuffle}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-border bg-background text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
        >
          <Shuffle className="h-5 w-5" />
          Shuffle
        </motion.button>
      </div>

      {/* Meal detail overlay */}
      <AnimatePresence>
        {selectedMeal && (
          <MealResultCard
            meal={selectedMeal}
            mode={mode}
            isSaved={savedIds.has(selectedMeal.id)}
            onSave={() => toggleSave(selectedMeal.id)}
            onSwap={() => { setSelectedMeal(null); handleDismiss() }}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
