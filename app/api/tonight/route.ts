import { NextRequest, NextResponse } from 'next/server'
import { getRandomTonightMeal, TONIGHT_MEALS } from '@/lib/tonight-meals'
import { createClient } from '@/lib/supabase/server'
import { getUserDietaryPrefs } from '@/lib/meal-engine/preferences'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'
import type { TonightMeal } from '@/lib/tonight-meals'

// Eating styles that indicate no meat — used to filter pre-built static meals by tags
const VEGETARIAN_STYLES = new Set(['vegetarian', 'vegan', 'pescatarian'])

function pickPreferenceMeal(
  mode: 'quick' | 'tired' | 'pantry',
  avoidFoods: string[],
  allergies: string[],
  eatingStyle: string,
): TonightMeal {
  const pool = TONIGHT_MEALS[mode]
  const lowerExcludes = [...avoidFoods, ...allergies].map((f) => f.toLowerCase())
  const needsVegetarian = VEGETARIAN_STYLES.has(eatingStyle)

  const filtered = pool.filter((meal) => {
    const mealText = [meal.title, ...meal.tags, ...meal.ingredients.map((i) => i.name)]
      .join(' ')
      .toLowerCase()
    if (lowerExcludes.some((excl) => mealText.includes(excl))) return false
    if (needsVegetarian && !meal.tags.includes('vegetarian') && !meal.tags.includes('vegan')) return false
    return true
  })

  const candidates = filtered.length > 0 ? filtered : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function GET(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const mode = req.nextUrl.searchParams.get('mode') as 'quick' | 'tired' | 'pantry' | null

  if (!mode || !['quick', 'tired', 'pantry'].includes(mode)) {
    return NextResponse.json(
      { error: 'Invalid mode. Use: quick, tired, or pantry' },
      { status: 400 }
    )
  }

  // Optional auth — apply prefs if signed in
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const prefs = await getUserDietaryPrefs(user.id)
      if (prefs && (prefs.allergies.length > 0 || prefs.avoid_foods.length > 0 || prefs.eating_style !== 'omnivore')) {
        const meal = pickPreferenceMeal(mode, prefs.avoid_foods, prefs.allergies, prefs.eating_style)
        return NextResponse.json({ meal })
      }
    }
  } catch {
    // Fall through to default selection
  }

  const meal = getRandomTonightMeal(mode)
  return NextResponse.json({ meal })
}
