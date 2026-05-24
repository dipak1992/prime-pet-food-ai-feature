'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Clock, Users, DollarSign, CheckCircle, ChefHat, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hapticTap, hapticSuccess } from '@/lib/scan/haptics'
import { trackScan } from '@/lib/scan/analytics'
import { SaveReminderCard } from '@/components/shared/SaveReminderCard'
import type { FridgeResult, Ingredient, FridgeRecipe } from '@/lib/scan/types'

interface FridgeResultsProps {
  result: FridgeResult
  isDemo?: boolean
  onClose: () => void
  onRetake: () => void
}

export function FridgeResults({ result, isDemo = false, onClose, onRetake }: FridgeResultsProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(result.ingredients)
  const [savedToPantry, setSavedToPantry] = useState(result.savedToPantry)
  const [saving, setSaving] = useState(false)
  const [newIngredientName, setNewIngredientName] = useState('')

  const removeIngredient = (id: string) => {
    hapticTap()
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  const addIngredient = () => {
    const name = newIngredientName.trim()
    if (!name) return
    hapticTap()
    setIngredients((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name,
      },
    ])
    setNewIngredientName('')
    trackScan('scan_ingredient_manual_add', { ingredient_count: ingredients.length + 1 })
  }

  const handleSavePantry = async () => {
    if (isDemo) {
      window.location.href = '/signup?intent=save-pantry'
      return
    }
    if (savedToPantry || saving || ingredients.length === 0) return
    hapticSuccess()
    setSaving(true)
    try {
      await fetch('/api/pantry/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      setSavedToPantry(true)
      trackScan('scan_save_pantry', { ingredient_count: ingredients.length })
    } catch {
      // Silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
              Fridge Scan
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Review, correct, then cook from what you have
            </p>
          </div>
          <button
            onClick={() => { hapticTap(); onRetake() }}
            className="text-sm text-[#D97757] font-semibold"
          >
            Retake
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-6">
        {/* Ingredient chips */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Detected Ingredients
            </h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50">
              {ingredients.length} found
            </span>
          </div>

          {ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <motion.div
                  key={ing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  {ing.emoji && <span>{ing.emoji}</span>}
                  <span>{ing.name}</span>
                  {ing.quantity && (
                    <span className="text-neutral-400 text-xs">{ing.quantity}{ing.unit}</span>
                  )}
                  <button
                    onClick={() => removeIngredient(ing.id)}
                    className="ml-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    aria-label={`Remove ${ing.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              Nothing is selected yet. Add the obvious ingredients manually or retake with the fridge light on and the camera held steady.
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={newIngredientName}
              aria-label="Add missed ingredient"
              onChange={(event) => setNewIngredientName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addIngredient()
                }
              }}
              placeholder="Add missed ingredient"
              className="min-h-11 flex-1 rounded-2xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#D97757]/50 focus:ring-2 focus:ring-[#D97757]/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={addIngredient}
              disabled={!newIngredientName.trim()}
              className="min-h-11 rounded-2xl bg-neutral-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
            >
              Add
            </button>
          </div>

          {/* Save to pantry */}
          <button
            onClick={handleSavePantry}
            disabled={savedToPantry || saving || ingredients.length === 0}
            className={cn(
              'mt-3 flex items-center gap-2 text-sm font-semibold transition-colors',
              savedToPantry
                ? 'text-green-600 dark:text-green-400'
                : ingredients.length === 0
                  ? 'text-neutral-400'
                  : 'text-[#D97757] hover:text-[#C86646]'
            )}
          >
            {savedToPantry ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved to pantry
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save all to pantry'}
              </>
            )}
          </button>
        </section>

        {/* Recipe suggestions */}
        {result.recipes.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              Recipe Ideas
            </h3>
            <div className="space-y-3">
              {result.recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} isDemo={isDemo} />
              ))}
            </div>
          </section>
        )}

        {/* Save & Remind CTA — only for authenticated users */}
        {!isDemo && result.recipes.length > 0 && (
          <SaveReminderCard
            mealId={result.recipes[0].id}
            mealName={result.recipes[0].title}
            variant="scan"
          />
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <button
          onClick={() => { hapticTap(); onClose() }}
          className="w-full py-3 rounded-2xl bg-[#D97757] text-white font-semibold hover:bg-[#C86646] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function RecipeCard({ recipe, isDemo }: { recipe: FridgeRecipe; isDemo: boolean }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden">
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{recipe.title}</h4>
        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.cookTime}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {recipe.servings}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            ~${recipe.estimatedCost.toFixed(2)}
          </span>
        </div>
        {recipe.missingIngredients.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Missing: {recipe.missingIngredients.join(', ')}
          </p>
        )}
        <button
          onClick={() => {
            window.location.href = isDemo ? `/signup?intent=scan-recipe&recipe=${recipe.id}` : `/recipes/${recipe.id}`
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D97757] text-sm font-semibold text-white hover:bg-[#C86646] transition-colors"
        >
          <ChefHat className="h-4 w-4" aria-hidden />
          {isDemo ? 'Unlock this recipe' : 'Cook this tonight'}
        </button>
        {recipe.missingIngredients.length > 0 && !isDemo && (
          <button
            type="button"
            onClick={() => {
              window.location.href = `/grocery-list?source=scan&items=${encodeURIComponent(recipe.missingIngredients.join(','))}`
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Add missing to list
          </button>
        )}
      </div>
    </div>
  )
}
