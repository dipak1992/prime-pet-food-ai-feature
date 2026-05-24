import 'server-only'

/**
 * Server-only environment variables. Importing this module from a Client
 * Component fails the build, which prevents accidental secret exposure.
 */

export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  stripePricingTierPro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
  },
  stripeTrialDays: parseInt(process.env.STRIPE_TRIAL_DAYS ?? '7', 10),
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  webPushPrivateKey: process.env.WEB_PUSH_PRIVATE_KEY ?? '',
  webPushSubject: process.env.WEB_PUSH_SUBJECT ?? '',
} as const

export function assertServerEnv(keys: Array<keyof typeof serverEnv>, context = 'startup') {
  const missing = keys.filter((key) => !serverEnv[key])
  if (missing.length > 0) {
    throw new Error(`[env] Missing required server env vars in ${context}: ${missing.join(', ')}`)
  }
}
