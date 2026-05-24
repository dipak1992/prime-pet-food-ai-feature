// ============================================================
// Grocery Commerce — Provider: Costco
// ============================================================

import type { GroceryProvider } from '../types'

export const costcoUS: GroceryProvider = {
  id: 'costco_us',
  name: 'costco',
  displayName: 'Costco',
  icon: '📦',
  supportedCountries: ['US'],
  fulfillmentTypes: ['delivery', 'pickup'],
  estimatedMarkup: -4,
  deliveryFeeRange: [0, 9.99],
  searchUrlTemplate: 'https://www.costco.com/CatalogSearch?keyword={{query}}',
  multiItemSearchUrl: 'https://www.costco.com/CatalogSearch?keyword={{items}}',
  cartBuilderSupported: false,
  cartHandoffMode: 'multi_item_search',
  pricingConfidence: 'estimated',
  availabilityConfidence: 'store_dependent',
  estimatedDeliveryTime: 'Same day where available',
  estimatedPickupTime: 'Warehouse pickup where available',
  color: '#E31837',
  description: 'Bulk value for household staples, proteins, snacks, and recurring items.',
}

export const costcoCA: GroceryProvider = {
  ...costcoUS,
  id: 'costco_ca',
  displayName: 'Costco Canada',
  supportedCountries: ['CA'],
  searchUrlTemplate: 'https://www.costco.ca/CatalogSearch?keyword={{query}}',
  multiItemSearchUrl: 'https://www.costco.ca/CatalogSearch?keyword={{items}}',
}
