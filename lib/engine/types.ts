// ============================================================
// Smart Meal Engine — Type Definitions
// ============================================================

export type Stage = 'adult' | 'kid' | 'toddler' | 'baby'

// ── Request ─────────────────────────────────────────────────

export interface SmartMealRequest {
  // What they have
  pantryItems?: string[]
  inspirationMeal?: string // from image recognition or text

  // Who they're feeding
  household: {
    adultsCount: number
    kidsCount: number
    toddlersCount: number
    babiesCount: number
  }

  // Constraints
  pickyEater?: {
    active: boolean
    dislikedFoods?: string[]
    texturePreference?: 'normal' | 'soft' | 'pureed' | 'finger_foods'
    safeFoods?: string[]
  }
  lowEnergy?: boolean

  // Preferences
  locality?: string
  cuisinePreferences?: string[]
  allergies?: string[]
  dietaryRestrictions?: string[] // vegetarian, vegan, pescatarian, gluten-free, dairy-free
  budget?: 'low' | 'medium' | 'high'
  maxCookTime?: number // minutes
  preferredProteins?: string[]

  // Exclusion (for variety in swipe stacks)
  excludeIds?: string[]
}

// ── Result ──────────────────────────────────────────────────

export type IngredientCategory =
  | 'produce'
  | 'protein'
  | 'dairy'
  | 'grain'
  | 'pantry_staple'
  | 'spice'
  | 'condiment'
  | 'other'

export interface SmartIngredient {
  name: string
  quantity: string
  unit: string
  note?: string
  fromPantry: boolean
  category: IngredientCategory
}

export interface SmartVariation {
  stage: Stage
  label: string
  emoji: string
  title: string
  description: string
  modifications: string[]
  safetyNotes: string[]
  textureNotes: string | null
  servingTip: string
  allergyWarnings: string[]
}

export interface SmartShoppingItem {
  name: string
  quantity: string
  unit: string
  category: string
  estimatedCost: number
  substituteOptions: string[]
}

export interface EngineMeta {
  score: number
  matchedPantryItems: string[]
  pantryUtilization: number
  simplifiedForEnergy: boolean
  pickyEaterAdjusted: boolean
  localityApplied: boolean
  selectionReason: string
  acceptanceScore?: number
  familyHarmonyScore?: number
  easeScore?: number
  budgetScore?: number
  prepTimeScore?: number
  /** True when < 2 viable candidates remained after allergen/dietary filtering */
  poolExhausted?: boolean
}

export interface SmartMealResult {
  id: string
  title: string
  tagline: string
  description: string
  cuisineType: string
  imageUrl?: string
  prepTime: number
  cookTime: number
  totalTime: number
  estimatedCost: number
  servings: number
  difficulty: 'easy' | 'moderate' | 'hard'
  tags: string[]
  ingredients: SmartIngredient[]
  steps: string[]
  variations: SmartVariation[]
  leftoverTip: string | null
  shoppingList: SmartShoppingItem[]
  meta: EngineMeta
  /** Whether this meal has been reviewed by a professional chef */
  chefVerified?: boolean
}

// ── Internal / Meal Database ────────────────────────────────

export type CuisineTag =
  | 'american'
  | 'mexican'
  | 'asian'
  | 'mediterranean'
  | 'indian'
  | 'italian'
  | 'nepali'
  | 'comfort'
  | 'global'

export type ProteinType =
  | 'chicken'
  | 'beef'
  | 'pork'
  | 'fish'
  | 'shrimp'
  | 'tofu'
  | 'beans'
  | 'eggs'
  | 'lentils'
  | 'turkey'
  | 'sausage'
  | 'none'

export interface MealIngredient {
  name: string
  quantity: string
  unit: string
  note?: string
  category: IngredientCategory
  pantryStaple: boolean
}

export interface MealVariationData {
  title: string
  description: string
  modifications: string[]
  safetyNotes: string[]
  textureNotes: string | null
  servingTip: string
}

export interface MealCandidate {
  id: string
  title: string
  tagline: string
  description: string
  cuisineTags: CuisineTag[]
  proteinType: ProteinType
  prepTime: number
  cookTime: number
  estimatedCost: number
  costLevel: 'low' | 'medium' | 'high'
  servings: number
  difficulty: 'easy' | 'moderate' | 'hard'
  energyDemand: 'low' | 'medium' | 'high'
  tags: string[]
  kidFriendlyScore: number // 0-10
  dietaryCompat: string[]
  ingredients: MealIngredient[]
  steps: string[]
  variations: Record<Stage, MealVariationData>
  simplifiedSteps?: string[]
  simplifiedSwaps?: { from: string; to: string }[]
  leftoverTip: string | null
  keyIngredients: string[]
  relatedTerms: string[]
  imageUrl?: string // per-meal image; falls back to cuisine-based if not provided
}
