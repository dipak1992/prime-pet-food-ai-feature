// ============================================================
// Grocery Commerce — Provider: Walmart Canada
// ============================================================

import type { GroceryProvider } from '../types'

export const walmartCA: GroceryProvider = {
  id: 'walmart_ca',
  name: 'walmart_canada',
  displayName: 'Walmart Canada',
  icon: '🛒',
  supportedCountries: ['CA'],
  fulfillmentTypes: ['pickup', 'delivery'],
  estimatedMarkup: 0,
  deliveryFeeRange: [0, 9.97],
  searchUrlTemplate: 'https://www.walmart.ca/search?q={{query}}',
  multiItemSearchUrl: 'https://www.walmart.ca/search?q={{items}}',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: '1-3 hours',
  estimatedPickupTime: 'Today',
  color: '#0071DC',
  description: 'Everyday low prices with free pickup across Canada.',
}
