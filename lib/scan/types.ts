// ─── Scan Step State Machine ───────────────────────────────────────────────
export type ScanStep =
  | 'idle'
  | 'camera'
  | 'captured'
  | 'classifying'
  | 'picking'
  | 'processing'
  | 'results'
  | 'error'

// ─── Scan Mode / Type ──────────────────────────────────────────────────────
export type ScanMode = 'auto' | 'fridge' | 'menu' | 'food'
export type ScanType = 'fridge' | 'menu' | 'food'

// ─── Error Kinds ───────────────────────────────────────────────────────────
export type ScanErrorKind =
  | 'camera_permission'
  | 'network'
  | 'low_quality'
  | 'no_ingredients'
  | 'no_menu'
  | 'no_food'
  | 'rate_limited'
  | 'server'
  | 'unknown'

// ─── Classify API ──────────────────────────────────────────────────────────
export interface ClassifyResponse {
  type: ScanType
  confidence: number // 0–1
}

// ─── Fridge Scan ──────────────────────────────────────────────────────────
export interface Ingredient {
  id: string
  name: string
  quantity?: string
  unit?: string
  emoji?: string
}

export interface FridgeRecipe {
  id: string
  title: string
  imageUrl?: string
  cookTime: number // minutes
  servings: number
  estimatedCost: number
  matchedIngredients: string[]
  missingIngredients: string[]
}

export interface FridgeResult {
  ingredients: Ingredient[]
  recipes: FridgeRecipe[]
  savedToPantry: boolean
}

// ─── Menu Scan ────────────────────────────────────────────────────────────
export interface MenuPick {
  id: string
  name: string
  description?: string
  price?: number
  healthScore: number // 0–100
  calories?: number
  tags: string[]
  rank: number
}

export interface MenuResult {
  picks: MenuPick[]
  restaurantName?: string
}

// ─── Food Scan ────────────────────────────────────────────────────────────
export interface FoodResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  servingSize?: string
  warnings: string[]
  positives: string[]
}

// ─── Usage / Gating ───────────────────────────────────────────────────────
export interface UsageLimits {
  fridge: { used: number; limit: number; period: 'week' }
  menu: { used: number; limit: number; period: 'month' }
  food: { used: number; limit: number | null; period: 'unlimited' }
}

export type ScanGateReason = 'fridge_weekly_limit' | 'menu_monthly_limit' | null
