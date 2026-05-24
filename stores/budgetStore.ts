import { create } from 'zustand'
import type {
  BudgetSettings,
  BudgetState,
  BudgetPayload,
  SpendingHistoryWeek,
  CategorySpend,
} from '@/lib/budget/types'
import { computeAlertLevel } from '@/lib/budget/cost-estimator'

// ─── Store Type ───────────────────────────────────────────────────────────────

type BudgetStore = {
  // Data
  hydrated: boolean
  settings: BudgetSettings
  weekSpent: number
  weekEstimated: number
  mealsCooked: number
  breakdown: CategorySpend[]
  history: SpendingHistoryWeek[]
  plan: 'free' | 'plus'

  // Derived (computed on hydrate/update)
  percentUsed: number
  alertLevel: BudgetState['alertLevel']

  // UI state
  setupModalOpen: boolean
  drawerOpen: boolean
  isUpdating: boolean

  // Actions
  hydrate: (payload: BudgetPayload) => void
  updateSettings: (settings: Partial<BudgetSettings>) => Promise<void>
  addSpend: (amount: number, breakdown?: CategorySpend[]) => void
  openSetupModal: () => void
  closeSetupModal: () => void
  openDrawer: () => void
  closeDrawer: () => void

  // Derived helpers
  getBudgetState: () => BudgetState
  isGated: () => boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computePercent(spent: number, limit: number | null): number {
  if (!limit || limit <= 0) return 0
  return Math.min(Math.round((spent / limit) * 100), 100)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  hydrated: false,
  settings: {
    weeklyLimit: null,
    strictMode: false,
    zipCode: null,
    preferredStore: null,
  },
  weekSpent: 0,
  weekEstimated: 0,
  mealsCooked: 0,
  breakdown: [],
  history: [],
  plan: 'free',
  percentUsed: 0,
  alertLevel: 'safe',
  setupModalOpen: false,
  drawerOpen: false,
  isUpdating: false,

  hydrate: (payload) => {
    const { settings, currentWeek, history, plan } = payload
    const percentUsed = computePercent(currentWeek.spent, settings.weeklyLimit)
    const alertLevel = computeAlertLevel(currentWeek.spent, settings.weeklyLimit)

    set({
      hydrated: true,
      settings,
      weekSpent: currentWeek.spent,
      weekEstimated: currentWeek.estimated,
      mealsCooked: currentWeek.mealsCooked,
      breakdown: currentWeek.breakdown,
      history,
      plan,
      percentUsed,
      alertLevel,
    })
  },

  updateSettings: async (patch) => {
    const prev = get().settings
    const next = { ...prev, ...patch }

    // Optimistic update
    const percentUsed = computePercent(get().weekSpent, next.weeklyLimit)
    const alertLevel = computeAlertLevel(get().weekSpent, next.weeklyLimit)
    set({ settings: next, percentUsed, alertLevel, isUpdating: true })

    try {
      const res = await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (!res.ok) throw new Error('Budget update failed')
    } catch (e) {
      // Rollback
      const rollbackPercent = computePercent(get().weekSpent, prev.weeklyLimit)
      const rollbackAlert = computeAlertLevel(get().weekSpent, prev.weeklyLimit)
      set({ settings: prev, percentUsed: rollbackPercent, alertLevel: rollbackAlert })
      console.error(e)
    } finally {
      set({ isUpdating: false })
    }
  },

  addSpend: (amount, breakdown) => {
    const newSpent = get().weekSpent + amount
    const limit = get().settings.weeklyLimit
    const percentUsed = computePercent(newSpent, limit)
    const alertLevel = computeAlertLevel(newSpent, limit)

    set((state) => ({
      weekSpent: newSpent,
      mealsCooked: state.mealsCooked + 1,
      percentUsed,
      alertLevel,
      ...(breakdown ? { breakdown } : {}),
    }))
  },

  openSetupModal: () => set({ setupModalOpen: true }),
  closeSetupModal: () => set({ setupModalOpen: false }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  getBudgetState: () => {
    const s = get()
    return {
      settings: s.settings,
      weekSpent: s.weekSpent,
      weekEstimated: s.weekEstimated,
      mealsCooked: s.mealsCooked,
      percentUsed: s.percentUsed,
      alertLevel: s.alertLevel,
      breakdown: s.breakdown,
      history: s.history,
    }
  },

  isGated: () => get().plan === 'free',
}))
