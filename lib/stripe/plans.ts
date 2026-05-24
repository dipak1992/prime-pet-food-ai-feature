export type PlanId = 'free' | 'plus'

export type PlanDef = {
  id: PlanId
  name: string
  priceMonthly: number
  stripePriceId: string | null
  tagline: string
  badge?: string
  highlighted?: boolean
  features: string[]
  limits: {
    fridgeScansPerWeek: number | 'unlimited'
    menuScansPerMonth: number | 'unlimited'
    aiLeftoverSuggestions: 'limited' | 'unlimited'
    budgetTracking: boolean
    autopilot: boolean
    householdMembers: number
    prioritySupport: boolean
  }
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    stripePriceId: null,
    tagline: 'Start here',
    features: [
      'Tonight Suggestions (3/day)',
      'Snap & Cook — fridge scan (3/week)',
      'Basic grocery list',
      '1 member profile',
      'Basic dietary filters',
    ],
    limits: {
      fridgeScansPerWeek: 3,
      menuScansPerMonth: 3,
      aiLeftoverSuggestions: 'limited',
      budgetTracking: false,
      autopilot: false,
      householdMembers: 1,
      prioritySupport: false,
    },
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    priceMonthly: 9.99,
    stripePriceId: process.env.STRIPE_PLUS_PRICE_ID ?? null,
    tagline: 'Most popular',
    badge: 'Most popular',
    highlighted: true,
    features: [
      'Everything in Free',
      'Unlimited Tonight Suggestions',
      'Unlimited Snap & Cook scans',
      'Weekly Autopilot — 7 dinners, one tap',
      'Leftovers AI — track & use leftovers',
      'Budget Intelligence — weekly spend tracking',
      'Smart grocery list export',
      'Up to 6 household members',
      'Household memory & preferences',
    ],
    limits: {
      fridgeScansPerWeek: 'unlimited',
      menuScansPerMonth: 'unlimited',
      aiLeftoverSuggestions: 'unlimited',
      budgetTracking: true,
      autopilot: true,
      householdMembers: 6,
      prioritySupport: false,
    },
  },
}

export function planRank(plan: PlanId): number {
  return { free: 0, plus: 1 }[plan]
}

export function isAtLeast(userPlan: PlanId, required: PlanId): boolean {
  return planRank(userPlan) >= planRank(required)
}
