import type { SmartMealResult } from '@/lib/engine/types'
import type { WeeklyPlan } from '@/lib/planner/types'
import type { MealPillar } from '@/lib/recipes/canonical'

export interface SavedMeal {
  id: string
  user_id: string
  slug: string
  title: string
  description: string | null
  cuisine_type: string | null
  meal_data: SmartMealResult
  pillar_source?: MealPillar | null
  is_public: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/** Lightweight row — no meal_data. Used for list views. */
export interface SavedMealSummary {
  id: string
  slug: string
  title: string
  description: string | null
  cuisine_type: string | null
  is_public: boolean
  created_at: string
  published_at: string | null
  pillar_source?: MealPillar | null
}

export interface PublishedPlan {
  id: string
  user_id: string
  slug: string
  title: string
  description: string | null
  plan_data: WeeklyPlan
  is_public: boolean
  published_at: string
  created_at: string
}

/** Generates a URL-safe slug with a random suffix for uniqueness. */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
}
