import type { AutopilotOptions } from './types'

// ─── System prompt ────────────────────────────────────────────────────────────

export const AUTOPILOT_SYSTEM_PROMPT = `
You are MealEase's AI meal planner. You're warm, practical, and never preachy.
You plan one week of dinners for a household.

Hard rules:
1. Never repeat the same protein two days in a row.
2. Never repeat the same main dish twice in a week.
3. Respect dietary restrictions absolutely (allergies, vegetarian, vegan, etc.).
4. Stay within the weekly budget (soft unless strict_mode=true).
5. Prefer recipes that use active leftovers or about-to-expire pantry items FIRST.
6. Respect skill level — don't suggest hard recipes to beginners.
7. Match the household size for servings.
8. Never suggest a disliked ingredient or food.
9. IMPORTANT: Each suggested meal MUST primarily use ingredients the user has available in their pantry or grocery list. Do not introduce proteins or specialty ingredients not mentioned in the user's pantry, grocery list, or preferences. If the user has chicken and tofu, do not suggest salmon or lamb.

Prep-time rules:
- Monday–Thursday: quick meals (≤30 min cook time, easy–moderate difficulty).
- Friday: moderate (up to 45 min, can be slightly more involved).
- Saturday–Sunday: can be more involved (up to 60+ min, any difficulty).
- If low_energy_mode is true, cap ALL days at 25 min and easy difficulty.

Variety & rotation:
- Spread cuisines across the week (don't repeat the same cuisine 2 days in a row).
- Include at least 2 different cuisine families across the week.
- For omnivore households: include at least 1 vegetarian or fish dinner.
- Rotate protein sources: aim for 3+ unique proteins across the week.

Seasonal awareness:
- In winter (Dec–Feb): favor hearty soups, stews, roasts, comfort food.
- In spring (Mar–May): lighter fare, fresh vegetables, salads with protein.
- In summer (Jun–Aug): grilling, cold dishes, quick-cook to avoid heating kitchen.
- In fall (Sep–Nov): harvest vegetables, warm bowls, transitional comfort.

Leftover integration:
- If leftovers are expiring within 1–2 days, PRIORITIZE using them.
- Suggest creative repurposing (e.g., leftover roast chicken → chicken tacos).
- Note which leftover is being used in the "reason" field.

Budget intelligence:
- If budget is tight (remaining < $5/day/person), suggest pantry-heavy meals.
- If strict_mode, never exceed the per-day budget cap.
- Include estimated cost that accounts for pantry items already owned.

Output format: strict JSON matching the schema provided. No prose outside JSON.
`.trim()

// ─── Seasonal context ─────────────────────────────────────────────────────────

function getSeasonContext(): { season: string; seasonHint: string } {
  const month = new Date().getMonth() // 0-indexed
  if (month >= 11 || month <= 1) {
    return {
      season: 'winter',
      seasonHint: 'Favor hearty soups, stews, roasts, and warming comfort food.',
    }
  }
  if (month >= 2 && month <= 4) {
    return {
      season: 'spring',
      seasonHint: 'Favor lighter fare, fresh spring vegetables, and bright flavors.',
    }
  }
  if (month >= 5 && month <= 7) {
    return {
      season: 'summer',
      seasonHint: 'Favor grilling, cold dishes, salads with protein, and quick-cook meals.',
    }
  }
  return {
    season: 'fall',
    seasonHint: 'Favor harvest vegetables, warm grain bowls, and transitional comfort food.',
  }
}

// ─── Cuisine rotation helper ──────────────────────────────────────────────────

function getCuisineRotationHint(
  lockedDays: Array<{ dayAbbrev: string; recipeName: string }>,
  cuisinePreferences?: string[],
): string {
  const lines: string[] = []

  if (cuisinePreferences && cuisinePreferences.length > 0) {
    lines.push(`Preferred cuisines (weight these higher): ${cuisinePreferences.join(', ')}`)
  }

  if (lockedDays.length > 0) {
    lines.push(
      'Already locked meals (avoid repeating their cuisine type on adjacent days):',
      ...lockedDays.map((d) => `  - ${d.dayAbbrev}: ${d.recipeName}`),
    )
  }

  lines.push(
    'Aim for variety: e.g., Italian → Mexican → Asian → American → Mediterranean across the week.',
  )

  return lines.join('\n')
}

// ─── Build user prompt ────────────────────────────────────────────────────────

export function buildAutopilotPrompt(ctx: {
  household: {
    size: number
    dietary: string[]
    dislikes: string[]
    skillLevel: string
  }
  budget: {
    weeklyLimit: number | null
    strictMode: boolean
    spentThisWeek: number
  }
  activeLeftovers: Array<{
    name: string
    ingredients: string[]
    expiresInDays: number
  }>
  pantryItems: string[]
  lockedDays: Array<{
    dayAbbrev: string
    recipeName: string
  }>
  daysToFill: Array<{
    dayIndex: number
    dayAbbrev: string
    date: string
  }>
  cuisinePreferences?: string[]
  mealComplexity?: 'quick' | 'balanced' | 'adventurous'
  leftoverPriority?: 'high' | 'normal' | 'low'
  lowEnergyMode?: boolean
  options: AutopilotOptions
}): string {
  const {
    household,
    budget,
    activeLeftovers,
    pantryItems,
    lockedDays,
    daysToFill,
    cuisinePreferences,
    mealComplexity = 'balanced',
    leftoverPriority = 'normal',
    lowEnergyMode = false,
    options,
  } = ctx

  const { season, seasonHint } = getSeasonContext()
  const cuisineHint = getCuisineRotationHint(lockedDays, cuisinePreferences)

  const remainingBudget =
    budget.weeklyLimit != null
      ? Math.max(0, budget.weeklyLimit - budget.spentThisWeek)
      : null
  const budgetPerDay =
    remainingBudget != null && daysToFill.length > 0
      ? remainingBudget / daysToFill.length
      : null

  const complexityHint = {
    quick: 'User prefers QUICK meals — cap cook time at 25 min, easy difficulty only.',
    balanced: 'User prefers a balanced mix — follow the weekday/weekend prep-time rules.',
    adventurous: 'User enjoys cooking — feel free to suggest more involved recipes on any day.',
  }[mealComplexity]

  const leftoverHint = {
    high: 'STRONGLY prioritize using leftovers — even if it means slightly less variety.',
    normal: 'Use leftovers when they fit naturally into the plan.',
    low: 'Only use leftovers if they happen to match well; variety is more important.',
  }[leftoverPriority]

  return `
Household:
- Size: ${household.size} ${household.size === 1 ? 'person' : 'people'}
- Dietary: ${household.dietary.length ? household.dietary.join(', ') : 'none (omnivore)'}
- Dislikes / avoid: ${household.dislikes.length ? household.dislikes.join(', ') : 'none'}
- Skill level: ${household.skillLevel}
- Low energy mode: ${lowEnergyMode ? 'YES — keep everything under 25 min and easy' : 'no'}

Meal complexity preference: ${complexityHint}

Season: ${season}
${seasonHint}

Cuisine rotation:
${cuisineHint}

Budget:
${
  budget.weeklyLimit != null
    ? `- Weekly limit: $${budget.weeklyLimit}
- Already spent: $${budget.spentThisWeek.toFixed(0)}
- Remaining: $${remainingBudget!.toFixed(0)} across ${daysToFill.length} days (~$${budgetPerDay!.toFixed(0)}/day)
- ${budget.strictMode ? 'STRICT MODE: do NOT exceed the per-day budget.' : 'Soft guardrail — try to stay close.'}`
    : '- No weekly budget set; aim for average household value (~$8–12/meal for a family of 4).'
}

Active leftovers (${leftoverHint}):
${
  activeLeftovers.length === 0
    ? '- (none)'
    : activeLeftovers
        .sort((a, b) => a.expiresInDays - b.expiresInDays)
        .map(
          (l) =>
            `- ${l.name} (contains: ${l.ingredients.join(', ')}) — expires in ${l.expiresInDays} day${l.expiresInDays === 1 ? '' : 's'}${l.expiresInDays <= 2 ? ' ⚠️ USE SOON' : ''}`,
        )
        .join('\n')
}

Pantry staples available (no need to buy these):
${pantryItems.length === 0 ? '- (none recorded)' : pantryItems.slice(0, 30).map((p) => `- ${p}`).join('\n')}

Already locked (do not replace):
${lockedDays.length === 0 ? '- (none)' : lockedDays.map((d) => `- ${d.dayAbbrev}: ${d.recipeName}`).join('\n')}

Generate dinners for these days (${options.overwriteEmptyOnly ? 'empty slots only' : 'all non-locked slots'}):
${daysToFill.map((d) => `- ${d.dayAbbrev} (${d.date})`).join('\n')}

Return JSON:
{
  "days": [
    {
      "dayIndex": 0,
      "dayAbbrev": "Mon",
      "recipe": {
        "id": "slug-like-id",
        "name": "Recipe Name",
        "image": null,
        "cookTimeMin": 30,
        "difficulty": "easy",
        "servings": ${household.size},
        "costTotal": 14,
        "costPerServing": 3.5,
        "tags": ["cuisine-type", "protein-type", "quick", ...],
        "ingredients": ["ingredient1", "ingredient2", ...]
      },
      "reason": "one sentence explaining the pick (mention leftover/budget/variety)",
      "usesLeftoverId": null,
      "cuisineType": "italian"
    }
  ],
  "weekSummary": {
    "cuisineSpread": ["italian", "mexican", "asian", ...],
    "proteinVariety": ["chicken", "tofu", "salmon", ...],
    "avgCookTime": 28,
    "leftoverMealsCount": 1
  }
}
`.trim()
}
