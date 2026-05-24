/**
 * Cross-Feature Intelligence Layer
 *
 * Connects Tonight suggestions ↔ Weekly Plan ↔ Budget ↔ Leftovers
 * so each feature is aware of what other features have decided.
 *
 * Key intelligence:
 * - Tonight avoids meals already planned this week (no repeats)
 * - Tonight suggests today's planned meal if one exists
 * - Weekly plan knows what was cooked recently (from tonight history)
 * - Budget swaps are aware of tonight's choice
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import logger from '@/lib/logger'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WeekPlanContext {
  /** Meals already planned this week (to avoid repeats in tonight) */
  plannedMeals: Array<{
    dayIndex: number
    dayAbbrev: string
    recipeName: string
    cuisineType: string | null
    proteinType: string | null
  }>
  /** Today's specifically planned meal (if any) */
  todayPlannedMeal: {
    recipeName: string
    recipeId: string
    tags: string[]
  } | null
  /** Meals cooked in the last 7 days (from history) */
  recentlyCooked: string[]
  /** Cuisines used this week (for variety enforcement) */
  weekCuisines: string[]
  /** Proteins used this week (for variety enforcement) */
  weekProteins: string[]
}

export interface CrossFeatureSignals {
  /** Meal names to avoid (already planned/cooked recently) */
  avoidMeals: string[]
  /** Cuisines to deprioritize (already used this week) */
  avoidCuisines: string[]
  /** Proteins to deprioritize (already used this week) */
  avoidProteins: string[]
  /** Today's planned meal from weekly plan (if exists) */
  todayPlanned: { name: string; id: string; tags: string[] } | null
  /** Leftovers that are expiring soon (cross-feature priority) */
  urgentLeftovers: string[]
  /** Budget pressure signal (0-1, higher = more pressure) */
  budgetPressure: number
  /** Suggested reason prefix based on cross-feature context */
  reasonHint: string | null
}

// ── Day Helpers ───────────────────────────────────────────────────────────────

const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getTodayIndex(): number {
  return new Date().getDay()
}

function getWeekStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

// ── Cuisine/Protein Detection ─────────────────────────────────────────────────

const CUISINE_KEYWORDS: Record<string, string[]> = {
  italian: ['pasta', 'pizza', 'risotto', 'pesto', 'marinara', 'parmesan', 'italian'],
  mexican: ['taco', 'burrito', 'enchilada', 'salsa', 'quesadilla', 'mexican', 'fajita'],
  asian: ['stir-fry', 'teriyaki', 'soy sauce', 'rice bowl', 'noodle', 'asian', 'wok'],
  indian: ['curry', 'tikka', 'masala', 'naan', 'dal', 'indian', 'tandoori'],
  mediterranean: ['hummus', 'falafel', 'greek', 'olive', 'mediterranean', 'tzatziki'],
  american: ['burger', 'bbq', 'mac and cheese', 'american', 'grilled cheese'],
}

const PROTEIN_KEYWORDS: Record<string, string[]> = {
  chicken: ['chicken', 'poultry'],
  beef: ['beef', 'steak', 'ground beef', 'burger'],
  pork: ['pork', 'bacon', 'ham', 'sausage'],
  fish: ['salmon', 'tilapia', 'cod', 'tuna', 'fish', 'shrimp'],
  tofu: ['tofu', 'tempeh'],
  beans: ['beans', 'lentils', 'chickpeas'],
}

function detectCuisineFromText(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return cuisine
  }
  return null
}

function detectProteinFromText(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [protein, keywords] of Object.entries(PROTEIN_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return protein
  }
  return null
}

// ── Main Loader ───────────────────────────────────────────────────────────────

/**
 * Load cross-feature context for the current week.
 * Used by Tonight engine to avoid repeats and respect the weekly plan.
 */
export async function loadWeekPlanContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<WeekPlanContext> {
  const weekStart = getWeekStartDate()
  const todayIndex = getTodayIndex()

  // Load current week plan
  const { data: planRow } = await supabase
    .from('week_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const result: WeekPlanContext = {
    plannedMeals: [],
    todayPlannedMeal: null,
    recentlyCooked: [],
    weekCuisines: [],
    weekProteins: [],
  }

  if (!planRow) return result

  // Load all days with recipes
  const { data: dayRows } = await supabase
    .from('week_plan_days')
    .select('day_index, status, recipes(id, name, tags)')
    .eq('plan_id', planRow.id)

  if (!dayRows || dayRows.length === 0) return result

  for (const row of dayRows as Array<Record<string, unknown>>) {
    const recipe = row.recipes as { id: string; name: string; tags: string[] } | null
    if (!recipe) continue

    const dayIndex = row.day_index as number
    const recipeName = recipe.name
    const tags = recipe.tags || []
    const fullText = [recipeName, ...tags].join(' ')
    const cuisineType = detectCuisineFromText(fullText)
    const proteinType = detectProteinFromText(fullText)

    result.plannedMeals.push({
      dayIndex,
      dayAbbrev: DAY_ABBREVS[dayIndex] ?? `Day${dayIndex}`,
      recipeName,
      cuisineType,
      proteinType,
    })

    if (cuisineType) result.weekCuisines.push(cuisineType)
    if (proteinType) result.weekProteins.push(proteinType)

    // Check if today has a planned meal
    if (dayIndex === todayIndex) {
      result.todayPlannedMeal = {
        recipeName,
        recipeId: recipe.id,
        tags,
      }
    }

    // Track cooked meals (status = 'cooked' or past days)
    if (row.status === 'cooked' || dayIndex < todayIndex) {
      result.recentlyCooked.push(recipeName)
    }
  }

  // Deduplicate
  result.weekCuisines = [...new Set(result.weekCuisines)]
  result.weekProteins = [...new Set(result.weekProteins)]

  return result
}

/**
 * Generate cross-feature signals for the Tonight engine.
 * Tells tonight what to avoid and what to prioritize.
 */
export async function getCrossFeatureSignals(
  supabase: SupabaseClient,
  userId: string,
): Promise<CrossFeatureSignals> {
  const [weekPlan, budgetData, leftoverData] = await Promise.all([
    loadWeekPlanContext(supabase, userId),
    loadBudgetPressure(supabase, userId),
    loadUrgentLeftovers(supabase, userId),
  ])

  // Build avoidance lists
  const avoidMeals = [
    ...weekPlan.plannedMeals.map((m) => m.recipeName),
    ...weekPlan.recentlyCooked,
  ]

  // Cuisines used 2+ times this week should be deprioritized
  const cuisineCounts = weekPlan.weekCuisines.reduce<Record<string, number>>((acc, c) => {
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const avoidCuisines = Object.entries(cuisineCounts)
    .filter(([, count]) => count >= 2)
    .map(([cuisine]) => cuisine)

  // Proteins used 2+ times this week should be deprioritized
  const proteinCounts = weekPlan.weekProteins.reduce<Record<string, number>>((acc, p) => {
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})
  const avoidProteins = Object.entries(proteinCounts)
    .filter(([, count]) => count >= 2)
    .map(([protein]) => protein)

  // Build reason hint
  let reasonHint: string | null = null
  if (weekPlan.todayPlannedMeal) {
    reasonHint = `Your weekly plan has "${weekPlan.todayPlannedMeal.recipeName}" for today`
  } else if (leftoverData.length > 0) {
    reasonHint = `Uses your ${leftoverData[0]} before it expires`
  } else if (avoidCuisines.length > 0) {
    reasonHint = `Something different from this week's ${avoidCuisines[0]} meals`
  }

  const signals: CrossFeatureSignals = {
    avoidMeals,
    avoidCuisines,
    avoidProteins,
    todayPlanned: weekPlan.todayPlannedMeal
      ? { name: weekPlan.todayPlannedMeal.recipeName, id: weekPlan.todayPlannedMeal.recipeId, tags: weekPlan.todayPlannedMeal.tags }
      : null,
    urgentLeftovers: leftoverData,
    budgetPressure: budgetData,
    reasonHint,
  }

  logger.info('[cross-feature] Signals computed', {
    userId,
    avoidMealsCount: avoidMeals.length,
    avoidCuisines,
    avoidProteins,
    hasTodayPlan: !!signals.todayPlanned,
    urgentLeftovers: leftoverData.length,
    budgetPressure: budgetData.toFixed(2),
  })

  return signals
}

/**
 * Apply cross-feature signals to filter a meal pool.
 * Returns filtered pool with meals that don't conflict with weekly plan.
 */
export function applyCrossFeatureFilter<T extends { name: string; tags?: string[]; keyIngredients?: string[] }>(
  pool: T[],
  signals: CrossFeatureSignals,
): T[] {
  if (pool.length === 0) return pool

  const avoidLower = signals.avoidMeals.map((m) => m.toLowerCase())
  const avoidCuisinesLower = signals.avoidCuisines.map((c) => c.toLowerCase())
  const avoidProteinsLower = signals.avoidProteins.map((p) => p.toLowerCase())

  const filtered = pool.filter((meal) => {
    const nameLower = meal.name.toLowerCase()
    const fullText = [meal.name, ...(meal.tags || []), ...(meal.keyIngredients || [])].join(' ').toLowerCase()

    // Hard filter: don't repeat exact meals from this week
    if (avoidLower.some((avoid) => nameLower.includes(avoid) || avoid.includes(nameLower))) {
      return false
    }

    return true
  })

  // If filtering removed everything, return original pool (don't block the user)
  if (filtered.length === 0) return pool

  // Soft sort: deprioritize repeated cuisines/proteins (move to end)
  return filtered.sort((a, b) => {
    const aText = [a.name, ...(a.tags || []), ...(a.keyIngredients || [])].join(' ').toLowerCase()
    const bText = [b.name, ...(b.tags || []), ...(b.keyIngredients || [])].join(' ').toLowerCase()

    const aHasAvoidCuisine = avoidCuisinesLower.some((c) => aText.includes(c)) ? 1 : 0
    const bHasAvoidCuisine = avoidCuisinesLower.some((c) => bText.includes(c)) ? 1 : 0
    const aHasAvoidProtein = avoidProteinsLower.some((p) => aText.includes(p)) ? 1 : 0
    const bHasAvoidProtein = avoidProteinsLower.some((p) => bText.includes(p)) ? 1 : 0

    return (aHasAvoidCuisine + aHasAvoidProtein) - (bHasAvoidCuisine + bHasAvoidProtein)
  })
}

// ── Helper Loaders ────────────────────────────────────────────────────────────

async function loadBudgetPressure(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data: budgetRow } = await supabase
    .from('budgets')
    .select('weekly_limit')
    .eq('user_id', userId)
    .maybeSingle()

  if (!budgetRow?.weekly_limit) return 0

  const weekStart = getWeekStartDate()
  const { data: spendRow } = await supabase
    .from('budget_weekly_spend')
    .select('spent')
    .eq('user_id', userId)
    .gte('week_start', weekStart)
    .maybeSingle()

  const spent = (spendRow?.spent as number) ?? 0
  const limit = budgetRow.weekly_limit as number

  // Budget pressure: 0 = no pressure, 1 = over budget
  return Math.min(1, Math.max(0, spent / limit))
}

async function loadUrgentLeftovers(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  const { data: rows } = await supabase
    .from('leftovers')
    .select('name')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('expires_at', twoDaysFromNow.toISOString())
    .limit(5)

  return (rows ?? []).map((r) => r.name as string).filter(Boolean)
}
