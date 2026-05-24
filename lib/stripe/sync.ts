import { stripe } from '@/lib/stripe/client'
import type { PlanId } from './plans'

/**
 * Syncs a Stripe subscription to the user's profile row.
 * Idempotent — safe to call from multiple webhook events.
 */
export async function syncSubscriptionToProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  subscriptionId: string,
) {
  // Cast through unknown to handle Stripe v22 Response<Subscription> wrapper
  const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as {
    id: string
    status: string
    metadata: Record<string, string>
    items: { data: Array<{ price: { id: string } }> }
    current_period_end: number
    customer: string | { id: string }
  }

  const userId = sub.metadata?.supabase_user_id
  if (!userId) {
    console.warn('[stripe sync] missing supabase_user_id on subscription', subscriptionId)
    return
  }

  const priceId = sub.items.data[0]?.price?.id
  const plan: PlanId = matchPlan(priceId)
  const status = mapStatus(sub.status)
  const renewsAt = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  const customerId =
    typeof sub.customer === 'string' ? sub.customer : (sub.customer as { id: string }).id

  await supabase
    .from('profiles')
    .update({
      plan,
      plan_status: status,
      plan_renews_at: renewsAt,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
    })
    .eq('id', userId)
}

export async function clearSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  subscriptionId: string,
) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = sub.metadata?.supabase_user_id
  if (!userId) return

  await supabase
    .from('profiles')
    .update({
      plan: 'free',
      plan_status: 'canceled',
      plan_renews_at: null,
      stripe_subscription_id: null,
    })
    .eq('id', userId)
}

function matchPlan(priceId: string | undefined): PlanId {
  if (priceId === process.env.STRIPE_PLUS_PRICE_ID) return 'plus'
  return 'free'
}

function mapStatus(s: string): 'active' | 'past_due' | 'canceled' | 'paused' {
  if (s === 'active' || s === 'trialing') return 'active'
  if (s === 'past_due' || s === 'unpaid') return 'past_due'
  if (s === 'canceled' || s === 'incomplete_expired') return 'canceled'
  if (s === 'paused') return 'paused'
  return 'canceled'
}
