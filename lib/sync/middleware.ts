// ============================================================
// Sync Middleware — Debounced write-through of learning store
// to Supabase user_preference_snapshot. Falls back to
// localStorage when offline.
// ============================================================

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { useLearningStore } from '@/lib/learning/store'
import type { PreferenceSignal } from '@/lib/learning/types'

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 3_000
const STALE_MS = 60 * 60 * 1000 // 1 hour

/**
 * Sync preference snapshot to Supabase (debounced).
 * Called automatically when learning store changes.
 */
function scheduleSync() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      const signal = useLearningStore.getState().getSignal()
      if (!signal) return

      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_preference_snapshot')
        .upsert({
          user_id: user.id,
          snapshot: signal as unknown as Record<string, unknown>,
          computed_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
    } catch {
      // Offline or auth expired — localStorage is still the source of truth
    }
  }, DEBOUNCE_MS)
}

/**
 * Hydrate learning store from Supabase if the local data is stale.
 * Call once on app mount after auth is ready.
 */
export async function hydrateFromServer(): Promise<void> {
  try {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const localSignal = useLearningStore.getState().getSignal()
    const localAge = localSignal?.lastUpdated
      ? Date.now() - localSignal.lastUpdated
      : Infinity

    // If local data is fresh, skip server hydration
    if (localAge < STALE_MS && localSignal) return

    const { data } = await supabase
      .from('user_preference_snapshot')
      .select('snapshot, computed_at')
      .eq('user_id', user.id)
      .single()

    if (!data?.snapshot) return

    const serverSignal = data.snapshot as unknown as PreferenceSignal
    const serverAge = Date.now() - new Date(data.computed_at).getTime()

    // Use server data only if it's newer than local
    if (serverAge < localAge) {
      // Server snapshot is more recent — but we don't overwrite feedbackHistory
      // because the snapshot is a derived view. We just update the cached signal.
      useLearningStore.setState({
        _cachedSignal: serverSignal,
      })
    }
  } catch {
    // Offline — continue with local data
  }
}

/**
 * Subscribe to learning store changes and sync to server.
 * Call once on app mount. Returns unsubscribe function.
 */
export function startSyncSubscription(): () => void {
  let prevLen = useLearningStore.getState().feedbackHistory.length
  return useLearningStore.subscribe((state) => {
    if (state.feedbackHistory.length !== prevLen) {
      prevLen = state.feedbackHistory.length
      scheduleSync()
    }
  })
}
