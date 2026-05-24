// ============================================================
// Grocery Commerce — Provider Comparison Engine
// Generates estimated price comparisons across providers
// ============================================================

import type { GroceryProvider, ProviderEstimate, ProviderCartItem, FulfillmentType } from './types'
import type { GroceryList } from '@/lib/planner/types'
import { getProvidersForRegion } from './providers/registry'
import type { DetectedRegion } from './types'

const warnedProviders = new Set<string>()
const PREFERRED_PROVIDER_BOOST = -1000

/**
 * Build optimized search queries for grocery items.
 * Strips unnecessary words, keeps brand-relevant terms.
 */
function buildSearchQuery(name: string, quantity: number, unit: string): string {
  // Remove common filler words for better search results
  const fillers = ['of', 'the', 'a', 'an', 'some', 'fresh', 'organic']
  const words = name.split(' ').filter((w) => !fillers.includes(w.toLowerCase()))
  const cleanName = words.join(' ')

  // For small quantities, just use the name
  if (quantity <= 1 && (unit === 'whole' || unit === 'unit')) {
    return cleanName
  }

  return `${cleanName} ${quantity} ${unit}`
}

/**
 * Convert grocery list items to provider cart items with optimized search queries.
 */
export function buildProviderCartItems(groceryList: GroceryList): ProviderCartItem[] {
  return groceryList.items
    .filter((item) => !item.isInPantry && !item.isChecked)
    .map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      searchQuery: buildSearchQuery(item.name, item.quantity, item.unit),
    }))
}

/**
 * Generate a search URL for a provider with multiple items.
 */
export function buildProviderSearchUrl(
  provider: GroceryProvider,
  items: ProviderCartItem[]
): string {
  const combinedQuery = buildCombinedProviderQuery(provider, items)
  const encoded = encodeURIComponent(combinedQuery)
  const template = provider.multiItemSearchUrl ?? provider.searchUrlTemplate
  const url = template
    .replace('{{items}}', encoded)
    .replace('{{query}}', encoded)
  return appendAffiliateParams(url, provider.id)
}

/**
 * Generate a single-item search URL.
 */
export function buildSingleItemSearchUrl(
  provider: GroceryProvider,
  item: ProviderCartItem
): string {
  const encoded = encodeURIComponent(item.searchQuery)
  return appendAffiliateParams(provider.searchUrlTemplate.replace('{{query}}', encoded), provider.id)
}

function appendAffiliateParams(url: string, providerId: GroceryProvider['id']): string {
  const params = new URLSearchParams()
  if (providerId === 'instacart' && process.env.NEXT_PUBLIC_INSTACART_AFFILIATE_ID) {
    params.set('irgwc', process.env.NEXT_PUBLIC_INSTACART_AFFILIATE_ID)
  }
  if ((providerId === 'walmart_us' || providerId === 'walmart_ca') && process.env.NEXT_PUBLIC_WALMART_AFFILIATE_ID) {
    params.set('veh', 'aff')
    params.set('affiliates_ad_id', process.env.NEXT_PUBLIC_WALMART_AFFILIATE_ID)
  }
  if (providerId === 'amazon_fresh' && process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID) {
    params.set('tag', process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID)
  }
  if (providerId === 'kroger' && process.env.NEXT_PUBLIC_KROGER_AFFILIATE_ID) {
    params.set('cid', process.env.NEXT_PUBLIC_KROGER_AFFILIATE_ID)
  }
  if (process.env.NODE_ENV === 'development' && params.size === 0) {
    const missingEnv =
      providerId === 'instacart'
        ? 'NEXT_PUBLIC_INSTACART_AFFILIATE_ID'
        : providerId === 'amazon_fresh'
          ? 'NEXT_PUBLIC_AMAZON_AFFILIATE_ID'
        : providerId === 'kroger'
          ? 'NEXT_PUBLIC_KROGER_AFFILIATE_ID'
          : providerId === 'walmart_us' || providerId === 'walmart_ca'
            ? 'NEXT_PUBLIC_WALMART_AFFILIATE_ID'
            : null
    if (missingEnv && !warnedProviders.has(providerId)) {
      warnedProviders.add(providerId)
      console.warn(`[grocery] ${providerId} link opened without ${missingEnv}`)
    }
  }
  if (params.size === 0) return url
  return `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
}

function buildCombinedProviderQuery(
  provider: GroceryProvider,
  items: ProviderCartItem[]
): string {
  const maxItems =
    provider.id === 'instacart'
      ? 8
      : provider.id === 'costco_us' || provider.id === 'costco_ca'
        ? 6
        : 10
  const selected = items
    .slice(0, maxItems)
    .map((item) => item.searchQuery.trim())
    .filter(Boolean)

  if (selected.length === 0) return ''

  if (provider.id === 'instacart') {
    return selected.join(' ')
  }

  if (provider.id === 'kroger') {
    return selected.join(', ')
  }

  if (provider.id === 'amazon_fresh') {
    return selected.join(' ')
  }

  if (provider.id === 'costco_us' || provider.id === 'costco_ca') {
    return selected.join(' bulk ')
  }

  if (provider.id === 'regional_market') {
    return selected.join(' ')
  }

  return selected.join(', ')
}

/**
 * Estimate total cost for a provider based on grocery list.
 * Uses base estimated cost + provider markup + delivery fees.
 */
function estimateProviderTotal(
  provider: GroceryProvider,
  groceryList: GroceryList,
  fulfillmentType: FulfillmentType
): { total: number; deliveryFee: number } {
  const baseCost = groceryList.totalEstimatedCost
  const markupAmount = baseCost * (provider.estimatedMarkup / 100)
  const itemTotal = baseCost + markupAmount

  // Delivery fee: use midpoint of range for delivery, 0 for pickup
  let deliveryFee = 0
  if (fulfillmentType === 'delivery') {
    deliveryFee = (provider.deliveryFeeRange[0] + provider.deliveryFeeRange[1]) / 2
  }

  return {
    total: Math.round((itemTotal + deliveryFee) * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
  }
}

/**
 * Generate provider comparison estimates for a grocery list.
 */
export function compareProviders(
  groceryList: GroceryList,
  region: DetectedRegion,
  preferredStore?: string | null
): ProviderEstimate[] {
  const providers = getProvidersForRegion(region)
  const cartItems = buildProviderCartItems(groceryList)

  if (cartItems.length === 0) return []

  const estimates: ProviderEstimate[] = []

  for (const provider of providers) {
    // Generate estimates for each fulfillment type
    const preferredFulfillment: FulfillmentType =
      provider.fulfillmentTypes.includes('pickup') ? 'pickup' : 'delivery'

    const { total, deliveryFee } = estimateProviderTotal(
      provider,
      groceryList,
      preferredFulfillment
    )

    const estimatedTime =
      preferredFulfillment === 'pickup'
        ? provider.estimatedPickupTime ?? 'Today'
        : provider.estimatedDeliveryTime ?? '1-3 hours'

    estimates.push({
      providerId: provider.id,
      provider,
      estimatedTotal: total,
      estimatedDeliveryFee: deliveryFee,
      estimatedTime,
      itemCount: cartItems.length,
      fulfillmentType: preferredFulfillment,
      searchUrl: buildProviderSearchUrl(provider, cartItems),
      confidence: groceryList.totalEstimatedCost > 0 ? 'medium' : 'low',
      cartHandoffMode: provider.cartHandoffMode,
      pricingConfidence: provider.pricingConfidence,
      availabilityConfidence: provider.availabilityConfidence,
      readinessLabel: getReadinessLabel(provider),
    })
  }

  // Sort with preferred store first, then by estimated total.
  estimates.sort((a, b) => {
    const aScore = scoreEstimate(a, preferredStore)
    const bScore = scoreEstimate(b, preferredStore)
    return aScore - bScore
  })

  return estimates
}

function scoreEstimate(estimate: ProviderEstimate, preferredStore?: string | null): number {
  const normalizedPreferred = normalizeProviderName(preferredStore)
  const normalizedDisplay = normalizeProviderName(estimate.provider.displayName)
  const normalizedName = normalizeProviderName(estimate.provider.name)
  const preferredBoost =
    normalizedPreferred &&
    (normalizedPreferred === normalizedDisplay || normalizedPreferred === normalizedName)
      ? PREFERRED_PROVIDER_BOOST
      : 0

  return estimate.estimatedTotal + preferredBoost
}

function normalizeProviderName(value?: string | null): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, '_')
}

function getReadinessLabel(provider: GroceryProvider): string {
  if (provider.cartHandoffMode === 'cart_api') return 'Cart API ready'
  if (provider.cartHandoffMode === 'multi_item_search') return 'List handoff ready'
  return 'First item search'
}
