/**
 * Centralised environment variable access.
 * Only browser-safe variables live here. Do not add server secrets to this file:
 * client components import it directly.
 */

// ─── Public (browser-safe) ────────────────────────────────────────────────────

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mealeaseai.com',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  // Stripe price IDs (public, used on client for pricing display)
  stripePricingTierPro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY ?? '',
  },
  webPushPublicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '',
} as const

// ─── Runtime validation (call once at startup for critical keys) ──────────────

export function assertEnv(
  keys: Array<keyof typeof publicEnv>,
  context = 'startup'
) {
  const missing = keys.filter((k) => !publicEnv[k])
  if (missing.length > 0) {
    throw new Error(`[env] Missing required env vars in ${context}: ${missing.join(', ')}`)
  }
}
