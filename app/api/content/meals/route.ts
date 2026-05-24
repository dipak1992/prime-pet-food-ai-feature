import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSlug } from '@/lib/content/types'
import type { SmartMealResult } from '@/lib/engine/types'
import type { MealPillar } from '@/lib/recipes/canonical'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('saved_meals')
    .select('id, slug, title, description, cuisine_type, meal_data, pillar_source, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    meals: (data ?? []).map((row) => ({
      ...row,
      pillar_source: row.pillar_source ?? (row.meal_data as { pillar_source?: MealPillar } | null)?.pillar_source ?? null,
      meal_data: undefined,
    })),
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { meal?: SmartMealResult; source?: MealPillar }
  const meal = body?.meal
  const source = body.source ?? 'tonight'

  if (!meal?.id || !meal?.title) {
    return NextResponse.json({ error: 'Invalid meal data' }, { status: 400 })
  }

  const slug = generateSlug(meal.title)
  const storedMeal = {
    ...meal,
    pillar_source: source,
    saved_at: new Date().toISOString(),
    grocery_data: meal.shoppingList ?? [],
    cost_estimate: meal.estimatedCost ?? null,
  }

  const { data, error } = await supabase
    .from('saved_meals')
    .insert({
      user_id: user.id,
      slug,
      title: meal.title,
      description: (meal as { description?: string }).description ?? null,
      cuisine_type: meal.cuisineType ?? null,
      pillar_source: source,
      tags: meal.tags ?? [],
      image_url: meal.imageUrl ?? null,
      cost_estimate: meal.estimatedCost ?? null,
      grocery_data: meal.shoppingList ?? [],
      meal_data: storedMeal,
      is_public: false,
    })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 })
}
