import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, ChefHat, ShieldCheck, ChevronLeft } from 'lucide-react'
import { AllergenSafetyFooter } from '@/components/recipes/AllergenSafetyFooter'
import type { SmartMealResult, SmartVariation } from '@/lib/engine/types'

export const metadata = { title: 'Meal Detail' }

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
    <div className="glass-card rounded-xl border border-border/60 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{variation.emoji}</span>
        <span className="font-semibold">{variation.label}</span>
        <Badge className={`${colorClass} border-0 text-xs capitalize`}>{variation.stage}</Badge>
        {variation.allergyWarnings.length === 0 && (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs"><ShieldCheck className="h-3 w-3 mr-1" />Safe</Badge>
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

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: row } = await supabase
    .from('saved_meals')
    .select('meal_data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!row?.meal_data) notFound()

  const meal = row.meal_data as SmartMealResult

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/planner"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Planner
      </Link>
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {meal.difficulty && <Badge variant="secondary" className="capitalize">{meal.difficulty}</Badge>}
          {meal.cuisineType && <Badge variant="outline" className="capitalize">{meal.cuisineType}</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-3">{meal.title}</h1>
        {meal.tagline && <p className="text-muted-foreground text-lg leading-relaxed">{meal.tagline}</p>}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          {meal.prepTime != null && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Prep: {meal.prepTime} min</span>}
          {meal.cookTime != null && <span className="flex items-center gap-1.5"><ChefHat className="h-4 w-4" />Cook: {meal.cookTime} min</span>}
          {meal.variations && meal.variations.length > 0 && (
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{meal.variations.length} variations</span>
          )}
        </div>
      </div>

      {meal.ingredients && meal.ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <div className="glass-card rounded-xl border border-border/60 p-5">
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="font-medium">{ing.quantity} {ing.unit}</span>
                  <span>{ing.name}</span>
                  {ing.note && <span className="text-muted-foreground">({ing.note})</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {meal.steps && meal.steps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="glass-card rounded-xl border border-border/60 p-5">
            <ol className="space-y-3">
              {meal.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {meal.variations && meal.variations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Family Variations</h2>
          <p className="text-sm text-muted-foreground mb-4">Each family member gets their own safe, tailored version of this meal.</p>
          <div className="space-y-4">
            {meal.variations.map((v, i) => <MemberVariation key={i} variation={v} />)}
          </div>
        </section>
      )}

      {/* Allergen Safety Footer */}
      <AllergenSafetyFooter
        variations={meal.variations}
      />
    </div>
  )
}
