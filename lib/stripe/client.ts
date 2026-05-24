import Stripe from 'stripe'

// Lazy singleton — only instantiated when first used (not at module evaluation)
let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  _stripe = new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  })
  return _stripe
}

// Named export for convenience — resolves lazily
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripeClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
