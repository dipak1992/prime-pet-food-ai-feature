import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  DashboardPayload,
  TonightState,
  LeftoversState,
  BudgetState,
  RetentionState,
  Nudge,
  QuickAction,
} from '@/lib/dashboard/types'

type DashboardStore = {
  // Core state
  hydrated: boolean
  user: DashboardPayload['user'] | null
  tonight: TonightState | null
  leftovers: LeftoversState | null
  budget: BudgetState | null
  retention: RetentionState | null
  predictiveInsights: DashboardPayload['predictiveInsights']
  autonomousActions: DashboardPayload['autonomousActions']
  quickActions: QuickAction[]
  nudge: Nudge | null
  household: DashboardPayload['household'] | null
  limits: DashboardPayload['limits'] | null

  // Async / error state
  isRefreshing: boolean
  error: string | null
  lastFetchedAt: number | null

  // UI state
  isRegeneratingTonight: boolean
  tonightSwapSeenIds: string[]

  // Actions
  hydrate: (payload: DashboardPayload) => void
  /** Alias for hydrate — spec uses setData */
  setData: (payload: DashboardPayload) => void
  /** Re-fetch dashboard data from the API */
  refresh: () => Promise<void>
  regenerateTonight: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      tonight: null,
      leftovers: null,
      budget: null,
      retention: null,
      predictiveInsights: [],
      autonomousActions: [],
      quickActions: [],
      nudge: null,
      household: null,
      limits: null,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
      isRegeneratingTonight: false,
      tonightSwapSeenIds: [],

      hydrate: (payload) =>
        set({
          hydrated: true,
          user: payload.user,
          tonight: payload.tonight,
          leftovers: payload.leftovers,
          budget: payload.budget,
          retention: payload.retention,
          predictiveInsights: payload.predictiveInsights,
          autonomousActions: payload.autonomousActions,
          quickActions: payload.quickActions,
          nudge: payload.nudge,
          household: payload.household,
          limits: payload.limits,
          tonightSwapSeenIds: payload.tonight.recipe?.id ? [payload.tonight.recipe.id] : [],
          error: null,
          lastFetchedAt: Date.now(),
        }),

      setData: (payload) => get().hydrate(payload),

      refresh: async () => {
        if (get().isRefreshing) return
        set({ isRefreshing: true, error: null })
        try {
          const res = await fetch('/api/dashboard', { cache: 'no-store' })
          if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`)
          const payload: DashboardPayload = await res.json()
          set({
            hydrated: true,
            user: payload.user,
            tonight: payload.tonight,
            leftovers: payload.leftovers,
            budget: payload.budget,
            retention: payload.retention,
            predictiveInsights: payload.predictiveInsights,
            autonomousActions: payload.autonomousActions,
            quickActions: payload.quickActions,
            nudge: payload.nudge,
            household: payload.household,
            limits: payload.limits,
            tonightSwapSeenIds: payload.tonight.recipe?.id ? [payload.tonight.recipe.id] : [],
            isRefreshing: false,
            error: null,
            lastFetchedAt: Date.now(),
          })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown error'
          set({ isRefreshing: false, error: message })
          console.error('[DashboardStore] refresh error:', e)
        }
      },

      regenerateTonight: async () => {
        if (get().isRegeneratingTonight) return

        const currentMealId = get().tonight?.recipe?.id
        const excludeIds = Array.from(
          new Set([
            ...get().tonightSwapSeenIds,
            ...(currentMealId ? [currentMealId] : []),
          ]),
        ).slice(-25)

        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 5000)

        set({ isRegeneratingTonight: true, error: null })
        try {
          const res = await fetch('/api/dashboard/tonight/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
            body: JSON.stringify({ currentMealId, excludeIds }),
          })
          if (!res.ok) throw new Error('Regenerate failed')
          const next: TonightState = await res.json()
          if (!next?.recipe?.id) throw new Error('Regenerate returned no meal')
          set({
            tonight: next,
            tonightSwapSeenIds: Array.from(new Set([...excludeIds, next.recipe.id])).slice(-25),
            isRegeneratingTonight: false,
          })
        } catch (e) {
          const message =
            e instanceof DOMException && e.name === 'AbortError'
              ? 'Meal swap is taking longer than expected'
              : e instanceof Error
                ? e.message
                : 'Meal swap failed'
          set({ isRegeneratingTonight: false, error: message })
          console.error(e)
        } finally {
          window.clearTimeout(timeout)
        }
      },
    }),
    {
      name: 'dashboard-store',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist UI state — server data is always re-fetched
      partialize: (state) => ({
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
