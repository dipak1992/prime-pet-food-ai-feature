// ============================================================
// Grocery Commerce — Provider: Amazon Fresh
// ============================================================

import type { GroceryProvider } from '../types'

export const amazonFresh: GroceryProvider = {
  id: 'amazon_fresh',
  name: 'amazon_fresh',
  displayName: 'Amazon Fresh',
  icon: '📦',
  supportedCountries: ['US'],
  fulfillmentTypes: ['delivery'],
  estimatedMarkup: 8,
  deliveryFeeRange: [0, 9.95],
  searchUrlTemplate: 'https://www.amazon.com/s?k={{query}}&i=amazonfresh',
  multiItemSearchUrl: 'https://www.amazon.com/s?k={{items}}&i=amazonfresh',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: 'Same-day windows',
  estimatedPickupTime: undefined,
  color: '#FF9900',
  description: 'Amazon Fresh grocery delivery and household staples.',
}
