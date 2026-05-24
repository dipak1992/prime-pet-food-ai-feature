// ============================================================
// Plan Adaptation — Silent reactive adjustments
// Subscribes to store changes and adjusts weekly plans
// without any user-facing prompts or notifications.
// ============================================================

import type { SmartMealResult } from '@/lib/engine/types'

// ── Types ───────────────────────────────────────────────────

export interface PlanDay {
  day: string            // 'monday' | 'tuesday' | ...
  mealId: string | null
  meal: SmartMealResult | null
  locked: boolean        // user explicitly chose this — don't touch
  skipped: boolean       // user said "skip this day"
}

export type WeeklyPlan = PlanDay[]

// ── Adaptation functions ────────────────────────────────────

/**
 * When a meal is skipped/rejected, silently replace it with
 * the next best option without bothering the user.
 */
export function onMealSkipped(
  plan: WeeklyPlan,
  dayIndex: number,
  replacement: SmartMealResult | null,
): WeeklyPlan {
  const updated = [...plan]
  const day = updated[dayIndex]
  if (!day || day.locked) return plan

  updated[dayIndex] = {
    ...day,
    mealId: replacement?.id ?? null,
    meal: replacement,
    skipped: !replacement,
  }
  return updated
}

/**
 * When the user marks a day as busy, remove the meal for that day
 * and optionally redistribute the grocery list.
 */
export function onDayBusy(
  plan: WeeklyPlan,
  dayIndex: number,
): WeeklyPlan {
  const updated = [...plan]
  const day = updated[dayIndex]
  if (!day || day.locked) return plan

  updated[dayIndex] = {
    ...day,
    mealId: null,
    meal: null,
    skipped: true,
  }
  return updated
}

/**
 * When pantry changes (items added/removed), re-evaluate plan
 * meals that aren't locked to prefer higher pantry overlap.
 * Returns indices of days that should be refreshed.
 */
export function getDaysToRefresh(
  plan: WeeklyPlan,
  pantryItems: string[],
): number[] {
  const normalizedPantry = pantryItems.map(p => p.toLowerCase().trim())
  const toRefresh: number[] = []

  for (let i = 0; i < plan.length; i++) {
    const day = plan[i]
    if (day.locked || day.skipped || !day.meal) continue

    // Check if current meal has low pantry overlap
    const ingredientNames = day.meal.ingredients.map(ing => ing.name.toLowerCase())
    const overlap = normalizedPantry.filter(p =>
      ingredientNames.some(i => i.includes(p) || p.includes(i))
    ).length

    const ratio = ingredientNames.length > 0 ? overlap / ingredientNames.length : 0

    // If less than 20% pantry overlap, flag for refresh
    if (ratio < 0.2) {
      toRefresh.push(i)
    }
  }

  return toRefresh
}

/**
 * Replace a specific day's meal with a new one.
 * Only changes unlocked, non-skipped days.
 */
export function replaceDayMeal(
  plan: WeeklyPlan,
  dayIndex: number,
  meal: SmartMealResult,
): WeeklyPlan {
  const updated = [...plan]
  const day = updated[dayIndex]
  if (!day || day.locked) return plan

  updated[dayIndex] = {
    ...day,
    mealId: meal.id,
    meal,
    skipped: false,
  }
  return updated
}

/**
 * Create an empty weekly plan scaffold.
 */
export function createEmptyPlan(): WeeklyPlan {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return days.map(day => ({
    day,
    mealId: null,
    meal: null,
    locked: false,
    skipped: false,
  }))
}

/**
 * Compute a consolidated grocery list from all non-skipped plan days.
 */
export function buildGroceryList(plan: WeeklyPlan): { name: string; quantity: string; unit: string; category: string }[] {
  const items = new Map<string, { name: string; quantity: number; unit: string; category: string }>()

  for (const day of plan) {
    if (day.skipped || !day.meal) continue
    for (const ing of day.meal.ingredients) {
      if (ing.fromPantry) continue // skip items user already has
      const key = ing.name.toLowerCase()
      const existing = items.get(key)
      if (existing) {
        existing.quantity += parseFloat(ing.quantity) || 1
      } else {
        items.set(key, {
          name: ing.name,
          quantity: parseFloat(ing.quantity) || 1,
          unit: ing.unit,
          category: ing.category,
        })
      }
    }
  }

  return Array.from(items.values()).map(item => ({
    ...item,
    quantity: String(item.quantity),
  }))
}
