import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { getServerVapidConfig } from '@/lib/push/vapid'
import { apiRateLimited } from '@/lib/api-response'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Keep the test endpoint disabled in production unless explicitly enabled.
  const enableInProd = process.env.ENABLE_PUSH_TEST_ENDPOINT === 'true'
  if (process.env.NODE_ENV === 'production' && !enableInProd) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await rateLimit({
    key: `push-test:${user.id}:${rateLimitKeyFromRequest(req)}`,
    limit: 3,
    windowMs: 10 * 60_000,
  })
  if (!rl.success) return apiRateLimited(rl.reset)

  const vapid = getServerVapidConfig()
  if (!vapid) {
    return NextResponse.json({ error: 'VAPID keys are not configured' }, { status: 400 })
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  const { data: subscription, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to load push subscription' }, { status: 500 })
  }

  if (!subscription) {
    return NextResponse.json({ error: 'No active push subscription found' }, { status: 404 })
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: 'MealEase',
        body: 'Push notifications are ready on this device.',
        url: '/dashboard',
      }),
    )
  } catch {
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)

    return NextResponse.json({ error: 'Failed to send push test notification' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
