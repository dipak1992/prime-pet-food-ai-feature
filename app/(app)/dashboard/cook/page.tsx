'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Crown,
  Sparkles,
  RefreshCw,
  Camera,
  Utensils,
  Recycle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useLearningStore } from '@/lib/learning/store'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { hasAccess } from '@/lib/pillars/config'
import { householdFromMembers, fallbackHousehold, sendSignal } from '@/lib/decide/client'
import { PantryCapture } from '@/components/hub/PantryCapture'
import { PantryMatchList } from '@/components/hub/PantryMatchList'
import { MealCard } from '@/components/hub/MealCard'
import { SnapCookErrorBoundary } from '@/components/hub/SnapCookErrorBoundary'
import { cn } from '@/lib/utils'
import type { SmartMealResult } from '@/lib/engine/types'
import { persistMealForRecipe, type MealPillar } from '@/lib/recipes/canonical'
import type { SubscriptionTier } from '@/types'

type CookMode = 'snap' | 'pantry' | 'leftover'

/** Features launched after this date show a NEW badge for 14 days */
const FEATURE_LAUNCH_DATE = new Date('2026-04-24T00:00:00Z')
const NEW_BADGE_DURATION_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

function isNewFeature(): boolean {
  return Date.now() - FEATURE_LAUNCH_DATE.getTime() < NEW_BADGE_DURATION_MS
}

interface CookChip {
  id: CookMode
  label: string
  emoji: string
  description: string
  requiredTier: SubscriptionTier
  isNew?: boolean
}

const COOK_CHIPS: CookChip[] = [
  {
    id: 'snap',
    label: 'Snap & Cook',
    emoji: '📸',
    description: 'Take a photo of your fridge — get meals instantly',
    requiredTier: 'free',
  },
  {
    id: 'pantry',
    label: 'Pantry Meals',
    emoji: '🥫',
    description: 'Meals from what you already have stocked',
    requiredTier: 'pro',
  },
  {
    id: 'leftover',
    label: 'Smart Leftovers',
    emoji: '♻️',
    description: "Transform yesterday's food into something new",
    requiredTier: 'pro',
  },
]

function validateIngredientList(items: string[]): { valid: boolean; error: string | null } {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'No ingredients found. Please scan or add items first.' }
  }
  const cleaned = items.filter(i => typeof i === 'string' && i.trim().length > 0)
  if (cleaned.length === 0) {
    return { valid: false, error: 'All ingredients were empty. Please add valid items.' }
  }
  if (cleaned.length > 80) {
    return { valid: false, error: 'Too many ingredients (max 80). Please remove some.' }
  }
  return { valid: true, error: null }
}

function normalizeMatchResults(
  raw: unknown,
): { meal: SmartMealResult; pantryPercent: number }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((m): m is { meal: SmartMealResult; pantryPercent: number } => {
      return (
        m != null &&
        typeof m === 'object' &&
        'meal' in m &&
        (m as Record<string, unknown>).meal != null &&
        typeof ((m as Record<string, unknown>).meal as SmartMealResult).id === 'string' &&
        typeof ((m as Record<string, unknown>).meal as SmartMealResult).title === 'string'
      )
    })
    .map(m => ({
      meal: m.meal,
      pantryPercent: typeof m.pantryPercent === 'number' ? m.pantryPercent : 0,
    }))
}

export default function CookPillarPage() {
  const router = useRouter()
  const [activeChip, setActiveChip] = useState<CookMode | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pantryPhase, setPantryPhase] = useState<'capture' | 'results'>('capture')
  const [pantryMatches, setPantryMatches] = useState<{ meal: SmartMealResult; pantryPercent: number }[]>([])
  const [leftoverMeal, setLeftoverMeal] = useState<SmartMealResult | null>(null)
  const [leftoverInput, setLeftoverInput] = useState('')
  const [leftoverItems, setLeftoverItems] = useState<string[]>([])
  const [snapError, setSnapError] = useState<string | null>(null)
  const lastConfirmedItemsRef = useRef<string[]>([])

  const { status } = usePaywallStatus()
  const { state: { members } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const { getBoosts, recordLike } = useLearningStore()

  const getHousehold = useCallback(() =>
    members?.length
      ? householdFromMembers(members)
      : fallbackHousehold(light.householdType, light.hasKids, light.kidsAgeGroup),
    [members, light.householdType, light.hasKids, light.kidsAgeGroup])

  const handleSnapConfirm = useCallback(async (items: string[]) => {
    const { valid, error } = validateIngredientList(items)
    if (!valid) { setSnapError(error); return }
    setSnapError(null)
    setLoading(true)
    setPantryPhase('results')
    lastConfirmedItemsRef.current = items
    try {
      fetch('/api/pantry/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(name => ({ name })) }),
      }).catch(() => {})
      const res = await fetch('/api/pantry/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantryItems: items, household: getHousehold(), limit: 5 }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Server error (${res.status})`)
      }
      const data = await res.json().catch(() => null)
      if (!data?.success) throw new Error(data?.error ?? 'Unexpected response from server')
      const rawMatches = data.data?.matches ?? data.data?.meals ?? []
      setPantryMatches(normalizeMatchResults(rawMatches))
    } catch (err) {
      console.error('[SnapCook] handleSnapConfirm error:', err)
      setSnapError(err instanceof Error ? err.message : "We found ingredients, but couldn't build a meal yet.")
      setPantryMatches([])
    } finally { setLoading(false) }
  }, [getHousehold])

  const handlePantryFetch = useCallback(async () => {
    setLoading(true)
    setPantryPhase('results')
    setSnapError(null)
    try {
      const pantryRes = await fetch('/api/pantry')
      if (!pantryRes.ok) throw new Error('Failed to load pantry')
      const pantryData = await pantryRes.json().catch(() => null)
      const pantryItems: string[] = Array.isArray(pantryData?.data)
        ? pantryData.data.map((item: { name?: string }) => item?.name).filter((n: unknown): n is string => typeof n === 'string' && n.trim().length > 0)
        : []
      if (pantryItems.length === 0) { setPantryMatches([]); setLoading(false); return }
      const res = await fetch('/api/pantry/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantryItems, household: getHousehold(), limit: 5 }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Server error (${res.status})`)
      }
      const data = await res.json().catch(() => null)
      if (!data?.success) throw new Error(data?.error ?? 'Unexpected response')
      const rawMatches = data.data?.matches ?? data.data?.meals ?? []
      setPantryMatches(normalizeMatchResults(rawMatches))
    } catch (err) {
      console.error('[SnapCook] handlePantryFetch error:', err)
      setSnapError(err instanceof Error ? err.message : 'Could not load pantry meals.')
      setPantryMatches([])
    } finally { setLoading(false) }
  }, [getHousehold])

  const addLeftoverItem = useCallback(() => {
    const val = leftoverInput.trim().toLowerCase()
    if (!val || leftoverItems.includes(val)) return
    setLeftoverItems(prev => [...prev, val])
    setLeftoverInput('')
  }, [leftoverInput, leftoverItems])

  const removeLeftoverItem = useCallback((item: string) => {
    setLeftoverItems(prev => prev.filter(i => i !== item))
  }, [])

  const handleLeftoverGenerate = useCallback(async () => {
    if (leftoverItems.length === 0 || loading) return
    setLoading(true)
    setSnapError(null)
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'tonight', household: getHousehold(), pantryItems: leftoverItems,
          cuisinePreferences: light.cuisines, lowEnergy: true, learnedBoosts: getBoosts() ?? undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Server error (${res.status})`)
      }
      const data = await res.json().catch(() => null)
      if (data?.success && data.data?.meal) {
        const meal = data.data.meal as SmartMealResult
        if (!meal.id || !meal.title) throw new Error('Incomplete meal data received')
        setLeftoverMeal(meal)
      } else { throw new Error(data?.error ?? 'No meal generated') }
    } catch (err) {
      console.error('[SnapCook] handleLeftoverGenerate error:', err)
      setSnapError(err instanceof Error ? err.message : 'Could not generate a leftover meal.')
      setLeftoverMeal(null)
    } finally { setLoading(false) }
  }, [leftoverItems, loading, getHousehold, light.cuisines, getBoosts])

  const handleChipSelect = useCallback((chipId: CookMode) => {
    const chip = COOK_CHIPS.find(c => c.id === chipId)
    if (!chip) return
    if (!hasAccess(status.tier, chip.requiredTier)) { setPaywallOpen(true); return }
    setActiveChip(chipId)
    setPantryPhase('capture')
    setPantryMatches([])
    setLeftoverMeal(null)
    setLeftoverItems([])
    setSnapError(null)
    if (chipId === 'pantry') handlePantryFetch()
  }, [status.tier, handlePantryFetch])

  const handleCook = useCallback((meal: SmartMealResult) => {
    if (!meal?.id) return
    const source: MealPillar = activeChip === 'leftover' ? 'leftovers' : 'snap'
    recordLike(meal)
    sendSignal(meal.id, 'cooked', { mode: activeChip ?? 'snap' })
    persistMealForRecipe(meal, '/dashboard/cook', source)
    sessionStorage.setItem('recipe-open-cook', 'true')
    router.push('/tonight/recipe')
  }, [recordLike, activeChip, router])

  const handleSwap = useCallback(() => {
    if (activeChip === 'pantry') handlePantryFetch()
  }, [activeChip, handlePantryFetch])

  const handleErrorBoundaryReset = useCallback(() => {
    setSnapError(null); setPantryMatches([])
    if (lastConfirmedItemsRef.current.length > 0) handleSnapConfirm(lastConfirmedItemsRef.current)
  }, [handleSnapConfirm])

  const handleErrorBoundaryEditIngredients = useCallback(() => {
    setSnapError(null); setPantryMatches([]); setPantryPhase('capture')
  }, [])

  const handleErrorBoundaryBack = useCallback(() => {
    setSnapError(null); setPantryMatches([]); setPantryPhase('capture'); setActiveChip(null)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f7fef9 15%, #ffffff 40%, #ffffff 100%)' }}>
      <div className="mx-auto max-w-lg px-5 pb-16 pt-6">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">📸 Snap &amp; Cook</h1>
          <p className="text-sm text-muted-foreground mt-1">Cook from what you have — fridge, pantry, or leftovers</p>
        </div>

        {/* Mode chips */}
        <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
          {COOK_CHIPS.map((chip) => {
              const locked = !hasAccess(status.tier, chip.requiredTier)
              const isActive = activeChip === chip.id
              const showNew = chip.isNew && isNewFeature()
              return (
                <motion.button
                  key={chip.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChipSelect(chip.id)}
                  className={cn(
                    'relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border',
                    isActive ? 'bg-[#D97757] text-white border-[#D97757] shadow-sm'
                      : locked ? 'bg-white text-gray-500 border-amber-200 ring-1 ring-amber-100'
                      : 'bg-neutral-100 text-neutral-600 border-transparent hover:bg-neutral-200',
                  )}
                >
                  {showNew && (
                    <span className="absolute -top-2 -right-1 inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none shadow-sm">
                      NEW
                    </span>
                  )}
                  {chip.emoji} {chip.label}
                  {locked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      <Crown className="h-3 w-3" />
                      Plus
                    </span>
                  )}
                </motion.button>
              )
            })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* No mode selected */}
          {!activeChip && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-sm text-muted-foreground mb-4">Choose a mode above — scan menus, check food, or cook from what you have</p>
              <Button size="sm" onClick={() => handleChipSelect('snap')} className="gap-1.5 bg-[#D97757] hover:bg-[#C86646] text-white rounded-full px-5">
                <Camera className="h-3.5 w-3.5" /> Snap &amp; Cook
              </Button>
            </motion.div>
          )}


          {/* Snap & Cook: Capture Phase */}
          {activeChip === 'snap' && pantryPhase === 'capture' && (
            <motion.div key="snap-capture" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {snapError && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{snapError}</div>
              )}
              <PantryCapture onConfirm={handleSnapConfirm} onCancel={() => setActiveChip(null)} />
            </motion.div>
          )}

          {/* Snap & Cook / Pantry Meals: Results Phase */}
          {(activeChip === 'snap' || activeChip === 'pantry') && pantryPhase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {activeChip === 'snap' ? (<><Camera className="h-5 w-5 text-emerald-600" /> From Your Photo</>) : (<><Utensils className="h-5 w-5 text-emerald-600" /> From Your Pantry</>)}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeChip === 'snap' ? 'Meals you can make with what we spotted' : 'Meals from your stocked pantry items'}
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 text-[#D97757] animate-spin mb-4" />
                  <p className="text-sm font-semibold text-foreground">
                    {activeChip === 'snap' ? 'Building meals from your fridge + pantry…' : 'Finding meals from your pantry…'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Matching ingredients to recipes</p>
                </div>
              ) : snapError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <span className="text-3xl block mb-2">⚠️</span>
                  <p className="text-sm font-semibold text-foreground">We found ingredients, but couldn&apos;t build a meal yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">{snapError}</p>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => { setSnapError(null); if (lastConfirmedItemsRef.current.length > 0) handleSnapConfirm(lastConfirmedItemsRef.current) }} className="gap-1.5 bg-[#D97757] hover:bg-[#C86646] text-white rounded-full">
                      <RefreshCw className="h-3.5 w-3.5" /> Try Again
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleErrorBoundaryEditIngredients} className="gap-1.5 rounded-full">Edit Ingredients</Button>
                  </div>
                </div>
              ) : pantryMatches.length > 0 ? (
                <SnapCookErrorBoundary onReset={handleErrorBoundaryReset} onEditIngredients={handleErrorBoundaryEditIngredients} onBack={handleErrorBoundaryBack}>
                  <>
                    <PantryMatchList matches={pantryMatches} onCook={handleCook} onSwap={handleSwap} onOrder={() => {}} source="snap" />
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setPantryPhase('capture'); setPantryMatches([]); setSnapError(null) }} className="gap-1.5 rounded-full border-neutral-200">
                          <Camera className="h-3.5 w-3.5" /> Scan again
                        </Button>
                        <Button variant="outline" size="sm" disabled={loading} onClick={() => activeChip === 'pantry' ? handlePantryFetch() : setPantryPhase('capture')} className="gap-1.5 ml-auto rounded-full border-neutral-200">
                          <RefreshCw className="h-3.5 w-3.5" /> Refresh
                        </Button>
                      </div>
                  </>
                </SnapCookErrorBoundary>
              ) : (
                <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
                  <span className="text-3xl block mb-2">🥫</span>
                  <p className="text-sm font-semibold text-foreground">{activeChip === 'pantry' ? 'Your pantry is empty' : 'No matches found'}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">{activeChip === 'pantry' ? 'Add items to your pantry first to see what you can cook.' : 'Try scanning again with a clearer photo or more items.'}</p>
                  {activeChip === 'pantry' ? (
                    <Button size="sm" variant="outline" onClick={() => router.push('/pantry')} className="gap-1.5 rounded-full border-neutral-200">Go to Pantry</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setPantryPhase('capture'); setPantryMatches([]); setSnapError(null) }} className="gap-1.5 rounded-full border-neutral-200">
                      <Camera className="h-3.5 w-3.5" /> Try again
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Smart Leftovers */}
          {activeChip === 'leftover' && (
            <motion.div key="leftover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {!leftoverMeal ? (
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-foreground leading-snug flex items-center gap-2">
                      <Recycle className="h-5 w-5 text-emerald-600" /> What leftovers do you have?
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Tell us what&apos;s left over and we&apos;ll transform it</p>
                  </div>
                  {snapError && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{snapError}</div>
                  )}
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={leftoverInput} onChange={e => setLeftoverInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLeftoverItem() } }}
                      placeholder="e.g. leftover rice, roasted chicken"
                      className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#D97757]/60 focus:ring-2 focus:ring-[#D97757]/20 transition-all"
                      autoFocus
                    />
                    <button onClick={addLeftoverItem} disabled={!leftoverInput.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757] text-white hover:bg-[#C86646] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                      +
                    </button>
                  </div>
                  {leftoverItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {leftoverItems.map(item => (
                        <span key={item} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-[#D97757]/8 border border-[#D97757]/20 text-sm text-[#D97757]">
                          {item}
                          <button onClick={() => removeLeftoverItem(item)} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[#D97757]/20 transition-colors text-xs">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Button onClick={handleLeftoverGenerate} disabled={leftoverItems.length === 0 || loading} className="w-full gap-2 bg-[#D97757] hover:bg-[#C86646] text-white rounded-full">
                    {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Building your meal…</>) : (<><Sparkles className="h-4 w-4" /> Transform my leftovers</>)}
                  </Button>
                  <button onClick={() => setActiveChip(null)} className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">Cancel</button>
                </div>
              ) : (
                <SnapCookErrorBoundary
                  onReset={() => { setLeftoverMeal(null); handleLeftoverGenerate() }}
                  onEditIngredients={() => setLeftoverMeal(null)}
                  onBack={() => { setLeftoverMeal(null); setActiveChip(null) }}
                >
                  <div>
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2 text-xs border-[#D97757]/30 text-[#D97757] bg-[#D97757]/5">♻️ Leftover Transformation</Badge>
                      <h2 className="text-lg font-bold text-foreground">{leftoverMeal.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Made from: {leftoverItems.join(', ')}</p>
                    </div>
                    <MealCard meal={leftoverMeal} onCook={() => handleCook(leftoverMeal)} onSwap={() => { setLeftoverMeal(null); handleLeftoverGenerate() }} onOrder={() => {}} source="leftovers" />
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setLeftoverMeal(null); setLeftoverItems([]) }} className="gap-1.5 rounded-full border-neutral-200">Start over</Button>
                      <Button variant="outline" size="sm" disabled={loading} onClick={() => { setLeftoverMeal(null); handleLeftoverGenerate() }} className="gap-1.5 ml-auto rounded-full border-neutral-200">
                        <RefreshCw className="h-3.5 w-3.5" /> Try another
                      </Button>
                    </div>
                  </div>
                </SnapCookErrorBoundary>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="scan"
        title="Unlock Snap & Cook Plus tools"
        description="Upgrade to access Pantry Meals and Smart Leftovers — plus unlimited Snap & Cook scans."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/dashboard/cook"
      />
    </div>
  )
}
