// ============================================================
// Learning Store — Persisted feedback history & preference cache
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SmartMealResult } from '@/lib/engine/types'
import type { MealFeedback, PreferenceSignal, LearnedBoosts } from '@/lib/learning/types'
import { computePreferenceSignal, computeLearnedBoosts } from '@/lib/learning/engine'

const MAX_HISTORY = 200

interface LearningState {
  feedbackHistory: MealFeedback[]
  // Cached signal (recomputed on each feedback)
  _cachedSignal: PreferenceSignal | null
  _cachedBoosts: LearnedBoosts | null
}

interface LearningActions {
  recordLike: (meal: SmartMealResult) => void
  recordReject: (meal: SmartMealResult) => void
  recordSave: (meal: SmartMealResult) => void
  recordChipSwap: (meal: SmartMealResult, chipId: string) => void
  getSignal: () => PreferenceSignal | null
  getBoosts: () => LearnedBoosts | null
  clearHistory: () => void
}

type LearningStore = LearningState & LearningActions

function mealToFeedback(meal: SmartMealResult, action: 'like' | 'reject' | 'save', chipUsed?: string, hadKidsPresent?: boolean): MealFeedback {
  const now = new Date()
  return {
    mealId: meal.id,
    title: meal.title,
    cuisineType: meal.cuisineType ?? '',
    proteinType: meal.tags.find(t =>
      ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'tofu', 'beans', 'eggs', 'lentils', 'turkey', 'sausage'].includes(t)
    ) ?? '',
    tags: meal.tags,
    difficulty: meal.difficulty,
    totalTime: meal.totalTime,
    action,
    timestamp: Date.now(),
    hourOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    chipUsed,
    hadKidsPresent,
  }
}

function recompute(history: MealFeedback[]) {
  const signal = computePreferenceSignal(history)
  const boosts = computeLearnedBoosts(signal)
  return { _cachedSignal: signal, _cachedBoosts: boosts }
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      feedbackHistory: [],
      _cachedSignal: null,
      _cachedBoosts: null,

      recordLike: (meal) => {
        const fb = mealToFeedback(meal, 'like')
        set(s => {
          const history = [...s.feedbackHistory, fb].slice(-MAX_HISTORY)
          return { feedbackHistory: history, ...recompute(history) }
        })
      },

      recordReject: (meal) => {
        const fb = mealToFeedback(meal, 'reject')
        set(s => {
          const history = [...s.feedbackHistory, fb].slice(-MAX_HISTORY)
          return { feedbackHistory: history, ...recompute(history) }
        })
      },

      recordSave: (meal) => {
        const fb = mealToFeedback(meal, 'save')
        set(s => {
          const history = [...s.feedbackHistory, fb].slice(-MAX_HISTORY)
          return { feedbackHistory: history, ...recompute(history) }
        })
      },

      recordChipSwap: (meal, chipId) => {
        const fb = mealToFeedback(meal, 'reject', chipId)
        set(s => {
          const history = [...s.feedbackHistory, fb].slice(-MAX_HISTORY)
          return { feedbackHistory: history, ...recompute(history) }
        })
      },

      getSignal: () => get()._cachedSignal,
      getBoosts: () => get()._cachedBoosts,

      clearHistory: () => set({
        feedbackHistory: [],
        _cachedSignal: null,
        _cachedBoosts: null,
      }),
    }),
    {
      name: 'nutrinest-learning',
      partialize: (state) => ({
        feedbackHistory: state.feedbackHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.feedbackHistory?.length) {
          const { _cachedSignal, _cachedBoosts } = recompute(state.feedbackHistory)
          state._cachedSignal = _cachedSignal
          state._cachedBoosts = _cachedBoosts
        }
      },
    }
  )
)
