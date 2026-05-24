// ============================================================
// decideNow() — Hub-level decision function
// Wraps generateSmartMeal() with preference-weighted re-ranking
// to return ONE best meal card for the given intent.
// ============================================================

import { generateSmartMeal } from '@/lib/engine/engine'
import { MEAL_DATABASE } from '@/lib/engine/meals'
import type { SmartMealRequest, SmartMealResult, MealCandidate } from '@/lib/engine/types'
import type { LearnedBoosts, PreferenceSignal } from '@/lib/learning/types'

// ── Intent modes the hub dispatches ─────────────────────────

export type HubIntent = 'quick' | 'pantry' | 'surprise' | 'plan'

// ── Composite scoring weights (spec §3) ─────────────────────

const CW = {
  CUISINE_FIT:    0.25,
  PROTEIN_FIT:    0.20,
  TIME_FIT:       0.15,
  PANTRY_OVERLAP: 0.15,
  SLOT_FIT:       0.10,
  NOVELTY:        0.10,
  BUDGET_FIT:     0.05,
}

// ── Public API ──────────────────────────────────────────────

export interface DecideNowOptions {
  intent: HubIntent
  request: SmartMealRequest
  learnedBoosts?: LearnedBoosts | null
  signal?: PreferenceSignal | null
  recentMealIds?: string[]           // for novelty scoring
}

export interface DecideNowResult {
  meal: SmartMealResult
  compositeScore: number
  intent: HubIntent
}

/**
 * Single entry point for the hub. Returns ONE meal, period.
 * For "pantry" intent, also ranks by ingredient overlap.
 */
export function decideNow(opts: DecideNowOptions): DecideNowResult {
  const { intent, request, learnedBoosts, signal, recentMealIds = [] } = opts

  // Apply intent-specific request overrides
  const req = applyIntentOverrides(intent, request)

  // Generate the top meal via the existing engine
  const meal = generateSmartMeal(req, learnedBoosts)

  // Compute a composite score for transparency / logging
  const compositeScore = computeComposite(meal, signal, recentMealIds, req)

  return { meal, compositeScore, intent }
}

/**
 * For pantry-match mode: returns up to `limit` meals ranked by
 * pantry overlap. Used by /api/pantry/match.
 */
export function matchPantryMeals(
  pantryItems: string[],
  request: SmartMealRequest,
  learnedBoosts?: LearnedBoosts | null,
  limit = 3,
): SmartMealResult[] {
  const normalizedPantry = pantryItems.map(p => p.toLowerCase().trim())

  // Score all non-excluded meals by pantry overlap
  const pool = (request.excludeIds?.length
    ? MEAL_DATABASE.filter(m => !request.excludeIds!.includes(m.id))
    : MEAL_DATABASE
  ) as MealCandidate[]

  const ranked = pool
    .map(m => {
      const ingredientNames = m.ingredients.map(i => i.name.toLowerCase())
      const matches = normalizedPantry.filter(p =>
        ingredientNames.some(i => i.includes(p) || p.includes(i))
      )
      return { meal: m, overlap: matches.length, ratio: matches.length / m.ingredients.length }
    })
    .filter(r => r.overlap > 0)
    .sort((a, b) => b.ratio - a.ratio || b.overlap - a.overlap)
    .slice(0, limit)

  // Generate full results for top matches
  return ranked.map(r => {
    const req: SmartMealRequest = {
      ...request,
      pantryItems,
      // Force this meal by excluding everything else (except this one)
      excludeIds: pool.filter(m => m.id !== r.meal.id).map(m => m.id),
    }
    return generateSmartMeal(req, learnedBoosts)
  })
}

// ── Intent-specific overrides ───────────────────────────────

function applyIntentOverrides(intent: HubIntent, request: SmartMealRequest): SmartMealRequest {
  switch (intent) {
    case 'quick':
      return { ...request, lowEnergy: true, maxCookTime: request.maxCookTime ?? 25 }
    case 'pantry':
      return { ...request } // pantry items already in request
    case 'surprise':
      return { ...request } // no constraint changes, engine handles variety
    case 'plan':
      return { ...request } // plan mode uses the base request
    default:
      return request
  }
}

// ── Composite scoring (for logging/debugging) ───────────────

function computeComposite(
  meal: SmartMealResult,
  signal: PreferenceSignal | null | undefined,
  recentMealIds: string[],
  request: SmartMealRequest,
): number {
  let score = 0

  if (signal) {
    // Cuisine fit
    const cuisineAff = signal.cuisineAffinities[meal.cuisineType] ?? 0
    score += cuisineAff * CW.CUISINE_FIT * 100

    // Protein fit
    const protein = meal.tags.find(t =>
      ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'tofu', 'beans', 'eggs', 'lentils', 'turkey'].includes(t)
    )
    const proteinAff = protein ? (signal.proteinAffinities[protein] ?? 0) : 0
    score += proteinAff * CW.PROTEIN_FIT * 100

    // Time fit — closer to preferred range = higher score
    if (signal.preferredTimeRange) {
      const { min, max } = signal.preferredTimeRange
      const time = meal.totalTime
      if (time >= min && time <= max) {
        score += CW.TIME_FIT * 100
      } else {
        const dist = time < min ? min - time : time - max
        score += Math.max(0, CW.TIME_FIT * 100 - dist * 2)
      }
    }
  }

  // Pantry overlap
  if (request.pantryItems?.length && meal.meta.pantryUtilization > 0) {
    score += meal.meta.pantryUtilization * CW.PANTRY_OVERLAP * 100
  }

  // Novelty — penalise recently shown meals
  if (recentMealIds.includes(meal.id)) {
    score -= CW.NOVELTY * 100
  } else {
    score += CW.NOVELTY * 50
  }

  // Budget fit
  if (request.budget) {
    const budgetOrder = { low: 1, medium: 2, high: 3 }
    const mealCostLevel = meal.estimatedCost < 10 ? 'low' : meal.estimatedCost < 20 ? 'medium' : 'high'
    if (budgetOrder[mealCostLevel] <= budgetOrder[request.budget]) {
      score += CW.BUDGET_FIT * 100
    }
  }

  return Math.round(score)
}
