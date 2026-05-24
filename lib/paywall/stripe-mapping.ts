// ============================================================
// lib/paywall/stripe-mapping.ts
// Maps Stripe price IDs to MealEase tier and billing interval
// ============================================================

import type { SubscriptionTier } from '@/types'

export interface PriceMapping {
  tier: SubscriptionTier
  interval: 'monthly' | 'yearly'
  displayName: string
  monthlyEquivalent: number
}

/**
 * Map Stripe price ID to tier and billing interval.
 * This is the SOURCE OF TRUTH for plan identification.
 */
export function mapPriceIdToTier(priceId: string | undefined): PriceMapping | null {
  if (!priceId) return null

  // Environment-based price ID mapping
  // These MUST match exactly with Stripe dashboard
  const PRICE_MAPPINGS: Record<string, PriceMapping> = {
    // Pro tier
    [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: {
      tier: 'pro',
      interval: 'monthly',
      displayName: 'Plus Monthly',
      monthlyEquivalent: 9.99,
    },
    [process.env.STRIPE_PRICE_PRO_YEARLY || '']: {
      tier: 'pro',
      interval: 'yearly',
      displayName: 'Plus Yearly',
      monthlyEquivalent: 6.58, // $79/12 ≈ $6.58/month equivalent
    },
  }

  const mapping = PRICE_MAPPINGS[priceId]
  if (!mapping) {
    console.warn(`[stripe-mapping] Unknown price ID: ${priceId}`)
    return null
  }

  return mapping
}

/**
 * Extract tier from subscription metadata or price ID.
 * Used in webhook handlers to determine correct tier.
 */
export function extractTierFromSubscription(subscription: Record<string, unknown>): SubscriptionTier | null {
  // First, try to get from metadata (if we set it during checkout)
  const metadata = subscription['metadata'] as Record<string, unknown> | undefined
  if (metadata?.plan) {
    const plan = String(metadata.plan)
    if (plan.startsWith('pro')) return 'pro'
  }

  // Fall back to price ID extraction
  const items = subscription['items'] as Record<string, unknown> | undefined
  const itemsData = items?.['data'] as Array<Record<string, unknown>> | undefined
  if (itemsData && itemsData.length > 0) {
    const price = itemsData[0]['price'] as Record<string, unknown> | undefined
    const priceId = price?.['id'] as string | undefined

    const mapping = mapPriceIdToTier(priceId)
    if (mapping) return mapping.tier
  }

  return null
}

/**
 * Validate that price ID belongs to a specific tier.
 * Used for security checks.
 */
export function validatePriceForTier(
  priceId: string | undefined,
  expectedTier: SubscriptionTier,
): boolean {
  const mapping = mapPriceIdToTier(priceId)
  return mapping?.tier === expectedTier
}
