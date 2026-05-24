// ============================================================
// API: POST /api/webhook/stripe
// Handles Stripe webhook events to sync subscription state
// with the Supabase profiles table.
//
// Events handled:
//   checkout.session.completed    → upgrade user to pro
//   customer.subscription.updated → sync tier on plan change
//   customer.subscription.deleted → downgrade to free
//   invoice.payment_failed        → log (no immediate downgrade)
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'
import { serverEnv } from '@/lib/server-env'
import { mapPriceIdToTier } from '@/lib/paywall/stripe-mapping'
import type { SubscriptionTier } from '@/types'
import {
  alertAdminBillingEvent,
  alertAdminFailedPayment,
  alertAdminNewPro,
  sendCancellationConfirmationEmail,
  sendFailedPaymentEmail,
  sendPaymentReceiptEmail,
  sendProConfirmationEmail,
  sendRefundConfirmationEmail,
  sendTrialStartedEmail,
} from '@/lib/email/triggers'

// Use service-role client so we can update any user's profile (bypasses RLS)
function adminSupabase() {
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey)
}

type AdminClient = ReturnType<typeof adminSupabase>

type ProfileForEmail = {
  id: string
  email: string | null
  full_name: string | null
  subscription_tier?: string | null
}

function firstName(profile?: ProfileForEmail | null): string | undefined {
  return profile?.full_name?.split(' ')[0] || undefined
}

function formatMoney(cents?: number | null, currency = 'usd'): string | undefined {
  if (typeof cents !== 'number') return undefined
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

async function getProfileById(supabase: AdminClient, userId: string): Promise<ProfileForEmail | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier')
    .eq('id', userId)
    .maybeSingle()
  return (data as ProfileForEmail | null) ?? null
}

async function getProfileByCustomer(supabase: AdminClient, customerId: string): Promise<ProfileForEmail | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return (data as ProfileForEmail | null) ?? null
}

// ── Stripe signature verification (no SDK) ────────────────────────────────────

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => p.split('=')),
  ) as Record<string, string>

  const timestamp = parts['t']
  const signatures = sigHeader
    .split(',')
    .filter((p) => p.startsWith('v1='))
    .map((p) => p.slice(3))

  if (!timestamp || signatures.length === 0) return false

  // Replay-attack guard: reject webhooks older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) {
    console.warn('[stripe-webhook] Rejecting stale event, age:', age, 's')
    return false
  }

  const signedPayload = `${timestamp}.${payload}`
  const keyData = new TextEncoder().encode(secret)
  const msgData = new TextEncoder().encode(signedPayload)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signatures.some((sig) => sig === expected)
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Record<string, unknown>) {
  const metadata = session['metadata'] as Record<string, unknown> | null
  const userId =
    (session['client_reference_id'] as string | null) ??
    (metadata?.supabase_user_id as string | undefined) ??
    (metadata?.user_id as string | undefined) ??
    null
  const customerId = session['customer'] as string | null
  const subscriptionId = session['subscription'] as string | null

  if (!userId || !customerId) {
    console.error('[stripe-webhook] checkout.session.completed missing user/customer')
    return
  }

  // Extract tier from metadata (plan selected during checkout)
  let tier: SubscriptionTier = 'pro'
  if (metadata?.plan) {
    const plan = String(metadata.plan)
    if (plan.includes('pro')) tier = 'pro'
  }

  const supabase = adminSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId ?? null,
      trial_started_at: null, // Clear trial flag when they convert
    })
    .eq('id', userId)

  if (error) {
    console.error('[stripe-webhook] checkout update failed:', error.message)
  } else {
    console.log(`[stripe-webhook] upgraded user ${userId} to ${tier}`)
    const profile = await getProfileById(supabase, userId)
    const email = profile?.email ?? (session['customer_email'] as string | null)
    if (email) {
      void sendProConfirmationEmail({
        to: email,
        firstName: firstName(profile),
        planName: 'Plus',
        subscriptionId: subscriptionId ?? undefined,
      })
      void alertAdminNewPro({
        userEmail: email,
        userId,
        planName: 'Plus',
      })
    }
  }
}

async function handleSubscriptionUpserted(sub: Record<string, unknown>) {
  const customerId = sub['customer'] as string | null
  const subscriptionId = sub['id'] as string | null
  const status = sub['status'] as string
  const items = sub['items'] as Record<string, unknown> | undefined
  const itemsData = items?.['data'] as Array<Record<string, unknown>> | undefined

  if (!customerId) {
    console.error('[stripe-webhook] subscription event missing customer')
    return
  }

  // Extract price ID from subscription items
  let priceId: string | undefined
  let tier: SubscriptionTier = 'free'
  let billingInterval: 'monthly' | 'yearly' | null = null

  if (itemsData && itemsData.length > 0) {
    const price = itemsData[0]['price'] as Record<string, unknown> | undefined
    priceId = price?.['id'] as string | undefined

    // Map price ID to tier
    if (priceId) {
      const mapping = mapPriceIdToTier(priceId)
      if (mapping) {
        tier = mapping.tier
        billingInterval = mapping.interval
      }
    }
  }

  // If subscription is not active/trialing, downgrade to free
  if (status !== 'active' && status !== 'trialing') {
    tier = 'free'
    billingInterval = null
  }

  const supabase = adminSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      stripe_subscription_id: subscriptionId ?? null,
      stripe_price_id: priceId ?? null,
      billing_interval: billingInterval,
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[stripe-webhook] subscription upsert failed:', error.message)
  } else {
    console.log(
      `[stripe-webhook] subscription synced → ${tier} (${billingInterval}) for customer: ${customerId}`,
    )
    if (status === 'trialing') {
      const profile = await getProfileByCustomer(supabase, customerId)
      if (profile?.email) {
        const trialEndSeconds = sub['trial_end'] as number | undefined
        const trialEndDate = trialEndSeconds
          ? new Date(trialEndSeconds * 1000).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : undefined
        void sendTrialStartedEmail({
          to: profile.email,
          firstName: firstName(profile),
          trialDays: serverEnv.stripeTrialDays || 7,
          trialEndDate,
          subscriptionId: subscriptionId ?? undefined,
        })
      }
    }
  }
}

async function handleSubscriptionDeleted(sub: Record<string, unknown>) {
  const customerId = sub['customer'] as string | null
  if (!customerId) return

  const supabase = adminSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      stripe_subscription_id: null,
      stripe_price_id: null,
      billing_interval: null,
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[stripe-webhook] subscription delete failed:', error.message)
  } else {
    console.log('[stripe-webhook] downgraded to free for customer:', customerId)
    const profile = await getProfileByCustomer(supabase, customerId)
    if (profile?.email) {
      void sendCancellationConfirmationEmail({
        to: profile.email,
        firstName: firstName(profile),
        subscriptionId: (sub['id'] as string | undefined) ?? undefined,
      })
      void alertAdminBillingEvent({
        title: 'Subscription cancelled',
        userEmail: profile.email,
        userId: profile.id,
        event: 'customer.subscription.deleted',
      })
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Record<string, unknown>) {
  const customerId = invoice['customer'] as string | null
  if (!customerId) return

  const supabase = adminSupabase()
  const profile = await getProfileByCustomer(supabase, customerId)
  if (!profile?.email) return

  const invoiceId = invoice['id'] as string | undefined
  const amount = formatMoney(invoice['amount_paid'] as number | undefined, (invoice['currency'] as string | undefined) ?? 'usd')
  const invoiceUrl = (invoice['hosted_invoice_url'] as string | undefined) ?? (invoice['invoice_pdf'] as string | undefined)
  const created = invoice['created'] as number | undefined
  const date = created
    ? new Date(created * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  void sendPaymentReceiptEmail({
    to: profile.email,
    firstName: firstName(profile),
    amount: amount ?? 'Paid',
    date,
    invoiceId,
    invoiceUrl,
    planName: 'Plus',
  })
}

async function handleInvoicePaymentFailed(invoice: Record<string, unknown>) {
  const customerId = invoice['customer'] as string | null
  if (!customerId) return

  const supabase = adminSupabase()
  const profile = await getProfileByCustomer(supabase, customerId)
  if (!profile?.email) return

  const invoiceId = invoice['id'] as string | undefined
  const amount = formatMoney(invoice['amount_due'] as number | undefined, (invoice['currency'] as string | undefined) ?? 'usd')
  const invoiceUrl = invoice['hosted_invoice_url'] as string | undefined

  void sendFailedPaymentEmail({
    to: profile.email,
    firstName: firstName(profile),
    amount,
    invoiceId,
    invoiceUrl,
  })
  void alertAdminFailedPayment({
    userEmail: profile.email,
    userId: profile.id,
    amount,
    reason: 'Stripe invoice.payment_failed',
  })
}

async function handleChargeRefunded(charge: Record<string, unknown>) {
  const customerId = charge['customer'] as string | null
  if (!customerId) return

  const supabase = adminSupabase()
  const profile = await getProfileByCustomer(supabase, customerId)
  if (!profile?.email) return

  const refundContainer = charge['refunds'] as Record<string, unknown> | undefined
  const refunds = refundContainer?.['data'] as Array<Record<string, unknown>> | undefined
  const refund = refunds?.[0]
  const refundId = refund?.['id'] as string | undefined
  const amount = formatMoney((refund?.['amount'] as number | undefined) ?? (charge['amount_refunded'] as number | undefined), (charge['currency'] as string | undefined) ?? 'usd')

  void sendRefundConfirmationEmail({
    to: profile.email,
    firstName: firstName(profile),
    amount,
    refundId,
  })
  void alertAdminBillingEvent({
    title: 'Refund processed',
    userEmail: profile.email,
    userId: profile.id,
    event: 'charge.refunded',
    amount,
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const webhookSecret = serverEnv.stripeWebhookSecret
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const sigHeader = req.headers.get('stripe-signature') ?? ''
  const payload = await req.text()

  const valid = await verifyStripeSignature(payload, sigHeader, webhookSecret)
  if (!valid) {
    console.warn('[stripe-webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { id?: string; type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!event.id) {
    console.warn('[stripe-webhook] Missing event id')
    return NextResponse.json({ error: 'Missing event id' }, { status: 400 })
  }

  const supabase = adminSupabase()
  const { error: claimError } = await supabase
    .from('stripe_webhook_events')
    .insert({ id: event.id, event_type: event.type })

  if (claimError) {
    if (claimError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    console.error('[stripe-webhook] idempotency claim error:', claimError)
    return NextResponse.json({ error: 'Webhook persistence error' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpserted(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err)
    await supabase
      .from('stripe_webhook_events')
      .delete()
      .eq('id', event.id)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
