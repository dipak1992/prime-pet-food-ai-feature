import type { MainIngredient, IngredientCategory, Urgency } from './types'

// USDA-based shelf life rules (days in fridge)
const SHELF_LIFE_BY_CATEGORY: Record<IngredientCategory, number> = {
  meat: 3,
  poultry: 3,
  seafood: 2,
  dairy: 4,
  egg: 4,
  grain: 5,
  vegetable: 4,
  fruit: 4,
  legume: 5,
  other: 4,
}

/**
 * Calculate expiration date based on the most perishable ingredient.
 * Returns an ISO string.
 */
export function calculateExpirationDate(
  mainIngredients: MainIngredient[],
  cookedAt: Date = new Date(),
): Date {
  if (mainIngredients.length === 0) {
    // Default: 4 days
    const d = new Date(cookedAt)
    d.setDate(d.getDate() + 4)
    return d
  }

  // Find the minimum shelf life across all ingredients
  const minDays = mainIngredients.reduce((min, ing) => {
    const days = SHELF_LIFE_BY_CATEGORY[ing.category] ?? 4
    return Math.min(min, days)
  }, Infinity)

  const expiresAt = new Date(cookedAt)
  expiresAt.setDate(expiresAt.getDate() + (isFinite(minDays) ? minDays : 4))
  return expiresAt
}

/**
 * Get urgency level based on expiration date.
 */
export function getUrgency(expiresAt: Date | string, now: Date = new Date()): Urgency {
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = (exp.getTime() - now.getTime()) / msPerDay

  if (daysLeft < 0) return 'expired'
  if (daysLeft < 1) return 'today'
  if (daysLeft <= 2) return 'soon'
  return 'fresh'
}

/**
 * Get days until expiry (negative = already expired).
 */
export function getDaysUntilExpiry(expiresAt: Date | string, now: Date = new Date()): number {
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((exp.getTime() - now.getTime()) / msPerDay)
}
