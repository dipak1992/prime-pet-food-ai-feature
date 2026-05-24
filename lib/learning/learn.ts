// ============================================================
// onSignal() — Server-side signal handler
// Writes to meal_signals + updates user_preference_snapshot
// with rolling EMA affinity updates.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PreferenceSignal } from '@/lib/learning/types'

const EMA_ALPHA = 0.2
const DECAY_THRESHOLD = 3  // 3x rejection → decay cuisine/protein affinity

export type ServerSignal = 'accepted' | 'rejected' | 'swapped' | 'cooked' | 'skipped' | 'saved'

interface SignalPayload {
  userId: string
  mealId: string
  signal: ServerSignal
  context?: {
    cuisineType?: string
    proteinType?: string
    tags?: string[]
    totalTime?: number
    hour?: number
    dayOfWeek?: number
    chipUsed?: string
    [key: string]: unknown
  }
}

/**
 * Process a meal signal: persist to meal_signals, then update
 * the user's preference snapshot with EMA-based affinity rolling.
 */
export async function onSignal(
  supabase: SupabaseClient,
  payload: SignalPayload,
): Promise<void> {
  const { userId, mealId, signal, context = {} } = payload

  // 1. Write the raw signal
  const now = new Date()
  await supabase.from('meal_signals').insert({
    user_id: userId,
    meal_id: mealId,
    signal,
    context: {
      ...context,
      hour: context.hour ?? now.getHours(),
      dayOfWeek: context.dayOfWeek ?? now.getDay(),
    },
  })

  // 2. Update preference snapshot (EMA rolling)
  const { data: existing } = await supabase
    .from('user_preference_snapshot')
    .select('snapshot')
    .eq('user_id', userId)
    .single()

  const snapshot = (existing?.snapshot as unknown as PreferenceSignal) ?? emptySnapshot()
  const updated = applySignal(snapshot, signal, context)

  await supabase
    .from('user_preference_snapshot')
    .upsert({
      user_id: userId,
      snapshot: updated as unknown as Record<string, unknown>,
      computed_at: now.toISOString(),
    }, { onConflict: 'user_id' })
}

// ── EMA update logic ────────────────────────────────────────

function applySignal(
  snap: PreferenceSignal,
  signal: ServerSignal,
  context: SignalPayload['context'] = {},
): PreferenceSignal {
  const cuisine = context?.cuisineType
  const protein = context?.proteinType
  const isPositive = signal === 'accepted' || signal === 'cooked' || signal === 'saved'
  const isNegative = signal === 'rejected' || signal === 'skipped' || signal === 'swapped'

  // Cuisine affinity
  if (cuisine) {
    const prev = snap.cuisineAffinities[cuisine] ?? 0.5
    if (isPositive) {
      snap.cuisineAffinities[cuisine] = ema(prev, 1.0)
    } else if (isNegative) {
      snap.cuisineAffinities[cuisine] = ema(prev, 0.0)
      snap.rejectedCuisines[cuisine] = (snap.rejectedCuisines[cuisine] ?? 0) + 1
      // Decay on threshold
      if ((snap.rejectedCuisines[cuisine] ?? 0) >= DECAY_THRESHOLD) {
        snap.cuisineAffinities[cuisine] = Math.max(0, snap.cuisineAffinities[cuisine] - 0.1)
      }
    }
  }

  // Protein affinity
  if (protein) {
    const prev = snap.proteinAffinities[protein] ?? 0.5
    if (isPositive) {
      snap.proteinAffinities[protein] = ema(prev, 1.0)
    } else if (isNegative) {
      snap.proteinAffinities[protein] = ema(prev, 0.0)
      snap.rejectedProteins[protein] = (snap.rejectedProteins[protein] ?? 0) + 1
      if ((snap.rejectedProteins[protein] ?? 0) >= DECAY_THRESHOLD) {
        snap.proteinAffinities[protein] = Math.max(0, snap.proteinAffinities[protein] - 0.1)
      }
    }
  }

  // Tag affinities
  if (context?.tags) {
    for (const tag of context.tags) {
      const prev = snap.tagAffinities[tag] ?? 0.5
      snap.tagAffinities[tag] = ema(prev, isPositive ? 1.0 : isNegative ? 0.0 : prev)
    }
  }

  // Track rejected meal IDs
  if (isNegative) {
    if (!snap.rejectedMealIds.includes(context?.cuisineType ?? '')) {
      // Store by meal context — actual mealId tracked in meal_signals
    }
  }

  // Chip signals
  if (context?.chipUsed) {
    snap.chipSignals[context.chipUsed] = (snap.chipSignals[context.chipUsed] ?? 0) + 1
  }

  // Update metadata
  snap.totalInteractions += 1
  snap.lastUpdated = Date.now()

  return snap
}

function ema(prev: number, target: number): number {
  return prev + EMA_ALPHA * (target - prev)
}

function emptySnapshot(): PreferenceSignal {
  return {
    cuisineAffinities: {},
    proteinAffinities: {},
    tagAffinities: {},
    rejectedMealIds: [],
    rejectedCuisines: {},
    rejectedProteins: {},
    preferredDifficulty: null,
    preferredTimeRange: null,
    pickyScore: 0,
    weekdayAvgTime: null,
    weekendAvgTime: null,
    chipSignals: {},
    totalInteractions: 0,
    lastUpdated: Date.now(),
  }
}
