import type { LoadedRecipe } from '@/app/recipes/[id]/loader'
import type { SmartMealResult } from '@/lib/engine/types'
import { detectAllergens, buildSafetyNotes } from '@/lib/safety/allergen-detector'
import { findRelevantCulinaryRules } from '@/lib/safety/culinary-rules'
import { enrichStepsWithTimers } from '@/lib/recipes/timer-extractor'

export type MealPillar =
  | 'tonight'
  | 'snap'
  | 'weekly'
  | 'leftovers'
  | 'budget'
  | 'saved'

export const PILLAR_LABELS: Record<MealPillar, string> = {
  tonight: 'Tonight Suggestions',
  snap: 'Snap & Cook',
  weekly: 'Weekly Autopilot',
  leftovers: 'Leftovers AI',
  budget: 'Budget Intelligence',
  saved: 'Saved Meals',
}

export function pillarLabel(pillar?: string | null) {
  if (!pillar) return PILLAR_LABELS.tonight
  return PILLAR_LABELS[pillar as MealPillar] ?? pillar
}

function difficultyForRecipe(value: SmartMealResult['difficulty']): LoadedRecipe['difficulty'] {
  if (value === 'hard') return 'hard'
  if (value === 'moderate') return 'medium'
  return 'easy'
}

export function mealToRecipe(meal: SmartMealResult, source: MealPillar = 'tonight'): LoadedRecipe {
  const ingredients = (meal.ingredients ?? []).map((ingredient) => ({
    name: ingredient.name,
    quantity: Number.parseFloat(String(ingredient.quantity)) || 1,
    unit: ingredient.unit || 'unit',
  }))
  const steps = enrichStepsWithTimers((meal.steps ?? []).map((instruction, index) => ({
    order: index + 1,
    instruction,
  })))
  const ingredientNames = ingredients.map((ingredient) => ingredient.name)
  const instructionTexts = steps.map((step) => step.instruction)

  return {
    id: meal.id,
    name: meal.title,
    image: meal.imageUrl ?? null,
    description: meal.description ?? meal.tagline ?? null,
    servings: meal.servings || 4,
    cookTimeMin: meal.cookTime || Math.max(0, (meal.totalTime || 0) - (meal.prepTime || 0)),
    prepTimeMin: meal.prepTime || 0,
    difficulty: difficultyForRecipe(meal.difficulty),
    costTotal: meal.estimatedCost || 0,
    costPerServing: meal.servings ? (meal.estimatedCost || 0) / meal.servings : 0,
    tags: [PILLAR_LABELS[source], ...(meal.tags ?? [])],
    ingredients,
    steps,
    nutrition: undefined,
    verifiedStatus: 'safety_reviewed',
    verifiedBy: 'MealEase safety rules',
    verifiedAt: null,
    allergenWarnings: detectAllergens(ingredientNames),
    safetyNotes: buildSafetyNotes({ ingredients: ingredientNames, instructions: instructionTexts }),
    culinaryRules: findRelevantCulinaryRules({
      ingredients: ingredientNames,
      instructions: instructionTexts,
      tags: meal.tags ?? [],
    }),
  }
}

export function recipeSignature(recipe: Pick<LoadedRecipe, 'id' | 'name' | 'ingredients' | 'steps'>) {
  return JSON.stringify({
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients.map((item) => [item.name, item.quantity, item.unit]),
    steps: recipe.steps.map((step) => step.instruction),
  })
}

export function persistMealForRecipe(meal: SmartMealResult, backPath: string, source: MealPillar) {
  sessionStorage.setItem('tonight-meal', JSON.stringify(meal))
  sessionStorage.setItem('recipe-back', backPath)
  sessionStorage.setItem('recipe-source', source)
}
