'use client'

import { AnimatePresence } from 'framer-motion'
import { MealCard } from './MealCard'
import type { SmartMealResult } from '@/lib/engine/types'
import type { MealPillar } from '@/lib/recipes/canonical'

interface PantryMatch {
  meal: SmartMealResult
  pantryPercent: number
}

interface Props {
  matches: PantryMatch[]
  onCook: (meal: SmartMealResult) => void
  onSwap: (meal: SmartMealResult) => void
  onOrder: (meal: SmartMealResult) => void
  source?: MealPillar
}

export function PantryMatchList({ matches, onCook, onSwap, onOrder, source = 'snap' }: Props) {
  // Safe guard: ensure matches is always an array
  const safeMatches = Array.isArray(matches) ? matches : []

  if (safeMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white p-6 text-center">
        <span className="text-3xl block mb-2">🥫</span>
        <p className="text-sm font-semibold text-foreground">No pantry matches yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add items to your pantry to see meals you can make right now.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {safeMatches.slice(0, 3).map((m) => {
          // Guard against malformed match entries
          if (!m?.meal?.id) return null
          return (
            <MealCard
              key={m.meal.id}
              meal={m.meal}
              pantryMatch={typeof m.pantryPercent === 'number' ? m.pantryPercent : 0}
              onCook={() => onCook(m.meal)}
              onSwap={() => onSwap(m.meal)}
              onOrder={() => onOrder(m.meal)}
              source={source}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
