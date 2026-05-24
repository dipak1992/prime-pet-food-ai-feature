// ============================================================
// Grocery Commerce — Analytics
// Track grocery-related events using existing PostHog setup
// ============================================================

import type { GroceryAnalyticsEvent, DetectedRegion, ProviderId } from './types'

type EventProperties = Record<string, string | number | boolean | null | undefined>

/**
 * Track a grocery commerce event.
 * Uses PostHog if available, falls back to console in dev.
 */
export function trackGroceryEvent(
  event: GroceryAnalyticsEvent,
  properties?: EventProperties
): void {
  // PostHog capture
  if (typeof window !== 'undefined' && 'posthog' in window) {
    const posthog = (window as unknown as { posthog: { capture: (event: string, props?: EventProperties) => void } }).posthog
    posthog.capture(event, {
      ...properties,
      feature: 'grocery_commerce',
    })
  }

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Grocery Analytics] ${event}`, properties)
  }
}

/** Track page view */
export function trackGroceryPageView(region: DetectedRegion, hasProviders: boolean): void {
  trackGroceryEvent('grocery_page_view', {
    region,
    has_providers: hasProviders,
  })
}

/** Track region detection */
export function trackRegionDetected(region: DetectedRegion): void {
  trackGroceryEvent('region_detected', { region })
}

/** Track provider selection */
export function trackProviderSelected(providerId: ProviderId, region: DetectedRegion): void {
  const eventMap: Record<string, GroceryAnalyticsEvent> = {
    walmart_us: 'walmart_selected',
    walmart_ca: 'walmart_selected',
    instacart: 'instacart_selected',
    kroger: 'kroger_selected',
    costco_us: 'costco_selected',
    costco_ca: 'costco_selected',
    regional_market: 'regional_provider_selected',
  }
  trackGroceryEvent(eventMap[providerId] ?? 'provider_search_opened', {
    provider_id: providerId,
    region,
  })
}

/** Track export action */
export function trackExportAction(
  action: 'copy' | 'pdf' | 'email' | 'share',
  itemCount: number
): void {
  const eventMap: Record<string, GroceryAnalyticsEvent> = {
    copy: 'copy_list_clicked',
    pdf: 'pdf_downloaded',
    email: 'email_list_clicked',
    share: 'share_list_clicked',
  }
  trackGroceryEvent(eventMap[action], { item_count: itemCount })
}

/** Track comparison view */
export function trackComparisonViewed(providerCount: number, region: DetectedRegion): void {
  trackGroceryEvent('provider_comparison_viewed', {
    provider_count: providerCount,
    region,
  })
}
