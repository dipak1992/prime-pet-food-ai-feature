import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIGeneratedPlan, HouseholdMember, KidsAgeGroup } from '@/types'

// Local OnboardingState — flat structure used by settings/onboarding pages
export interface OnboardingState {
  step: number
  totalSteps: number
  householdName: string
  cookingTimePreference: string
  budgetLevel: string
  servingsBase: number
  cuisinePreferences: string[]
  cookingSkillLevel: string
  useLeftovers: boolean
  members: Partial<HouseholdMember>[]
}

// ─── Planner Store ────────────────────────────────────────────────────────────

interface PlannerStore {
  currentPlan: AIGeneratedPlan | null
  selectedDayIndex: number
  isGenerating: boolean
  generationError: string | null
  setCurrentPlan: (plan: AIGeneratedPlan | null) => void
  setSelectedDayIndex: (index: number) => void
  setIsGenerating: (loading: boolean) => void
  setGenerationError: (error: string | null) => void
  clearPlan: () => void
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  currentPlan: null,
  selectedDayIndex: 0,
  isGenerating: false,
  generationError: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan, generationError: null }),
  setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  setGenerationError: (error) => set({ generationError: error, isGenerating: false }),
  clearPlan: () => set({ currentPlan: null, generationError: null }),
}))

// ─── Onboarding Store ─────────────────────────────────────────────────────────

const initialOnboardingState: OnboardingState = {
  step: 1,
  totalSteps: 5,
  householdName: '',
  cookingTimePreference: '30-45 min',
  budgetLevel: 'moderate',
  servingsBase: 4,
  cuisinePreferences: [],
  cookingSkillLevel: 'intermediate',
  useLeftovers: true,
  members: [],
}

interface OnboardingStore {
  state: OnboardingState
  updateState: (updates: Partial<OnboardingState>) => void
  nextStep: () => void
  prevStep: () => void
  addMember: (member: Partial<HouseholdMember>) => void
  removeMember: (index: number) => void
  updateMember: (index: number, updates: Partial<HouseholdMember>) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      state: initialOnboardingState,
      updateState: (updates) =>
        set((s) => ({ state: { ...s.state, ...updates } })),
      nextStep: () =>
        set((s) => ({
          state: { ...s.state, step: Math.min(s.state.step + 1, s.state.totalSteps) },
        })),
      prevStep: () =>
        set((s) => ({
          state: { ...s.state, step: Math.max(s.state.step - 1, 1) },
        })),
      addMember: (member) =>
        set((s) => ({
          state: {
            ...s.state,
            members: [...s.state.members, member as HouseholdMember],
          },
        })),
      removeMember: (index) =>
        set((s) => ({
          state: {
            ...s.state,
            members: s.state.members.filter((_, i) => i !== index),
          },
        })),
      updateMember: (index, updates) =>
        set((s) => ({
          state: {
            ...s.state,
            members: s.state.members.map((m, i) =>
              i === index ? { ...m, ...updates } : m
            ),
          },
        })),
      reset: () => set({ state: initialOnboardingState }),
    }),
    { name: 'nutrinest-onboarding' }
  )
)

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIStore {
  sidebarOpen: boolean
  activeTab: string
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  activeTab: 'all',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

// ─── Light Onboarding Store ───────────────────────────────────────────────────

export type HouseholdType = 'solo' | 'couple' | 'family'

export interface LightOnboardingData {
  householdType: HouseholdType | null
  hasKids: boolean | null
  kidsAgeGroup: KidsAgeGroup | null
  pickyEater: boolean
  cuisines: string[]
  dislikedFoods: string[]
  cookingTimeMinutes: number
  lowEnergy: boolean
  country: string
  storePreference: string
  completedAt: string | null
}

type LightOnboardingStore = LightOnboardingData & {
  setHouseholdType: (type: HouseholdType | null) => void
  setHasKids: (hasKids: boolean | null) => void
  setKidsAgeGroup: (v: KidsAgeGroup | null) => void
  setPickyEater: (v: boolean) => void
  setCuisines: (v: string[]) => void
  setDislikedFoods: (v: string[]) => void
  setCookingTimeMinutes: (v: number) => void
  setLowEnergy: (v: boolean) => void
  setCountry: (v: string) => void
  setStorePreference: (v: string) => void
  markCompleted: () => void
  reset: () => void
}

const initialLightOnboarding: LightOnboardingData = {
  householdType: null,
  hasKids: null,
  kidsAgeGroup: null,
  pickyEater: false,
  cuisines: [],
  dislikedFoods: [],
  cookingTimeMinutes: 30,
  lowEnergy: false,
  country: '',
  storePreference: '',
  completedAt: null,
}

export const useLightOnboardingStore = create<LightOnboardingStore>()(
  persist(
    (set) => ({
      ...initialLightOnboarding,
      setHouseholdType: (householdType) => set({ householdType }),
      setHasKids: (hasKids) => set({ hasKids }),
      setKidsAgeGroup: (kidsAgeGroup) => set({ kidsAgeGroup }),
      setPickyEater: (pickyEater) => set({ pickyEater }),
      setCuisines: (cuisines) => set({ cuisines }),
      setDislikedFoods: (dislikedFoods) => set({ dislikedFoods }),
      setCookingTimeMinutes: (cookingTimeMinutes) => set({ cookingTimeMinutes }),
      setLowEnergy: (lowEnergy) => set({ lowEnergy }),
      setCountry: (country) => set({ country }),
      setStorePreference: (storePreference) => set({ storePreference }),
      markCompleted: () => set({ completedAt: new Date().toISOString() }),
      reset: () => set(initialLightOnboarding),
    }),
    { name: 'nutrinest-light-onboarding' }
  )
)
