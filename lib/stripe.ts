import Stripe from 'stripe'
import { serverEnv } from '@/lib/server-env'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!serverEnv.stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(serverEnv.stripeSecretKey)
  }
  return _stripe
}
