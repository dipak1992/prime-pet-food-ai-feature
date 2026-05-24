/**
 * ============================================================
 * PANTRY CONSTRAINT ENGINE
 * ============================================================
 * 
 * Ensures recipes ONLY use ingredients that are actually
 * in the user's pantry. No hallucinations.
 * 
 * Outputs three categories:
 * 1. MAKE NOW (100% available)
 * 2. ALMOST READY (1 missing item)
 * 3. SHOPPING UPGRADE (optional inspiration)
 */

import type { MealCandidate } from '@/lib/engine/types'
import type { PantryRecipeSuggestion, PantryRecipeType } from './types'

const BASIC_STAPLES = [
  'salt',
  'pepper',
  'oil',
  'water',
  'sugar',
  'vinegar',
  'garlic',
  'onion',
]

interface ConstraintResult {
  type: PantryRecipeType
  availableIngs: string[]
  missingIngs: string[]
  missingCount: number
  confidence: number // 0-100
}

/**
 * Categorize a meal based on what's in the pantry
 */
export function categorizeMealForPantry(
  meal: MealCandidate,
  availablePantry: string[],
  allowStaples = true,
): ConstraintResult | null {
  const pantryNorm = availablePantry.map(p => p.toLowerCase().trim())
  
  // Collect available and missing
  const available: string[] = []
  const missing: string[] = []

  for (const ing of meal.ingredients) {
    const ingName = ing.name.toLowerCase()
    const isAvailable = isPantryMatch(ingName, pantryNorm)
    const isStaple = allowStaples && BASIC_STAPLES.some(s => ingName.includes(s) || s.includes(ingName))

    if (isAvailable || isStaple) {
      available.push(ing.name)
    } else {
      missing.push(ing.name)
    }
  }

  const missingCount = missing.length
  const confidence = Math.round((available.length / (available.length + missingCount)) * 100)

  // Categorize
  let type: PantryRecipeType
  if (missingCount === 0) {
    type = 'make_now'
  } else if (missingCount === 1) {
    type = 'almost_ready'
  } else {
    type = 'shopping_upgrade'
  }

  return {
    type,
    availableIngs: available,
    missingIngs: missing,
    missingCount,
    confidence,
  }
}

/**
 * Filter meals to find ONLY those that can be made with pantry items
 * Strict: no more than `maxMissing` items missing
 */
export function filterMealsForPantry(
  meals: MealCandidate[],
  availablePantry: string[],
  maxMissing = 0,
  allowStaples = true,
): Array<{ meal: MealCandidate; category: ConstraintResult }> {
  const result: Array<{ meal: MealCandidate; category: ConstraintResult }> = []

  for (const meal of meals) {
    const cat = categorizeMealForPantry(meal, availablePantry, allowStaples)
    if (!cat) continue

    if (cat.missingCount <= maxMissing) {
      result.push({ meal, category: cat })
    }
  }

  return result
}

/**
 * Sort meals by category, then by confidence
 */
export function rankPantryMeals(
  classified: Array<{ meal: MealCandidate; category: ConstraintResult }>,
): PantryRecipeSuggestion[] {
  // Sort: make_now first, then almost_ready, then shopping_upgrade
  // Within each, sort by confidence desc
  const typeOrder = { make_now: 0, almost_ready: 1, shopping_upgrade: 2 }

  const sorted = classified.sort((a, b) => {
    const typeA = typeOrder[a.category.type]
    const typeB = typeOrder[b.category.type]
    if (typeA !== typeB) return typeA - typeB
    return b.category.confidence - a.category.confidence
  })

  return sorted.map(({ meal, category }) => ({
    type: category.type,
    confidence: category.confidence,
    mealId: meal.id,
    title: meal.title,
    description: meal.description,
    availableIngredients: category.availableIngs,
    missingIngredients: category.missingIngs,
    missingCount: category.missingCount,
    reasons: buildReasons(meal, category),
    estimatedCost: meal.estimatedCost,
    totalTime: meal.prepTime + meal.cookTime,
    difficulty: meal.difficulty === 'moderate' ? 'medium' : meal.difficulty,
    kidFriendlyScore: meal.kidFriendlyScore,
    badge:
      category.type === 'make_now' ? ('✅ Everything Available' as const)
      : category.type === 'almost_ready' ? ('🟡 Missing 1 Item' as const)
      : ('🛒 Needs Few Extras' as const),
  }))
}

/**
 * Build human-readable reasons for why this meal is recommended
 */
function buildReasons(meal: MealCandidate, category: ConstraintResult): string[] {
  const reasons: string[] = []

  if (category.type === 'make_now') {
    reasons.push('Everything you need is available')
    if (category.confidence === 100) {
      reasons.push('No shopping required')
    }
  } else if (category.type === 'almost_ready') {
    reasons.push(`Just need: ${category.missingIngs[0]}`)
  } else {
    reasons.push(`${category.missingCount} items to shop`)
  }

  // Add meal-specific reasons
  if (meal.difficulty === 'easy') {
    reasons.push('Quick & easy to prepare')
  } else if (meal.difficulty === 'moderate') {
    reasons.push('Moderate effort')
  }

  if (meal.kidFriendlyScore >= 8) {
    reasons.push('Kid-friendly')
  }

  return reasons
}

/**
 * Check if ingredient is in pantry (fuzzy match)
 */
function isPantryMatch(ingredientName: string, pantryItems: string[]): boolean {
  const n = ingredientName.toLowerCase()
  return pantryItems.some(p => {
    const pLower = p.toLowerCase()
    return n.includes(pLower) || pLower.includes(n)
  })
}

/**
 * Check if ANY ingredient is a basic staple
 */
export function containsStaple(ingredientName: string): boolean {
  const n = ingredientName.toLowerCase()
  return BASIC_STAPLES.some(s => n.includes(s))
}

/**
 * Get trust score for pantry mode
 * 0-100: how confident we are in suggestions
 */
export function calculateTrustScore(
  pantrySize: number,
  mealCount: number,
  avgConfidence: number,
): number {
  // Trust is lower with sparse pantry
  const pantryScore = Math.min(pantrySize / 10, 1) * 50
  
  // Trust is lower with few meal options
  const mealScore = Math.min(mealCount / 5, 1) * 30
  
  // Trust is based on confidence of suggestions
  const confidenceScore = (avgConfidence / 100) * 20

  return Math.round(pantryScore + mealScore + confidenceScore)
}
