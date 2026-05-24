import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadWeekPlan, getCurrentWeekStart } from '@/app/plan/loader'
import { getActiveLeftoverIngredients } from '@/app/api/leftovers/route'
import { AUTOPILOT_SYSTEM_PROMPT, buildAutopilotPrompt } from '@/lib/plan/autopilot-prompt'
import { apiRateLimited } from '@/lib/api-response'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import type { AutopilotOptions, AutopilotResult, AutopilotPreferences } from '@/lib/plan/types'
import type { Recipe } from '@/lib/dashboard/types'
import { detectCuisine, detectProtein } from '@/lib/plan/scoring'
import { generateText } from '@/lib/ai/service'

const AUTOPILOT_QUOTA = {
  key: 'ai_autopilot_plan',
  limit: 5,
  label: 'autopilot planning',
}

// ─── POST /api/plan/autopilot ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const quotaResponse = await enforceFeatureQuota(supabase, user.id, AUTOPILOT_QUOTA)
  if (quotaResponse) return quotaResponse

  const body = await req.json()
  const {
    weekStart: rawWeekStart,
    options = {},
  } = body as { weekStart?: string; options?: Partial<AutopilotOptions> }

  const weekStart = rawWeekStart ?? getCurrentWeekStart()

  const autopilotOptions: AutopilotOptions = {
    respectLocked: options.respectLocked ?? true,
    overwriteEmptyOnly: options.overwriteEmptyOnly ?? true,
    budgetCap: options.budgetCap,
    mealType: options.mealType,
    preferences: options.preferences,
  }

  const preferences: AutopilotPreferences = autopilotOptions.preferences ?? {
    cuisinePreferences: [],
    mealComplexity: 'balanced',
    leftoverPriority: 'normal',
    lowEnergyMode: false,
  }

  try {
    // ── 1. Load current plan ─────────────────────────────────────────────────
    const currentPlan = await loadWeekPlan(user.id, weekStart)

    // ── 2. Load household preferences ───────────────────────────────────────
    const { data: householdRow } = await supabase
      .from('household_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const household = {
      size: (householdRow?.household_size as number) ?? 2,
      dietary: (householdRow?.dietary_restrictions as string[]) ?? [],
      dislikes: (householdRow?.dislikes as string[]) ?? [],
      skillLevel: (householdRow?.skill_level as string) ?? 'intermediate',
    }

    // ── 3. Load budget ───────────────────────────────────────────────────────
    const { data: budgetRow } = await supabase
      .from('budgets')
      .select('weekly_limit, strict_mode')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: weekSpendRow } = await supabase
      .from('budget_weekly_spend')
      .select('spent')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle()

    const budget = {
      weeklyLimit: (budgetRow?.weekly_limit as number | null) ?? null,
      strictMode: (budgetRow?.strict_mode as boolean) ?? false,
      spentThisWeek: (weekSpendRow?.spent as number) ?? 0,
    }

    // ── 4. Load active leftovers ─────────────────────────────────────────────
    const leftoverIngredients = await getActiveLeftoverIngredients(user.id)

    const { data: leftoverRows } = await supabase
      .from('leftovers')
      .select('name, main_ingredients, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(10)

    const activeLeftovers = (leftoverRows ?? []).map((row) => {
      const expiresAt = new Date(row.expires_at as string)
      const now = new Date()
      const expiresInDays = Math.max(
        0,
        Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
      return {
        name: row.name as string,
        ingredients: leftoverIngredients,
        expiresInDays,
      }
    })

    // ── 5. Load pantry items ─────────────────────────────────────────────────
    const { data: pantryRows } = await supabase
      .from('pantry_items')
      .select('name')
      .eq('user_id', user.id)
      .limit(30)

    const pantryItems = (pantryRows ?? []).map((r) => r.name as string)

    // ── 6. Load cuisine preferences from user profile (if not passed) ────────
    let cuisinePreferences = preferences.cuisinePreferences
    if (cuisinePreferences.length === 0) {
      const { data: prefRow } = await supabase
        .from('user_dietary_preferences')
        .select('cuisine_preferences')
        .eq('user_id', user.id)
        .maybeSingle()
      cuisinePreferences = (prefRow?.cuisine_preferences as string[]) ?? []
    }

    // ── 7. Determine locked vs days to fill ──────────────────────────────────
    const lockedDays = currentPlan.days
      .filter((d) => d.locked && d.recipe)
      .map((d) => ({ dayAbbrev: d.dayAbbrev, recipeName: d.recipe!.name }))

    const daysToFill = currentPlan.days
      .filter((d) => {
        if (d.locked) return false
        if (autopilotOptions.overwriteEmptyOnly && d.recipe) return false
        return true
      })
      .map((d) => ({ dayIndex: d.dayIndex, dayAbbrev: d.dayAbbrev, date: d.date }))

    if (daysToFill.length === 0) {
      return NextResponse.json(
        { error: 'All days are locked or filled. Unlock some days first.' },
        { status: 400 },
      )
    }

    // ── 8. Build prompt & call AI ────────────────────────────────────────────
    const userPrompt = buildAutopilotPrompt({
      household,
      budget,
      activeLeftovers,
      pantryItems,
      lockedDays,
      daysToFill,
      cuisinePreferences,
      mealComplexity: preferences.mealComplexity,
      leftoverPriority: preferences.leftoverPriority,
      lowEnergyMode: preferences.lowEnergyMode,
      options: autopilotOptions,
    })

    const aiResult = await generateText({
      system: AUTOPILOT_SYSTEM_PROMPT,
      user: userPrompt,
      task: 'autopilot',
      temperature: 0.7,
      jsonMode: true,
    })
    await incrementFeatureQuota(supabase, AUTOPILOT_QUOTA)

    const raw = aiResult.text || '{}'
    const parsed = JSON.parse(raw) as {
      days: Array<{
        dayIndex: number
        dayAbbrev: string
        recipe: Recipe & { ingredients?: string[] }
        reason: string
        usesLeftoverId: string | null
        cuisineType?: string
      }>
      weekSummary?: {
        cuisineSpread?: string[]
        proteinVariety?: string[]
        avgCookTime?: number
        leftoverMealsCount?: number
      }
    }

    // ── 9. Upsert day rows into DB ───────────────────────────────────────────
    const planRow = await ensurePlanRow(supabase, user.id, weekStart)

    for (const aiDay of parsed.days ?? []) {
      const recipe = aiDay.recipe
      if (!recipe) continue

      // Upsert recipe into recipes table
      const { data: recipeRow } = await supabase
        .from('recipes')
        .upsert(
          {
            id: recipe.id,
            name: recipe.name,
            image: recipe.image ?? '',
            cook_time_min: recipe.cookTimeMin ?? 30,
            difficulty: recipe.difficulty ?? 'easy',
            servings: recipe.servings ?? household.size,
            cost_total: recipe.costTotal ?? 0,
            cost_per_serving: recipe.costPerServing ?? 0,
            tags: recipe.tags ?? [],
            ingredients: recipe.ingredients ?? [],
            user_id: user.id,
          },
          { onConflict: 'id' },
        )
        .select('id')
        .single()

      const recipeId = recipeRow?.id ?? recipe.id

      // Upsert day row
      await supabase.from('week_plan_days').upsert(
        {
          plan_id: planRow.id,
          day_index: aiDay.dayIndex,
          recipe_id: recipeId,
          status: 'planned',
          locked: false,
          estimated_cost: recipe.costTotal ?? null,
          notes: aiDay.reason ?? null,
        },
        { onConflict: 'plan_id,day_index' },
      )
    }

    // ── 10. Mark plan as autopilot ───────────────────────────────────────────
    await supabase
      .from('week_plans')
      .update({ is_autopilot: true })
      .eq('id', planRow.id)
      .eq('user_id', user.id)

    // ── 11. Record autopilot run for analytics ───────────────────────────────
    try {
      await supabase.from('autopilot_runs').insert({
        user_id: user.id,
        plan_id: planRow.id,
        week_start: weekStart,
        days_generated: parsed.days?.length ?? 0,
        preferences: preferences,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Ignore analytics errors — table may not exist yet
    }

    // ── 12. Reload and compute enhanced summary ──────────────────────────────
    const updatedPlan = await loadWeekPlan(user.id, weekStart)

    const daysGenerated = parsed.days?.length ?? 0
    const estimatedTotalCost = updatedPlan.stats.totalEstimatedCost
    const leftoversUsed = (parsed.days ?? []).filter((d) => d.usesLeftoverId).length

    // Compute cuisine spread
    const cuisineSpread = Array.from(new Set(
      (parsed.days ?? [])
        .map((d) => {
          if (d.cuisineType) return d.cuisineType
          const text = [d.recipe?.name ?? '', ...(d.recipe?.tags ?? [])].join(' ').toLowerCase()
          return detectCuisine(text) ?? 'other'
        })
        .filter(Boolean),
    ))

    // Compute unique proteins
    const proteinSet = new Set(
      (parsed.days ?? [])
        .map((d) => {
          const text = [d.recipe?.name ?? '', ...(d.recipe?.ingredients ?? [])].join(' ').toLowerCase()
          return detectProtein(text) ?? null
        })
        .filter(Boolean),
    )

    // Compute avg cook time
    const cookTimes = (parsed.days ?? [])
      .map((d) => d.recipe?.cookTimeMin ?? 30)
      .filter((t) => t > 0)
    const avgCookTime = cookTimes.length > 0
      ? Math.round(cookTimes.reduce((a, b) => a + b, 0) / cookTimes.length)
      : 30

    // Compute pantry items used
    const pantryItemsUsed = pantryItems.filter((p) =>
      (parsed.days ?? []).some((d) =>
        (d.recipe?.ingredients ?? []).some((ing) =>
          ing.toLowerCase().includes(p.toLowerCase()),
        ),
      ),
    ).length

    // Compute budget savings
    const budgetSavings = budget.weeklyLimit != null
      ? Math.max(0, budget.weeklyLimit - budget.spentThisWeek - estimatedTotalCost)
      : null

    // Seasonal meals count
    const month = new Date().getMonth()
    const seasonTags = month >= 11 || month <= 1
      ? ['soup', 'stew', 'roast', 'comfort']
      : month >= 5 && month <= 7
      ? ['grill', 'salad', 'light', 'cold']
      : month >= 2 && month <= 4
      ? ['fresh', 'light', 'spring']
      : ['harvest', 'squash', 'warm', 'bowl']
    const seasonalMeals = (parsed.days ?? []).filter((d) => {
      const text = [d.recipe?.name ?? '', ...(d.recipe?.tags ?? [])].join(' ').toLowerCase()
      return seasonTags.some((t) => text.includes(t))
    }).length

    const result: AutopilotResult = {
      weekPlan: updatedPlan,
      summary: {
        daysGenerated,
        estimatedTotalCost,
        leftoversUsed,
        uniqueProteins: proteinSet.size,
        cuisineSpread,
        avgCookTime,
        seasonalMeals,
        pantryItemsUsed,
        budgetSavings,
      },
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('[POST /api/plan/autopilot]', e)
    return NextResponse.json({ error: 'Autopilot failed' }, { status: 500 })
  }
}

// ─── Helper: ensure week_plans row exists ─────────────────────────────────────

async function ensurePlanRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  weekStart: string,
) {
  const weekEnd = (() => {
    const d = new Date(weekStart + 'T12:00:00')
    d.setDate(d.getDate() + 6)
    return d.toISOString().slice(0, 10)
  })()

  const { data: existing } = await supabase
    .from('week_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existing) return existing

  const { data: inserted } = await supabase
    .from('week_plans')
    .insert({ user_id: userId, week_start: weekStart, week_end: weekEnd, is_autopilot: false })
    .select('id')
    .single()

  return inserted!
}
