// ============================================================
// Meal Badge Engine — auto-computed from meal + household
// ============================================================

import type { SmartMealResult, SmartMealRequest } from './types'
import type { MealBadge, MealBadgeId } from '@/types'

const BADGE_DEFS: Record<MealBadgeId, MealBadge> = {
  kid_friendly:   { id: 'kid_friendly',   label: 'Kid-friendly',   emoji: '🧒' },
  mild:           { id: 'mild',           label: 'Mild',           emoji: '🌿' },
  easy_to_eat:    { id: 'easy_to_eat',    label: 'Easy to eat',    emoji: '🥄' },
  family_tested:  { id: 'family_tested',  label: 'Family tested',  emoji: '👨‍👩‍👧' },
  picky_approved: { id: 'picky_approved', label: 'Picky-approved', emoji: '🛡️' },
  quick_win:      { id: 'quick_win',      label: 'Quick win',      emoji: '⚡' },
}

// Spicy ingredients / tags we look for
const SPICY_TERMS = [
  'chili', 'jalapeño', 'sriracha', 'cayenne', 'hot sauce',
  'habanero', 'chipotle', 'wasabi', 'gochujang',
]
const SPICY_TAGS = ['spicy', 'hot', 'thai-spicy', 'cajun']

/**
 * Compute which badges apply to a meal based on its properties
 * and the household context. Returns empty array when no kids —
 * family badges are invisible for adult-only households.
 */
export function computeMealBadges(
  meal: SmartMealResult,
  request?: Partial<SmartMealRequest>,
  likedMealIds?: string[],
): MealBadge[] {
  const badges: MealBadge[] = []

  const kidsCount = request?.household?.kidsCount ?? 0
  const toddlersCount = request?.household?.toddlersCount ?? 0
  const babiesCount = request?.household?.babiesCount ?? 0
  const hasKids = kidsCount + toddlersCount + babiesCount > 0

  // No family badges for adult-only households — invisible by design
  if (!hasKids) return badges

  // Kid-friendly: high kidFriendlyScore implied by tags or variations
  const isKidFriendly =
    meal.tags.includes('kid-friendly') ||
    meal.tags.includes('kid-favorite') ||
    meal.variations.some(v => v.stage === 'kid' || v.stage === 'toddler')
  if (isKidFriendly) badges.push(BADGE_DEFS.kid_friendly)

  // Mild: no spicy ingredients or tags
  const hasSpice =
    SPICY_TAGS.some(t => meal.tags.includes(t)) ||
    meal.ingredients.some(i =>
      SPICY_TERMS.some(term => i.name.toLowerCase().includes(term))
    )
  if (!hasSpice) badges.push(BADGE_DEFS.mild)

  // Easy to eat: easy difficulty + short time
  if (meal.difficulty === 'easy' && meal.totalTime <= 30) {
    badges.push(BADGE_DEFS.easy_to_eat)
  }

  // Quick win: under 20 min total
  if (meal.totalTime <= 20) {
    badges.push(BADGE_DEFS.quick_win)
  }

  // Family tested: previously liked with kids present
  if (likedMealIds?.includes(meal.id)) {
    badges.push(BADGE_DEFS.family_tested)
  }

  // Picky-approved: kid-friendly + mild + easy
  if (isKidFriendly && !hasSpice && meal.difficulty !== 'hard') {
    badges.push(BADGE_DEFS.picky_approved)
  }

  // Limit to 3 most relevant badges to avoid clutter
  return badges.slice(0, 3)
}
