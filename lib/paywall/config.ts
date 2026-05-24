import type { SubscriptionTier } from '@/types'

// ── Pricing tiers & values (SOURCE OF TRUTH) ─────────────────────────────────
// All price IDs must be configured in Vercel ENV vars before checkout works

export const PRICING_TIERS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: undefined,
    yearlyPriceId: undefined,
  },
  pro: {
    name: 'Plus',
    monthlyPrice: 9.99,
    yearlyPrice: 79,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
  },
} as const

// ── Stripe trial days (configurable via ENV) ──────────────────────────────────
export const STRIPE_TRIAL_DAYS = parseInt(process.env.STRIPE_TRIAL_DAYS || '7', 10)

// ── Free plan limits ──────────────────────────────────────────────────────

export const FREE_TONIGHT_SWIPE_LIMIT = 3 // Free users: 3 swipes/day
export const FREE_PLAN_PREVIEW_DAYS = 3   // Free users: 3-day week preview
export const FREE_DAILY_GENERATIONS = 3   // Free users: 3 meal generations/day

// ── Pro tier unlocks ─────────────────────────────────────────────────────

export const PRO_UNLOCKS = [
  'Full 7-day Weekly Autopilot',
  'Unlimited Tonight swaps and fridge scans',
  'Smart grocery lists with pantry deductions',
  'Leftovers AI with use-before-expiry nudges',
  'Budget Intelligence with cheaper meal swaps',
  'Household memory for preferences and dislikes',
] as const

// ── Savings calculations ──────────────────────────────────────────────────

export const PRO_ANNUAL_SAVINGS = Math.round((1 - PRICING_TIERS.pro.yearlyPrice / (PRICING_TIERS.pro.monthlyPrice * 12)) * 100) // 34% ($79/yr vs $119.88/yr)

export const ROI_ASSUMPTIONS = {
  avoidedTakeoutNight: 38,
  weeklyWasteReduction: 12,
  monthlyWasteReduction: 48,
  monthlyBreakEvenEvents: 1,
} as const

export const ROI_UNLOCKS = [
  'Avoid one takeout night and Plus can pay for the month',
  'Use aging pantry and leftovers before they become waste',
  'Swap expensive dinners before the grocery cart gets painful',
  'Keep the whole household aligned so duplicate shopping drops',
] as const

// ── Tier normalization & checks ───────────────────────────────────────────

export function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  if (tier === 'pro' || tier === 'plus') return 'pro'
  return 'free'
}

export function isProTier(tier: SubscriptionTier | string | null | undefined): boolean {
  const normalized = typeof tier === 'string' ? normalizeTier(tier) : 'free'
  return normalized === 'pro'
}
