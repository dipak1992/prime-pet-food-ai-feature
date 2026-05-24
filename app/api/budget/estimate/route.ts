import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { estimateRecipeCost, estimateWeekCost } from '@/lib/budget/cost-estimator'
import type { RecipeIngredient } from '@/lib/budget/types'
import { cleanString, uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const ingredientSchema = z.object({
  name: cleanString(100),
  quantity: z.coerce.number().min(0).max(10000).optional(),
  unit: z.string().max(40).default(''),
  category: z.enum(['produce', 'meat', 'seafood', 'dairy', 'grains', 'pantry', 'frozen', 'beverages', 'other']).optional(),
}).passthrough()

const recipeEstimateSchema = z.object({
  type: z.literal('recipe'),
  recipeId: uuidSchema,
  recipeName: cleanString(140),
  ingredients: z.array(ingredientSchema).min(1).max(200),
  servings: z.coerce.number().int().min(1).max(50),
}).strict()

const weekEstimateSchema = z.object({
  type: z.literal('week'),
  recipes: z.array(recipeEstimateSchema.omit({ type: true })).min(1).max(14),
}).strict()

const estimateSchema = z.discriminatedUnion('type', [recipeEstimateSchema, weekEstimateSchema])

// ─── POST /api/budget/estimate ────────────────────────────────────────────────
// Body: { type: 'recipe' | 'week', ... }

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paywall = await getPaywallStatus()
  if (!paywall.isPro) {
    return NextResponse.json({ error: 'Plus plan required' }, { status: 403 })
  }

  const parsed = estimateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
  const body = parsed.data
  const { type } = body

  // ── Load user's zip code ──────────────────────────────────────────────────
  const { data: budgetRow } = await supabase
    .from('budgets')
    .select('zip_code')
    .eq('user_id', user.id)
    .maybeSingle()

  const zipCode = budgetRow?.zip_code ?? null

  // ── Recipe estimate ───────────────────────────────────────────────────────
  if (type === 'recipe') {
    const { recipeId, recipeName, ingredients, servings } = body

    const estimate = await estimateRecipeCost(
      recipeId,
      recipeName ?? 'Unknown Recipe',
      ingredients as RecipeIngredient[],
      servings,
      zipCode,
    )

    return NextResponse.json(estimate)
  }

  // ── Week estimate ─────────────────────────────────────────────────────────
  if (type === 'week') {
    const result = await estimateWeekCost(body.recipes as Array<{ recipeId: string; recipeName: string; ingredients: RecipeIngredient[]; servings: number }>, zipCode)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
