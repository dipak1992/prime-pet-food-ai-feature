'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X,
  Clock,
  ChefHat,
  Users,
  Heart,
  RefreshCw,
  ShoppingCart,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import type { SmartMealResult } from '@/lib/engine/types'

// ─── Shared gradient/emoji map (mirrors MealSwipeStack) ──────────────────────

const CARD_STYLES: Record<string, { bg: string; emoji: string; heroFrom: string; heroTo: string }> = {
  italian:       { bg: 'from-rose-500 via-orange-400 to-amber-300',   emoji: '🍝', heroFrom: '#f43f5e', heroTo: '#f97316' },
  mexican:       { bg: 'from-amber-500 via-yellow-400 to-lime-300',    emoji: '🌮', heroFrom: '#f59e0b', heroTo: '#84cc16' },
  asian:         { bg: 'from-teal-600 via-emerald-500 to-green-400',   emoji: '🥢', heroFrom: '#0d9488', heroTo: '#22c55e' },
  american:      { bg: 'from-orange-500 via-amber-400 to-yellow-300',  emoji: '🍔', heroFrom: '#f97316', heroTo: '#fbbf24' },
  indian:        { bg: 'from-orange-600 via-amber-500 to-yellow-300',  emoji: '🍛', heroFrom: '#ea580c', heroTo: '#d97706' },
  mediterranean: { bg: 'from-sky-500 via-teal-400 to-emerald-300',     emoji: '🥗', heroFrom: '#0ea5e9', heroTo: '#2dd4bf' },
  comfort:       { bg: 'from-emerald-500 via-teal-400 to-cyan-300',    emoji: '🫕', heroFrom: '#10b981', heroTo: '#06b6d4' },
  global:        { bg: 'from-violet-500 via-purple-400 to-indigo-300', emoji: '🌏', heroFrom: '#8b5cf6', heroTo: '#6366f1' },
}

function getStyle(cuisine?: string) {
  const key = (cuisine?.toLowerCase() ?? '').split(' ')[0]
  return CARD_STYLES[key] ?? CARD_STYLES.comfort
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFF_STYLE = {
  easy:     'bg-emerald-50 text-emerald-700',
  moderate: 'bg-amber-50   text-amber-700',
  hard:     'bg-red-50     text-red-700',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Pill({ children, color = 'bg-gray-100 text-gray-600' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${color}`}>
      {children}
    </span>
  )
}

// ─── Skeleton (loading state) ─────────────────────────────────────────────────

export function MealResultSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* hero */}
      <div className="h-56 w-full rounded-b-3xl bg-gray-200" />
      <div className="px-5 py-5 space-y-4">
        {/* title */}
        <div className="space-y-2">
          <div className="h-5 w-2/3 rounded-full bg-gray-200" />
          <div className="h-3.5 w-1/2 rounded-full bg-gray-100" />
        </div>
        {/* pills */}
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-gray-200" />
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-24 rounded-full bg-gray-200" />
        </div>
        {/* actions */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 flex-1 rounded-2xl bg-gray-100" />
          ))}
        </div>
        {/* ingredients header */}
        <div className="h-4 w-28 rounded-full bg-gray-200 mt-2" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-3 w-full rounded-full bg-gray-100" />
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 pb-4">Creating something simple for you…</p>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

export function MealResultError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-5 text-center">
      <span className="text-4xl">😕</span>
      <p className="font-semibold text-foreground">Something didn&apos;t work — let&apos;s try again</p>
      <p className="text-sm text-muted-foreground">We couldn&apos;t generate a meal right now.</p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onRetry}
        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </motion.button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  meal: SmartMealResult
  mode: 'ingredients' | 'inspiration' | 'tired' | 'smart'
  isSaved: boolean
  onSave: () => void
  onSwap: () => void
  onClose: () => void
}

export function MealResultCard({ meal, mode, isSaved, onSave, onSwap, onClose }: Props) {
  const [stepsOpen, setStepsOpen] = useState(false)
  const style = getStyle(meal.cuisineType)

  const pantryIngredients = meal.ingredients.filter(i => i.fromPantry)
  const buyIngredients    = meal.ingredients.filter(i => !i.fromPantry)
  const isPantryMode      = mode === 'ingredients' && pantryIngredients.length > 0

  // Build trust tag pills
  const trustTags: { label: string; color: string }[] = []
  if (meal.meta?.simplifiedForEnergy)         trustTags.push({ label: 'Low effort',           color: 'bg-emerald-50 text-emerald-700' })
  if (meal.variations.some(v => v.stage === 'kid' || v.stage === 'toddler'))
                                              trustTags.push({ label: 'Kid-friendly',          color: 'bg-sky-50 text-sky-700' })
  if (meal.totalTime <= 30)                   trustTags.push({ label: 'Quick dinner',          color: 'bg-violet-50 text-violet-700' })
  if (isPantryMode)                           trustTags.push({ label: 'Uses your ingredients', color: 'bg-amber-50 text-amber-700' })
  // Add up to 2 meal tags if we have room
  meal.tags.slice(0, Math.max(0, 4 - trustTags.length)).forEach(tag =>
    trustTags.push({ label: tag, color: 'bg-gray-100 text-gray-600' })
  )

  const handleSwap = useCallback(() => {
    onSwap()
    onClose()
  }, [onSwap, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto overscroll-contain"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      {/* ── Hero image area ── */}
      <div
        className="relative w-full flex-shrink-0 overflow-hidden rounded-b-3xl"
        style={{ height: 240 }}
      >
        {/* gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(145deg, ${style.heroFrom}, ${style.heroTo})` }}
        />

        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* big emoji */}
        <span
          className="absolute right-5 bottom-6 opacity-60 leading-none select-none pointer-events-none"
          style={{ fontSize: 120 }}
        >
          {style.emoji}
        </span>

        {/* bottom gradient for overlay text */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent rounded-b-3xl" />

        {/* cooking time overlay — bottom left */}
        <div className="absolute bottom-4 left-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Clock className="h-3.5 w-3.5 text-white" />
          <span className="text-white text-xs font-semibold">{meal.totalTime} min</span>
        </div>

        {/* close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-28">

        {/* ── Title + info ── */}
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-[22px] font-semibold text-gray-900 leading-tight tracking-tight">
            {meal.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 leading-snug line-clamp-2">{meal.tagline}</p>

          {/* quick meta row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ChefHat className="h-3.5 w-3.5" />
              <span className={`capitalize font-medium px-1.5 py-0.5 rounded-full text-[11px] ${DIFF_STYLE[meal.difficulty]}`}>
                {meal.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              <span>Serves {meal.servings}</span>
            </div>
            {meal.estimatedCost > 0 && (
              <div className="text-xs text-gray-500">
                ~${meal.estimatedCost.toFixed(0)} / meal
              </div>
            )}
          </div>
        </div>

        {/* ── Tags / trust indicators ── */}
        {trustTags.length > 0 && (
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {trustTags.map((t, i) => (
              <Pill key={i} color={t.color}>{t.label}</Pill>
            ))}
          </div>
        )}

        {/* ── Quick action buttons ── */}
        <div className="px-5 pb-5">
          <div className="flex gap-2">
            {/* Swap */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleSwap}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="text-[11px] font-medium">Try another</span>
            </motion.button>

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onSave}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-[11px] font-medium">{isSaved ? 'Loved' : 'Save'}</span>
            </motion.button>

            {/* Quick version */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span className="text-[11px] font-medium">15 min</span>
            </motion.button>

            {/* Grocery */}
            <Link
              href="/pantry"
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[11px] font-medium">Grocery</span>
            </Link>
          </div>
        </div>

        {/* ── Ingredients ── */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">What you&apos;ll need</h2>

          {isPantryMode ? (
            <div className="space-y-4">
              {pantryIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    You already have
                  </p>
                  <ul className="space-y-1.5">
                    {pantryIngredients.map((ing, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                        <span>
                          <span className="text-emerald-700 font-medium">{ing.quantity} {ing.unit}</span>{' '}
                          {ing.name}
                          {ing.note && <span className="text-gray-400 text-xs ml-1">({ing.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {buyIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    You may need
                  </p>
                  <ul className="space-y-1.5">
                    {buyIngredients.map((ing, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                        <span>
                          <span className="font-medium">{ing.quantity} {ing.unit}</span>{' '}
                          {ing.name}
                          {ing.note && <span className="text-gray-400 text-xs ml-1">({ing.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-baseline gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
                  <span>
                    <span className="font-medium text-gray-800">{ing.quantity} {ing.unit}</span>{' '}
                    {ing.name}
                    {ing.note && <span className="text-gray-400 text-xs ml-1">({ing.note})</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Steps (collapsed by default) ── */}
        {meal.steps.length > 0 && (
          <div className="px-5 pb-6">
            <button
              onClick={() => setStepsOpen(o => !o)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 py-3 border-t border-gray-100"
            >
              <span>{stepsOpen ? 'Hide steps' : 'See how to cook it'}</span>
              {stepsOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {stepsOpen && (
                <motion.ol
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden space-y-3 mt-1"
                >
                  {meal.steps.slice(0, 7).map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Family variations ── */}
        {meal.variations.length > 0 && (
          <div className="px-5 pb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              How we adapted it
            </h2>
            <div className="space-y-3">
              {meal.variations.map((v, i) => {
                const stageColor =
                  v.stage === 'toddler' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  v.stage === 'kid'     ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                          'bg-gray-50 text-gray-700 border-gray-100'
                return (
                  <div key={i} className={`rounded-2xl border p-4 ${stageColor}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{v.emoji}</span>
                      <p className="text-sm font-semibold">{v.label}</p>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">{v.description}</p>
                    {v.modifications.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {v.modifications.slice(0, 3).map((mod, j) => (
                          <li key={j} className="text-xs opacity-70">• {mod}</li>
                        ))}
                      </ul>
                    )}
                    {v.servingTip && (
                      <p className="mt-2 text-xs opacity-60 italic">{v.servingTip}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>{/* end scrollable body */}

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              href="/planner"
              className="flex items-center justify-center w-full h-14 rounded-2xl text-white font-semibold text-base"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              }}
            >
              See full plan
            </Link>
          </motion.div>
        </div>
      </div>

    </motion.div>
  )
}
