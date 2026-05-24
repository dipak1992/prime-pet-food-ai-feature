// ============================================================
// Grocery Commerce — Provider Registry
// Central registry for all grocery providers
// ============================================================

import type { GroceryProvider, ProviderId, DetectedRegion, SupportedCountry } from '../types'
import { walmartUS } from './walmart'
import { walmartCA } from './walmart-canada'
import { instacart } from './instacart'
import { amazonFresh } from './amazon-fresh'
import { kroger } from './kroger'
import { costcoUS, costcoCA } from './costco'
import { regionalMarket } from './regional-market'

/** All registered providers */
const ALL_PROVIDERS: GroceryProvider[] = [
  walmartUS,
  walmartCA,
  instacart,
  amazonFresh,
  kroger,
  costcoUS,
  costcoCA,
  regionalMarket,
]

/** Provider map for O(1) lookup */
const PROVIDER_MAP = new Map<ProviderId, GroceryProvider>(
  ALL_PROVIDERS.map((p) => [p.id, p])
)

/** Get a provider by ID */
export function getProvider(id: ProviderId): GroceryProvider | undefined {
  return PROVIDER_MAP.get(id)
}

/** Get all providers available for a given region */
export function getProvidersForRegion(region: DetectedRegion): GroceryProvider[] {
  if (region === 'OTHER') return []
  return ALL_PROVIDERS.filter((p) =>
    p.supportedCountries.includes(region as SupportedCountry)
  )
}

/** Check if a region has provider support */
export function hasProviderSupport(region: DetectedRegion): boolean {
  return region === 'US' || region === 'CA'
}

/** Get all registered providers */
export function getAllProviders(): GroceryProvider[] {
  return [...ALL_PROVIDERS]
}
