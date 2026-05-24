'use client'

import { useCallback, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, FlameKindling, ChevronRight, BookMarked } from 'lucide-react'
import posthog from 'posthog-js'
import { MealCard } from '@/components/hub/MealCard'
import { PantryMatchList } from '@/components/hub/PantryMatchList'
import { PantryCapture } from '@/components/hub/PantryCapture'
import { AdjustChipRail } from '@/components/hub/AdjustChipRail'
import { MilestoneBanner } from '@/components/dashboard/MilestoneBanner'
import { StreakBadge } from '@/components/habit/StreakBadge'
import { TodayCard } from '@/components/habit/TodayCard'
import { InsightCards } from '@/components/habit/InsightCards'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useDailySwapLimit } from '@/lib/paywall/use-daily-swap-limit'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { DEMO_WEEKLY_PLAN } from '@/lib/demo-data'
import {
  decideMeal,
  sendSignal,
  householdFromMembers,
  fallbackHousehold,
} from '@/lib/decide/client'
import type { SmartMealResult, SmartMealRequest } from '@/lib/engine/types'
import { persistMealForRecipe, type MealPillar } from '@/lib/recipes/canonical'
import type { SmartChipId, LifeStage } from '@/types'

// ── Intent tiles ────────────────────────────────────────────

type HubTile = 'quick' | 'pantry' | 'surprise' | 'plan' | 'rescue'

const TILES: { id: HubTile; emoji: string; label: string; hint: string }[] = [
  { id: 'quick',    emoji: '⚡', label: "Don't want to think", hint: 'One tap — dinner decided' },
  { id: 'pantry',   emoji: '🫙', label: 'Use what I have',     hint: 'Meals from your pantry' },
  { id: 'surprise', emoji: '✨', label: 'Surprise me',         hint: "Something new you'll love" },
  { id: 'plan',     emoji: '📅', label: 'Plan my week',        hint: '7 dinners, zero repeats' },
  { id: 'rescue',   emoji: '🧊', label: 'Rescue my fridge',    hint: "Cook what's about to expire" },
]

// ── Chip → request modifier ─────────────────────────────────

function chipToOverrides(chipId: SmartChipId): Partial<SmartMealRequest> {
  switch (chipId) {
    case 'too_expensive':    return { budget: 'low' }
    case 'too_much_cooking': return { lowEnergy: true, maxCookTime: 20 }
    case 'more_protein':     return { preferredProteins: ['chicken', 'beef', 'fish', 'eggs'] }
    case 'kid_friendly':     return { pickyEater: { active: true } }
    case 'faster':           return { maxCookTime: 20 }
    case 'less_spicy':       return { pickyEater: { active: true }, dietaryRestrictions: ['mild'] }
    case 'easier_texture':   return { pickyEater: { active: true, texturePreference: 'soft' }, maxCookTime: 30 }
    case 'picky_safe':       return { pickyEater: { active: true, safeFoods: ['mild', 'kid-friendly'] } }
  }
}

// ── Helpers ──────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function stageToEmoji(stage: LifeStage): string {
  if (stage === 'baby')    return '👶'
  if (stage === 'toddler') return '🧒'
  if (stage === 'kid')     return '👦'
  return '🧑'
}

// ── Props ───────────────────────────────────────────────────

interface Props {
  userName: string
}

// ── Main component ──────────────────────────────────────────

export function HomeHub({ userName }: Props) {
  const firstName = userName.includes('@') ? userName.split('@')[0] : userName

  // ── Active tile state ─────────────────────────────────────
  const [activeTile, setActiveTile] = useState<HubTile | null>(null)
  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const [pantryMatches, setPantryMatches] = useState<{ meal: SmartMealResult; pantryPercent: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [activeChip, setActiveChip] = useState<SmartChipId | null>(null)
  const [pantryPhase, setPantryPhase] = useState<'capture' | 'results' | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallCopy, setPaywallCopy] = useState({
    title: 'Unlock full recipes with Plus',
    description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
  })
  const shownIdsRef = useRef<string[]>([])

  // ── Stores ───────────────────────────────────────────────
  const { state: { members } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const router = useRouter()
  const { feedbackHistory, getBoosts, recordLike, recordReject } = useLearningStore()
  const { status: paywallStatus } = usePaywallStatus()
  const swaps = useDailySwapLimit(paywallStatus, 'home-hub')

  // ── Derived ──────────────────────────────────────────────
  const savedCount = useMemo(() =>
    (feedbackHistory ?? []).filter((f: { action?: string; saved?: boolean }) =>
      f.action === 'save' || f.saved === true
    ).length, [feedbackHistory])

  const mealsPlannedCount = useMemo(() =>
    DEMO_WEEKLY_PLAN.days.filter(d => d?.meals?.length > 0).length, [])

  const totalInteractions = useMemo(() =>
    (feedbackHistory ?? []).length, [feedbackHistory])

  const familyEmojis = useMemo(() => {
    if (members && members.length > 0) {
      return members.slice(0, 5).map(m => stageToEmoji(m.stage ?? 'adult'))
    }
    const base: string[] = light.householdType === 'solo' ? ['🧑'] : ['🧑', '🧑']
    if (light.hasKids) base.push('🧒')
    return base
  }, [members, light.hasKids, light.householdType])

  const hasKids = light.hasKids || (members ?? []).some(m => m.stage !== 'adult')

  // ── Household building ────────────────────────────────────

  const getHousehold = useCallback(() =>
    members?.length
      ? householdFromMembers(members)
      : fallbackHousehold(light.householdType, light.hasKids, light.kidsAgeGroup),
    [members, light.householdType, light.hasKids, light.kidsAgeGroup])

  // ── Fetch logic ───────────────────────────────────────────

  const fetchQuick = useCallback(async (chipOverrides?: Partial<SmartMealRequest>) => {
    setLoading(true)
    try {
      const res = await decideMeal({
        mode: 'tonight',
        household: getHousehold(),
        cuisinePreferences: light.cuisines,
        lowEnergy: true,
        maxCookTime: light.cookingTimeMinutes || 25,
        excludeIds: shownIdsRef.current,
        learnedBoosts: getBoosts() ?? undefined,
        pickyEater: light.pickyEater ? { active: true, dislikedFoods: light.dislikedFoods } : undefined,
        ...chipOverrides,
      })
      setMeal(res.meal)
      shownIdsRef.current = [...shownIdsRef.current, res.meal.id].slice(-15)
    } catch {
      setMeal(null)
    } finally {
      setLoading(false)
    }
  }, [getHousehold, light.cuisines, light.cookingTimeMinutes, light.pickyEater, light.dislikedFoods, getBoosts])

  const fetchSurprise = useCallback(async (chipOverrides?: Partial<SmartMealRequest>) => {
    setLoading(true)
    try {
      const res = await decideMeal({
        mode: 'surprise',
        household: getHousehold(),
        cuisinePreferences: light.cuisines,
        excludeIds: shownIdsRef.current,
        learnedBoosts: getBoosts() ?? undefined,
        ...chipOverrides,
      })
      setMeal(res.meal)
      shownIdsRef.current = [...shownIdsRef.current, res.meal.id].slice(-15)
    } catch {
      setMeal(null)
    } finally {
      setLoading(false)
    }
  }, [getHousehold, light.cuisines, getBoosts])

  const fetchPantry = useCallback(async (pantryItems: string[]) => {
    setLoading(true)
    try {
      // Save items to server
      await fetch('/api/pantry/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pantryItems.map(name => ({ name })) }),
      })

      const res = await fetch('/api/pantry/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems,
          household: getHousehold(),
          learnedBoosts: getBoosts() ?? undefined,
          limit: 3,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const matches = (data.data?.matches ?? []).map((m: { meal: SmartMealResult; pantryPercent: number }) => ({
        meal: m.meal,
        pantryPercent: m.pantryPercent,
      }))
      setPantryMatches(matches)
    } catch {
      setPantryMatches([])
    } finally {
      setLoading(false)
    }
  }, [getHousehold, getBoosts])

  // ── Tile tap ──────────────────────────────────────────────

  const handleTileTap = useCallback((id: HubTile) => {
    if (id === 'plan') return // navigates via Link
    posthog.capture('hub_tile_tapped', { tile: id })

    if (id === 'rescue') {
      setActiveTile('rescue')
      setActiveChip(null)
      setPantryPhase('capture')
      return
    }

    setActiveTile(id)
    setActiveChip(null)
    setMeal(null)
    setPantryMatches([])

    if (id === 'quick')    void fetchQuick()
    if (id === 'surprise') void fetchSurprise()
    if (id === 'pantry')   setPantryPhase('capture')
  }, [fetchQuick, fetchSurprise, fetchPantry])

  const handleBack = useCallback(() => {
    if (activeTile === 'pantry' && pantryPhase === 'results') {
      setPantryPhase('capture')
      setPantryMatches([])
      return
    }
    setActiveTile(null)
    setMeal(null)
    setPantryMatches([])
    setActiveChip(null)
    setPantryPhase(null)
  }, [activeTile, pantryPhase])

  // ── Meal actions ──────────────────────────────────────────

  const handleCook = useCallback((m: SmartMealResult) => {
    if (!paywallStatus.isPro) {
      setPaywallCopy({
        title: 'Unlock full recipes with Plus',
        description: 'Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
      })
      setPaywallOpen(true)
      return
    }
    const source: MealPillar = activeTile === 'pantry' ? 'snap' : 'tonight'
    recordLike(m)
    sendSignal(m.id, 'cooked', { mode: activeTile ?? 'tonight' })
    posthog.capture('meal_cooked', { meal_id: m.id, meal_name: m.title, mode: activeTile ?? 'tonight' })
    persistMealForRecipe(m, '/dashboard', source)
    sessionStorage.setItem('recipe-open-cook', 'true')
    router.push('/tonight/recipe')
  }, [recordLike, activeTile, router, paywallStatus.isPro])

  const handleSwap = useCallback(async (m: SmartMealResult) => {
    if (!swaps.recordSwap()) {
      setPaywallCopy({
        title: 'You’ve used your free meal changes today.',
        description: 'Free includes 3 meal swaps per day. Upgrade to Plus for unlimited meal swaps, personalized picks, and full Cook This recipes.',
      })
      setPaywallOpen(true)
      return
    }
    recordReject(m)
    sendSignal(m.id, 'swapped', { mode: activeTile ?? 'tonight' })
    posthog.capture('meal_swapped', { meal_id: m.id, meal_name: m.title, mode: activeTile ?? 'tonight', active_chip: activeChip })
    setSwapping(true)

    const chipOverrides = activeChip ? chipToOverrides(activeChip) : {}

    try {
      if (activeTile === 'quick') await fetchQuick(chipOverrides)
      else if (activeTile === 'surprise') await fetchSurprise(chipOverrides)
      else if (activeTile === 'pantry') await fetchPantry([])
    } finally {
      setSwapping(false)
    }
  }, [recordReject, activeTile, activeChip, fetchQuick, fetchSurprise, fetchPantry, swaps])

  const handleOrder = useCallback((m: SmartMealResult) => {
    sendSignal(m.id, 'accepted', { mode: activeTile ?? 'tonight', intent: 'order_ingredients' })
  }, [activeTile])

  // ── Chip tap handler ──────────────────────────────────────

  const handleChipTap = useCallback((chipId: SmartChipId) => {
    const next = activeChip === chipId ? null : chipId
    setActiveChip(next)
    const overrides = next ? chipToOverrides(next) : {}
    if (activeTile === 'quick') void fetchQuick(overrides)
    else if (activeTile === 'surprise') void fetchSurprise(overrides)
  }, [activeChip, activeTile, fetchQuick, fetchSurprise])

  // ── Skeleton ──────────────────────────────────────────────

  const Skeleton = () => (
    <div className="rounded-3xl border border-border/60 bg-white p-6 h-40 animate-pulse" />
  )

  const initial = firstName.charAt(0).toUpperCase()

  return (
    <>
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fef7f0 0%, #f0fdf4 15%, #ffffff 40%, #ffffff 100%)' }}>
      {/* ── Sub-nav when a tile is active ── */}
      {activeTile && (
        <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </motion.button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-5 py-6">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════
              HOME SCREEN — 4 verb tiles
             ═══════════════════════════════════════════════════════ */}
          {!activeTile && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Greeting */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">
                    {getGreeting()}, {firstName}
                  </p>
                  <StreakBadge />
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                  What do you want tonight?
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Pick a vibe — we handle the rest.
                </p>

                {/* Family chip */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-1">
                    {familyEmojis.map((emoji, i) => (
                      <span
                        key={i}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border-2 border-white text-base ring-1 ring-border/20"
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Family profile active
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Personalized
                  </span>
                </div>
              </div>

              {/* ── 4 Verb Tiles ── */}
              <div className="grid grid-cols-1 gap-2.5">
                {TILES.map((tile) => {
                  // "Plan my week" navigates directly
                  if (tile.id === 'plan') {
                    return (
                      <motion.div key={tile.id} whileTap={{ scale: 0.97 }}>
                        <Link
                          href="/planner"
                          className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-border/60 bg-white hover:border-primary/40 hover:shadow-md transition-all group text-left"
                        >
                          <span className="text-3xl flex-shrink-0">{tile.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{tile.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{tile.hint}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      </motion.div>
                    )
                  }

                  // The hero tile (quick) gets a prominent style
                  const isHero = tile.id === 'quick'

                  return (
                    <motion.button
                      key={tile.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTileTap(tile.id)}
                      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-left transition-all group ${
                        isHero
                          ? 'border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 hover:shadow-lg'
                          : 'border border-border/60 bg-white hover:border-primary/40 hover:shadow-md'
                      }`}
                    >
                      <span className="text-3xl flex-shrink-0">{tile.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold transition-colors ${isHero ? 'group-hover:text-primary' : 'group-hover:text-primary'}`}>
                          {tile.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tile.hint}</p>
                      </div>
                      {tile.id === 'surprise' && (
                        <Sparkles className="h-5 w-5 text-violet-400 flex-shrink-0" />
                      )}
                      {isHero && (
                        <ChevronRight className="h-4 w-4 text-primary/60 flex-shrink-0" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Family covered strip */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">Your family is covered</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">
                    Every meal adapts to your household — ages, allergies, and all.
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <span className="text-lg font-bold text-foreground">{mealsPlannedCount}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">meals this<br/>week</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <span className="text-lg font-bold text-foreground">{savedCount}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">meals<br/>saved</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <FlameKindling className="h-5 w-5 text-orange-500" />
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">streak<br/>active</span>
                </div>
              </div>

              {/* Value accumulator — free users */}
              {!paywallStatus.isPro && totalInteractions > 0 && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        You&apos;ve explored {totalInteractions} meal{totalInteractions !== 1 ? 's' : ''} with MealEase
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {savedCount > 0 ? `${savedCount} saved to your favorites. ` : ''}
                        Plus members save an average of 4.2 hours per week on meal planning.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/upgrade"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    See your Plus preview
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {/* Milestone */}
              <div className="mt-4">
                <MilestoneBanner isPro={paywallStatus.isPro} />
              </div>

              {/* Habit cards */}
              <div className="mt-8">
                <TodayCard />
                <InsightCards />
              </div>

              {/* Bottom CTA */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-border/60">
                <div className="relative px-5 py-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
                      <BookMarked className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug">Build your full week in one tap</p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">7 dinners, all age-adapted, zero repeats — ready in seconds.</p>
                    </div>
                  </div>
                  <Link
                    href="/planner"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    Plan my week
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════
              RESULT SCREEN — shows after tapping a tile
             ═══════════════════════════════════════════════════════ */}
          {/* ── PANTRY / RESCUE CAPTURE PHASE ── */}
          {(activeTile === 'pantry' || activeTile === 'rescue') && pantryPhase === 'capture' && (
            <PantryCapture
              onConfirm={(items) => {
                if (activeTile === 'rescue') {
                  setActiveTile(null)
                  setPantryPhase(null)
                  if (items.length > 0) {
                    const q = encodeURIComponent(items.join(','))
                    router.push(`/tonight?ingredients=${q}&mode=rescue`)
                  }
                } else {
                  setPantryPhase('results')
                  void fetchPantry(items)
                }
              }}
              onCancel={() => {
                setActiveTile(null)
                setPantryPhase(null)
              }}
            />
          )}

          {activeTile && activeTile !== 'plan' && activeTile !== 'rescue' && !(activeTile === 'pantry' && pantryPhase === 'capture') && (
            <motion.div
              key={`result-${activeTile}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tile header */}
              <div className="mb-5">
                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {activeTile === 'quick' && '⚡ Here\'s something easy'}
                  {activeTile === 'surprise' && '✨ Picked for you'}
                  {activeTile === 'pantry' && '🥫 From your pantry'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeTile === 'pantry'
                    ? 'Meals you can make with what you have'
                    : 'Tap Swap for another · the app learns your taste'}
                </p>
              </div>

              {/* Chip rail for quick/surprise */}
              {(activeTile === 'quick' || activeTile === 'surprise') && (
                <div className="mb-4">
                  <AdjustChipRail
                    onChipTap={handleChipTap}
                    activeChip={activeChip}
                    disabled={loading}
                    hasKids={hasKids}
                  />
                </div>
              )}

              {/* Loading skeleton */}
              {loading && <Skeleton />}

              {/* Single meal card (quick / surprise) */}
              {!loading && meal && activeTile !== 'pantry' && (
                <MealCard
                  meal={meal}
                  swapping={swapping}
                  onCook={() => handleCook(meal)}
                  onSwap={() => void handleSwap(meal)}
                  onOrder={() => handleOrder(meal)}
                  source="tonight"
                />
              )}

              {/* Pantry match list */}
              {!loading && activeTile === 'pantry' && (
                <PantryMatchList
                  matches={pantryMatches}
                  onCook={handleCook}
                  onSwap={(m) => void handleSwap(m)}
                  onOrder={handleOrder}
                  source="snap"
                />
              )}

              {/* No result fallback */}
              {!loading && !meal && activeTile !== 'pantry' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-900">Couldn&apos;t find a match</p>
                  <p className="text-xs text-red-700/80 mt-1">Try removing a chip filter or tapping Swap.</p>
                </div>
              )}

              {/* Hint text */}
              {!loading && meal && activeTile !== 'pantry' && (
                <p className="text-[11px] text-muted-foreground text-center mt-4">
                  Not feeling it? Tap <span className="font-semibold">Swap</span> — we&apos;ll learn.
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
    <PaywallDialog
      open={paywallOpen}
      onOpenChange={setPaywallOpen}
      feature="guided_cooking"
      title={paywallCopy.title}
      description={paywallCopy.description}
      isAuthenticated={paywallStatus.isAuthenticated}
      redirectPath="/dashboard"
    />

    </>
  )
}
