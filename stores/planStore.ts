import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  WeekPlan,
  PlanDay,
  AutopilotOptions,
  AutopilotResult,
  AutopilotPreferences,
} from '@/lib/plan/types'

// ─── Store Type ───────────────────────────────────────────────────────────────

type PlanStore = {
  plan: WeekPlan | null
  hydrated: boolean
  isRunningAutopilot: boolean
  autopilotProgress: string
  lastAutopilotSummary: AutopilotResult['summary'] | null
  autopilotPreferences: AutopilotPreferences
  error: string | null

  // Actions
  hydrate: (plan: WeekPlan) => void
  refresh: () => Promise<void>
  navigateWeek: (offsetWeeks: number) => Promise<void>
  reorderDays: (orderedDayIds: string[]) => Promise<void>
  toggleLock: (dayId: string) => Promise<void>
  markCooked: (dayId: string) => Promise<void>
  clearDay: (dayId: string) => Promise<void>
  swapDay: (dayId: string, newRecipeId: string) => Promise<boolean>
  runAutopilot: (options: Partial<AutopilotOptions>) => Promise<AutopilotResult | null>
  setAutopilotPreferences: (prefs: Partial<AutopilotPreferences>) => void
  dismissSummary: () => void
}

// ─── Default preferences ──────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: AutopilotPreferences = {
  cuisinePreferences: [],
  mealComplexity: 'balanced',
  leftoverPriority: 'normal',
  lowEnergyMode: false,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: null,
      hydrated: false,
      isRunningAutopilot: false,
      autopilotProgress: '',
      lastAutopilotSummary: null,
      autopilotPreferences: DEFAULT_PREFERENCES,
      error: null,

      hydrate: (plan) => set({ plan, hydrated: true }),

      refresh: async () => {
        const current = get().plan
        try {
          const res = await fetch(`/api/plan?weekStart=${current?.weekStart ?? ''}`)
          if (!res.ok) throw new Error('Refresh failed')
          const plan: WeekPlan = await res.json()
          set({ plan })
        } catch (e: unknown) {
          set({ error: e instanceof Error ? e.message : 'Refresh failed' })
        }
      },

      navigateWeek: async (offsetWeeks) => {
        const current = get().plan
        if (!current) return
        const nextStart = new Date(current.weekStart)
        nextStart.setDate(nextStart.getDate() + offsetWeeks * 7)
        const iso = nextStart.toISOString().slice(0, 10)
        try {
          const res = await fetch(`/api/plan?weekStart=${iso}`)
          if (!res.ok) throw new Error('Navigation failed')
          const plan: WeekPlan = await res.json()
          set({ plan })
        } catch {
          // stay on current week
        }
      },

      reorderDays: async (orderedDayIds) => {
        const prev = get().plan
        if (!prev) return

        // Optimistic: swap recipes between day slots while keeping dates pinned
        const byId = new Map(prev.days.map((d) => [d.id, d]))
        const sortedByIndex = [...prev.days].sort((a, b) => a.dayIndex - b.dayIndex)

        const newDays: PlanDay[] = sortedByIndex.map((target, i) => {
          const sourceId = orderedDayIds[i]
          const source = byId.get(sourceId)
          if (!source) return target
          return {
            ...target,
            recipe: source.recipe,
            status: source.status === 'cooked' ? 'cooked' : source.recipe ? 'planned' : 'empty',
            locked: source.locked,
            estimatedCost: source.estimatedCost,
            notes: source.notes,
          }
        })

        set({ plan: { ...prev, days: newDays } })

        try {
          const res = await fetch('/api/plan', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'reorder',
              weekStart: prev.weekStart,
              orderedDayIds,
            }),
          })
          if (!res.ok) throw new Error('Reorder failed')
        } catch {
          set({ plan: prev })
        }
      },

      toggleLock: async (dayId) => {
        const prev = get().plan
        if (!prev) return
        const target = prev.days.find((d) => d.id === dayId)
        if (!target || !target.recipe) return

        // Optimistic
        set({
          plan: {
            ...prev,
            days: prev.days.map((d) =>
              d.id === dayId ? { ...d, locked: !d.locked } : d,
            ),
          },
        })

        try {
          const res = await fetch('/api/plan', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_lock', dayId }),
          })
          if (!res.ok) throw new Error('Toggle lock failed')
        } catch {
          set({ plan: prev })
        }
      },

      markCooked: async (dayId) => {
        const prev = get().plan
        if (!prev) return

        const updatedDays = prev.days.map((d) =>
          d.id === dayId ? { ...d, status: 'cooked' as const } : d,
        )
        const cookedCount = updatedDays.filter((d) => d.status === 'cooked').length

        set({
          plan: {
            ...prev,
            days: updatedDays,
            stats: {
              ...prev.stats,
              cookedCount,
              completionPercentage: Math.round((cookedCount / Math.max(1, updatedDays.length)) * 100),
            },
          },
        })

        try {
          const res = await fetch('/api/plan', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_cooked', dayId }),
          })
          if (!res.ok) throw new Error('Mark cooked failed')
        } catch {
          set({ plan: prev })
        }
      },

      clearDay: async (dayId) => {
        const prev = get().plan
        if (!prev) return

        const updatedDays = prev.days.map((d) =>
          d.id === dayId
            ? { ...d, recipe: null, status: 'empty' as const, locked: false, estimatedCost: null }
            : d,
        )
        const plannedCount = updatedDays.filter((d) => d.recipe).length
        const emptyCount = updatedDays.filter((d) => !d.recipe).length

        set({
          plan: {
            ...prev,
            days: updatedDays,
            stats: {
              ...prev.stats,
              plannedCount,
              emptyCount,
              completionPercentage: Math.round((plannedCount / Math.max(1, updatedDays.length)) * 100),
            },
          },
        })

        try {
          const res = await fetch('/api/plan', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear', dayId }),
          })
          if (!res.ok) throw new Error('Clear day failed')
        } catch {
          set({ plan: prev })
        }
      },

      swapDay: async (dayId, newRecipeId) => {
        try {
          const res = await fetch(`/api/plan/${dayId}/swap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId: newRecipeId }),
          })
          if (!res.ok) return false
          const updatedPlan: WeekPlan = await res.json()
          set({ plan: updatedPlan })
          return true
        } catch {
          return false
        }
      },

      runAutopilot: async (options) => {
        set({ isRunningAutopilot: true, autopilotProgress: 'Reading your household…', error: null })

        const progressMessages = [
          'Reading your household…',
          'Checking leftovers & pantry…',
          'Analyzing cuisine variety…',
          'Matching seasonal ingredients…',
          'Planning variety across the week…',
          'Checking against your budget…',
          'Optimizing prep times…',
          'Almost done…',
        ]
        let i = 0
        const timer = setInterval(() => {
          i = Math.min(i + 1, progressMessages.length - 1)
          set({ autopilotProgress: progressMessages[i] })
        }, 1100)

        try {
          const preferences = get().autopilotPreferences
          const res = await fetch('/api/plan/autopilot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weekStart: get().plan?.weekStart,
              options: {
                respectLocked: true,
                overwriteEmptyOnly: true,
                ...options,
                preferences,
              },
            }),
          })
          clearInterval(timer)

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            set({
              error: (data as { error?: string }).error ?? 'Autopilot failed',
              isRunningAutopilot: false,
              autopilotProgress: '',
            })
            return null
          }

          const result: AutopilotResult = await res.json()
          set({
            plan: result.weekPlan,
            lastAutopilotSummary: result.summary,
            isRunningAutopilot: false,
            autopilotProgress: '',
          })
          return result
        } catch {
          clearInterval(timer)
          set({ error: 'Autopilot failed', isRunningAutopilot: false, autopilotProgress: '' })
          return null
        }
      },

      setAutopilotPreferences: (prefs) => {
        set((state) => ({
          autopilotPreferences: { ...state.autopilotPreferences, ...prefs },
        }))
      },

      dismissSummary: () => set({ lastAutopilotSummary: null }),
    }),
    {
      name: 'nutrinest-plan-store',
      partialize: (state) => ({
        autopilotPreferences: state.autopilotPreferences,
      }),
    },
  ),
)
