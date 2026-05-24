import { NextRequest, NextResponse } from 'next/server'
import { generateSmartMeal } from '@/lib/engine/engine'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
import { generateText } from '@/lib/ai/service'
import { enforceTonightSwapQuota, incrementTonightSwapQuota } from '@/lib/paywall/tonight-quota'
import logger from '@/lib/logger'
import { generateSlug } from '@/lib/content/types'
import { promptInjectionIssue, smartMealRequestSchema, validationError } from '@/lib/validation/input'
import type { SmartMealRequest, SmartMealResult } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'

function dedupeStrings(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v)))
}

function getTimeAwareDefaults(now = new Date()): Pick<SmartMealRequest, 'maxCookTime' | 'lowEnergy' | 'cuisinePreferences'> {
  const hour = now.getHours()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  if (isWeekend) {
    return {
      maxCookTime: 50,
      lowEnergy: false,
      cuisinePreferences: ['comfort'],
    }
  }

  if (hour < 11) {
    return {
      maxCookTime: 20,
      lowEnergy: true,
      cuisinePreferences: ['mediterranean'],
    }
  }

  if (hour < 17) {
    return {
      maxCookTime: 25,
      lowEnergy: true,
      cuisinePreferences: ['asian'],
    }
  }

  return {
    maxCookTime: 40,
    lowEnergy: false,
    cuisinePreferences: ['comfort'],
  }
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  try {
    const rawBody = await req.json()
    const parsed = smartMealRequestSchema.safeParse(rawBody)
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const injectionIssue = promptInjectionIssue(parsed.data)
    if (injectionIssue) return NextResponse.json({ error: injectionIssue }, { status: 400 })
    const rawMode = (rawBody as { mode?: string }).mode
    const countsAsTonightSwap = rawMode === 'tonight-swap'
      || (rawMode === 'tonight' && Array.isArray(parsed.data.excludeIds) && parsed.data.excludeIds.length > 0)
    const body = { ...parsed.data, learnedBoosts: (rawBody as { learnedBoosts?: LearnedBoosts }).learnedBoosts } as SmartMealRequest & { learnedBoosts?: LearnedBoosts }

    const { adultsCount = 0, kidsCount = 0, toddlersCount = 0, babiesCount = 0 } = body.household
    if (adultsCount + kidsCount + toddlersCount + babiesCount === 0) {
      return NextResponse.json(
        { error: 'Household must have at least one member' },
        { status: 400 },
      )
    }

    const { learnedBoosts, mode: _mode, ...mealRequest } = body as typeof body & { mode?: string }
    void _mode

    if (countsAsTonightSwap) {
      const quotaResponse = await enforceTonightSwapQuota(supabase, user.id)
      if (quotaResponse) return quotaResponse
    }

    let historyExcludeIds: string[] = []
    try {
      const { data: recent } = await supabase
        .from('recently_shown_meals')
        .select('meal_id, shown_at')
        .eq('user_id', user.id)
        .in('source_mode', ['smart-meal', 'weekly-plan', 'tonight'])
        .order('shown_at', { ascending: false })
        .limit(20)
      historyExcludeIds = (recent ?? []).map((r) => r.meal_id).filter(Boolean)
    } catch {
      historyExcludeIds = []
    }

    const timeDefaults = getTimeAwareDefaults()

    const mergedRequest: SmartMealRequest = {
      ...mealRequest,
      household: { adultsCount, kidsCount, toddlersCount, babiesCount },
      maxCookTime: mealRequest.maxCookTime ?? timeDefaults.maxCookTime,
      lowEnergy: mealRequest.lowEnergy ?? timeDefaults.lowEnergy,
      cuisinePreferences:
        mealRequest.cuisinePreferences && mealRequest.cuisinePreferences.length > 0
          ? mealRequest.cuisinePreferences
          : timeDefaults.cuisinePreferences,
      excludeIds: dedupeStrings([...(mealRequest.excludeIds ?? []), ...historyExcludeIds]),
    }

    const result = generateSmartMeal(
      mergedRequest,
      learnedBoosts,
    )

    try {
      await supabase.from('recently_shown_meals').insert({
        user_id: user.id,
        meal_id: result.id,
        source_mode: 'smart-meal',
        metadata: {
          title: result.title,
          hour: new Date().getHours(),
          weekend: [0, 6].includes(new Date().getDay()),
        },
      })
    } catch {
      // non-fatal
    }

    // ── AI escape hatch: pool exhausted → generate via AI ───
    if (result.meta.poolExhausted) {
      logger.info('[smart-meal] Pool exhausted, falling through to AI', {
        viableScore: result.meta.score,
      })

      try {
        const aiMeal = await generateAIMeal(mealRequest, body.household)
        // Cache in saved_meals with system_generated flag
        const slug = generateSlug(aiMeal.title)
        await supabase.from('saved_meals').insert({
          user_id: user.id,
          slug,
          title: aiMeal.title,
          description: aiMeal.description ?? null,
          cuisine_type: aiMeal.cuisineType ?? null,
          meal_data: { ...aiMeal, system_generated: true },
          is_public: false,
        })

        if (countsAsTonightSwap) await incrementTonightSwapQuota(supabase)
        return NextResponse.json(aiMeal)
      } catch (aiError) {
        logger.warn('[smart-meal] AI fallback failed, returning engine result', {
          error: aiError instanceof Error ? aiError.message : String(aiError),
        })
        // Fall through to engine result if AI also fails
      }
    }

    if (countsAsTonightSwap) await incrementTonightSwapQuota(supabase)
    return NextResponse.json(result)
  } catch (error) {
    logger.error('[smart-meal] Engine error', { error: error instanceof Error ? error.message : String(error) })
    return apiError('Failed to generate meal')
  }
}

/** Generate a single meal via AI when the deterministic engine pool is exhausted. */
async function generateAIMeal(
  request: SmartMealRequest,
  household: { adultsCount?: number; kidsCount?: number; toddlersCount?: number; babiesCount?: number },
): Promise<SmartMealResult> {
  const constraints: string[] = []
  if (request.allergies?.length) constraints.push(`Allergies: ${request.allergies.join(', ')}`)
  if (request.dietaryRestrictions?.length) constraints.push(`Dietary: ${request.dietaryRestrictions.join(', ')}`)
  if (request.cuisinePreferences?.length) constraints.push(`Preferred cuisines: ${request.cuisinePreferences.join(', ')}`)
  if (request.preferredProteins?.length) constraints.push(`Preferred proteins: ${request.preferredProteins.join(', ')}`)
  if (request.pantryItems?.length) constraints.push(`Pantry items to use: ${request.pantryItems.join(', ')}`)
  if (request.lowEnergy) constraints.push('Low-energy/simple meal preferred')

  const servings =
    (household.adultsCount ?? 0) +
    (household.kidsCount ?? 0) +
    (household.toddlersCount ?? 0) +
    Math.ceil((household.babiesCount ?? 0) * 0.5)

  const system = `You are a family meal planner. Return ONLY valid JSON matching this schema (no markdown, no code fences):
{
  "id": "ai-<short-uuid>",
  "title": string,
  "tagline": string,
  "description": string,
  "cuisineType": string,
  "imageUrl": string (a short keyword describing the dish for image lookup, e.g. "pasta bolognese" or "chicken curry"),
  "prepTime": number (minutes),
  "cookTime": number (minutes),
  "totalTime": number,
  "estimatedCost": number (USD),
  "servings": number,
  "difficulty": "easy"|"moderate"|"hard",
  "tags": string[],
  "ingredients": [{"name":string,"quantity":string,"unit":string,"fromPantry":boolean,"category":string}],
  "steps": string[],
  "variations": [],
  "leftoverTip": string|null,
  "shoppingList": [{"name":string,"quantity":string,"unit":string,"category":string}],
  "meta": {"score":0,"matchedPantryItems":[],"pantryUtilization":0,"simplifiedForEnergy":false,"pickyEaterAdjusted":false,"localityApplied":false,"selectionReason":"AI-generated: pool exhausted","poolExhausted":true}
}`

  const user = `Generate one meal for ${servings} servings.\n${constraints.length ? constraints.join('\n') : 'No special constraints.'}`

  const { text } = await generateText({ system, user, maxTokens: 4096 })

  logger.info('[smart-meal] AI single-meal generated', { feature: 'generate-plan' })

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const meal = JSON.parse(cleaned) as SmartMealResult

  // If AI didn't return a real URL, remove imageUrl so components render emoji fallback
  if (!meal.imageUrl || !meal.imageUrl.startsWith('http')) {
    delete meal.imageUrl
  }

  return meal
}
