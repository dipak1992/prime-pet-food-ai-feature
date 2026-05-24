'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, ChefHat, Users, ShieldCheck, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { CookMode } from '@/components/recipes/CookMode'
import { AllergenSafetyFooter } from '@/components/recipes/AllergenSafetyFooter'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { mealToRecipe, type MealPillar } from '@/lib/recipes/canonical'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import type { SmartMealResult, SmartVariation } from '@/lib/engine/types'

function MemberVariation({ variation }: { variation: SmartVariation }) {
  const stageColors: Record<string, string> = {
    baby: 'bg-purple-100 text-purple-700',
    toddler: 'bg-amber-100 text-amber-700',
    kid: 'bg-emerald-100 text-emerald-700',
    teen: 'bg-cyan-100 text-cyan-700',
    adult: 'bg-blue-100 text-blue-700',
    senior: 'bg-slate-100 text-slate-700',
    pregnant: 'bg-pink-100 text-pink-700',
    breastfeeding: 'bg-rose-100 text-rose-700',
  }
  const colorClass = stageColors[variation.stage] ?? 'bg-gray-100 text-gray-700'
  return (
    <div className="rounded-xl border border-border/60 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{variation.emoji}</span>
        <span className="font-semibold">{variation.label}</span>
        <Badge className={`${colorClass} border-0 text-xs capitalize`}>{variation.stage}</Badge>
        {variation.allergyWarnings.length === 0 && (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />Safe
          </Badge>
        )}
      </div>
      {variation.description && <p className="text-sm text-muted-foreground">{variation.description}</p>}
      {variation.modifications && variation.modifications.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Modifications:</p>
          <ul className="space-y-1">
            {variation.modifications.map((mod, i) => <li key={i} className="text-sm">• {mod}</li>)}
          </ul>
        </div>
      )}
      {variation.allergyWarnings.length > 0 && (
        <p className="text-xs text-amber-600">⚠️ {variation.allergyWarnings.join(', ')}</p>
      )}
      {variation.safetyNotes.length > 0 && (
        <p className="text-xs text-blue-600 mt-0.5">💊 {variation.safetyNotes.join(', ')}</p>
      )}
    </div>
  )
}

export default function TonightRecipePage() {
  const router = useRouter()
  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [source, setSource] = useState<MealPillar>('tonight')
  const [showCookMode, setShowCookMode] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { status } = usePaywallStatus()
  const addCustomItem = useWeeklyPlanStore((s) => s.addCustomItem)

  useEffect(() => {
    const raw = sessionStorage.getItem('tonight-meal')
    if (raw) {
      try {
        setMeal(JSON.parse(raw) as SmartMealResult)
        const storedSource = sessionStorage.getItem('recipe-source') as MealPillar | null
        if (storedSource) setSource(storedSource)
        if (sessionStorage.getItem('recipe-open-cook') === 'true') {
          sessionStorage.removeItem('recipe-open-cook')
          setShowCookMode(true)
        }
      } catch {
        router.replace('/tonight')
      }
    } else {
      router.replace('/tonight')
    }
  }, [router])

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading recipe…</div>
      </div>
    )
  }

  const recipe = mealToRecipe(meal, source)

  if (showCookMode && !status.isPro) {
    return (
      <PaywallDialog
        open
        onOpenChange={(open) => {
          setPaywallOpen(open)
          if (!open) setShowCookMode(false)
        }}
        feature="guided_cooking"
        title="Unlock guided cooking with Plus"
        description="The basic recipe is yours. Plus adds step-by-step Cook Mode, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/tonight/recipe"
      />
    )
  }

  function addIngredientsToGrocery() {
    if (!meal) return
    const items = meal.shoppingList?.length
      ? meal.shoppingList
      : meal.ingredients.filter((item) => !item.fromPantry).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        }))

    for (const item of items) {
      addCustomItem({
        name: item.name,
        quantity: Number.parseFloat(String(item.quantity)) || 1,
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Ingredients added to grocery list.')
  }

  if (showCookMode) {
    return (
      <CookMode
        recipe={recipe}
        recipeId={recipe.id}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => {
            try {
              const src = sessionStorage.getItem('recipe-back')
              if (src) { router.push(src) } else { router.back() }
            } catch { router.back() }
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {meal.difficulty && <Badge variant="secondary" className="capitalize">{meal.difficulty}</Badge>}
            {meal.cuisineType && <Badge variant="outline" className="capitalize">{meal.cuisineType}</Badge>}
            {meal.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{meal.title}</h1>
          {meal.tagline && <p className="text-muted-foreground mt-1">{meal.tagline}</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            {meal.totalTime && (
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {meal.totalTime} min</span>
            )}
            {meal.servings && (
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {meal.servings} servings</span>
            )}
            {meal.estimatedCost != null && (
              <span className="flex items-center gap-1">~${meal.estimatedCost.toFixed(2)}</span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                if (!status.isPro) {
                  setPaywallOpen(true)
                  return
                }
                setShowCookMode(true)
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <ChefHat className="h-4 w-4" />
              Start Cooking
            </Button>
            <SaveMealButton meal={meal} source={source} className="h-10 w-10 border border-border" />
            <Button variant="outline" onClick={addIngredientsToGrocery} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add groceries
            </Button>
          </div>
        </div>

        {/* Meal image */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8">
          {meal.imageUrl && !imgFailed ? (
            <img
              src={meal.imageUrl}
              alt={meal.title}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 flex flex-col items-center justify-center gap-3">
              <span className="text-7xl">🍽️</span>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">{meal.title}</p>
                <p className="text-xs text-muted-foreground">Easy • Personalized • Ready Tonight</p>
              </div>
            </div>
          )}
        </div>

        {meal.description && (
          <p className="text-foreground/80 leading-relaxed mb-8">{meal.description}</p>
        )}

        {/* Ingredients */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-emerald-600" />
            Ingredients
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {meal.ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white border border-border/60 px-4 py-2.5">
                <span className="text-emerald-600 mt-0.5">•</span>
                <span className="text-sm">
                  <span className="font-medium">{ing.quantity} {ing.unit}</span>{' '}
                  {ing.name}
                  {ing.note && <span className="text-muted-foreground ml-1">({ing.note})</span>}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {meal.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Leftover tip */}
        {meal.leftoverTip && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-8">
            <p className="text-sm text-blue-900">🥡 <span className="font-semibold">Leftover tip:</span> {meal.leftoverTip}</p>
          </div>
        )}

        {/* Variations */}
        {meal.variations && meal.variations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Family Variations</h2>
            <div className="space-y-3">
              {meal.variations.map((v, i) => (
                <MemberVariation key={i} variation={v} />
              ))}
            </div>
          </section>
        )}

        {/* Allergen Safety Footer */}
        <AllergenSafetyFooter
          variations={meal.variations}
        />
      </div>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title="Unlock guided cooking with Plus"
        description="The basic recipe is yours. Plus adds step-by-step Cook Mode, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/tonight/recipe"
      />
    </div>
  )
}
