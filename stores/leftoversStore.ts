import { create } from 'zustand'
import type { Leftover, LeftoverInsights, MainIngredient } from '@/lib/leftovers/types'
import { getUrgency, getDaysUntilExpiry } from '@/lib/leftovers/expiration-calculator'

// ─── Cooked Prompt State ────────────────────────────────────────────────────

type CookedPromptData = {
  recipeId: string
  recipeName: string
  recipeImage: string | null
  servings: number
  costPerServing: number | null
  mainIngredients: MainIngredient[]
}

// ─── Store Types ─────────────────────────────────────────────────────────────

type LeftoversFilter = 'all' | 'active' | 'expiring' | 'used'

type LeftoversStore = {
  // Data
  leftovers: Leftover[]
  insights: LeftoverInsights | null
  hydrated: boolean

  // UI state
  filter: LeftoversFilter
  selectedId: string | null
  isModalOpen: boolean

  // Cooked prompt
  cookedPromptOpen: boolean
  cookedPromptData: CookedPromptData | null

  // Actions — data
  hydrate: (leftovers: Leftover[], insights: LeftoverInsights) => void
  addLeftover: (leftover: Leftover) => void
  updateLeftover: (id: string, patch: Partial<Leftover>) => void
  removeLeftover: (id: string) => void
  markUsed: (id: string) => Promise<void>
  markDiscarded: (id: string) => Promise<void>

  // Actions — UI
  setFilter: (filter: LeftoversFilter) => void
  openModal: (id: string) => void
  closeModal: () => void

  // Actions — cooked prompt
  openCookedPrompt: (data: CookedPromptData) => void
  closeCookedPrompt: () => void

  // Derived helpers
  getFiltered: () => Leftover[]
  getById: (id: string) => Leftover | undefined
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function enrichLeftover(l: Leftover): Leftover {
  return {
    ...l,
    urgency: getUrgency(l.expiresAt),
    daysUntilExpiry: getDaysUntilExpiry(l.expiresAt),
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLeftoversStore = create<LeftoversStore>((set, get) => ({
  leftovers: [],
  insights: null,
  hydrated: false,
  filter: 'all',
  selectedId: null,
  isModalOpen: false,
  cookedPromptOpen: false,
  cookedPromptData: null,

  hydrate: (leftovers, insights) =>
    set({
      hydrated: true,
      leftovers: leftovers.map(enrichLeftover),
      insights,
    }),

  addLeftover: (leftover) =>
    set((state) => ({
      leftovers: [enrichLeftover(leftover), ...state.leftovers],
    })),

  updateLeftover: (id, patch) =>
    set((state) => ({
      leftovers: state.leftovers.map((l) =>
        l.id === id ? enrichLeftover({ ...l, ...patch }) : l,
      ),
    })),

  removeLeftover: (id) =>
    set((state) => ({
      leftovers: state.leftovers.filter((l) => l.id !== id),
    })),

  markUsed: async (id) => {
    const prev = get().leftovers
    // Optimistic update
    set((state) => ({
      leftovers: state.leftovers.map((l) =>
        l.id === id
          ? enrichLeftover({ ...l, status: 'used', usedAt: new Date().toISOString() })
          : l,
      ),
      isModalOpen: false,
      selectedId: null,
    }))

    try {
      const res = await fetch(`/api/leftovers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'used' }),
      })
      if (!res.ok) throw new Error('Failed to mark as used')
    } catch (e) {
      set({ leftovers: prev })
      console.error(e)
    }
  },

  markDiscarded: async (id) => {
    const prev = get().leftovers
    // Optimistic update
    set((state) => ({
      leftovers: state.leftovers.map((l) =>
        l.id === id ? enrichLeftover({ ...l, status: 'discarded' }) : l,
      ),
      isModalOpen: false,
      selectedId: null,
    }))

    try {
      const res = await fetch(`/api/leftovers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'discarded' }),
      })
      if (!res.ok) throw new Error('Failed to mark as discarded')
    } catch (e) {
      set({ leftovers: prev })
      console.error(e)
    }
  },

  setFilter: (filter) => set({ filter }),

  openModal: (id) => set({ selectedId: id, isModalOpen: true }),

  closeModal: () => set({ isModalOpen: false, selectedId: null }),

  openCookedPrompt: (data) => set({ cookedPromptOpen: true, cookedPromptData: data }),

  closeCookedPrompt: () => set({ cookedPromptOpen: false, cookedPromptData: null }),

  getFiltered: () => {
    const { leftovers, filter } = get()
    const now = new Date()
    switch (filter) {
      case 'active':
        return leftovers.filter((l) => l.status === 'active')
      case 'expiring':
        return leftovers.filter(
          (l) => l.status === 'active' && (l.urgency === 'today' || l.urgency === 'soon'),
        )
      case 'used':
        return leftovers.filter((l) => l.status === 'used' || l.status === 'discarded')
      default:
        return leftovers
    }
  },

  getById: (id) => get().leftovers.find((l) => l.id === id),
}))
