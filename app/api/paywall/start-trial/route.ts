// ============================================================
// API: POST /api/paywall/start-trial
// Starts a free trial by setting temp_pro_until.
// One-time only per user.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { sendTrialStartedEmail } from '@/lib/email/triggers'
import { serverEnv } from '@/lib/server-env'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  // 10 attempts per minute per IP — prevents trial farming via rapid account creation
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Login required to start trial' }, { status: 401 })
    }

    const tier = 'pro'

    // Check existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, temp_pro_until, trial_started_at, full_name')
      .eq('id', user.id)
      .maybeSingle()

    // Already has paid subscription → no trial needed
    if (profile?.subscription_tier === 'pro') {
      return NextResponse.json(
        { error: 'You already have a paid subscription. No trial needed.' },
        { status: 400 },
      )
    }

    // Already started a trial before
    if (profile?.trial_started_at) {
      return NextResponse.json(
        { error: 'You\'ve already used your free trial. Upgrade to continue.' },
        { status: 400 },
      )
    }

    const now = new Date()
    const trialDays = serverEnv.stripeTrialDays || 7
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)

    const serviceClient = createSupabaseServiceClient()
    const { error: upsertError } = await serviceClient.from('profiles').upsert(
      {
        id: user.id,
        email: user.email ?? null,
        subscription_tier: 'free',
        temp_pro_until: trialEnd.toISOString(),
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
      },
      { onConflict: 'id' },
    )

    if (upsertError) {
      console.error('[start-trial] upsert error:', upsertError)
      return NextResponse.json({ error: 'Could not start trial. Try again.' }, { status: 500 })
    }

    // Fire trial-started email (non-blocking)
    if (user.email) {
      const firstName = profile?.full_name?.split(' ')[0] ?? undefined
      void sendTrialStartedEmail({
        to: user.email,
        firstName,
        trialDays,
        trialEndDate: trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      })
    }

    return NextResponse.json({
      success: true,
      tempProUntil: trialEnd.toISOString(),
      trialDays,
      tier,
    })
  } catch (err) {
    console.error('[start-trial] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
