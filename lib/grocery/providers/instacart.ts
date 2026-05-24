// ============================================================
// Grocery Commerce — Provider: Instacart
// ============================================================

import type { GroceryProvider } from '../types'

export const instacart: GroceryProvider = {
  id: 'instacart',
  name: 'instacart',
  displayName: 'Instacart',
  icon: '🚚',
  supportedCountries: ['US', 'CA'],
  fulfillmentTypes: ['delivery'],
  estimatedMarkup: 15, // ~15% markup on items
  deliveryFeeRange: [3.99, 9.99],
  searchUrlTemplate: 'https://www.instacart.com/store/search/{{query}}',
  multiItemSearchUrl: 'https://www.instacart.com/store/search/{{items}}',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: 'As fast as 1 hour',
  estimatedPickupTime: undefined,
  color: '#43B02A',
  description: 'Fast delivery from local stores. Shop multiple retailers.',
}
