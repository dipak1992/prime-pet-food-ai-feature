import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { serverEnv } from '@/lib/server-env'
import { getSiteUrl } from '@/lib/seo'
import { stripe } from '@/lib/stripe/client'
import { PLANS, type PlanId } from '@/lib/stripe/plans'
import { isStripePriceId, normalizeStripePriceId } from '@/lib/stripe/price-id'
import { validationError } from '@/lib/validation/input'
import { z } from 'zod'

const checkoutSchema = z.object({
  planId: z.enum(['plus']).optional(),
  plan: z.enum(['pro_monthly', 'pro_yearly']).optional(),
}).strict()

// ─── POST /api/stripe/checkout ────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = checkoutSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const { planId, plan } = parsed.data
    const validPlanId = typeof planId === 'string' && planId in PLANS
    const validLegacyPlan = plan === 'pro_monthly' || plan === 'pro_yearly'
    if (!validPlanId && !validLegacyPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const resolvedPlanId: PlanId = validPlanId ? planId as PlanId : 'plus'
    const billingInterval = plan === 'pro_yearly' ? 'yearly' : 'monthly'
    const selectedPlan = PLANS[resolvedPlanId]
    const configuredPriceId = plan === 'pro_yearly'
      ? serverEnv.stripePricingTierPro.yearly
      : plan === 'pro_monthly'
        ? serverEnv.stripePricingTierPro.monthly
        : selectedPlan?.stripePriceId
    const priceId = normalizeStripePriceId(configuredPriceId)
    if (!priceId || !isStripePriceId(priceId)) {
      return NextResponse.json(
        {
          error: 'billing_not_configured',
          message: 'Stripe checkout is not live yet. Email hello@mealeaseai.com to upgrade manually.',
        },
        { status: 503 },
      )
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId: string | undefined = profile?.stripe_customer_id ?? undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      const serviceClient = createSupabaseServiceClient()
      await serviceClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Validate origin against allowlist to prevent post-payment redirect to phishing pages
    const ALLOWED_ORIGINS = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      'https://mealeaseai.com',
      'https://www.mealeaseai.com',
      'http://localhost:3000',
    ].filter(Boolean) as string[]
    const rawOrigin = req.headers.get('origin') ?? ''
    const origin = ALLOWED_ORIGINS.includes(rawOrigin)
      ? rawOrigin.replace(/\/$/, '')
      : getSiteUrl().replace(/\/$/, '')
    const metadata = {
      supabase_user_id: user.id,
      user_id: user.id,
      plan_id: resolvedPlanId,
      plan: plan ?? resolvedPlanId,
      tier: 'pro',
      billing_interval: billingInterval,
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?cancelled=1`,
      client_reference_id: user.id,
      metadata,
      subscription_data: {
        metadata,
        ...(serverEnv.stripeTrialDays > 0
          ? { trial_period_days: serverEnv.stripeTrialDays }
          : {}),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json({ error: 'Payment setup failed. Please try again.' }, { status: 500 })
  }
}
