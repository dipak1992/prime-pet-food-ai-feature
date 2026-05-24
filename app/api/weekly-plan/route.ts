// ============================================================
// API: POST /api/weekly-plan
// Generates 7 unique SmartMealResults using the smart engine,
// then builds a full grocery list for the week.
// ============================================================

import { NextResponse } from 'next/server'
import { apiRateLimited } from '@/lib/api-response'
import { generateSmartMeal } from '@/lib/engine/engine'
import { buildGroceryList } from '@/lib/planner/grocery'
import { getPaywallStatus } from '@/lib/paywall/server'
import { FREE_PLAN_PREVIEW_DAYS } from '@/lib/paywall/config'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import { getUserDietaryPrefs, applyPrefsToEngineRequest } from '@/lib/meal-engine/preferences'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'
import type { StoreFormat } from '@/lib/planner/types'
import { buildFamilyEngineOverrides, getFamilyMembers, mergeUnique } from '@/lib/family/service'
import { isoDateSchema, promptInjectionIssue, smartMealRequestSchema, stringArraySchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

interface WeeklyPlanRequest {
  baseRequest: SmartMealRequest
  learnedBoosts?: LearnedBoosts | null
  storeFormat?: StoreFormat
  weekStart: string
  pantryItems?: string[]
}

const weeklyPlanRequestSchema = z.object({
  baseRequest: smartMealRequestSchema,
  learnedBoosts: z.unknown().optional(),
  storeFormat: z.enum(['standard', 'walmart', 'costco']).optional(),
  weekStart: isoDateSchema,
  pantryItems: stringArraySchema(80, 80).optional(),
}).strict()

const WEEKLY_PLAN_QUOTA = {
  key: 'weekly_plan_generation',
  limit: 20,
  label: 'weekly plan generation',
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit({
      key: `weekly-plan:${rateLimitKeyFromRequest(req)}`,
      limit: 10,
      windowMs: 60_000,
    })
    if (!rl.success) return apiRateLimited(rl.reset)

    const paywall = await getPaywallStatus()

    if (!paywall.isAuthenticated) {
      return NextResponse.json(
        { error: 'Login required to generate a weekly plan' },
        { status: 401 },
      )
    }

    const parsed = weeklyPlanRequestSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const injectionIssue = promptInjectionIssue(parsed.data)
    if (injectionIssue) return NextResponse.json({ error: injectionIssue }, { status: 400 })
    const body = parsed.data as WeeklyPlanRequest

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Login required to generate a weekly plan' }, { status: 401 })
    }
    const quotaResponse = await enforceFeatureQuota(supabase, user.id, WEEKLY_PLAN_QUOTA)
    if (quotaResponse) return quotaResponse
    const prefs = user ? await getUserDietaryPrefs(user.id) : null
    const { baseRequest: rawBaseRequest, learnedBoosts, storeFormat = 'standard', weekStart, pantryItems = [] } = body
    const baseRequest = prefs ? applyPrefsToEngineRequest(rawBaseRequest, prefs) : rawBaseRequest

    let familyOverrides: ReturnType<typeof buildFamilyEngineOverrides> | null = null
    if (user && paywall.isPro) {
      try {
        const members = await getFamilyMembers(supabase, user.id)
        if (members.length > 0) {
          familyOverrides = buildFamilyEngineOverrides(members)
        }
      } catch {
        // Non-fatal: keep current planner fallback behavior.
      }
    }

    const household = familyOverrides?.household ?? baseRequest.household
    const { adultsCount = 1, kidsCount = 0, toddlersCount = 0, babiesCount = 0 } = household
    if (adultsCount + kidsCount + toddlersCount + babiesCount === 0) {
      return NextResponse.json(
        { error: 'Household must have at least one member' },
        { status: 400 },
      )
    }

    // Generate 7 unique meals — each excludes previously chosen ids for variety
    const meals = []
    const usedIds: string[] = []

    for (let i = 0; i < 7; i++) {
      const meal = generateSmartMeal(
        {
          ...baseRequest,
          allergies: mergeUnique(baseRequest.allergies, familyOverrides?.allergies),
          dietaryRestrictions: mergeUnique(baseRequest.dietaryRestrictions, familyOverrides?.dietaryRestrictions),
          cuisinePreferences: mergeUnique(baseRequest.cuisinePreferences, familyOverrides?.cuisinePreferences),
          preferredProteins: mergeUnique(baseRequest.preferredProteins, familyOverrides?.preferredProteins),
          pickyEater: familyOverrides?.pickyEater?.active
            ? {
                active: true,
                dislikedFoods: mergeUnique(baseRequest.pickyEater?.dislikedFoods, familyOverrides.pickyEater.dislikedFoods),
              }
            : baseRequest.pickyEater,
          household: { adultsCount, kidsCount, toddlersCount, babiesCount },
          excludeIds: usedIds,
        },
        learnedBoosts,
      )
      meals.push(meal)
      usedIds.push(meal.id)
    }

    // Build grocery list from all 7 meals combined
    const groceryList = buildGroceryList(meals, pantryItems, storeFormat, weekStart)
    await incrementFeatureQuota(supabase, WEEKLY_PLAN_QUOTA)

    const plannerPayload = {
      id: `plan-${weekStart}`,
      weekStart,
      days: meals.map((meal, i) => {
        const d = new Date(`${weekStart}T00:00:00`)
        d.setDate(d.getDate() + i)
        return {
          dayIndex: i,
          date: d.toISOString().split('T')[0],
          meal,
        }
      }),
      generatedAt: new Date().toISOString(),
    }

    if (!paywall.isPro) {
      const previewDays = paywall.effectivePlanPreviewDays ?? FREE_PLAN_PREVIEW_DAYS
      // Strip locked meals to a teaser payload — enough to render a blurred
      // card (title, cuisine, time) but not enough to cook from.
      const teaseredMeals = meals.map((meal, i) => {
        if (i < previewDays) return meal
        return {
          ...meal,
          description: '',
          ingredients: [],
          steps: [],
          variations: [],
          shoppingList: [],
          leftoverTip: null,
          estimatedCost: 0,
          isLocked: true,
        }
      })
      await supabase
        .from('weekly_plans')
        .upsert(
          {
            user_id: user.id,
            week_of: weekStart,
            planner_payload: {
              ...plannerPayload,
              days: plannerPayload.days.map((day, i) => ({
                ...day,
                meal: teaseredMeals[i] ?? null,
              })),
            },
            grocery_list: null,
            source: 'weekly-plan-preview',
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,week_of' },
        )
      return NextResponse.json({
        meals: teaseredMeals,
        groceryList: null,
        isPreview: true,
        previewDays,
      })
    }

    await supabase
      .from('weekly_plans')
      .upsert(
        {
          user_id: user.id,
          week_of: weekStart,
          planner_payload: plannerPayload,
          grocery_list: groceryList,
          source: 'weekly-plan',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,week_of' },
      )

    return NextResponse.json({
      meals,
      groceryList,
      isPreview: false,
      previewDays: 7,
    })
  } catch (error) {
    console.error('[WeeklyPlan] Engine error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly plan' },
      { status: 500 },
    )
  }
}
