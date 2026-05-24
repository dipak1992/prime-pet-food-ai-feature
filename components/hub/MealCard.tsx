'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, RefreshCw, ShoppingCart, Flame, ChevronDown, ChevronUp, Leaf, ExternalLink, ShieldCheck } from 'lucide-react'
import type { SmartMealResult } from '@/lib/engine/types'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { ShareMealButton } from '@/components/content/ShareMealButton'
import { persistMealForRecipe, type MealPillar } from '@/lib/recipes/canonical'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'

// ── Helpers ─────────────────────────────────────────────────

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

// ── Props ───────────────────────────────────────────────────

interface Props {
  meal: SmartMealResult
  /** Optional pantry match percentage (0-100) */
  pantryMatch?: number
  /** Swap button is animating */
  swapping?: boolean
  onCook: () => void
  onSwap: () => void
  onOrder: () => void
  source?: MealPillar
}

// ── Component ───────────────────────────────────────────────

export function MealCard({ meal, pantryMatch, swapping, onCook, onSwap, onOrder, source = 'tonight' }: Props) {
  const [showIngredients, setShowIngredients] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const router = useRouter()
  const { status } = usePaywallStatus()

  // ── Safe null guards — prevent crash if meal data is incomplete ──
  if (!meal || !meal.id) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
        <p className="text-sm font-semibold text-amber-800">Meal data unavailable</p>
        <p className="text-xs text-amber-700 mt-1">Try scanning again or refreshing.</p>
      </div>
    )
  }

  const safeIngredients = Array.isArray(meal.ingredients) ? meal.ingredients : []
  const safeSteps = Array.isArray(meal.steps) ? meal.steps : []
  const safeDifficulty: 'easy' | 'moderate' | 'hard' = meal.difficulty ?? 'easy'
  const safeMeta = meal.meta ?? { pantryUtilization: 0, matchedPantryItems: [], score: 0, simplifiedForEnergy: false, pickyEaterAdjusted: false, localityApplied: false, selectionReason: '' }

  const pantryItems = safeIngredients.filter((i) => i?.fromPantry === true)
  const toBuyItems = safeIngredients.filter((i) => i?.fromPantry !== true)

  function handleViewRecipe() {
    try {
      persistMealForRecipe(meal, '/dashboard', source)
    } catch {}
    router.push('/tonight/recipe')
  }

  function handleCookClick() {
    if (!status.isPro) {
      setPaywallOpen(true)
      return
    }
    onCook()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <h3 className="text-base font-bold text-foreground leading-snug">{meal.title ?? 'Untitled Meal'}</h3>
        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{meal.tagline ?? meal.description ?? ''}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {meal.chefVerified && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5" title="Reviewed and verified by a professional chef">
              <ShieldCheck className="h-3 w-3" />
              Chef-Verified
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#D97757]/8 text-[#D97757] border border-[#D97757]/20 rounded-full px-2.5 py-0.5">
            <Clock className="h-3 w-3" />
            {formatTime(meal.totalTime ?? 0)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-100 text-neutral-600 rounded-full px-2.5 py-0.5">
            <DifficultyDots difficulty={safeDifficulty} />
            <span className="capitalize">{safeDifficulty}</span>
          </span>
          {pantryMatch != null && pantryMatch > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5">
              <Flame className="h-3 w-3" />
              {pantryMatch}% pantry
            </span>
          )}
          {!pantryMatch && (safeMeta.pantryUtilization ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5">
              <Flame className="h-3 w-3" />
              {Math.round((safeMeta.pantryUtilization ?? 0) * 100)}% pantry
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ShareMealButton meal={meal} className="h-7 w-7" />
            <SaveMealButton meal={meal} source={source} className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Pantry usage hint */}
      {pantryItems.length > 0 && (
        <div className="flex items-center gap-1.5 px-5 pb-2 text-xs text-emerald-700 font-medium">
          <Leaf className="h-3 w-3" />
          Uses {pantryItems.length} pantry item{pantryItems.length > 1 ? 's' : ''}:{' '}
          {pantryItems.slice(0, 3).map((i) => i.name).join(', ')}
          {pantryItems.length > 3 && ` +${pantryItems.length - 3} more`}
        </div>
      )}

      {/* Expandable: Ingredients */}
      {safeIngredients.length > 0 && (
        <div className="border-t border-neutral-100">
          <button
            onClick={() => setShowIngredients((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <span>🛒 {toBuyItems.length} to buy · {pantryItems.length} from pantry</span>
            {showIngredients ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
          </button>
          <AnimatePresence>
            {showIngredients && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-3 space-y-2">
                  {toBuyItems.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Need to buy</p>
                      <div className="flex flex-wrap gap-1.5">
                        {toBuyItems.map((i, idx) => (
                          <span key={idx} className="text-xs bg-red-50 text-red-800 border border-red-200 rounded-full px-2 py-0.5">
                            {[i.quantity, i.unit, i.name].filter(Boolean).join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pantryItems.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">From pantry</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pantryItems.map((i, idx) => (
                          <span key={idx} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5">
                            {[i.quantity, i.unit, i.name].filter(Boolean).join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Expandable: Cooking steps */}
      {safeSteps.length > 0 && (
        <div className="border-t border-neutral-100">
          <button
            onClick={() => setShowSteps((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <span>📋 {safeSteps.length} cooking step{safeSteps.length !== 1 ? 's' : ''}</span>
            {showSteps ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
          </button>
          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <ol className="px-5 pb-3 space-y-1.5 list-decimal list-inside">
                  {safeSteps.map((step, idx) => (
                    <li key={idx} className="text-xs leading-relaxed text-neutral-500">
                      {step ?? ''}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* View Full Recipe link */}
      <div className="border-t border-neutral-100">
        <button
          onClick={handleViewRecipe}
          className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-[#D97757] hover:bg-[#D97757]/5 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Full Recipe
        </button>
      </div>

      {/* 3-button footer — Cook / Swap / Order */}
      <div className="grid grid-cols-3 border-t border-neutral-100">
        <button
          onClick={handleCookClick}
          className="flex flex-col items-center justify-center gap-1 py-3.5 hover:bg-[#D97757]/5 transition-colors group"
        >
          <ChefHat className="h-5 w-5 text-[#D97757]" />
          <span className="text-xs font-semibold text-[#D97757]">Cook</span>
        </button>
        <button
          onClick={onSwap}
          disabled={swapping}
          className="flex flex-col items-center justify-center gap-1 py-3.5 border-x border-neutral-100 hover:bg-neutral-50 transition-colors group disabled:opacity-60"
        >
          <RefreshCw className={`h-5 w-5 text-neutral-500 ${swapping ? 'animate-spin' : ''}`} />
          <span className="text-xs font-semibold text-neutral-600 group-hover:text-neutral-800">
            {swapping ? 'Swapping…' : 'Swap'}
          </span>
        </button>
        <button
          onClick={onOrder}
          className="flex flex-col items-center justify-center gap-1 py-3.5 hover:bg-blue-50 transition-colors group"
        >
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800">Order</span>
        </button>
      </div>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title="Unlock full recipes with Plus"
        description="Cook This is a Plus feature. Upgrade for guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/dashboard"
      />
    </motion.div>
  )
}
