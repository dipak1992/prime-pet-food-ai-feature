import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { getServerVapidConfig } from '@/lib/push/vapid'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

/**
 * POST /api/push/pantry-expiry
 *
 * Checks the authenticated user's pantry for items expiring within 2 days
 * and sends a push notification summarizing what's about to expire.
 *
 * Can be called by:
 * - A cron job (with service role key)
 * - The client on app open (to trigger a check)
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    key: `pantry-expiry:${rateLimitKeyFromRequest(req)}`,
    limit: 5,
    windowMs: 60_000,
  })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check notification preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('pantry_expiry_reminders')
    .eq('user_id', user.id)
    .maybeSingle()

  // Default to enabled if no preference set
  if (prefs?.pantry_expiry_reminders === false) {
    return NextResponse.json({ skipped: true, reason: 'disabled' })
  }

  // Find pantry items expiring within 2 days
  const now = new Date()
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const { data: expiringItems, error: pantryError } = await supabase
    .from('pantry_items')
    .select('id, name, expires_at')
    .eq('user_id', user.id)
    .not('expires_at', 'is', null)
    .lte('expires_at', twoDaysFromNow.toISOString())
    .gte('expires_at', now.toISOString())
    .order('expires_at', { ascending: true })
    .limit(10)

  if (pantryError) {
    return NextResponse.json({ error: 'Failed to check pantry' }, { status: 500 })
  }

  if (!expiringItems || expiringItems.length === 0) {
    return NextResponse.json({ sent: false, reason: 'no_expiring_items' })
  }

  // Build notification message
  const itemNames = expiringItems.map((item) => item.name)
  const expiringToday = expiringItems.filter((item) => {
    const expDate = new Date(item.expires_at)
    return expDate.toDateString() === now.toDateString()
  })

  let title: string
  let body: string

  if (expiringToday.length > 0) {
    title = `🚨 ${expiringToday.length} item${expiringToday.length > 1 ? 's' : ''} expiring today`
    body = expiringToday.length <= 3
      ? `Use up: ${expiringToday.map((i) => i.name).join(', ')}`
      : `${expiringToday.slice(0, 2).map((i) => i.name).join(', ')} +${expiringToday.length - 2} more — tap for meal ideas`
  } else {
    title = `⏰ ${itemNames.length} item${itemNames.length > 1 ? 's' : ''} expiring soon`
    body = itemNames.length <= 3
      ? `Use soon: ${itemNames.join(', ')}`
      : `${itemNames.slice(0, 2).join(', ')} +${itemNames.length - 2} more — plan meals before they expire`
  }

  // Get push subscription
  const { data: subscription } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!subscription) {
    // No push subscription — return the data for in-app use
    return NextResponse.json({
      sent: false,
      reason: 'no_subscription',
      expiringItems: expiringItems.map((i) => ({
        id: i.id,
        name: i.name,
        expiresAt: i.expires_at,
      })),
    })
  }

  // Send push notification
  const vapid = getServerVapidConfig()
  if (!vapid) {
    return NextResponse.json({
      sent: false,
      reason: 'vapid_not_configured',
      expiringItems: expiringItems.map((i) => ({
        id: i.id,
        name: i.name,
        expiresAt: i.expires_at,
      })),
    })
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

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
        title,
        body,
        url: '/pantry',
        tag: 'pantry-expiry',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      }),
    )

    return NextResponse.json({
      sent: true,
      itemCount: expiringItems.length,
      expiringItems: expiringItems.map((i) => ({
        id: i.id,
        name: i.name,
        expiresAt: i.expires_at,
      })),
    })
  } catch {
    // Mark subscription as inactive if push fails
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)

    return NextResponse.json({
      sent: false,
      reason: 'push_failed',
      expiringItems: expiringItems.map((i) => ({
        id: i.id,
        name: i.name,
        expiresAt: i.expires_at,
      })),
    })
  }
}
