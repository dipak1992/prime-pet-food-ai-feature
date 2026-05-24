import type { SmartMealResult } from '@/lib/engine/types'
import type { WeeklyPlan } from '@/lib/planner/types'

export function sanitizePublicMeal(meal: SmartMealResult): SmartMealResult {
  return {
    id: meal.id,
    title: meal.title,
    tagline: meal.tagline,
    description: meal.description,
    cuisineType: meal.cuisineType,
    imageUrl: meal.imageUrl,
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    totalTime: meal.totalTime,
    estimatedCost: meal.estimatedCost,
    servings: meal.servings,
    difficulty: meal.difficulty,
    tags: meal.tags ?? [],
    ingredients: (meal.ingredients ?? []).map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      note: ingredient.note,
      fromPantry: false,
      category: ingredient.category,
    })),
    steps: meal.steps ?? [],
    variations: [],
    leftoverTip: meal.leftoverTip,
    shoppingList: [],
    meta: {
      score: 0,
      matchedPantryItems: [],
      pantryUtilization: 0,
      simplifiedForEnergy: false,
      pickyEaterAdjusted: false,
      localityApplied: false,
      selectionReason: '',
    },
  }
}

export function sanitizePublicPlan(plan: WeeklyPlan): WeeklyPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meal: day.meal ? sanitizePublicMeal(day.meal) : null,
    })),
  }
}
