// ─── Price & Confidence ──────────────────────────────────────────────────────

export type PriceSource = 'usda' | 'cache' | 'estimate'
export type Confidence = 'high' | 'medium' | 'low'
export type AlertLevel = 'safe' | 'caution' | 'over'

// ─── Ingredient Categories ────────────────────────────────────────────────────

export type IngredientCategory =
  | 'produce'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'grains'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'other'

// ─── Recipe Ingredient ────────────────────────────────────────────────────────

export type RecipeIngredient = {
  name: string
  quantity: number
  unit: string
  category?: IngredientCategory
}

// ─── Cost Estimate ────────────────────────────────────────────────────────────

export type CostEstimate = {
  recipeId: string
  recipeName: string
  totalCost: number
  costPerServing: number
  servings: number
  breakdown: IngredientCost[]
  confidence: Confidence
  estimatedAt: string
}

export type IngredientCost = {
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  priceSource: PriceSource
}

// ─── Budget State ─────────────────────────────────────────────────────────────

export type BudgetSettings = {
  weeklyLimit: number | null
  strictMode: boolean
  zipCode: string | null
  preferredStore: string | null
}

export type BudgetState = {
  settings: BudgetSettings
  weekSpent: number
  weekEstimated: number
  mealsCooked: number
  percentUsed: number
  alertLevel: AlertLevel
  breakdown: CategorySpend[]
  history: SpendingHistoryWeek[]
}

export type CategorySpend = {
  category: IngredientCategory
  amount: number
  percentage: number
}

// ─── Price Point ──────────────────────────────────────────────────────────────

export type PricePoint = {
  ingredientKey: string
  zipRegion: string
  pricePerUnit: number
  unit: string
  source: PriceSource
  confidence: Confidence
  cachedAt: string
  expiresAt: string
}

// ─── Spending History ─────────────────────────────────────────────────────────

export type SpendingHistoryWeek = {
  weekStart: string // ISO date string YYYY-MM-DD
  spent: number
  estimated: number
  mealsCooked: number
  breakdown: CategorySpend[]
}

// ─── Budget Payload (server → client) ────────────────────────────────────────

export type BudgetPayload = {
  settings: BudgetSettings
  currentWeek: {
    weekStart: string
    spent: number
    estimated: number
    mealsCooked: number
    breakdown: CategorySpend[]
  }
  history: SpendingHistoryWeek[]
  plan: 'free' | 'plus'
}
