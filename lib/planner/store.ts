// ============================================================
// Weekly Planner — Zustand Store
// Persists the week plan and grocery list to localStorage
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeekDay, WeeklyPlan, GroceryList, GroceryLine, StoreFormat } from './types'
import { reformatGroceryList } from './grocery'

// ── Helpers ───────────────────────────────────────────────────

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day // adjust to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function makeDays(weekStart: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return {
      dayIndex: i,
      date: d.toISOString().split('T')[0],
      meal: null,
    }
  })
}

function makeEmptyPlan(): WeeklyPlan {
  const weekStart = getWeekStart()
  return {
    id: `plan-${weekStart}`,
    weekStart,
    days: makeDays(weekStart),
    generatedAt: new Date().toISOString(),
  }
}

function groceryItemKey(item: Pick<GroceryLine, 'name' | 'unit'>) {
  return `${item.name.trim().toLowerCase().replace(/\s+/g, ' ')}::${item.unit.trim().toLowerCase()}`
}

// ── Store interface ───────────────────────────────────────────

interface WeeklyPlanStore {
  plan: WeeklyPlan
  selectedDayIndex: number
  groceryList: GroceryList | null
  storeFormat: StoreFormat
  isGeneratingWeek: boolean
  generatingDayIndex: number | null

  // Plan actions
  setPlan: (plan: WeeklyPlan) => void
  setSelectedDayIndex: (i: number) => void
  clearPlan: () => void

  // Grocery actions
  setGroceryList: (list: GroceryList) => void
  setStoreFormat: (format: StoreFormat) => void
  togglePantryItem: (id: string) => void
  toggleChecked: (id: string) => void
  checkAllInCategory: (category: string) => void
  uncheckAll: () => void
  clearGrocery: () => void
  addCustomItem: (item: { name: string; quantity: number; unit: string; category: string; note?: string }) => void
  deleteItem: (id: string) => void
  updateItem: (id: string, updates: Partial<GroceryLine>) => void
  clearCheckedItems: () => void

  // Loading flags
  setIsGeneratingWeek: (v: boolean) => void
  setGeneratingDayIndex: (i: number | null) => void
}

// ── Store ─────────────────────────────────────────────────────

export const useWeeklyPlanStore = create<WeeklyPlanStore>()(
  persist(
    (set, get) => ({
      plan: makeEmptyPlan(),
      selectedDayIndex: 0,
      groceryList: null,
      storeFormat: 'standard',
      isGeneratingWeek: false,
      generatingDayIndex: null,

      setPlan: (plan) => set({ plan, selectedDayIndex: 0 }),
      setSelectedDayIndex: (i) => set({ selectedDayIndex: i }),
      clearPlan: () => set({ plan: makeEmptyPlan(), groceryList: null }),

      setGroceryList: (list) => set({ groceryList: list }),
      setStoreFormat: (format) => {
        const { groceryList } = get()
        if (!groceryList) {
          set({ storeFormat: format })
          return
        }
        set({ storeFormat: format, groceryList: reformatGroceryList(groceryList, format) })
      },
      togglePantryItem: (id) =>
        set((s) => {
          if (!s.groceryList) return s
          return {
            groceryList: {
              ...s.groceryList,
              items: s.groceryList.items.map((item) =>
                item.id === id ? { ...item, isInPantry: !item.isInPantry } : item
              ),
            },
          }
        }),
      toggleChecked: (id) =>
        set((s) => {
          if (!s.groceryList) return s
          return {
            groceryList: {
              ...s.groceryList,
              items: s.groceryList.items.map((item) =>
                item.id === id ? { ...item, isChecked: !item.isChecked } : item
              ),
            },
          }
        }),
      checkAllInCategory: (category) =>
        set((s) => {
          if (!s.groceryList) return s
          return {
            groceryList: {
              ...s.groceryList,
              items: s.groceryList.items.map((item) =>
                item.category === category ? { ...item, isChecked: true } : item
              ),
            },
          }
        }),
      uncheckAll: () =>
        set((s) => {
          if (!s.groceryList) return s
          return {
            groceryList: {
              ...s.groceryList,
              items: s.groceryList.items.map((item) => ({ ...item, isChecked: false })),
            },
          }
        }),
      clearGrocery: () => set({ groceryList: null }),
      addCustomItem: (item) =>
        set((s) => {
          const normalizedName = item.name.trim().toLowerCase().replace(/\s+/g, ' ')
          const normalizedUnit = item.unit.trim().toLowerCase()
          const list = s.groceryList
          if (!list) {
            // Create a new list if none exists
            const newList: GroceryList = {
              weekStart: s.plan.weekStart,
              items: [{
                id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                estimatedCost: 0,
                fromMeals: [],
                isInPantry: false,
                isChecked: false,
                isCustom: true,
                note: item.note,
              }],
              totalEstimatedCost: 0,
              generatedAt: new Date().toISOString(),
              storeFormat: s.storeFormat,
            }
            return { groceryList: newList }
          }
          const existing = list.items.find((line) =>
            line.name.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedName &&
            line.unit.trim().toLowerCase() === normalizedUnit &&
            line.category === item.category
          )
          if (existing) {
            return {
              groceryList: {
                ...list,
                items: list.items.map((line) =>
                  line.id === existing.id
                    ? {
                        ...line,
                        quantity: Math.round((line.quantity + item.quantity) * 100) / 100,
                        note: line.note ?? item.note,
                      }
                    : line
                ),
              },
            }
          }
          return {
            groceryList: {
              ...list,
              items: [
                ...list.items,
                {
                  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  category: item.category,
                  estimatedCost: 0,
                  fromMeals: [],
                  isInPantry: false,
                  isChecked: false,
                  isCustom: true,
                  note: item.note,
                },
              ],
            },
          }
        }),
      deleteItem: (id) =>
        set((s) => {
          if (!s.groceryList) return s
          const removed = s.groceryList.items.find((item) => item.id === id)
          const items = s.groceryList.items.filter((item) => item.id !== id)
          const removedItemKeys = removed && !removed.isCustom
            ? Array.from(new Set([...(s.groceryList.removedItemKeys ?? []), groceryItemKey(removed)]))
            : s.groceryList.removedItemKeys
          return {
            groceryList: {
              ...s.groceryList,
              items,
              removedItemKeys,
              totalEstimatedCost: items.reduce((sum, i) => sum + i.estimatedCost, 0),
            },
          }
        }),
      updateItem: (id, updates) =>
        set((s) => {
          if (!s.groceryList) return s
          return {
            groceryList: {
              ...s.groceryList,
              items: s.groceryList.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item
              ),
            },
          }
        }),
      clearCheckedItems: () =>
        set((s) => {
          if (!s.groceryList) return s
          const items = s.groceryList.items.filter((item) => !item.isChecked)
          return {
            groceryList: {
              ...s.groceryList,
              items,
              totalEstimatedCost: items.reduce((sum, i) => sum + i.estimatedCost, 0),
            },
          }
        }),
      setIsGeneratingWeek: (v) => set({ isGeneratingWeek: v }),
      setGeneratingDayIndex: (i) => set({ generatingDayIndex: i }),
    }),
    {
      name: 'nutrinest-weekly-plan',
      partialize: (s) => ({
        plan: s.plan,
        groceryList: s.groceryList,
        storeFormat: s.storeFormat,
        selectedDayIndex: s.selectedDayIndex,
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-reset stale plans from previous weeks
        if (state && state.plan.weekStart !== getWeekStart()) {
          state.plan = makeEmptyPlan()
          state.groceryList = null
          state.selectedDayIndex = 0
        }
      },
    }
  )
)
