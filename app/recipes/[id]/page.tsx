import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { RecipeNotFoundError, loadRecipe } from './loader'
import { RecipeHero } from '@/components/recipes/RecipeHero'
import { IngredientList } from '@/components/recipes/IngredientList'
import { NutritionCard } from '@/components/recipes/NutritionCard'
import { RecipeActions } from '@/components/recipes/RecipeActions'
import { RecipeSafetyFooter } from '@/components/recipes/RecipeSafetyFooter'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cooked?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const recipe = await loadRecipe(id).catch((error) => {
    if (error instanceof RecipeNotFoundError) return null
    throw error
  })
  if (!recipe) return { title: 'Recipe not found — NutriNest AI' }
  return {
    title: `${recipe.name} — NutriNest AI`,
    description: recipe.description,
  }
}

export default async function RecipePage({ params, searchParams }: Props) {
  const { id } = await params
  const { cooked } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const recipe = await loadRecipe(id).catch((error) => {
    if (error instanceof RecipeNotFoundError) notFound()
    throw error
  })

  // Check if there's an active cook session
  const { data: activeSession } = await supabase
    .from('cook_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', id)
    .eq('status', 'active')
    .maybeSingle()

  const hasActiveSession = !!activeSession

  return (
    <>
      <DashboardNav />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.14),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#fefce8_28%,#f8fafc_100%)] pb-16">
        <div className="mx-auto max-w-2xl px-4 pt-4">
          {/* "Just cooked" banner */}
          {cooked === '1' && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
              🎉 Great job! Your cook session has been recorded.
            </div>
          )}

          {/* Hero */}
          <RecipeHero recipe={recipe} />

          <div className="mt-6 space-y-5">
            {/* Actions */}
            <RecipeActions recipe={recipe} recipeId={id} hasActiveSession={hasActiveSession} />

            {/* Instructions */}
            <section className="rounded-3xl border border-orange-100/80 bg-white/88 p-5 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-base font-semibold text-slate-950">Instructions</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step) => (
                  <li key={step.order} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D97757]/20 text-xs font-bold text-[#D97757]">
                      {step.order}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">{step.instruction}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Ingredients */}
            <IngredientList
              ingredients={recipe.ingredients}
              defaultServings={recipe.servings}
            />

            {/* Nutrition */}
            {recipe.nutrition && (
              <NutritionCard nutrition={recipe.nutrition} />
            )}

            <RecipeSafetyFooter recipe={recipe} />
          </div>
        </div>
      </main>
    </>
  )
}
