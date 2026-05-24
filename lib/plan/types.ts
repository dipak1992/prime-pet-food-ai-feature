import type { Recipe } from '@/lib/dashboard/types'

export type DayStatus = 'planned' | 'cooked' | 'skipped' | 'empty'

export type PlanDay = {
  id: string
  dayIndex: number       // 0 = Mon, 6 = Sun
  dayAbbrev: string      // "Mon"
  dayLabel: string       // "Monday"
  date: string           // ISO date YYYY-MM-DD
  dateLabel: string      // "Dec 3"
  recipe: Recipe | null
  status: DayStatus
  locked: boolean
  estimatedCost: number | null
  notes: string | null
}

export type WeekPlan = {
  id: string
  weekStart: string      // ISO date (Monday)
  weekEnd: string        // ISO date (Sunday)
  isAutopilot: boolean
  days: PlanDay[]
  stats: {
    plannedCount: number
    cookedCount: number
    emptyCount: number
    totalEstimatedCost: number
    completionPercentage: number
  }
}

export type SwapCandidate = {
  recipe: Recipe
  reason: string
  matchScore: number     // 0..1
  usesLeftover: boolean
  withinBudget: boolean
}

export type MealComplexity = 'quick' | 'balanced' | 'adventurous'
export type LeftoverPriority = 'high' | 'normal' | 'low'

export type AutopilotPreferences = {
  cuisinePreferences: string[]
  mealComplexity: MealComplexity
  leftoverPriority: LeftoverPriority
  lowEnergyMode: boolean
}

export type AutopilotOptions = {
  respectLocked: boolean
  overwriteEmptyOnly: boolean
  budgetCap?: number
  mealType?: 'breakfast' | 'lunch' | 'dinner'
  // Enhanced preferences
  preferences?: AutopilotPreferences
}

export type AutopilotResult = {
  weekPlan: WeekPlan
  summary: {
    daysGenerated: number
    estimatedTotalCost: number
    leftoversUsed: number
    uniqueProteins: number
    // Enhanced summary fields
    cuisineSpread: string[]
    avgCookTime: number
    seasonalMeals: number
    pantryItemsUsed: number
    budgetSavings: number | null  // how much under budget (null if no budget)
  }
}

// ─── Autopilot history (for learning) ─────────────────────────────────────────

export type AutopilotFeedback = {
  planId: string
  dayIndex: number
  action: 'accepted' | 'swapped' | 'cleared' | 'cooked'
  timestamp: string
}

export type AutopilotStats = {
  totalPlansGenerated: number
  acceptanceRate: number       // 0..1
  avgDaysKept: number
  topCuisines: string[]
  topProteins: string[]
  avgBudgetUtilization: number // 0..1
}
