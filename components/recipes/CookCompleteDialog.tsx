'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Refrigerator, Star, CheckCircle2, Minus, Plus, Wallet, X } from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'

type Props = {
  recipe: LoadedRecipe
  recipeId: string
  onClose: () => void
}

type CompletionSummary = {
  leftoverSaved: boolean
  budgetUpdated: boolean
  nextLunchSuggestion: {
    title: string
    description: string
    ctaHref: string
  } | null
}

export function CookCompleteDialog({ recipe, recipeId, onClose }: Props) {
  const router = useRouter()
  const [servingsCooked, setServingsCooked] = useState(recipe.servings)
  const [leftoverServings, setLeftoverServings] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<CompletionSummary | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/recipes/${recipeId}/cook-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servingsCooked,
          leftoverServings,
          rating: rating > 0 ? rating : undefined,
          recipeName: recipe.name,
          recipeImage: recipe.image,
          costPerServing: recipe.costPerServing,
          mainIngredients: recipe.ingredients.slice(0, 5).map((item) => item.name),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json() as CompletionSummary
      setSummary(data)
      setSubmitting(false)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-orange-100 bg-white shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-orange-200" />
        </div>

        <div className="px-6 pb-10 pt-3 space-y-6">
          {summary ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-1">✅</div>
                  <h2 className="text-xl font-bold text-slate-950">Dinner is logged</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{recipe.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-orange-50 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-2">
                {summary.leftoverSaved && (
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3">
                    <Refrigerator className="mt-0.5 h-4 w-4 text-emerald-700" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Leftovers tracked</p>
                      <p className="text-xs text-emerald-700/80">MealEase will watch the use-by window for you.</p>
                    </div>
                  </div>
                )}
                {summary.budgetUpdated && (
                  <div className="flex items-start gap-3 rounded-2xl bg-orange-50 p-3">
                    <Wallet className="mt-0.5 h-4 w-4 text-[#D97757]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Budget updated</p>
                      <p className="text-xs text-slate-500">This cooked meal was added to the weekly food total.</p>
                    </div>
                  </div>
                )}
                {summary.nextLunchSuggestion && (
                  <div className="rounded-2xl border border-orange-100 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#D97757]">Tomorrow&rsquo;s lunch</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{summary.nextLunchSuggestion.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{summary.nextLunchSuggestion.description}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                {summary.nextLunchSuggestion && (
                  <button
                    type="button"
                    onClick={() => router.push(summary.nextLunchSuggestion!.ctaHref)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Use leftovers
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push('/dashboard?cooked=1')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50"
                >
                  Back to dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-1">🎉</div>
              <h2 className="text-xl font-bold text-slate-950">Nice cooking!</h2>
              <p className="text-sm text-slate-500 mt-0.5">{recipe.name}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-orange-50 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Star rating */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Rate this recipe
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? 0 : n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      n <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Servings cooked */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Servings cooked
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServingsCooked((s) => Math.max(1, s - 1))}
                disabled={servingsCooked <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100 disabled:opacity-30"
                aria-label="Decrease servings"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-2xl font-bold text-slate-950 tabular-nums">
                {servingsCooked}
              </span>
              <button
                type="button"
                onClick={() => setServingsCooked((s) => Math.min(20, s + 1))}
                disabled={servingsCooked >= 20}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100 disabled:opacity-30"
                aria-label="Increase servings"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Leftover servings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Leftover servings to track
              </p>
              <span className="text-sm font-bold text-slate-950 tabular-nums">
                {leftoverServings}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={servingsCooked}
              value={leftoverServings}
              onChange={(e) => setLeftoverServings(parseInt(e.target.value))}
              className="w-full accent-[#D97757]"
              aria-label="Leftover servings"
            />
            {leftoverServings > 0 && (
              <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1.5">
                <span>♻️</span>
                We&rsquo;ll remind you to use these within 3 days.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              'Saving…'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save dinner
              </>
            )}
          </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
