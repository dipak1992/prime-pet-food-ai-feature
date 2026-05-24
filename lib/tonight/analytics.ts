/**
 * Tonight Analytics Events
 * 
 * Track engagement with the Tonight system across landing and dashboard.
 * Uses PostHog (already integrated) for event tracking.
 */

type TonightEvent =
  | 'landing_tonight_viewed'
  | 'landing_signup_after_tonight'
  | 'dashboard_tonight_viewed'
  | 'swap_clicked'
  | 'cook_clicked'
  | 'upgrade_after_personalization_teaser'
  | 'plus_personalized_meal_engagement'

type EventProperties = {
  meal_id?: string
  meal_name?: string
  weekday_theme?: string
  is_personalized?: boolean
  swap_count?: number
  plan?: string
}

/**
 * Track a Tonight-related event.
 * Safe to call on server (no-ops) and client (fires to PostHog).
 */
export function trackTonightEvent(event: TonightEvent, properties?: EventProperties) {
  if (typeof window === 'undefined') return

  // PostHog capture (already available via providers)
  try {
    const posthog = (window as unknown as { posthog?: { capture: (e: string, p?: object) => void } }).posthog
    if (posthog?.capture) {
      posthog.capture(event, {
        ...properties,
        source: 'tonight_system',
        timestamp: new Date().toISOString(),
      })
    }
  } catch {
    // Silent fail — analytics should never break the app
  }
}
