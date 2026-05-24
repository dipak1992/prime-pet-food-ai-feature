import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserGoal } from '@/types'

interface GoalStore {
  activeGoals: UserGoal[]
  toggleGoal: (goal: UserGoal) => void
  setGoals: (goals: UserGoal[]) => void
  clearGoals: () => void
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      activeGoals: [],
      toggleGoal: (goal) =>
        set((s) => ({
          activeGoals: s.activeGoals.includes(goal)
            ? s.activeGoals.filter((g) => g !== goal)
            : [...s.activeGoals, goal],
        })),
      setGoals: (goals) => set({ activeGoals: goals }),
      clearGoals: () => set({ activeGoals: [] }),
    }),
    { name: 'nutrinest-goals' },
  ),
)
