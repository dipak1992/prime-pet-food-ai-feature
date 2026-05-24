/**
 * Unified Tonight Engine
 * 
 * Single canonical source for Tonight meal suggestions.
 * Serves two contexts:
 * 
 * 1. Landing page (public, no auth) — curated daily rotation
 * 2. Dashboard (authenticated) — free generic OR plus personalized
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plan, TonightState, Recipe } from '@/lib/dashboard/types'
import {
  type CuratedMeal,
  TONIGHT_CATALOG,
  WEEKDAY_THEMES,
  getMealsByTheme,
  getMealImage,
  dailyHash,
  pickDailyMeal,
  getMealDayOfWeek,
} from './catalog'
import { getCrossFeatureSignals, applyCrossFeatureFilter } from '@/lib/ai/cross-feature'
import { loadActiveWeeklyInstructions, type WeeklyInstruction } from '@/lib/copilot/weekly-instructions'
import { loadHouseholdMemory, type HouseholdMemoryItem } from '@/lib/ai/stateful-memory'

type PantryDetail = {
  name: string
  expiresInDays: number | null
  ageDays: number
  isAging: boolean
}

// ─── LANDING PAGE ENGINE ────────────────────────────────────────────────────────

export type LandingTonightMeal = {
  id: string
  name: string
  tagline: string
  cookTimeMin: number
  servings: number
  costPerServing: number
  difficulty: 'easy' | 'medium' | 'hard'
  benefits: string[]
  image: string
  category: string
  weekdayLabel: string
  reason: string
  chefVerified: boolean
}

/**
 * Get today's landing page meal.
 * Deterministic per day — same meal shown to all visitors all day.
 * Changes at 7am CT based on weekday theme.
 */
export function getLandingTonightMeal(): LandingTonightMeal {
  const day = getMealDayOfWeek()
  const { theme, label } = WEEKDAY_THEMES[day]
  const themed = getMealsByTheme(theme)
  const meal = pickDailyMeal(themed, 'landing-public')

  return {
    id: meal.id,
    name: meal.name,
    tagline: meal.tagline,
    cookTimeMin: meal.cookTimeMin,
    servings: meal.servings,
    costPerServing: meal.costPerServing,
    difficulty: meal.difficulty,
    benefits: meal.benefits,
    image: getMealImage(meal),
    category: meal.category,
    weekdayLabel: label,
    reason: WEEKDAY_THEMES[day].reason,
    chefVerified: meal.chefVerified ?? true,
  }
}

// ─── DASHBOARD ENGINE ───────────────────────────────────────────────────────────

type PersonalizationContext = {
  dietary: string[]
  cuisines: string[]
  goals: string[]
  pantry: string[]
  pantryDetails: PantryDetail[]
  groceryItems: string[]
  leftovers: string[]
  urgentLeftovers: string[]
  savedMeals: string[]
  dislikes: string[]
  weeklyBudget: number | null
  weekSpent: number
  maxCookTimeMin: number | null
  weeklyInstructions: WeeklyInstruction[]
  memory: HouseholdMemoryItem[]
}

/** Convert CuratedMeal → TonightState for dashboard consumption */
function toTonightState(meal: CuratedMeal, reason: string, extras?: Partial<TonightState>): TonightState {
  const recipe: Recipe = {
    id: meal.id,
    name: meal.name,
    image: getMealImage(meal),
    cookTimeMin: meal.cookTimeMin,
    difficulty: meal.difficulty,
    servings: meal.servings,
    costTotal: Math.round(meal.costPerServing * meal.servings * 100) / 100,
    costPerServing: meal.costPerServing,
    tags: meal.tags,
    chefVerified: meal.chefVerified ?? true, // All curated catalog meals are chef-verified
  }

  return {
    recipe,
    reason,
    alternativesAvailable: 3,
    isFromPantry: meal.weekdayTheme === 'pantry',
    usesLeftover: null,
    ...extras,
  }
}

/**
 * Get tonight suggestion for FREE users.
 * Deterministic per user per day. Themed by weekday.
 */
export function getFreeTonightSuggestion(userId: string): TonightState {
  const day = getMealDayOfWeek()
  const { theme, reason } = WEEKDAY_THEMES[day]
  const themed = getMealsByTheme(theme)
  const meal = pickDailyMeal(themed, `free:${userId}`)

  return toTonightState(meal, reason, { alternativesAvailable: 3 })
}

/**
 * Get tonight suggestion for PLUS users.
 * Personalized based on preferences, pantry, leftovers, grocery items, budget.
 */
export async function getPlusTonightSuggestion(
  supabase: SupabaseClient,
  userId: string,
): Promise<TonightState> {
  const day = getMealDayOfWeek()
  const { theme } = WEEKDAY_THEMES[day]

  try {
    // Load personalization context and cross-feature signals in parallel
    const [context, crossSignals] = await Promise.all([
      loadPersonalizationContext(supabase, userId),
      getCrossFeatureSignals(supabase, userId).catch(() => null),
    ])

    // If today has a planned meal in the weekly plan, suggest that directly
    if (crossSignals?.todayPlanned) {
      const planned = crossSignals.todayPlanned
      // Find it in catalog for full data, or build a minimal state
      const catalogMatch = TONIGHT_CATALOG.find(
        (m) => m.name.toLowerCase() === planned.name.toLowerCase() || m.id === planned.id
      )
      if (catalogMatch) {
        return toTonightState(catalogMatch, `From your weekly plan — already planned for today.`, {
          alternativesAvailable: 99,
          isFromPantry: false,
          usesLeftover: null,
        })
      }
    }

    const themed = getMealsByTheme(theme)
    let allMeals = themed.length >= 2 ? themed : TONIGHT_CATALOG

    // Apply cross-feature filter: avoid meals already planned this week
    if (crossSignals) {
      allMeals = applyCrossFeatureFilter(allMeals, crossSignals)
    }

    // Try personalization in priority order
    const personalized = personalizeSelection(allMeals, context, userId)

    // Enhance reason with cross-feature context
    let reason = personalized.reason
    if (crossSignals?.reasonHint && !personalized.usesLeftover) {
      reason = `${reason} ${crossSignals.reasonHint}.`
    }

    return toTonightState(personalized.meal, reason, {
      alternativesAvailable: 99,
      isFromPantry: personalized.isFromPantry,
      usesLeftover: personalized.usesLeftover,
    })
  } catch {
    // Fallback: deterministic daily pick per user from plus pool
    const themed = getMealsByTheme(theme)
    const meal = pickDailyMeal(themed.length ? themed : TONIGHT_CATALOG, `plus:${userId}`)
    return toTonightState(meal, WEEKDAY_THEMES[day].reason, { alternativesAvailable: 99 })
  }
}

/**
 * Get a swap suggestion (no-repeat guarantee).
 * For plus users: respects dietary restrictions and dislikes.
 * Returns a different meal from the same theme, excluding already-seen IDs.
 */
export function getSwapSuggestion(
  userId: string,
  excludeIds: string[],
  plan: Plan,
  context?: Pick<PersonalizationContext, 'dietary' | 'dislikes' | 'cuisines'>,
): TonightState {
  const day = getMealDayOfWeek()
  const { theme, reason } = WEEKDAY_THEMES[day]
  const themed = getMealsByTheme(theme)

  // Filter out already-seen meals
  let available = themed.filter((m) => !excludeIds.includes(m.id))

  // For Plus users with context: also filter dislikes and dietary
  if (context && plan === 'plus') {
    available = applyHardFilters(available, context)
    // If filtering leaves nothing, fall back to just exclude-filtered pool
    if (available.length === 0) {
      available = themed.filter((m) => !excludeIds.includes(m.id))
    }
  }

  // If all themed meals exhausted, pull from full catalog
  const pool = available.length > 0
    ? available
    : TONIGHT_CATALOG.filter((m) => !excludeIds.includes(m.id))

  // If truly exhausted (unlikely with 21 meals), wrap around
  const finalPool = pool.length > 0 ? pool : TONIGHT_CATALOG

  const offset = excludeIds.length
  const meal = finalPool[dailyHash(`${userId}:swap:${offset}`) % finalPool.length]

  return toTonightState(meal, reason, {
    alternativesAvailable: plan === 'plus' ? 99 : Math.max(0, 3 - excludeIds.length),
  })
}

// ─── PERSONALIZATION LOGIC ──────────────────────────────────────────────────────

type PersonalizedResult = {
  meal: CuratedMeal
  reason: string
  isFromPantry: boolean
  usesLeftover: { leftoverId: string; leftoverName: string } | null
}

/**
 * Apply hard dietary/dislike filters to a pool.
 * Returns filtered pool (may be empty if nothing passes).
 */
function applyHardFilters(
  pool: CuratedMeal[],
  context: Pick<PersonalizationContext, 'dietary' | 'dislikes'>,
): CuratedMeal[] {
  let filtered = pool

  // Filter out dislikes
  if (context.dislikes.length > 0) {
    filtered = filtered.filter((m) =>
      !context.dislikes.some((d) =>
        m.name.toLowerCase().includes(d.toLowerCase()) ||
        m.keyIngredients.some((ing) => ing.toLowerCase().includes(d.toLowerCase()))
      )
    )
  }

  // Filter vegetarian/vegan
  const lowerDietary = context.dietary.map((d) => d.toLowerCase())
  if (lowerDietary.includes('vegan')) {
    const vegan = filtered.filter((m) => m.tags.includes('vegan') || m.tags.includes('vegetarian'))
    if (vegan.length > 0) filtered = vegan
  } else if (lowerDietary.includes('vegetarian')) {
    const veg = filtered.filter((m) => m.tags.includes('vegetarian'))
    if (veg.length > 0) filtered = veg
  }

  return filtered
}

/** Known protein terms for pantry-protein matching */
const KNOWN_PROTEIN_TERMS = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'tofu', 'tempeh', 'eggs', 'sausage', 'lamb', 'tuna', 'cod', 'trout']

function extractProteinsFromStrings(items: string[]): string[] {
  const lower = items.map(i => i.toLowerCase())
  return KNOWN_PROTEIN_TERMS.filter(p => lower.some(item => item.includes(p) || p.includes(item)))
}

function mealHasProteinMatch(meal: CuratedMeal, pantryProteins: string[]): boolean {
  const mealIngLower = meal.keyIngredients.map(k => k.toLowerCase())
  return pantryProteins.some(pp =>
    mealIngLower.some(ing => ing.includes(pp) || pp.includes(ing))
  )
}

function personalizeSelection(
  pool: CuratedMeal[],
  context: PersonalizationContext,
  userId: string,
): PersonalizedResult {
  // Apply hard filters first (dislikes + dietary)
  const safePool = applyHardFilters(pool, context).length > 0
    ? applyHardFilters(pool, context)
    : pool

  // Hard filter: if pantry has proteins, remove meals whose protein doesn't match
  let pantryFilteredPool = safePool
  if (context.pantry.length > 0) {
    const pantryProteins = extractProteinsFromStrings(context.pantry)
    if (pantryProteins.length > 0) {
      const matched = safePool.filter(m => mealHasProteinMatch(m, pantryProteins))
      // Only apply if we still have at least 2 meals to choose from
      if (matched.length >= 2) {
        pantryFilteredPool = matched
      }
    }
  }

  // Ensure selected meal uses at least 2 pantry items when pantry is available
  let pantryPreferredPool = pantryFilteredPool
  if (context.pantry.length >= 2) {
    const lowerPantry = context.pantry.map(p => p.toLowerCase())
    const multiMatch = pantryFilteredPool.filter(m => {
      const matchCount = m.keyIngredients.filter(k =>
        lowerPantry.some(p => k.toLowerCase().includes(p) || p.includes(k.toLowerCase()))
      ).length
      return matchCount >= 2
    })
    if (multiMatch.length >= 1) {
      pantryPreferredPool = multiMatch
    }
  }

  // Priority 0: Stateful use-soon inventory — clear expiring/aging food before generic preferences
  const useSoonIngredients = getUseSoonIngredients(context)
  if (useSoonIngredients.length > 0) {
    const memoryMatch = findIngredientMatch(pantryPreferredPool, useSoonIngredients)
    if (memoryMatch) {
      const usesLeftover = context.urgentLeftovers
        .map((item) => item.toLowerCase())
        .some((item) => item.includes(memoryMatch.matched) || memoryMatch.matched.includes(item))

      return {
        meal: memoryMatch.meal,
        reason: `Clears ${memoryMatch.matched} from your remembered use-soon inventory before it goes to waste.`,
        isFromPantry: true,
        usesLeftover: usesLeftover
          ? { leftoverId: 'stateful-memory', leftoverName: memoryMatch.matched }
          : null,
      }
    }
  }

  // Priority 1: Weekly instruction cuisine — if set, try to match before other signals
  if (context.cuisines && context.cuisines.length > 0) {
    const cuisineMatch = findCuisineMatch(pantryPreferredPool, context.cuisines)
    if (cuisineMatch) {
      return {
        meal: cuisineMatch,
        reason: `Matches your week's theme: ${context.cuisines.join(', ')}.`,
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Priority 2: Use leftovers — highest value signal
  if (context.leftovers.length > 0) {
    const leftoverMatch = findIngredientMatch(pantryPreferredPool, context.leftovers)
    if (leftoverMatch) {
      return {
        meal: leftoverMatch.meal,
        reason: `Uses your leftover ${leftoverMatch.matched} — less waste, more flavor.`,
        isFromPantry: true,
        usesLeftover: { leftoverId: 'context-leftover', leftoverName: leftoverMatch.matched },
      }
    }
  }

  // Priority 3: Match pantry ingredients
  if (context.pantry.length > 0) {
    const pantryMatch = findIngredientMatch(pantryPreferredPool, context.pantry)
    if (pantryMatch) {
      return {
        meal: pantryMatch.meal,
        reason: `Matches the ${pantryMatch.matched} you already have — no extra shopping needed.`,
        isFromPantry: true,
        usesLeftover: null,
      }
    }
  }

  // Priority 4: Match grocery items already bought
  if (context.groceryItems.length > 0) {
    const groceryMatch = findIngredientMatch(pantryPreferredPool, context.groceryItems)
    if (groceryMatch) {
      return {
        meal: groceryMatch.meal,
        reason: `Uses the ${groceryMatch.matched} already on your grocery list — cook it tonight.`,
        isFromPantry: true,
        usesLeftover: null,
      }
    }
  }

  // Priority 5: Budget constraint — if over 80% of weekly budget, pick cheapest
  if (context.weeklyBudget != null && context.weeklyBudget > 0) {
    const budgetRemaining = context.weeklyBudget - context.weekSpent
    const perMealBudget = context.weeklyBudget / 7
    if (budgetRemaining < perMealBudget * 1.5) {
      // Under budget pressure — find cheapest meal in pantry-filtered pool
      const sorted = [...pantryPreferredPool].sort((a, b) => a.costPerServing - b.costPerServing)
      const budgetMeal = sorted[0]
      if (budgetMeal) {
        return {
          meal: budgetMeal,
          reason: `Budget-friendly pick — ~$${budgetMeal.costPerServing.toFixed(2)}/serving to keep your week on track.`,
          isFromPantry: false,
          usesLeftover: null,
        }
      }
    }
  }

  // Priority 5: Temporary weekly Copilot cuisine instruction
  const weeklyCuisine = context.weeklyInstructions.find((item) => item.instructionType === 'cuisine_boost')
  if (weeklyCuisine) {
    const cuisineMeal = findCuisineMatch(pantryPreferredPool, [weeklyCuisine.value])
    if (cuisineMeal) {
      return {
        meal: cuisineMeal,
        reason: `${weeklyCuisine.label} is active, so tonight leans that direction.`,
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Priority 6: Respect dietary preferences
  if (context.dietary.length > 0) {
    const dietaryMeal = findDietaryMatch(pantryPreferredPool, context.dietary)
    if (dietaryMeal) {
      return {
        meal: dietaryMeal,
        reason: `Aligned with your ${context.dietary[0]} preferences.`,
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Priority 7: Cuisine preference
  if (context.cuisines.length > 0) {
    const cuisineMeal = findCuisineMatch(pantryPreferredPool, context.cuisines)
    if (cuisineMeal) {
      return {
        meal: cuisineMeal,
        reason: `Matches your ${context.cuisines[0]} cuisine preference.`,
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Priority 8: Cook time constraint
  if (context.maxCookTimeMin != null) {
    const quickMeals = pantryPreferredPool.filter((m) => m.cookTimeMin <= context.maxCookTimeMin!)
    if (quickMeals.length > 0) {
      const meal = pickDailyMeal(quickMeals, `plus:${userId}`)
      return {
        meal,
        reason: `Ready in ${meal.cookTimeMin} minutes — fits your cooking time preference.`,
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Priority 9: Budget goal from profile
  if (context.goals.includes('save_money')) {
    const budgetMeal = pantryPreferredPool.find((m) => m.tags.includes('budget'))
    if (budgetMeal) {
      return {
        meal: budgetMeal,
        reason: 'Chosen to keep tonight affordable — aligned with your budget goal.',
        isFromPantry: false,
        usesLeftover: null,
      }
    }
  }

  // Fallback: per-user deterministic pick from pantry-filtered pool
  const meal = pickDailyMeal(pantryPreferredPool, `plus:${userId}`)

  return {
    meal,
    reason: 'Personalized from your preferences, pantry, and meal history.',
    isFromPantry: false,
    usesLeftover: null,
  }
}

function findIngredientMatch(
  pool: CuratedMeal[],
  ingredients: string[],
): { meal: CuratedMeal; matched: string } | null {
  const lowerIngredients = ingredients.map((i) => i.toLowerCase())

  for (const meal of pool) {
    for (const key of meal.keyIngredients) {
      const keyLower = key.toLowerCase()
      const match = lowerIngredients.find((ing) =>
        ing.includes(keyLower) || keyLower.includes(ing)
      )
      if (match) {
        return { meal, matched: match }
      }
    }
  }
  return null
}

function getUseSoonIngredients(context: PersonalizationContext): string[] {
  const urgentLeftovers = context.urgentLeftovers
  const agingPantry = context.pantryDetails
    .filter((item) => item.isAging || (item.expiresInDays != null && item.expiresInDays <= 3))
    .sort((a, b) => {
      const aExpiry = a.expiresInDays ?? 999
      const bExpiry = b.expiresInDays ?? 999
      return aExpiry - bExpiry || b.ageDays - a.ageDays
    })
    .map((item) => item.name)

  const rememberedInventory = context.memory
    .filter((item) => item.memoryType === 'pantry_inventory' || item.memoryType === 'leftover_inventory')
    .flatMap((item) => splitInventorySubject(item.subject))

  return uniqueStrings([
    ...urgentLeftovers,
    ...rememberedInventory,
    ...agingPantry,
  ]).slice(0, 16)
}

function splitInventorySubject(subject: string): string[] {
  return subject
    .replace(/\bleftover\b/gi, '')
    .replace(/\bgoing soft\b/gi, '')
    .replace(/\buse up\b/gi, '')
    .split(/,|\band\b|\+|\/|with/i)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    const key = trimmed.toLowerCase()
    if (!trimmed || seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

function buildPantryDetail(row: Record<string, unknown>): PantryDetail | null {
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  if (!name) return null

  const now = Date.now()
  const createdAt = typeof row.created_at === 'string'
    ? new Date(row.created_at).getTime()
    : now
  const ageDays = Math.max(0, Math.floor((now - createdAt) / 86400000))
  const expiresAt = typeof row.expires_at === 'string' && row.expires_at
    ? new Date(row.expires_at).getTime()
    : null
  const expiresInDays = expiresAt == null
    ? null
    : Math.max(0, Math.ceil((expiresAt - now) / 86400000))

  return {
    name,
    expiresInDays,
    ageDays,
    isAging: ageDays >= 5,
  }
}

function expiresWithinDays(value: string | null | undefined, days: number): boolean {
  if (!value) return false
  const expiresAt = new Date(value).getTime()
  if (!Number.isFinite(expiresAt)) return false
  return expiresAt <= Date.now() + days * 86400000
}

function findDietaryMatch(pool: CuratedMeal[], dietary: string[]): CuratedMeal | null {
  const lowerDietary = dietary.map((d) => d.toLowerCase())

  if (lowerDietary.includes('vegetarian') || lowerDietary.includes('vegan')) {
    return pool.find((m) => m.tags.includes('vegetarian')) ?? null
  }
  if (lowerDietary.includes('high-protein') || lowerDietary.includes('keto')) {
    return pool.find((m) => m.tags.includes('high-protein')) ?? null
  }
  if (lowerDietary.includes('gluten-free')) {
    return pool.find((m) => m.tags.includes('gluten-free')) ?? null
  }
  return null
}

function findCuisineMatch(pool: CuratedMeal[], cuisines: string[]): CuratedMeal | null {
  const lowerCuisines = cuisines.map((c) => c.toLowerCase())
  return pool.find((m) =>
    lowerCuisines.some((c) =>
      m.tags.some((t) => t.toLowerCase().includes(c)) ||
      m.name.toLowerCase().includes(c) ||
      m.category.toLowerCase().includes(c)
    )
  ) ?? null
}

// ─── DATA LOADING ───────────────────────────────────────────────────────────────

async function loadPersonalizationContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<PersonalizationContext> {
  const context: PersonalizationContext = {
    dietary: [],
    cuisines: [],
    goals: [],
    pantry: [],
    pantryDetails: [],
    groceryItems: [],
    leftovers: [],
    urgentLeftovers: [],
    savedMeals: [],
    dislikes: [],
    weeklyBudget: null,
    weekSpent: 0,
    maxCookTimeMin: null,
    weeklyInstructions: [],
    memory: [],
  }

  // ── Load preferences — try household_preferences first (written by onboarding) ──
  const { data: householdPrefs } = await supabase
    .from('household_preferences')
    .select('dietary_restrictions, disliked_ingredients, cuisines, cooking_time_minutes, weekly_budget, goals')
    .eq('user_id', userId)
    .maybeSingle()

  if (householdPrefs) {
    context.dietary = Array.isArray(householdPrefs.dietary_restrictions)
      ? (householdPrefs.dietary_restrictions as string[]).filter(Boolean)
      : []
    context.dislikes = Array.isArray(householdPrefs.disliked_ingredients)
      ? (householdPrefs.disliked_ingredients as string[]).filter(Boolean)
      : []
    context.cuisines = Array.isArray(householdPrefs.cuisines)
      ? (householdPrefs.cuisines as string[]).filter(Boolean)
      : []
    if (typeof householdPrefs.cooking_time_minutes === 'number' && householdPrefs.cooking_time_minutes > 0) {
      context.maxCookTimeMin = householdPrefs.cooking_time_minutes
    }
    if (typeof householdPrefs.weekly_budget === 'number' && householdPrefs.weekly_budget > 0) {
      context.weeklyBudget = householdPrefs.weekly_budget
    }
    context.goals = Array.isArray(householdPrefs.goals)
      ? (householdPrefs.goals as string[]).filter(Boolean)
      : []
  }

  // ── Active weekly Copilot instructions — temporary, auto-expiring context ──
  const weeklyInstructions = await loadActiveWeeklyInstructions(supabase, userId).catch(() => [])
  context.weeklyInstructions = weeklyInstructions
  for (const instruction of weeklyInstructions) {
    if (instruction.instructionType === 'cuisine_boost') {
      context.cuisines = [
        instruction.value,
        ...context.cuisines.filter((item) => item.toLowerCase() !== instruction.value.toLowerCase()),
      ]
    }
    if (instruction.instructionType === 'avoid') {
      context.dislikes = [
        instruction.value,
        ...context.dislikes.filter((item) => item.toLowerCase() !== instruction.value.toLowerCase()),
      ]
    }
    if (instruction.instructionType === 'time_constraint') {
      const minutes = Number(instruction.value)
      if (Number.isFinite(minutes) && minutes > 0) {
        context.maxCookTimeMin = context.maxCookTimeMin == null
          ? minutes
          : Math.min(context.maxCookTimeMin, minutes)
      }
    }
    if (instruction.instructionType === 'budget_override') {
      const budget = Number(instruction.value)
      if (Number.isFinite(budget) && budget > 0) {
        context.weeklyBudget = context.weeklyBudget == null
          ? budget
          : Math.min(context.weeklyBudget, budget)
      }
    }
  }

  // ── Fallback: user_dietary_preferences (older table) ──
  if (context.dietary.length === 0 && context.dislikes.length === 0) {
    const { data: prefs } = await supabase
      .from('user_dietary_preferences')
      .select('eating_style, goals, dislikes')
      .eq('user_id', userId)
      .maybeSingle()

    if (prefs) {
      context.dietary = [prefs.eating_style].filter(Boolean) as string[]
      if (context.goals.length === 0) {
        context.goals = Array.isArray(prefs.goals) ? (prefs.goals as string[]) : []
      }
      context.dislikes = Array.isArray(prefs.dislikes) ? (prefs.dislikes as string[]) : []
    }
  }

  // ── Load budget from budgets table if not already set ──
  if (context.weeklyBudget === null) {
    const { data: budgetRow } = await supabase
      .from('budgets')
      .select('weekly_limit')
      .eq('user_id', userId)
      .maybeSingle()
    if (typeof budgetRow?.weekly_limit === 'number' && budgetRow.weekly_limit > 0) {
      context.weeklyBudget = budgetRow.weekly_limit
    }
  }

  // ── Load current week spend ──
  if (context.weeklyBudget != null) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const { data: weekRow } = await supabase
      .from('budget_weekly_spend')
      .select('spent')
      .eq('user_id', userId)
      .gte('week_start', weekStart.toISOString().slice(0, 10))
      .maybeSingle()
    context.weekSpent = typeof weekRow?.spent === 'number' ? weekRow.spent : 0
  }

  // ── Durable memory — long-lived facts Copilot saved across sessions ──
  context.memory = await loadHouseholdMemory(supabase, userId).catch(() => [])

  // ── Load user pantry with expiry/age metadata ──
  const { data: userPantry } = await supabase
    .from('pantry_items')
    .select('name, expires_at, created_at, updated_at')
    .eq('user_id', userId)
    .limit(50)

  context.pantryDetails = ((userPantry ?? [])
    .map((item) => buildPantryDetail(item as Record<string, unknown>))
    .filter((item: PantryDetail | null): item is PantryDetail => item !== null)) as PantryDetail[]
  context.pantry = context.pantryDetails.map((item: PantryDetail) => item.name)

  // ── Load household pantry fallback ──
  const { data: household } = await supabase
    .from('households')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  if (household?.id && context.pantry.length === 0) {
    const { data: pantry } = await supabase
      .from('pantry_items')
      .select('name')
      .eq('household_id', household.id)
      .limit(30)
    context.pantry = (pantry ?? []).map((item) => item.name as string).filter(Boolean)
  }

  if (household?.id) {
    const { data: leftovers } = await supabase
      .from('leftovers')
      .select('display_name, main_ingredients, expires_at')
      .eq('household_id', household.id)
      .eq('status', 'active')
      .limit(10)
    context.leftovers = (leftovers ?? []).flatMap((item) => [
      item.display_name as string,
      ...(Array.isArray(item.main_ingredients) ? (item.main_ingredients as string[]) : []),
    ]).filter(Boolean)
    context.urgentLeftovers = (leftovers ?? [])
      .filter((item) => expiresWithinDays(item.expires_at as string | null | undefined, 2))
      .flatMap((item) => [
        item.display_name as string,
        ...(Array.isArray(item.main_ingredients) ? (item.main_ingredients as string[]) : []),
      ])
      .filter(Boolean)
  }

  // ── Fallback: user-level leftovers ──
  if (context.leftovers.length === 0) {
    const { data: leftovers } = await supabase
      .from('leftovers')
      .select('name, main_ingredients, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(10)
    context.leftovers = (leftovers ?? []).flatMap((item) => [
      item.name as string,
      ...(Array.isArray(item.main_ingredients) ? (item.main_ingredients as string[]) : []),
    ]).filter(Boolean)
    context.urgentLeftovers = (leftovers ?? [])
      .filter((item) => expiresWithinDays(item.expires_at as string | null | undefined, 2))
      .flatMap((item) => [
        item.name as string,
        ...(Array.isArray(item.main_ingredients) ? (item.main_ingredients as string[]) : []),
      ])
      .filter(Boolean)
  }

  // ── Load grocery list items (things already bought / on list) ──
  const { data: groceryRows } = await supabase
    .from('grocery_list_items')
    .select('name')
    .eq('user_id', userId)
    .eq('checked', true)   // items already bought
    .limit(20)
  if (groceryRows && groceryRows.length > 0) {
    context.groceryItems = groceryRows.map((r) => r.name as string).filter(Boolean)
  } else {
    // Also try unchecked items — things on the list to buy tonight
    const { data: uncheckedRows } = await supabase
      .from('grocery_list_items')
      .select('name')
      .eq('user_id', userId)
      .eq('checked', false)
      .limit(20)
    context.groceryItems = (uncheckedRows ?? []).map((r) => r.name as string).filter(Boolean)
  }

  // ── Load saved meals for context ──
  const { data: saved } = await supabase
    .from('saved_meals')
    .select('title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  context.savedMeals = (saved ?? []).map((item) => item.title as string).filter(Boolean)

  return context
}

// ─── REGENERATE (SERVER ACTION) ─────────────────────────────────────────────────

/**
 * Called by the regenerate/swap API endpoint.
 * Returns a new TonightState excluding previously shown meals.
 */
export function regenerateTonight(
  userId: string,
  plan: Plan,
  excludeIds: string[],
): TonightState {
  return getSwapSuggestion(userId, excludeIds, plan)
}
