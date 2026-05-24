// ============================================================
// Grocery Commerce — Provider: Regional Market
// ============================================================

import type { GroceryProvider } from '../types'

export const regionalMarket: GroceryProvider = {
  id: 'regional_market',
  name: 'regional_market',
  displayName: 'Regional grocer',
  icon: '🏬',
  supportedCountries: ['US', 'CA'],
  fulfillmentTypes: ['pickup', 'delivery'],
  estimatedMarkup: 1,
  deliveryFeeRange: [0, 7.99],
  searchUrlTemplate: 'https://www.google.com/search?q={{query}}+grocery+near+me',
  multiItemSearchUrl: 'https://www.google.com/search?q={{items}}+grocery+near+me',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: 'Varies by local store',
  estimatedPickupTime: 'Varies by local store',
  color: '#047857',
  description: 'Fallback search for regional chains and local grocery providers.',
}
