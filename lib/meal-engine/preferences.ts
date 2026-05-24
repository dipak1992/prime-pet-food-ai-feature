// ============================================================
// lib/meal-engine/preferences.ts
// Server-only barrel: re-exports all client-safe types and
// utilities from preferences-types.ts, plus the server-side
// fetch helper that requires next/headers via createClient.
// API routes import from here; client components must import
// from @/lib/meal-engine/preferences-types instead.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { UserDietaryPreferences } from './preferences-types'

export type {
  EatingStyle,
  AllergyType,
  AvoidFood,
  FavoriteProtein,
  CuisineType,
  DietaryGoal,
  KidsSpiceTolerance,
  UserDietaryPreferences,
} from './preferences-types'
export {
  DEFAULT_PREFS,
  buildPreferenceContext,
  buildExplanationHint,
  applyPrefsToEngineRequest,
} from './preferences-types'

// ── Server fetch ──────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's dietary preferences from Supabase.
 * Returns null if unauthenticated or on error.
 */
export async function getUserDietaryPrefs(
  userId: string,
): Promise<UserDietaryPreferences | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_dietary_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as UserDietaryPreferences
}

