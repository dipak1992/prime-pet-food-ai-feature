/**
 * Tonight Intelligence — Dashboard Integration Layer
 * 
 * This file bridges the unified Tonight engine (lib/tonight/engine.ts)
 * with the existing dashboard API and store contracts.
 * 
 * Maintains backward compatibility with existing TonightState type.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plan, TonightState } from '@/lib/dashboard/types'
import {
  getFreeTonightSuggestion,
  getPlusTonightSuggestion,
  getSwapSuggestion,
} from '@/lib/tonight/engine'

/**
 * Main entry point for dashboard Tonight suggestion.
 * Called by /api/dashboard route.
 */
export async function getTonightSuggestion(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<TonightState> {
  if (plan === 'plus') {
    return getPlusTonightSuggestion(supabase, userId)
  }
  return getFreeTonightSuggestion(userId)
}

/**
 * Get a rotating suggestion for swap/regenerate.
 * Called by /api/dashboard/tonight/regenerate route.
 * @deprecated Use getSwapSuggestion directly from engine for personalized swaps.
 */
export function getRotatingTonightSuggestion(
  userId: string,
  plan: Plan,
  excludeIds: string[] = [],
): TonightState {
  return getSwapSuggestion(userId, excludeIds, plan)
}
