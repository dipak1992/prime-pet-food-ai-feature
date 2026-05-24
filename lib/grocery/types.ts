// ============================================================
// Grocery Commerce — Types
// Core types for the provider adapter system
// ============================================================

/** Supported countries for grocery commerce */
export type SupportedCountry = 'US' | 'CA'

/** All possible countries (for region detection) */
export type DetectedRegion = SupportedCountry | 'OTHER'

/** Fulfillment method offered by a provider */
export type FulfillmentType = 'pickup' | 'delivery' | 'both'

/** How close MealEase can get to a completed retailer cart today */
export type CartHandoffMode = 'cart_api' | 'multi_item_search' | 'single_item_search'

/** How precise the provider estimate can be before the retailer page opens */
export type CommerceConfidence = 'live' | 'estimated' | 'store_dependent'

/** Provider identifier */
export type ProviderId =
  | 'walmart_us'
  | 'walmart_ca'
  | 'instacart'
  | 'amazon_fresh'
  | 'kroger'
  | 'costco_us'
  | 'costco_ca'
  | 'regional_market'

/** Provider definition */
export interface GroceryProvider {
  id: ProviderId
  name: string
  displayName: string
  icon: string
  supportedCountries: SupportedCountry[]
  fulfillmentTypes: FulfillmentType[]
  estimatedMarkup: number // percentage above base price (0 = no markup)
  deliveryFeeRange: [number, number] // [min, max] in USD
  searchUrlTemplate: string // template with {{query}} placeholder
  multiItemSearchUrl?: string // template with {{items}} placeholder
  cartBuilderSupported: boolean
  cartHandoffMode: CartHandoffMode
  pricingConfidence: CommerceConfidence
  availabilityConfidence: CommerceConfidence
  estimatedDeliveryTime?: string // e.g. "1-2 hours"
  estimatedPickupTime?: string // e.g. "Today"
  color: string // brand color for UI
  description: string
}

/** A single item formatted for provider handoff */
export interface ProviderCartItem {
  name: string
  quantity: number
  unit: string
  searchQuery: string // optimized search string for the provider
}

/** Result of a provider comparison */
export interface ProviderEstimate {
  providerId: ProviderId
  provider: GroceryProvider
  estimatedTotal: number
  estimatedDeliveryFee: number
  estimatedTime: string
  itemCount: number
  fulfillmentType: FulfillmentType
  searchUrl: string
  confidence: 'high' | 'medium' | 'low'
  cartHandoffMode: CartHandoffMode
  pricingConfidence: CommerceConfidence
  availabilityConfidence: CommerceConfidence
  readinessLabel: string
}

/** Export format for global fallback */
export type ExportFormat = 'text' | 'pdf' | 'email' | 'share'

/** Grocery analytics event names */
export type GroceryAnalyticsEvent =
  | 'grocery_page_view'
  | 'region_detected'
  | 'provider_options_shown'
  | 'walmart_selected'
  | 'instacart_selected'
  | 'kroger_selected'
  | 'costco_selected'
  | 'regional_provider_selected'
  | 'copy_list_clicked'
  | 'pdf_downloaded'
  | 'email_list_clicked'
  | 'share_list_clicked'
  | 'export_started'
  | 'export_completed'
  | 'grocery_list_edits'
  | 'plan_to_grocery_rate'
  | 'grocery_to_upgrade_rate'
  | 'provider_comparison_viewed'
  | 'provider_search_opened'
  | 'cart_builder_started'
