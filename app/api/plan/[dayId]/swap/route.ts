import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadWeekPlan } from '@/app/plan/loader'
import { getActiveLeftoverIngredients } from '@/app/api/leftovers/route'
import { scoreRecipe, getRecentProteins, getRecentCuisines, getDayType, getCurrentSeason } from '@/lib/plan/scoring'
import type { SwapCandidate } from '@/lib/plan/types'
import type { Recipe } from '@/lib/dashboard/types'
import { uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const swapRequestSchema = z.object({ recipeId: uuidSchema }).strict()

// ─── GET /api/plan/[dayId]/swap — load swap candidates ────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await params
  const parsedDayId = uuidSchema.safeParse(rawParams.dayId)
  if (!parsedDayId.success) return NextResponse.json({ error: 'Day not found' }, { status: 404 })
  const dayId = parsedDayId.data

  try {
    // ── Find the day row ─────────────────────────────────────────────────────
    const { data: dayRow } = await supabase
      .from('week_plan_days')
      .select('*, plan:plan_id(week_start, user_id), recipe:recipe_id(*)')
      .eq('id', dayId)
      .maybeSingle()

    if (!dayRow) return NextResponse.json({ error: 'Day not found' }, { status: 404 })

    const planRaw = dayRow.plan as unknown
    const planMeta = (Array.isArray(planRaw) ? planRaw[0] : planRaw) as {
      week_start: string
      user_id: string
    }
    if (planMeta.user_id !== user.id) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 })
    }

    const dayIndex = dayRow.day_index as number
    const currentRecipeId = (dayRow.recipe as { id?: string } | null)?.id ?? null

    // ── Load current week plan for context ───────────────────────────────────
    const currentPlan = await loadWeekPlan(user.id, planMeta.week_start)

    // ── Load household preferences ───────────────────────────────────────────
    const { data: householdRow } = await supabase
      .from('household_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const household = {
      size: (householdRow?.household_size as number) ?? 2,
      dietary: (householdRow?.dietary_restrictions as string[]) ?? [],
      dislikes: (householdRow?.dislikes as string[]) ?? [],
    }

    // ── Load budget ──────────────────────────────────────────────────────────
    const { data: budgetRow } = await supabase
      .from('budgets')
      .select('weekly_limit')
      .eq('user_id', user.id)
      .maybeSingle()

    const weeklyLimit = (budgetRow?.weekly_limit as number | null) ?? null
    const budgetPerMeal = weeklyLimit != null ? weeklyLimit / 7 : null

    // ── Load active leftover ingredients ─────────────────────────────────────
    const activeLeftoverIngredients = await getActiveLeftoverIngredients(user.id)

    // ── Recent proteins for variety ──────────────────────────────────────────
    const recentlyPlannedProteins = getRecentProteins(
      currentPlan.days.map((d) => ({
        recipe: d.recipe ? { name: d.recipe.name, ingredients: d.recipe.tags } : null,
        status: d.status,
        dayIndex: d.dayIndex,
      })),
      dayIndex,
    )

    // ── Load recipe candidates ───────────────────────────────────────────────
    // Get recipes from the recipes table, excluding the current one
    const query = supabase
      .from('recipes')
      .select('*')
      .limit(50)

    if (currentRecipeId) {
      query.neq('id', currentRecipeId)
    }

    const { data: recipeRows } = await query

    if (!recipeRows || recipeRows.length === 0) {
      return NextResponse.json({ candidates: [] })
    }

    // ── Score and rank candidates ────────────────────────────────────────────
    const recentCuisines = getRecentCuisines(
      currentPlan.days.map((d) => ({
        recipe: d.recipe ? { name: d.recipe.name, tags: d.recipe.tags } : null,
        dayIndex: d.dayIndex,
      })),
      dayIndex,
    )

    const scoringCtx = {
      activeLeftoverIngredients,
      budgetPerMeal,
      household,
      recentlyPlannedProteins,
      recentCuisines,
      pantryItems: [] as string[],
      season: getCurrentSeason(),
      dayType: getDayType(dayIndex),
      leftoverPriority: 'normal' as const,
    }

    const scored: SwapCandidate[] = recipeRows
      .map((row) => {
        const recipe: Recipe & { ingredients?: string[] } = {
          id: row.id as string,
          name: row.name as string,
          image: (row.image as string) ?? '',
          cookTimeMin: (row.cook_time_min as number) ?? 30,
          difficulty: (row.difficulty as Recipe['difficulty']) ?? 'easy',
          servings: (row.servings as number) ?? 4,
          costTotal: (row.cost_total as number) ?? 0,
          costPerServing: (row.cost_per_serving as number) ?? 0,
          tags: (row.tags as string[]) ?? [],
          ingredients: (row.ingredients as string[]) ?? [],
        }

        const { score, reasons, usesLeftover, withinBudget } = scoreRecipe(recipe, scoringCtx)

        return {
          recipe,
          reason: reasons.length > 0 ? reasons[0] : 'Good match for your household',
          matchScore: score,
          usesLeftover,
          withinBudget,
        } satisfies SwapCandidate
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8)

    return NextResponse.json({ candidates: scored })
  } catch (e) {
    console.error('[GET /api/plan/[dayId]/swap]', e)
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 })
  }
}

// ─── POST /api/plan/[dayId]/swap — commit a swap ──────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await params
  const parsedDayId = uuidSchema.safeParse(rawParams.dayId)
  if (!parsedDayId.success) return NextResponse.json({ error: 'Day not found' }, { status: 404 })
  const dayId = parsedDayId.data
  const parsedBody = swapRequestSchema.safeParse(await req.json())
  if (!parsedBody.success) return NextResponse.json({ error: validationError(parsedBody.error) }, { status: 400 })
  const { recipeId } = parsedBody.data

  try {
    // Verify ownership
    const { data: dayRow } = await supabase
      .from('week_plan_days')
      .select('plan_id, plan:plan_id(user_id, week_start)')
      .eq('id', dayId)
      .maybeSingle()

    if (!dayRow) return NextResponse.json({ error: 'Day not found' }, { status: 404 })

    const planRaw = dayRow.plan as unknown
    const planMeta = (Array.isArray(planRaw) ? planRaw[0] : planRaw) as {
      user_id: string
      week_start: string
    }
    if (planMeta.user_id !== user.id) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 })
    }

    // Fetch recipe cost for estimated_cost
    const { data: recipeRow } = await supabase
      .from('recipes')
      .select('cost_total')
      .eq('id', recipeId)
      .maybeSingle()

    // Update the day
    await supabase
      .from('week_plan_days')
      .update({
        recipe_id: recipeId,
        status: 'planned',
        estimated_cost: (recipeRow?.cost_total as number | null) ?? null,
      })
      .eq('id', dayId)
      .eq('plan_id', dayRow.plan_id as string)

    // Return the updated full plan
    const updatedPlan = await loadWeekPlan(user.id, planMeta.week_start)
    return NextResponse.json(updatedPlan)
  } catch (e) {
    console.error('[POST /api/plan/[dayId]/swap]', e)
    return NextResponse.json({ error: 'Swap failed' }, { status: 500 })
  }
}
