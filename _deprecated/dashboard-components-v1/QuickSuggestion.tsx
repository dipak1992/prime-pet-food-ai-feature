'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, Users, Loader2, Brain, Zap, ShoppingCart, UtensilsCrossed, RefreshCw } from 'lucide-react'
import type { SmartMealRequest, SmartMealResult } from '@/lib/engine/types'
import type { SmartChipId, MealBadge } from '@/types'
import { useLearningStore } from '@/lib/learning/store'
import { useLightOnboardingStore } from '@/lib/store'
import { computeMealBadges } from '@/lib/engine/badges'
import { SmartChips } from './SmartChips'
import { MealResultCard } from './MealResultCard'

// ─── Card style map (mirrors MealSwipeStack) ─────────────────────────────────

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

// ─── Chip → request modifier ──────────────────────────────────────────────────

function chipToOverrides(chipId: SmartChipId): Partial<SmartMealRequest> {
  switch (chipId) {
    case 'too_expensive':    return { budget: 'low' }
    case 'too_much_cooking': return { lowEnergy: true, maxCookTime: 20 }
    case 'more_protein':     return { preferredProteins: ['chicken', 'beef', 'fish', 'eggs'] }
    case 'kid_friendly':     return { pickyEater: { active: true } }
    case 'faster':           return { maxCookTime: 20 }
    case 'less_spicy':       return { pickyEater: { active: true } }
    case 'easier_texture':   return { pickyEater: { active: true }, maxCookTime: 30 }
    case 'picky_safe':       return { pickyEater: { active: true } }
  }
}

// ─── API helper ──────────────────────────────────────────────────────────────

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

export function QuickSuggestion() {
  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [swapping, setSwapping] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeChip, setActiveChip] = useState<SmartChipId | null>(null)
  const seenIds = useRef<string[]>([])
  const { recordLike, recordSave, recordChipSwap, getBoosts } = useLearningStore()
  const { hasKids, pickyEater, householdType } = useLightOnboardingStore()
  const [badges, setBadges] = useState<MealBadge[]>([])

  const household = {
    adultsCount: householdType === 'solo' ? 1 : 2,
    kidsCount: hasKids ? 1 : 0,
    toddlersCount: 0,
    babiesCount: 0,
  }

  const loadMeal = useCallback(async (overrides?: Partial<SmartMealRequest>) => {
    setLoading(true)
    const boosts = getBoosts()
    const req: SmartMealRequest & { learnedBoosts?: unknown } = {
      household,
      lowEnergy: true,
      pickyEater: pickyEater ? { active: true } : undefined,
      excludeIds: seenIds.current,
      ...overrides,
      ...(boosts ? { learnedBoosts: boosts } : {}),
    }
    const result = await fetchMeal(req)
    if (result) {
      seenIds.current.push(result.id)
      setMeal(result)
      setSaved(false)
      setBadges(computeMealBadges(result, req))
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getBoosts, hasKids, pickyEater, householdType])

  // Initial load
  useEffect(() => {
    loadMeal()
  }, [loadMeal])

  function handleCook() {
    if (meal) {
      recordLike(meal)
      setShowDetail(true)
    }
  }

  async function handleSwap(chipId?: SmartChipId) {
    if (!meal) return
    setSwapping(true)
    if (chipId) {
      recordChipSwap(meal, chipId)
      setActiveChip(chipId)
      await loadMeal(chipToOverrides(chipId))
    } else {
      setActiveChip(null)
      await loadMeal()
    }
    setSwapping(false)
  }

  function handleSave() {
    if (meal && !saved) {
      recordSave(meal)
      setSaved(true)
    }
  }

  // ─── Loading ──

  if (loading && !meal) {
    const boosts = getBoosts()
    const hasLearning = boosts && Object.keys(boosts.cuisineBoost).length > 0
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          {hasLearning ? 'Picking something you\'ll love…' : 'Finding something easy for tonight…'}
        </p>
        {hasLearning && (
          <span className="flex items-center gap-1.5 text-xs text-primary/70 bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
            <Brain className="h-3 w-3" /> Personalized for you
          </span>
        )}
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="text-4xl">😕</span>
        <p className="text-sm text-muted-foreground">Couldn&apos;t find a meal — try again?</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => loadMeal()}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
        >
          Try again
        </motion.button>
      </div>
    )
  }

  const style = getStyle(meal.cuisineType)

  return (
    <>
      <div className="space-y-4">
        {/* ── Meal card ── */}
        <motion.div
          key={meal.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-3xl overflow-hidden shadow-lg"
          style={{ height: 380 }}
        >
          {/* gradient bg */}
          <div className={`absolute inset-0 bg-gradient-to-br ${style.bg}`} />

          {/* dot pattern */}
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

          {/* swapping overlay */}
          {swapping && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 rounded-3xl">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}

          {/* bottom content */}
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
              {badges.map((b) => (
                <div key={b.id} className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
                  <span className="text-xs">{b.emoji}</span>
                  {b.label}
                </div>
              ))}
              {meal.meta?.simplifiedForEnergy && (
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-white text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  Low-effort
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── 3-button CTA row: Cook / Swap / Order ── */}
        <div className="flex gap-2.5">
          {/* Cook this */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCook}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-colors"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Cook this
          </motion.button>

          {/* Swap */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwap()}
            disabled={swapping}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-border bg-white text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${swapping ? 'animate-spin' : ''}`} />
            Swap
          </motion.button>

          {/* Order ingredients */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-medium transition-colors ${
              saved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'border-border bg-white text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save'}
          </motion.button>
        </div>

        {/* ── Smart chips — "Not quite? Try:" ── */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Not quite? Try:</p>
          <SmartChips
            onChipTap={(chipId) => handleSwap(chipId)}
            activeChip={activeChip}
            disabled={swapping}
            hasKids={!!hasKids}
          />
        </div>
      </div>

      {/* ── Full meal detail overlay ── */}
      <AnimatePresence>
        {showDetail && meal && (
          <MealResultCard
            meal={meal}
            mode="tired"
            isSaved={saved}
            onSave={handleSave}
            onSwap={() => { setShowDetail(false); handleSwap() }}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
