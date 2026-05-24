// ============================================================
// lib/meal-engine/preferences-types.ts
// Client-safe dietary preference types, defaults, and pure
// utility functions. No server-only imports.
// ============================================================

// ── Types ─────────────────────────────────────────────────────────────────────

export type EatingStyle =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'custom'

export type AllergyType =
  | 'peanuts'
  | 'tree_nuts'
  | 'dairy'
  | 'eggs'
  | 'soy'
  | 'gluten'
  | 'sesame'
  | 'shellfish'
  | 'fish'

export type AvoidFood =
  | 'beef'
  | 'pork'
  | 'eggs'
  | 'dairy'
  | 'seafood'
  | 'mushrooms'
  | 'cilantro'
  | 'onion'
  | 'garlic'
  | 'spicy'

export type FavoriteProtein =
  | 'chicken'
  | 'fish'
  | 'paneer'
  | 'tofu'
  | 'lentils'
  | 'beans'
  | 'turkey'
  | 'shrimp'
  | 'beef'
  | 'pork'

export type CuisineType =
  | 'nepali'
  | 'indian'
  | 'italian'
  | 'mexican'
  | 'american'
  | 'korean'
  | 'japanese'
  | 'mediterranean'
  | 'thai'
  | 'chinese'
  | 'french'
  | 'middle_eastern'

export type DietaryGoal =
  | 'save_money'
  | 'high_protein'
  | 'healthy_eating'
  | 'quick_meals'
  | 'family_harmony'
  | 'reduce_waste'
  | 'weight_management'

export type KidsSpiceTolerance = 'none' | 'mild' | 'medium' | 'spicy'

export interface UserDietaryPreferences {
  user_id: string
  eating_style: EatingStyle
  avoid_foods: string[]
  allergies: string[]
  favorite_proteins: string[]
  cuisine_love: string[]
  goals: string[]
  kids_spice_tolerance: KidsSpiceTolerance
  kids_foods_love: string[]
  kids_foods_reject: string[]
  updated_at: string
}

export const DEFAULT_PREFS: Omit<UserDietaryPreferences, 'user_id' | 'updated_at'> = {
  eating_style: 'omnivore',
  avoid_foods: [],
  allergies: [],
  favorite_proteins: [],
  cuisine_love: [],
  goals: [],
  kids_spice_tolerance: 'mild',
  kids_foods_love: [],
  kids_foods_reject: [],
}

// ── AI Context Builder ────────────────────────────────────────────────────────

export function buildPreferenceContext(
  prefs: UserDietaryPreferences | null | undefined,
  opts?: { includeKidsSettings?: boolean },
): string {
  if (!prefs) return ''

  const lines: string[] = []

  if (prefs.eating_style && prefs.eating_style !== 'omnivore') {
    const styleLabels: Record<string, string> = {
      vegetarian: 'Vegetarian (no meat or fish)',
      vegan: 'Vegan (no animal products at all)',
      pescatarian: 'Pescatarian (fish ok, no red meat or poultry)',
      halal: 'Halal (halal-certified proteins only)',
      kosher: 'Kosher dietary guidelines',
      custom: 'Custom dietary preferences (see avoidances below)',
    }
    lines.push(`Eating style: ${styleLabels[prefs.eating_style] ?? prefs.eating_style}`)
  }

  if (prefs.allergies?.length) {
    lines.push(
      `⚠️ HARD ALLERGIES — NEVER include these ingredients or derivatives: ${prefs.allergies.join(', ')}`,
    )
  }

  if (prefs.avoid_foods?.length) {
    lines.push(`Foods to avoid (strong preference): ${prefs.avoid_foods.join(', ')}`)
  }

  if (prefs.favorite_proteins?.length) {
    lines.push(`Preferred proteins: ${prefs.favorite_proteins.join(', ')}`)
  }

  if (prefs.cuisine_love?.length) {
    lines.push(`Loved cuisines: ${prefs.cuisine_love.join(', ')}`)
  }

  if (prefs.goals?.length) {
    const goalLabels: Record<string, string> = {
      save_money: 'budget-friendly meals',
      high_protein: 'high-protein meals',
      healthy_eating: 'nutritious, balanced meals',
      quick_meals: 'fast prep time (≤ 30 min)',
      family_harmony: 'meals everyone enjoys',
      reduce_waste: 'use pantry staples, minimise waste',
      weight_management: 'lighter, portion-conscious meals',
    }
    const goalDesc = prefs.goals.map(g => goalLabels[g] ?? g).join('; ')
    lines.push(`Meal goals: ${goalDesc}`)
  }

  if (opts?.includeKidsSettings) {
    if (prefs.kids_spice_tolerance === 'none') {
      lines.push(`Kids spice tolerance: none — keep all dishes completely mild`)
    } else if (prefs.kids_spice_tolerance && prefs.kids_spice_tolerance !== 'mild') {
      lines.push(`Kids spice tolerance: ${prefs.kids_spice_tolerance}`)
    }
    if (prefs.kids_foods_love?.length) {
      lines.push(`Kids love: ${prefs.kids_foods_love.join(', ')}`)
    }
    if (prefs.kids_foods_reject?.length) {
      lines.push(
        `⚠️ Kids REFUSE these foods — never include: ${prefs.kids_foods_reject.join(', ')}`,
      )
    }
  }

  if (!lines.length) return ''

  return `\n\nUSER DIETARY PROFILE (these constraints MUST be respected in every suggestion):\n${lines.map(l => `- ${l}`).join('\n')}\n`
}

// ── Explanation Builder ───────────────────────────────────────────────────────

export function buildExplanationHint(
  prefs: UserDietaryPreferences | null | undefined,
): string {
  if (!prefs) return ''

  const parts: string[] = []

  if (prefs.eating_style && prefs.eating_style !== 'omnivore') {
    parts.push(`${prefs.eating_style} profile`)
  }

  if (prefs.allergies?.length) {
    const label = prefs.allergies.length === 1 ? prefs.allergies[0] : `${prefs.allergies.length} allergies`
    parts.push(`${label}-free`)
  }

  if (prefs.cuisine_love?.length) {
    parts.push(`your love of ${prefs.cuisine_love[0]}`)
  }

  if (prefs.goals?.includes('quick_meals')) parts.push('quick prep')
  if (prefs.goals?.includes('high_protein')) parts.push('high protein')

  if (!parts.length) return ''
  return `Personalized for ${parts.slice(0, 3).join(', ')}`
}

// ── Preference → Engine field mapper ──────────────────────────────────────────

export function applyPrefsToEngineRequest<
  T extends {
    allergies?: string[]
    dietaryRestrictions?: string[]
    cuisinePreferences?: string[]
    preferredProteins?: string[]
  },
>(request: T, prefs: UserDietaryPreferences | null): T {
  if (!prefs) return request

  const existingAllergies = request.allergies ?? []
  const mergedAllergies = Array.from(new Set([...existingAllergies, ...prefs.allergies]))

  const existingDietary = request.dietaryRestrictions ?? []
  const styleDietary =
    prefs.eating_style !== 'omnivore' && prefs.eating_style !== 'custom'
      ? [prefs.eating_style]
      : []
  const avoidDietary = prefs.avoid_foods.map(f => `avoid_${f}`)
  const mergedDietary = Array.from(
    new Set([...existingDietary, ...styleDietary, ...avoidDietary]),
  )

  const existingCuisines = request.cuisinePreferences ?? []
  const mergedCuisines = Array.from(new Set([...existingCuisines, ...prefs.cuisine_love]))

  const existingProteins = request.preferredProteins ?? []
  const mergedProteins = Array.from(
    new Set([...existingProteins, ...prefs.favorite_proteins]),
  )

  return {
    ...request,
    allergies: mergedAllergies,
    dietaryRestrictions: mergedDietary,
    cuisinePreferences: mergedCuisines,
    preferredProteins: mergedProteins,
  }
}
