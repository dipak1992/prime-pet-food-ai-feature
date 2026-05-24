import { useLightOnboardingStore } from '@/lib/store'

export type HouseholdType = 'solo' | 'couple' | 'family'

export interface CardLabels {
  quickDecide: { title: string; sub: string }
  planWeek: { title: string; sub: string }
}

export interface HouseholdConfig {
  householdType: HouseholdType
  hasKids: boolean
  greeting: (name: string) => string
  smartToolLabel: string
  showFamilyMode: boolean
  cardLabels: CardLabels
}

// ─── Config tables ────────────────────────────────────────────────────────────

const cardLabelMap: Record<HouseholdType, CardLabels> = {
  solo: {
    quickDecide: { title: "I Don't Want to Think", sub: 'One tap — dinner decided' },
    planWeek: { title: 'Plan My Week', sub: '7 dinners, zero repeats' },
  },
  couple: {
    quickDecide: { title: 'Dinner for Two', sub: 'One tap — dinner decided' },
    planWeek: { title: 'Plan Our Week', sub: '7 dinners, zero repeats' },
  },
  family: {
    quickDecide: { title: 'Feed Everyone Tonight', sub: 'One tap — dinner decided' },
    planWeek: { title: 'Plan Family Week', sub: '7 dinners, zero repeats' },
  },
}

const smartToolLabelMap: Record<HouseholdType, string> = {
  solo: '🍽️ Solo Night',
  couple: '💑 Date Night',
  family: '👨‍👩‍👧 Family Mode',
}

const greetingMap: Record<HouseholdType, (name: string) => string> = {
  solo: () => 'What sounds good tonight?',
  couple: () => 'Planning a night for two?',
  family: () => "What's the family craving?",
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHouseholdConfig(): HouseholdConfig {
  const householdType = useLightOnboardingStore((s) => s.householdType) ?? 'solo'
  const hasKids = useLightOnboardingStore((s) => s.hasKids) ?? false

  return {
    householdType,
    hasKids,
    greeting: greetingMap[householdType],
    smartToolLabel: smartToolLabelMap[householdType],
    showFamilyMode: householdType === 'family',
    cardLabels: cardLabelMap[householdType],
  }
}
