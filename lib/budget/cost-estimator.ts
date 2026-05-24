import type { RecipeIngredient, CostEstimate, IngredientCost, CategorySpend } from './types'
import { categorize, normalizeIngredientKey } from './categorize'
import { toGrams } from './units'
import { usdaProvider } from './price-providers/usda'
import { normalizeZipRegion } from './price-providers/index'

// ─── Estimate a single recipe cost ───────────────────────────────────────────

export async function estimateRecipeCost(
  recipeId: string,
  recipeName: string,
  ingredients: RecipeIngredient[],
  servings: number,
  zipCode: string | null = null,
): Promise<CostEstimate> {
  const zipRegion = normalizeZipRegion(zipCode)
  const breakdown: IngredientCost[] = []
  let totalCost = 0
  let lowestConfidence: 'high' | 'medium' | 'low' = 'high'

  const confidenceRank = { high: 3, medium: 2, low: 1 }

  for (const ing of ingredients) {
    const category = ing.category ?? categorize(ing.name)
    const key = normalizeIngredientKey(ing.name)

    // Get price point
    const pricePoint = await usdaProvider.getPrice(key, category, zipRegion)

    if (!pricePoint) {
      // Skip ingredient if no price available
      continue
    }

    // Convert to grams
    const grams = toGrams(ing.quantity, ing.unit, category)
    if (grams === null || grams <= 0) {
      // Use a default 100g if conversion fails
      const unitCost = pricePoint.pricePerUnit * 100
      breakdown.push({
        name: ing.name,
        category,
        quantity: ing.quantity,
        unit: ing.unit,
        unitCost,
        totalCost: unitCost,
        priceSource: pricePoint.source,
      })
      totalCost += unitCost
    } else {
      const ingredientCost = pricePoint.pricePerUnit * grams
      breakdown.push({
        name: ing.name,
        category,
        quantity: ing.quantity,
        unit: ing.unit,
        unitCost: pricePoint.pricePerUnit,
        totalCost: ingredientCost,
        priceSource: pricePoint.source,
      })
      totalCost += ingredientCost
    }

    // Track lowest confidence
    if (confidenceRank[pricePoint.confidence] < confidenceRank[lowestConfidence]) {
      lowestConfidence = pricePoint.confidence
    }
  }

  const costPerServing = servings > 0 ? totalCost / servings : totalCost

  return {
    recipeId,
    recipeName,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerServing: Math.round(costPerServing * 100) / 100,
    servings,
    breakdown,
    confidence: lowestConfidence,
    estimatedAt: new Date().toISOString(),
  }
}

// ─── Estimate week cost from multiple recipes ─────────────────────────────────

export async function estimateWeekCost(
  recipes: Array<{
    recipeId: string
    recipeName: string
    ingredients: RecipeIngredient[]
    servings: number
  }>,
  zipCode: string | null = null,
): Promise<{
  totalCost: number
  estimates: CostEstimate[]
  breakdown: CategorySpend[]
}> {
  const estimates = await Promise.all(
    recipes.map((r) =>
      estimateRecipeCost(r.recipeId, r.recipeName, r.ingredients, r.servings, zipCode),
    ),
  )

  const totalCost = estimates.reduce((sum, e) => sum + e.totalCost, 0)

  // Aggregate category breakdown
  const categoryTotals: Record<string, number> = {}
  for (const estimate of estimates) {
    for (const item of estimate.breakdown) {
      categoryTotals[item.category] = (categoryTotals[item.category] ?? 0) + item.totalCost
    }
  }

  const breakdown: CategorySpend[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as CategorySpend['category'],
      amount: Math.round(amount * 100) / 100,
      percentage: totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    estimates,
    breakdown,
  }
}

// ─── Compute alert level ──────────────────────────────────────────────────────

export function computeAlertLevel(
  weekSpent: number,
  weeklyLimit: number | null,
): 'safe' | 'caution' | 'over' {
  if (!weeklyLimit || weeklyLimit <= 0) return 'safe'
  const pct = (weekSpent / weeklyLimit) * 100
  if (pct >= 100) return 'over'
  if (pct >= 70) return 'caution'
  return 'safe'
}

// ─── Get current week start (Monday) ─────────────────────────────────────────

export function getCurrentWeekStart(): Date {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day // adjust to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function formatWeekStart(date: Date): string {
  return date.toISOString().split('T')[0]
}
