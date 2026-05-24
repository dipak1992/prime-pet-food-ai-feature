export type LeftoverStatus = 'active' | 'used' | 'discarded' | 'expired'

export type Urgency = 'fresh' | 'soon' | 'today' | 'expired'

export type IngredientCategory =
  | 'meat'
  | 'poultry'
  | 'seafood'
  | 'dairy'
  | 'egg'
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'legume'
  | 'other'

export type MainIngredient = {
  name: string
  category: IngredientCategory
}

export type Leftover = {
  id: string
  userId: string
  householdId: string | null
  sourceRecipeId: string | null
  name: string
  image: string | null
  mainIngredients: MainIngredient[]
  servingsRemaining: number
  originalCostPerServing: number | null
  notes: string | null
  cookedAt: string
  expiresAt: string
  status: LeftoverStatus
  usedAt: string | null
  createdAt: string
  updatedAt: string
  // computed client-side
  urgency?: Urgency
  daysUntilExpiry?: number
}

export type LeftoverInsights = {
  totalSaved: number
  totalWasted: number
  activeCount: number
  expiringSoonCount: number
  usedThisWeek: number
  wasteReductionPercent: number
}

export type LeftoverSuggestion = {
  id: string
  name: string
  description: string
  cookTimeMin: number
  usesIngredients: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  image: string | null
}
