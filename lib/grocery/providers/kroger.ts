// ============================================================
// Grocery Commerce — Provider: Kroger
// ============================================================

import type { GroceryProvider } from '../types'

export const kroger: GroceryProvider = {
  id: 'kroger',
  name: 'kroger',
  displayName: 'Kroger',
  icon: '🛍️',
  supportedCountries: ['US'],
  fulfillmentTypes: ['pickup', 'delivery'],
  estimatedMarkup: 3,
  deliveryFeeRange: [0, 9.95],
  searchUrlTemplate: 'https://www.kroger.com/search?query={{query}}',
  multiItemSearchUrl: 'https://www.kroger.com/search?query={{items}}',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: 'Same day',
  estimatedPickupTime: 'Today',
  color: '#004B91',
  description: 'Search your list at Kroger for pickup or delivery in supported markets.',
}
