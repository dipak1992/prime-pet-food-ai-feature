import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { sendPushToSubscription } from '@/lib/push/send'

function authorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret && process.env.NODE_ENV === 'production') return false
  return !cronSecret || request.headers.get('authorization') === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServiceClient()
  const { data: prefs, error } = await supabase
    .from('household_preferences')
    .select('user_id, weekly_budget, sunday_plan_push_enabled')
    .eq('sunday_plan_push_enabled', true)
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  let skipped = 0

  for (const pref of prefs ?? []) {
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('proactive_nudges')
      .select('id')
      .eq('user_id', pref.user_id)
      .eq('nudge_type', 'sunday_plan')
      .gte('sent_at', since)
      .maybeSingle()
    if (existing) { skipped++; continue }

    const { data: subscription } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', pref.user_id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription) { skipped++; continue }

    const budget = typeof pref.weekly_budget === 'number' && pref.weekly_budget > 0
      ? `$${pref.weekly_budget}`
      : 'your budget'

    try {
      const ok = await sendPushToSubscription(subscription, {
        title: 'Your MealEase week is ready',
        body: `Review a 5-day dinner plan built around ${budget}, pantry, and family preferences.`,
        url: '/planner?source=sunday-push',
      })
      if (!ok) { skipped++; continue }

      await supabase.from('proactive_nudges').insert({
        user_id: pref.user_id,
        nudge_type: 'sunday_plan',
        payload: { weekly_budget: pref.weekly_budget ?? null },
      })
      sent++
    } catch {
      skipped++
    }
  }

  return NextResponse.json({ ok: true, sent, skipped })
}
