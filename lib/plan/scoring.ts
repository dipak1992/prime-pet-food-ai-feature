import type { Recipe } from '@/lib/dashboard/types'

// ─── Scoring Context ──────────────────────────────────────────────────────────

export type ScoringContext = {
  activeLeftoverIngredients: string[]  // ingredient names from active leftovers
  budgetPerMeal: number | null
  household: {
    dislikes: string[]
    dietary: string[]
    size: number
  }
  recentlyPlannedProteins: string[]    // last 3-4 days
  recentCuisines: string[]             // cuisines from locked/planned days
  pantryItems: string[]                // items user already has
  season: 'winter' | 'spring' | 'summer' | 'fall'
  dayType: 'weekday' | 'friday' | 'weekend'
  leftoverPriority: 'high' | 'normal' | 'low'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEFTOVER_BOOST = 0.30
const LEFTOVER_URGENT_BOOST = 0.15  // extra if expiring within 2 days
const PANTRY_OVERLAP_BOOST = 0.05   // per matched pantry item (max 0.20)
const OVER_BUDGET_PENALTY = 0.35
const UNDER_BUDGET_BONUS = 0.10
const REPETITION_PENALTY = 0.25
const CUISINE_REPETITION_PENALTY = 0.15
const DISLIKE_PENALTY = 0.8
const DIETARY_VIOLATION_PENALTY = 1.0
const SEASONAL_MATCH_BONUS = 0.10
const PREP_TIME_FIT_BONUS = 0.10
const PREP_TIME_PENALTY = 0.15
const VARIETY_BONUS = 0.05

// ─── Seasonal tags ────────────────────────────────────────────────────────────

const SEASONAL_TAGS: Record<string, string[]> = {
  winter: ['soup', 'stew', 'roast', 'comfort', 'hearty', 'braised', 'chili', 'casserole'],
  spring: ['fresh', 'light', 'salad', 'spring', 'herb', 'asparagus', 'pea'],
  summer: ['grill', 'grilled', 'cold', 'salad', 'bbq', 'light', 'no-cook', 'quick'],
  fall: ['harvest', 'squash', 'pumpkin', 'apple', 'warm', 'bowl', 'root vegetable'],
}

// ─── Prep time expectations by day type ───────────────────────────────────────

const PREP_TIME_CAPS: Record<string, number> = {
  weekday: 30,
  friday: 45,
  weekend: 75,
}

// ─── Score a recipe ───────────────────────────────────────────────────────────

export function scoreRecipe(
  recipe: Recipe & { ingredients?: string[]; cuisineType?: string },
  ctx: ScoringContext,
): {
  score: number
  reasons: string[]
  usesLeftover: boolean
  withinBudget: boolean
  signals: ScoreSignals
} {
  const reasons: string[] = []
  let score = 0.5

  const lowerText = [
    recipe.name.toLowerCase(),
    ...(recipe.tags ?? []).map((t) => t.toLowerCase()),
    ...(recipe.ingredients ?? []).map((i) => i.toLowerCase()),
  ].join(' ')

  const signals: ScoreSignals = {
    leftoverMatch: 0,
    budgetFit: 0,
    varietyScore: 0,
    seasonalFit: 0,
    prepTimeFit: 0,
    pantryOverlap: 0,
    cuisineDiversity: 0,
  }

  // ── Dietary violation (hard filter) ─────────────────────────────────────────
  for (const restriction of ctx.household.dietary) {
    const lower = restriction.toLowerCase()
    if (lower === 'vegetarian' && detectProtein(lowerText) && !['tofu', 'tempeh', 'lentil', 'chickpea', 'bean'].some(p => lowerText.includes(p))) {
      if (['chicken', 'beef', 'pork', 'turkey', 'lamb', 'salmon', 'tuna', 'shrimp', 'fish'].some(p => lowerText.includes(p))) {
        score -= DIETARY_VIOLATION_PENALTY
        reasons.push(`Contains meat — violates ${restriction}`)
      }
    }
  }

  // ── Leftover boost ──────────────────────────────────────────────────────────
  const leftoverMultiplier = ctx.leftoverPriority === 'high' ? 1.5 : ctx.leftoverPriority === 'low' ? 0.5 : 1.0
  const matchedLeftover = ctx.activeLeftoverIngredients.find((ing) =>
    lowerText.includes(ing.toLowerCase()),
  )
  const usesLeftover = !!matchedLeftover
  if (usesLeftover) {
    const boost = LEFTOVER_BOOST * leftoverMultiplier
    score += boost
    signals.leftoverMatch = boost
    reasons.push(`Uses your ${matchedLeftover}`)
  }

  // ── Pantry overlap boost ────────────────────────────────────────────────────
  const ingredients = recipe.ingredients ?? []
  let pantryMatches = 0
  for (const pantryItem of ctx.pantryItems) {
    const lower = pantryItem.toLowerCase()
    if (ingredients.some((ing) => ing.toLowerCase().includes(lower) || lower.includes(ing.toLowerCase()))) {
      pantryMatches++
    }
  }
  const pantryBoost = Math.min(0.20, pantryMatches * PANTRY_OVERLAP_BOOST)
  if (pantryBoost > 0) {
    score += pantryBoost
    signals.pantryOverlap = pantryBoost
    reasons.push(`${pantryMatches} pantry item${pantryMatches > 1 ? 's' : ''} already owned`)
  }

  // ── Budget fit ──────────────────────────────────────────────────────────────
  const withinBudget =
    ctx.budgetPerMeal == null || recipe.costTotal <= ctx.budgetPerMeal * 1.05
  if (ctx.budgetPerMeal != null) {
    if (recipe.costTotal <= ctx.budgetPerMeal * 0.85) {
      score += UNDER_BUDGET_BONUS
      signals.budgetFit = UNDER_BUDGET_BONUS
      reasons.push('Under budget')
    } else if (!withinBudget) {
      score -= OVER_BUDGET_PENALTY
      signals.budgetFit = -OVER_BUDGET_PENALTY
      reasons.push('Over weekly per-meal budget')
    }
  }

  // ── Protein variety (repetition penalty) ────────────────────────────────────
  const recipeProtein = detectProtein(lowerText)
  if (recipeProtein && ctx.recentlyPlannedProteins.includes(recipeProtein)) {
    score -= REPETITION_PENALTY
    signals.varietyScore -= REPETITION_PENALTY
    reasons.push(`Already had ${recipeProtein} recently`)
  } else if (recipeProtein && !ctx.recentlyPlannedProteins.includes(recipeProtein)) {
    score += VARIETY_BONUS
    signals.varietyScore += VARIETY_BONUS
  }

  // ── Cuisine diversity ───────────────────────────────────────────────────────
  const recipeCuisine = recipe.cuisineType ?? detectCuisine(lowerText)
  if (recipeCuisine && ctx.recentCuisines.includes(recipeCuisine)) {
    score -= CUISINE_REPETITION_PENALTY
    signals.cuisineDiversity = -CUISINE_REPETITION_PENALTY
    reasons.push(`Same cuisine (${recipeCuisine}) as a recent day`)
  } else if (recipeCuisine && ctx.recentCuisines.length > 0) {
    score += VARIETY_BONUS
    signals.cuisineDiversity = VARIETY_BONUS
  }

  // ── Seasonal fit ────────────────────────────────────────────────────────────
  const seasonalTags = SEASONAL_TAGS[ctx.season] ?? []
  const hasSeasonalMatch = seasonalTags.some((tag) => lowerText.includes(tag))
  if (hasSeasonalMatch) {
    score += SEASONAL_MATCH_BONUS
    signals.seasonalFit = SEASONAL_MATCH_BONUS
    reasons.push(`Seasonal fit (${ctx.season})`)
  }

  // ── Prep time fit ───────────────────────────────────────────────────────────
  const maxTime = PREP_TIME_CAPS[ctx.dayType]
  if (recipe.cookTimeMin <= maxTime) {
    score += PREP_TIME_FIT_BONUS
    signals.prepTimeFit = PREP_TIME_FIT_BONUS
  } else if (ctx.dayType === 'weekday' && recipe.cookTimeMin > maxTime + 15) {
    score -= PREP_TIME_PENALTY
    signals.prepTimeFit = -PREP_TIME_PENALTY
    reasons.push('Too long for a weekday')
  }

  // ── Dislikes ────────────────────────────────────────────────────────────────
  for (const dislike of ctx.household.dislikes) {
    if (lowerText.includes(dislike.toLowerCase())) {
      score -= DISLIKE_PENALTY
      reasons.push(`Contains ${dislike}`)
      break
    }
  }

  // ── Household size fit ──────────────────────────────────────────────────────
  if (recipe.servings >= ctx.household.size) {
    score += 0.05
  }

  return {
    score: Math.max(0, Math.min(2.0, score)),
    reasons,
    usesLeftover,
    withinBudget,
    signals,
  }
}

// ─── Score Signals (for UI display) ──────────────────────────────────────────

export type ScoreSignals = {
  leftoverMatch: number
  budgetFit: number
  varietyScore: number
  seasonalFit: number
  prepTimeFit: number
  pantryOverlap: number
  cuisineDiversity: number
}

// ─── Protein detection ────────────────────────────────────────────────────────

const PROTEINS = [
  'chicken', 'beef', 'pork', 'turkey', 'lamb',
  'salmon', 'tuna', 'shrimp', 'fish', 'cod', 'tilapia',
  'tofu', 'tempeh', 'lentil', 'chickpea', 'bean',
  'sausage', 'duck', 'venison',
]

export function detectProtein(text: string): string | null {
  for (const p of PROTEINS) {
    if (text.includes(p)) return p
  }
  return null
}

// ─── Cuisine detection ────────────────────────────────────────────────────────

const CUISINE_SIGNALS: Record<string, string[]> = {
  italian: ['pasta', 'risotto', 'parmesan', 'marinara', 'pesto', 'italian', 'lasagna', 'gnocchi'],
  mexican: ['taco', 'burrito', 'enchilada', 'salsa', 'mexican', 'quesadilla', 'fajita', 'chipotle'],
  asian: ['stir-fry', 'soy sauce', 'teriyaki', 'asian', 'wok', 'sesame', 'ginger-garlic'],
  indian: ['curry', 'masala', 'tikka', 'naan', 'indian', 'turmeric', 'dal', 'biryani'],
  mediterranean: ['mediterranean', 'greek', 'hummus', 'feta', 'olive', 'tzatziki', 'falafel'],
  american: ['burger', 'bbq', 'mac and cheese', 'american', 'meatloaf', 'pot roast'],
  japanese: ['ramen', 'sushi', 'teriyaki', 'miso', 'japanese', 'udon', 'tempura'],
  thai: ['thai', 'pad thai', 'coconut curry', 'lemongrass', 'basil chicken'],
  korean: ['korean', 'bibimbap', 'kimchi', 'bulgogi', 'gochujang'],
}

export function detectCuisine(text: string): string | null {
  for (const [cuisine, signals] of Object.entries(CUISINE_SIGNALS)) {
    if (signals.some((s) => text.includes(s))) return cuisine
  }
  return null
}

// ─── Get recent proteins from plan days ──────────────────────────────────────

export function getRecentProteins(
  days: Array<{
    recipe: { name: string; ingredients?: string[] } | null
    status: string
    dayIndex: number
  }>,
  currentDayIndex: number,
  lookback = 3,
): string[] {
  const proteins: string[] = []
  for (const d of days) {
    if (!d.recipe) continue
    if (d.dayIndex >= currentDayIndex) continue
    if (currentDayIndex - d.dayIndex > lookback) continue
    const text = [d.recipe.name, ...(d.recipe.ingredients ?? [])].join(' ').toLowerCase()
    const p = detectProtein(text)
    if (p) proteins.push(p)
  }
  return proteins
}

// ─── Get recent cuisines from plan days ──────────────────────────────────────

export function getRecentCuisines(
  days: Array<{
    recipe: { name: string; tags?: string[] } | null
    dayIndex: number
  }>,
  currentDayIndex: number,
  lookback = 2,
): string[] {
  const cuisines: string[] = []
  for (const d of days) {
    if (!d.recipe) continue
    if (d.dayIndex >= currentDayIndex) continue
    if (currentDayIndex - d.dayIndex > lookback) continue
    const text = [d.recipe.name, ...(d.recipe.tags ?? [])].join(' ').toLowerCase()
    const c = detectCuisine(text)
    if (c) cuisines.push(c)
  }
  return cuisines
}

// ─── Get day type ─────────────────────────────────────────────────────────────

export function getDayType(dayIndex: number): 'weekday' | 'friday' | 'weekend' {
  if (dayIndex === 4) return 'friday' // 0=Mon, 4=Fri
  if (dayIndex >= 5) return 'weekend' // 5=Sat, 6=Sun
  return 'weekday'
}

// ─── Get current season ───────────────────────────────────────────────────────

export function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'fall' {
  const month = new Date().getMonth()
  if (month >= 11 || month <= 1) return 'winter'
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  return 'fall'
}
