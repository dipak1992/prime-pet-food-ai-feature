/**
 * Unified AI Context Builder
 *
 * Single source of truth for loading user context before any AI call.
 * Consolidates data from: household_preferences, budgets, pantry, leftovers,
 * grocery lists, saved meals, learning signals, and weekly plans.
 *
 * Usage:
 *   const ctx = await buildUserContext(supabase, userId)
 *   const prompt = formatContextForPrompt(ctx)
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PreferenceSignal } from '@/lib/learning/types'
import logger from '@/lib/logger'
import {
  formatWeeklyInstructionsForPrompt,
  loadActiveWeeklyInstructions,
  type WeeklyInstruction,
} from '@/lib/copilot/weekly-instructions'
import { loadHouseholdMemory, type HouseholdMemoryItem } from '@/lib/ai/stateful-memory'

// ── Types ─────────────────────────────────────────────────────────────────────

type PantryDetail = {
  name: string
  expiresInDays: number | null
  ageDays: number
  isAging: boolean
}

export interface UserContext {
  userId: string

  /** Household & dietary */
  household: {
    size: number
    dietary: string[]
    dislikes: string[]
    cuisines: string[]
    skillLevel: string
    goals: string[]
    maxCookTimeMin: number | null
    lowEnergyMode: boolean
    preferredProteins: string[]
  }

  /** Budget state */
  budget: {
    weeklyLimit: number | null
    strictMode: boolean
    spentThisWeek: number
    remainingBudget: number | null
  }

  /** Pantry items available (no need to buy) */
  pantry: string[]

  /** Pantry with expiry/age metadata for stateful inventory decisions */
  pantryDetails: PantryDetail[]

  /** Active leftovers with expiry info */
  leftovers: Array<{
    name: string
    ingredients: string[]
    expiresInDays: number
  }>

  /** Grocery list items (already bought or on list) */
  groceryItems: string[]

  /** Recently saved/liked meals for preference context */
  savedMeals: string[]

  /** Learning signals (if available) */
  learning: {
    topCuisines: string[]
    topProteins: string[]
    rejectedCuisines: string[]
    rejectedProteins: string[]
    preferredDifficulty: string | null
    preferredTimeRange: { min: number; max: number } | null
    pickyScore: number
    totalInteractions: number
  } | null

  /** Current week plan context (locked days) */
  weekPlan: {
    lockedDays: Array<{ dayAbbrev: string; recipeName: string }>
  } | null

  /** Temporary current-week Copilot instructions */
  weeklyInstructions: WeeklyInstruction[]

  /** Durable remembered household facts and inventory notes */
  memory: HouseholdMemoryItem[]

  /** Seasonal context */
  season: {
    name: string
    hint: string
  }

  /** Timestamp when context was built */
  builtAt: number
}

export interface ContextOptions {
  /** Include learning signals (requires extra DB query) */
  includeLearning?: boolean
  /** Include week plan context */
  includeWeekPlan?: boolean
  /** Include active current-week instructions */
  includeWeeklyInstructions?: boolean
  /** Week start date for plan context (ISO string) */
  weekStart?: string
  /** Max pantry items to load */
  maxPantryItems?: number
  /** Max leftover items to load */
  maxLeftovers?: number
}

// ── Season Helper ─────────────────────────────────────────────────────────────

function getSeasonContext(): { name: string; hint: string } {
  const month = new Date().getMonth()
  if (month >= 11 || month <= 1) {
    return {
      name: 'winter',
      hint: 'Favor hearty soups, stews, roasts, and warming comfort food.',
    }
  }
  if (month >= 2 && month <= 4) {
    return {
      name: 'spring',
      hint: 'Favor lighter fare, fresh spring vegetables, and bright flavors.',
    }
  }
  if (month >= 5 && month <= 7) {
    return {
      name: 'summer',
      hint: 'Favor grilling, cold dishes, salads with protein, and quick-cook meals.',
    }
  }
  return {
    name: 'fall',
    hint: 'Favor harvest vegetables, warm grain bowls, and transitional comfort food.',
  }
}

// ── Main Builder ──────────────────────────────────────────────────────────────

/**
 * Build complete user context for AI features.
 * Loads all relevant data from Supabase in parallel where possible.
 */
export async function buildUserContext(
  supabase: SupabaseClient,
  userId: string,
  options: ContextOptions = {},
): Promise<UserContext> {
  const {
    includeLearning = true,
    includeWeekPlan = false,
    includeWeeklyInstructions = true,
    weekStart,
    maxPantryItems = 30,
    maxLeftovers = 10,
  } = options

  const startTime = Date.now()

  // ── Parallel data loading ─────────────────────────────────────────────────
  const [
    householdResult,
    budgetResult,
    weekSpendResult,
    pantryResult,
    leftoversResult,
    groceryResult,
    savedResult,
    learningResult,
    weekPlanResult,
    dietaryPrefsResult,
    weeklyInstructionsResult,
    memoryResult,
  ] = await Promise.allSettled([
    // 1. Household preferences
    supabase
      .from('household_preferences')
      .select('household_size, dietary_restrictions, dislikes, disliked_ingredients, cuisines, cuisine_preferences, cooking_time_minutes, weekly_budget, goals, skill_level, low_energy_mode, preferred_proteins')
      .eq('user_id', userId)
      .maybeSingle(),

    // 2. Budget
    supabase
      .from('budgets')
      .select('weekly_limit, strict_mode')
      .eq('user_id', userId)
      .maybeSingle(),

    // 3. Week spend
    supabase
      .from('budget_weekly_spend')
      .select('spent')
      .eq('user_id', userId)
      .gte('week_start', getWeekStartDate())
      .maybeSingle(),

    // 4. Pantry items
    supabase
      .from('pantry_items')
      .select('name, expires_at, created_at, updated_at')
      .eq('user_id', userId)
      .limit(maxPantryItems),

    // 5. Leftovers
    supabase
      .from('leftovers')
      .select('name, main_ingredients, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(maxLeftovers),

    // 6. Grocery list (bought items)
    supabase
      .from('grocery_list_items')
      .select('name')
      .eq('user_id', userId)
      .eq('checked', true)
      .limit(20),

    // 7. Saved meals
    supabase
      .from('saved_meals')
      .select('title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 8. Learning signals (preference_snapshots)
    includeLearning
      ? supabase
          .from('preference_snapshots')
          .select('signal')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),

    // 9. Week plan (locked days)
    includeWeekPlan && weekStart
      ? supabase
          .from('week_plan_days')
          .select('day_index, locked, recipes(name)')
          .eq('plan_id', weekStart)
          .eq('locked', true)
      : Promise.resolve({ data: null }),

    // 10. Fallback dietary preferences (older table)
    supabase
      .from('user_dietary_preferences')
      .select('eating_style, goals, dislikes, cuisine_preferences')
      .eq('user_id', userId)
      .maybeSingle(),

    includeWeeklyInstructions
      ? loadActiveWeeklyInstructions(supabase, userId)
      : Promise.resolve([]),

    loadHouseholdMemory(supabase, userId),
  ])

  // ── Extract results safely ────────────────────────────────────────────────

  const householdRow = extractResult(householdResult)?.data
  const budgetRow = extractResult(budgetResult)?.data
  const weekSpendRow = extractResult(weekSpendResult)?.data
  const pantryRows = extractResult(pantryResult)?.data ?? []
  const leftoverRows = extractResult(leftoversResult)?.data ?? []
  const groceryRows = extractResult(groceryResult)?.data ?? []
  const savedRows = extractResult(savedResult)?.data ?? []
  const learningRow = extractResult(learningResult)?.data
  const weekPlanRows = extractResult(weekPlanResult)?.data ?? []
  const dietaryPrefsRow = extractResult(dietaryPrefsResult)?.data
  const weeklyInstructions = extractResult(weeklyInstructionsResult) ?? []
  const memory = extractResult(memoryResult) ?? []

  // ── Build household context ───────────────────────────────────────────────

  let dietary: string[] = []
  let dislikes: string[] = []
  let cuisines: string[] = []
  let goals: string[] = []
  let skillLevel = 'intermediate'
  let maxCookTimeMin: number | null = null
  let weeklyBudgetFromHousehold: number | null = null
  let lowEnergyMode = false
  let preferredProteins: string[] = []

  if (householdRow) {
    dietary = safeArray(householdRow.dietary_restrictions)
    dislikes = [
      ...safeArray(householdRow.dislikes),
      ...safeArray(householdRow.disliked_ingredients),
    ].filter((v, i, a) => a.indexOf(v) === i) // dedupe
    cuisines = [
      ...safeArray(householdRow.cuisines),
      ...safeArray(householdRow.cuisine_preferences),
    ].filter((v, i, a) => a.indexOf(v) === i)
    goals = safeArray(householdRow.goals)
    skillLevel = (householdRow.skill_level as string) || 'intermediate'
    preferredProteins = safeArray(householdRow.preferred_proteins)
    lowEnergyMode = !!householdRow.low_energy_mode

    if (typeof householdRow.cooking_time_minutes === 'number' && householdRow.cooking_time_minutes > 0) {
      maxCookTimeMin = householdRow.cooking_time_minutes
    }
    if (typeof householdRow.weekly_budget === 'number' && householdRow.weekly_budget > 0) {
      weeklyBudgetFromHousehold = householdRow.weekly_budget
    }
  }

  // Fallback to older dietary preferences table
  if (dietary.length === 0 && dietaryPrefsRow) {
    dietary = [dietaryPrefsRow.eating_style].filter(Boolean) as string[]
    if (goals.length === 0) {
      goals = safeArray(dietaryPrefsRow.goals)
    }
    if (dislikes.length === 0) {
      dislikes = safeArray(dietaryPrefsRow.dislikes)
    }
    if (cuisines.length === 0) {
      cuisines = safeArray(dietaryPrefsRow.cuisine_preferences)
    }
  }

  // ── Build budget context ──────────────────────────────────────────────────

  const weeklyLimit = (budgetRow?.weekly_limit as number | null) ?? weeklyBudgetFromHousehold
  const strictMode = !!(budgetRow?.strict_mode)
  const spentThisWeek = (weekSpendRow?.spent as number) ?? 0
  const remainingBudget = weeklyLimit != null ? Math.max(0, weeklyLimit - spentThisWeek) : null

  // ── Build leftovers context ───────────────────────────────────────────────

  const now = Date.now()
  const leftovers = leftoverRows.map((row: Record<string, unknown>) => {
    const expiresAt = row.expires_at ? new Date(row.expires_at as string).getTime() : now + 7 * 86400000
    const expiresInDays = Math.max(0, Math.ceil((expiresAt - now) / 86400000))
    return {
      name: (row.name as string) || 'Unknown',
      ingredients: safeArray(row.main_ingredients),
      expiresInDays,
    }
  })

  // ── Build learning context ────────────────────────────────────────────────

  let learning: UserContext['learning'] = null
  if (learningRow?.signal) {
    const signal = learningRow.signal as PreferenceSignal
    learning = {
      topCuisines: topKeys(signal.cuisineAffinities, 5),
      topProteins: topKeys(signal.proteinAffinities, 5),
      rejectedCuisines: topKeys(signal.rejectedCuisines, 3),
      rejectedProteins: topKeys(signal.rejectedProteins, 3),
      preferredDifficulty: signal.preferredDifficulty,
      preferredTimeRange: signal.preferredTimeRange,
      pickyScore: signal.pickyScore ?? 0,
      totalInteractions: signal.totalInteractions ?? 0,
    }
  }

  // ── Build week plan context ───────────────────────────────────────────────

  const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let weekPlan: UserContext['weekPlan'] = null
  if (weekPlanRows.length > 0) {
    weekPlan = {
      lockedDays: weekPlanRows
        .filter((r: Record<string, unknown>) => r.locked)
        .map((r: Record<string, unknown>) => ({
          dayAbbrev: DAY_ABBREVS[r.day_index as number] ?? `Day${r.day_index}`,
          recipeName: r.recipes
            ? (r.recipes as { name: string }).name
            : 'Unknown',
        })),
    }
  }

  // ── Assemble final context ────────────────────────────────────────────────

  const pantryDetails: PantryDetail[] = pantryRows
    .map((row: Record<string, unknown>) => buildPantryDetail(row, now))
    .filter((item: PantryDetail | null): item is PantryDetail => item !== null)

  const ctx: UserContext = {
    userId,
    household: {
      size: (householdRow?.household_size as number) ?? 2,
      dietary,
      dislikes,
      cuisines,
      skillLevel,
      goals,
      maxCookTimeMin,
      lowEnergyMode,
      preferredProteins,
    },
    budget: {
      weeklyLimit,
      strictMode,
      spentThisWeek,
      remainingBudget,
    },
    pantry: pantryDetails.map((item: PantryDetail) => item.name),
    pantryDetails,
    leftovers,
    groceryItems: groceryRows.map((r: Record<string, unknown>) => r.name as string).filter(Boolean),
    savedMeals: savedRows.map((r: Record<string, unknown>) => r.title as string).filter(Boolean),
    learning,
    weekPlan,
    weeklyInstructions,
    memory,
    season: getSeasonContext(),
    builtAt: Date.now(),
  }

  logger.info('[ai/context] Built user context', {
    userId,
    loadTimeMs: Date.now() - startTime,
    pantryCount: ctx.pantry.length,
    leftoverCount: ctx.leftovers.length,
    hasLearning: !!ctx.learning,
    hasWeekPlan: !!ctx.weekPlan,
  })

  return ctx
}

// ── Prompt Formatter ──────────────────────────────────────────────────────────

/**
 * Format user context into a structured text block for AI prompts.
 * Can be injected into any system or user prompt.
 */
export function formatContextForPrompt(ctx: UserContext): string {
  const lines: string[] = []

  // Household
  lines.push('## USER CONTEXT')
  lines.push('')
  lines.push(`Household size: ${ctx.household.size}`)
  if (ctx.household.dietary.length > 0) {
    lines.push(`Dietary restrictions: ${ctx.household.dietary.join(', ')}`)
  }
  if (ctx.household.dislikes.length > 0) {
    lines.push(`Dislikes/avoid: ${ctx.household.dislikes.join(', ')}`)
  }
  if (ctx.household.cuisines.length > 0) {
    lines.push(`Preferred cuisines: ${ctx.household.cuisines.join(', ')}`)
  }
  if (ctx.weeklyInstructions.length > 0) {
    lines.push('')
    lines.push('Active weekly instructions:')
    lines.push(formatWeeklyInstructionsForPrompt(ctx.weeklyInstructions))
  }
  if (ctx.household.preferredProteins.length > 0) {
    lines.push(`Preferred proteins: ${ctx.household.preferredProteins.join(', ')}`)
  }
  lines.push(`Skill level: ${ctx.household.skillLevel}`)
  if (ctx.household.maxCookTimeMin) {
    lines.push(`Max cook time: ${ctx.household.maxCookTimeMin} minutes`)
  }
  if (ctx.household.lowEnergyMode) {
    lines.push(`⚡ LOW ENERGY MODE: Keep all meals under 25 min, easy difficulty, minimal steps`)
  }

  // Budget
  lines.push('')
  if (ctx.budget.weeklyLimit != null) {
    lines.push(`Budget: $${ctx.budget.weeklyLimit}/week (spent: $${ctx.budget.spentThisWeek.toFixed(0)}, remaining: $${ctx.budget.remainingBudget?.toFixed(0) ?? '?'})`)
    if (ctx.budget.strictMode) {
      lines.push(`⚠️ STRICT BUDGET MODE — do NOT exceed remaining budget`)
    }
  } else {
    lines.push('Budget: No limit set (aim for average ~$8-12/meal for family of 4)')
  }

  // Pantry
  if (ctx.pantry.length > 0) {
    lines.push('')
    lines.push(`Pantry staples (no need to buy): ${ctx.pantry.join(', ')}`)
    const aging = ctx.pantryDetails
      .filter((item) => item.isAging || (item.expiresInDays != null && item.expiresInDays <= 3))
      .slice(0, 8)
    if (aging.length > 0) {
      lines.push(`Use-soon pantry: ${aging.map((item) => item.expiresInDays == null ? item.name : `${item.name} (${item.expiresInDays}d)`).join(', ')}`)
    }
  }

  // Leftovers
  if (ctx.leftovers.length > 0) {
    lines.push('')
    lines.push('Active leftovers (use before they expire):')
    for (const l of ctx.leftovers.sort((a, b) => a.expiresInDays - b.expiresInDays)) {
      const urgency = l.expiresInDays <= 2 ? ' ⚠️ USE SOON' : ''
      lines.push(`  - ${l.name} (${l.ingredients.join(', ')}) — expires in ${l.expiresInDays}d${urgency}`)
    }
  }

  // Grocery items
  if (ctx.groceryItems.length > 0) {
    lines.push('')
    lines.push(`Recently bought: ${ctx.groceryItems.join(', ')}`)
  }

  // Learning signals
  if (ctx.learning && ctx.learning.totalInteractions >= 5) {
    lines.push('')
    lines.push('Learned preferences (from past interactions):')
    if (ctx.learning.topCuisines.length > 0) {
      lines.push(`  Favorite cuisines: ${ctx.learning.topCuisines.join(', ')}`)
    }
    if (ctx.learning.topProteins.length > 0) {
      lines.push(`  Favorite proteins: ${ctx.learning.topProteins.join(', ')}`)
    }
    if (ctx.learning.rejectedCuisines.length > 0) {
      lines.push(`  Disliked cuisines: ${ctx.learning.rejectedCuisines.join(', ')}`)
    }
    if (ctx.learning.rejectedProteins.length > 0) {
      lines.push(`  Disliked proteins: ${ctx.learning.rejectedProteins.join(', ')}`)
    }
    if (ctx.learning.preferredDifficulty) {
      lines.push(`  Preferred difficulty: ${ctx.learning.preferredDifficulty}`)
    }
    if (ctx.learning.preferredTimeRange) {
      lines.push(`  Preferred cook time: ${ctx.learning.preferredTimeRange.min}-${ctx.learning.preferredTimeRange.max} min`)
    }
    if (ctx.learning.pickyScore > 0.5) {
      lines.push(`  ⚠️ Picky household — stick to familiar flavors and safe choices`)
    }
  }

  // Saved meals
  if (ctx.savedMeals.length > 0) {
    lines.push('')
    lines.push(`Recently saved meals (they liked these): ${ctx.savedMeals.join(', ')}`)
  }

  const durableMemory = ctx.memory.filter((item) => !item.memoryType.endsWith('_inventory')).slice(0, 8)
  if (durableMemory.length > 0) {
    lines.push('')
    lines.push(`Durable household memory: ${durableMemory.map((item) => `${item.memoryType}: ${item.subject}`).join('; ')}`)
  }

  const inventoryMemory = ctx.memory.filter((item) => item.memoryType.endsWith('_inventory')).slice(0, 8)
  if (inventoryMemory.length > 0) {
    lines.push(`Remembered inventory notes: ${inventoryMemory.map((item) => item.subject).join('; ')}`)
  }

  // Season
  lines.push('')
  lines.push(`Season: ${ctx.season.name} — ${ctx.season.hint}`)

  // Week plan
  if (ctx.weekPlan && ctx.weekPlan.lockedDays.length > 0) {
    lines.push('')
    lines.push('Already planned (locked):')
    for (const d of ctx.weekPlan.lockedDays) {
      lines.push(`  - ${d.dayAbbrev}: ${d.recipeName}`)
    }
  }

  return lines.join('\n')
}

/**
 * Format a compact version of context for token-constrained prompts.
 * ~50% fewer tokens than full format.
 */
export function formatCompactContext(ctx: UserContext): string {
  const parts: string[] = []

  parts.push(`HH: ${ctx.household.size}ppl, ${ctx.household.skillLevel}`)
  if (ctx.household.dietary.length) parts.push(`Diet: ${ctx.household.dietary.join(',')}`)
  if (ctx.household.dislikes.length) parts.push(`Avoid: ${ctx.household.dislikes.join(',')}`)
  if (ctx.household.cuisines.length) parts.push(`Cuisines: ${ctx.household.cuisines.join(',')}`)
  if (ctx.weeklyInstructions.length) parts.push(`This week: ${ctx.weeklyInstructions.map((item) => item.label).join(',')}`)
  if (ctx.household.lowEnergyMode) parts.push('LOW-ENERGY')
  if (ctx.budget.weeklyLimit) parts.push(`Budget: $${ctx.budget.remainingBudget?.toFixed(0) ?? '?'} left`)
  if (ctx.pantry.length) parts.push(`Pantry: ${ctx.pantry.slice(0, 10).join(',')}`)
  const agingPantry = ctx.pantryDetails.filter((item) => item.isAging || (item.expiresInDays != null && item.expiresInDays <= 3)).slice(0, 6)
  if (agingPantry.length) parts.push(`Use soon: ${agingPantry.map((item) => item.name).join(',')}`)
  if (ctx.leftovers.length) {
    const urgent = ctx.leftovers.filter(l => l.expiresInDays <= 2)
    if (urgent.length) parts.push(`URGENT leftovers: ${urgent.map(l => l.name).join(',')}`)
  }
  if (ctx.learning?.topCuisines.length) parts.push(`Likes: ${ctx.learning.topCuisines.join(',')}`)
  const rememberedInventory = ctx.memory.filter((item) => item.memoryType.endsWith('_inventory')).slice(0, 5)
  if (rememberedInventory.length) parts.push(`Remembered inventory: ${rememberedInventory.map((item) => item.subject).join(',')}`)
  const durableMemory = ctx.memory.filter((item) => !item.memoryType.endsWith('_inventory')).slice(0, 5)
  if (durableMemory.length) parts.push(`Memory: ${durableMemory.map((item) => `${item.memoryType}:${item.subject}`).join(',')}`)
  parts.push(`Season: ${ctx.season.name}`)

  return parts.join(' | ')
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function getWeekStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter(Boolean) as string[]
  return []
}

function buildPantryDetail(row: Record<string, unknown>, nowMs: number): PantryDetail | null {
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  if (!name) return null

  const createdAt = typeof row.created_at === 'string'
    ? new Date(row.created_at).getTime()
    : nowMs
  const ageDays = Math.max(0, Math.floor((nowMs - createdAt) / 86400000))
  const expiresAt = typeof row.expires_at === 'string' && row.expires_at
    ? new Date(row.expires_at).getTime()
    : null
  const expiresInDays = expiresAt == null
    ? null
    : Math.max(0, Math.ceil((expiresAt - nowMs) / 86400000))

  return {
    name,
    expiresInDays,
    ageDays,
    isAging: ageDays >= 5,
  }
}

function topKeys(record: Record<string, number> | undefined | null, n: number): string[] {
  if (!record) return []
  return Object.entries(record)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResult(result: PromiseSettledResult<any>): any {
  if (result.status === 'fulfilled') return result.value
  logger.warn('[ai/context] Query failed', { reason: result.reason?.message ?? String(result.reason) })
  return { data: null }
}
