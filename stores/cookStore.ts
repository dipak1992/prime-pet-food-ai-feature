import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────

type CookSession = {
  sessionId: string
  step: number
}

type CookStore = {
  activeSessionByRecipeId: Record<string, CookSession>
  setSession: (recipeId: string, sessionId: string, step: number) => void
  clearSession: (recipeId: string) => void
}

// ─── Store (plain Zustand v5, no immer) ───────────────────────────────────────

export const useCookStore = create<CookStore>((set) => ({
  activeSessionByRecipeId: {},

  setSession: (recipeId, sessionId, step) =>
    set((state) => ({
      activeSessionByRecipeId: {
        ...state.activeSessionByRecipeId,
        [recipeId]: { sessionId, step },
      },
    })),

  clearSession: (recipeId) =>
    set((state) => {
      const next = { ...state.activeSessionByRecipeId }
      delete next[recipeId]
      return { activeSessionByRecipeId: next }
    }),
}))
