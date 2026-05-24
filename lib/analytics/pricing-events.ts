/**
 * Pricing & Subscription Analytics Events
 * Track all pricing page interactions and conversion flows
 */

import posthog from 'posthog-js'

export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_yearly'

// ─── Pricing Page Events ────────────────────────────────────────────────────

export function trackPricingPageView() {
  posthog.capture('pricing_page_views', {
    timestamp: new Date().toISOString(),
  })
}

export function trackBillingToggle(toggle: 'monthly' | 'annual') {
  posthog.capture(`pricing_${toggle}_toggle`, {
    billing_cycle: toggle,
    timestamp: new Date().toISOString(),
  })
}

// ─── CTA Clicks ─────────────────────────────────────────────────────────────

export function trackStartFreeClick() {
  posthog.capture('pricing_cta_start_free', {
    action: 'click',
    location: 'pricing_page',
  })
}

export function trackUpgradeClick(plan: 'pro') {
  posthog.capture('pricing_cta_upgrade', {
    plan,
    action: 'click',
  })
}

export function trackCompareClick() {
  posthog.capture('pricing_cta_compare', {
    action: 'click',
  })
}

export function trackFaqAccordionOpen(question: string) {
  posthog.capture('pricing_faq_open', {
    question,
  })
}

// ─── Checkout Flow ──────────────────────────────────────────────────────────

export function trackCheckoutInitiated(plan: SubscriptionPlan) {
  posthog.capture('checkout_initiated', {
    plan,
    timestamp: new Date().toISOString(),
  })
}

export function trackCheckoutCompleted(plan: SubscriptionPlan, amount: number) {
  posthog.capture('checkout_completed', {
    plan,
    amount,
    timestamp: new Date().toISOString(),
  })
}

export function trackCheckoutAbandoned(plan: SubscriptionPlan, reason?: string) {
  posthog.capture('checkout_abandoned', {
    plan,
    reason,
    timestamp: new Date().toISOString(),
  })
}

// ─── Trial Flow ─────────────────────────────────────────────────────────────

export function trackTrialStarted(plan: 'pro' = 'pro') {
  posthog.capture('trial_started', {
    plan,
    trial_days: 7,
    timestamp: new Date().toISOString(),
  })
}

export function trackTrialConvertedToPaid(plan: SubscriptionPlan, trialDays: number) {
  posthog.capture('trial_converted_to_paid', {
    plan,
    trial_days: trialDays,
    timestamp: new Date().toISOString(),
  })
}

export function trackTrialExpiredNoConversion(plan: 'pro') {
  posthog.capture('trial_expired_no_conversion', {
    plan,
    timestamp: new Date().toISOString(),
  })
}

// ─── Paywall Conversions ────────────────────────────────────────────────────

export function trackPaywallShown(feature: string, tier: 'pro') {
  posthog.capture('paywall_shown', {
    feature,
    required_tier: tier,
  })
}

export function trackPaywallConverted(feature: string, plan: SubscriptionPlan) {
  posthog.capture('paywall_conversion', {
    feature,
    plan,
    timestamp: new Date().toISOString(),
  })
}

export function trackPaywallDismissed(feature: string, reason?: string) {
  posthog.capture('paywall_dismissed', {
    feature,
    reason,
  })
}

// ─── Plan Comparisons ───────────────────────────────────────────────────────

export function trackComparisonTableView() {
  posthog.capture('comparison_table_viewed', {
    timestamp: new Date().toISOString(),
  })
}

export function trackPlanCompared(planA: 'free' | 'pro', planB: 'free' | 'pro') {
  posthog.capture('plan_compared', {
    plan_a: planA,
    plan_b: planB,
  })
}

// ─── Subscription Management ────────────────────────────────────────────────

export function trackPlanUpgraded(fromPlan: SubscriptionPlan, toPlan: SubscriptionPlan) {
  posthog.capture('plan_upgraded', {
    from_plan: fromPlan,
    to_plan: toPlan,
    timestamp: new Date().toISOString(),
  })
}

export function trackPlanDowngraded(fromPlan: SubscriptionPlan, toPlan: SubscriptionPlan) {
  posthog.capture('plan_downgraded', {
    from_plan: fromPlan,
    to_plan: toPlan,
    timestamp: new Date().toISOString(),
  })
}

export function trackSubscriptionCancelled(plan: SubscriptionPlan, reason?: string) {
  posthog.capture('subscription_cancelled', {
    plan,
    reason,
    timestamp: new Date().toISOString(),
  })
}

export function trackSubscriptionReactivated(plan: SubscriptionPlan) {
  posthog.capture('subscription_reactivated', {
    plan,
    timestamp: new Date().toISOString(),
  })
}

// ─── Conversion Metrics ─────────────────────────────────────────────────────

export function trackConversionFunnel(step: 'view' | 'compare' | 'checkout' | 'complete', plan: SubscriptionPlan) {
  posthog.capture(`conversion_funnel_${step}`, {
    plan,
    timestamp: new Date().toISOString(),
  })
}
