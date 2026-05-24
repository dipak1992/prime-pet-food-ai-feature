'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, Lock, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react'
import type { LeftoverSuggestion } from '@/lib/leftovers/types'
import type { SmartMealResult } from '@/lib/engine/types'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { persistMealForRecipe } from '@/lib/recipes/canonical'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'

type State = 'idle' | 'loading' | 'ready' | 'gated' | 'error'

type Props = {
  leftoverId: string
  leftoverName: string
}

export function LeftoverRecipeSuggestions({ leftoverId, leftoverName }: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [suggestions, setSuggestions] = useState<LeftoverSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { status } = usePaywallStatus()
  const addCustomItem = useWeeklyPlanStore((s) => s.addCustomItem)

  function toMeal(suggestion: LeftoverSuggestion): SmartMealResult {
    return {
      id: suggestion.id,
      title: suggestion.name,
      tagline: `Uses ${leftoverName}`,
      description: suggestion.description,
      cuisineType: 'leftovers',
      imageUrl: suggestion.image ?? undefined,
      prepTime: 5,
      cookTime: suggestion.cookTimeMin,
      totalTime: suggestion.cookTimeMin + 5,
      estimatedCost: 4,
      servings: 2,
      difficulty: suggestion.difficulty === 'medium' ? 'moderate' : suggestion.difficulty,
      tags: ['Leftovers AI', 'low-waste'],
      ingredients: [
        { name: leftoverName, quantity: '1', unit: 'portion', fromPantry: true, category: 'other' },
        { name: 'Eggs or protein boost', quantity: '2', unit: 'whole', fromPantry: false, category: 'other' },
        { name: 'Fresh vegetables', quantity: '2', unit: 'cups', fromPantry: false, category: 'produce' },
      ],
      steps: [
        `Warm the ${leftoverName} gently so it is hot throughout.`,
        'Add the fresh ingredients and cook until tender.',
        'Season, taste, and serve while warm.',
      ],
      variations: [],
      leftoverTip: `This uses ${leftoverName} before it becomes waste and can become tomorrow's lunch.`,
      shoppingList: [
        { name: 'Eggs or protein boost', quantity: '2', unit: 'whole', category: 'protein', estimatedCost: 2, substituteOptions: [] },
        { name: 'Fresh vegetables', quantity: '2', unit: 'cups', category: 'produce', estimatedCost: 2, substituteOptions: [] },
      ],
      meta: {
        score: 1,
        matchedPantryItems: [leftoverName, ...suggestion.usesIngredients],
        pantryUtilization: 0.5,
        simplifiedForEnergy: true,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'Built from your leftovers.',
      },
    }
  }

  function cookMeal(meal: SmartMealResult) {
    if (!status.isPro) {
      setPaywallOpen(true)
      return
    }
    persistMealForRecipe(meal, '/leftovers', 'leftovers')
    sessionStorage.setItem('recipe-open-cook', 'true')
    router.push('/tonight/recipe')
  }

  function addGroceries(meal: SmartMealResult) {
    for (const item of meal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: Number.parseFloat(String(item.quantity)) || 1,
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Missing ingredients added.')
  }

  async function fetchSuggestions() {
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/leftovers/suggest-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leftoverId }),
      })

      if (res.status === 402) {
        setState('gated')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to get suggestions')
      }

      const data: LeftoverSuggestion[] = await res.json()
      setSuggestions(data)
      setState('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950">AI Recipe Ideas</h3>
        {state === 'ready' && (
          <button
            onClick={fetchSuggestions}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-orange-50 hover:text-slate-950"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fetchSuggestions}
            className="w-full rounded-xl border border-dashed border-orange-200 py-4 text-sm text-slate-500 hover:border-[#D97757]/50 hover:text-[#D97757] transition-colors"
          >
            <ChefHat className="mx-auto mb-1.5 h-5 w-5" />
            Get AI recipe ideas for {leftoverName}
          </motion.button>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-6 text-slate-500"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <ChefHat className="h-6 w-6 text-[#D97757]" />
            </motion.div>
            <p className="text-xs">Finding recipes…</p>
          </motion.div>
        )}

        {state === 'gated' && (
          <motion.div
            key="gated"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-[#B8935A]/10 border border-[#B8935A]/30 p-4 text-center space-y-2"
          >
            <Lock className="mx-auto h-5 w-5 text-[#B8935A]" />
            <p className="text-sm font-semibold text-slate-950">Weekly limit reached</p>
            <p className="text-xs text-slate-500">
              Free members get 2 AI recipe suggestions per week.
            </p>
            <a
              href="/upgrade?feature=leftovers"
              className="inline-block mt-1 rounded-lg bg-[#B8935A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a07848]"
            >
              Upgrade to Plus
            </a>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-4 text-center"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchSuggestions}
              className="text-xs text-[#D97757] hover:underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        {state === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {suggestions.map((s, i) => (
              (() => {
                const meal = toMeal(s)
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl bg-orange-50/70 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-950 leading-tight">{s.name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        s.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.difficulty === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {s.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {s.cookTimeMin} min
                      </span>
                      <span>Uses: {s.usesIngredients.slice(0, 3).join(', ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button onClick={() => cookMeal(meal)} className="rounded-lg bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white">
                        <ChefHat className="mx-auto h-3.5 w-3.5" />Cook
                      </button>
                      <SaveMealButton meal={meal} source="leftovers" className="h-auto min-h-0 w-full rounded-lg bg-white px-2 py-2 text-slate-700 hover:bg-white" />
                      <button onClick={() => addGroceries(meal)} className="rounded-lg bg-white px-2 py-2 text-[11px] font-semibold text-slate-700">
                        <ShoppingCart className="mx-auto h-3.5 w-3.5" />List
                      </button>
                    </div>
                  </motion.div>
                )
              })()
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="leftovers"
        title="Turn leftovers into dinner with Plus"
        description="Track what expires soon, get leftover-aware recipe ideas, and cook them with guided steps."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/leftovers"
      />
    </div>
  )
}
