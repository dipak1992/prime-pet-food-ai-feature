'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'

type Ingredient = LoadedRecipe['ingredients'][number]

type Props = {
  ingredients: Ingredient[]
  defaultServings?: number
}

export function IngredientList({ ingredients, defaultServings = 4 }: Props) {
  const [servings, setServings] = useState(defaultServings)
  const scale = servings / defaultServings

  return (
    <div className="rounded-3xl border border-orange-100/80 bg-white/88 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <ShoppingCart className="h-4 w-4 text-[#D97757]" />
          Ingredients
        </h2>
        {/* Servings scaler */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            disabled={servings <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100 disabled:opacity-30"
            aria-label="Decrease servings"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[4rem] text-center text-xs text-slate-500">
            {servings} serving{servings !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(20, s + 1))}
            disabled={servings >= 20}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100 disabled:opacity-30"
            aria-label="Increase servings"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ul className="space-y-2.5">
        {ingredients.map((ing, i) => {
          const scaledQty = ing.quantity * scale
          const displayQty = Number.isInteger(scaledQty)
            ? scaledQty.toString()
            : scaledQty.toFixed(1)
          return (
            <li key={i} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97757]" />
                <span className="text-sm text-slate-700">{ing.name}</span>
              </div>
              <span className="shrink-0 text-sm text-slate-500">
                {displayQty} {ing.unit}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
