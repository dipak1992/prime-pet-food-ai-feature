import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { sendPushToSubscription } from '@/lib/push/send'
import { computeCopilotNudges, loadRecentCopilotNudgeTypes } from '@/lib/copilot/nudges'

function authorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret && process.env.NODE_ENV === 'production') return false
  return !cronSecret || request.headers.get('authorization') === `Bearer ${cronSecret}`
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServiceClient()
  const { data: prefs, error } = await supabase
    .from('household_preferences')
    .select('user_id, weekly_budget')
    .limit(250)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  let skipped = 0

  for (const pref of prefs ?? []) {
    const userId = String(pref.user_id)
    const recentTypes = await loadRecentCopilotNudgeTypes(supabase, userId, 22)
    const [{ data: leftovers }, { data: subscription }, { data: weekSpend }] = await Promise.all([
      supabase
        .from('leftovers')
        .select('id, name, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(10),
      supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('budget_weekly_spend')
        .select('spent')
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (!subscription) {
      skipped++
      continue
    }

    const weeklyLimit = typeof pref.weekly_budget === 'number' ? pref.weekly_budget : null
    const nudges = computeCopilotNudges({
      userId,
      screen: 'home',
      leftovers: (leftovers ?? []).map((leftover) => ({
        id: String(leftover.id),
        name: String(leftover.name),
        expiresAt: leftover.expires_at ? String(leftover.expires_at) : null,
        daysUntilExpiry: leftover.expires_at ? daysUntil(String(leftover.expires_at)) : null,
      })),
      budget: {
        weeklyLimit,
        spent: typeof weekSpend?.spent === 'number' ? weekSpend.spent : 0,
      },
      recentlySentTypes: recentTypes,
    })

    const nudge = nudges[0]
    if (!nudge) {
      skipped++
      continue
    }

    try {
      const ok = await sendPushToSubscription(subscription, {
        title: nudge.title,
        body: nudge.body,
        url: nudge.action.type === 'navigate' ? nudge.action.href : '/dashboard?source=copilot-push',
      })
      if (!ok) {
        skipped++
        continue
      }

      await supabase.from('proactive_nudges').insert({
        user_id: userId,
        nudge_type: nudge.type,
        payload: {
          source: 'copilot_cron',
          title: nudge.title,
          body: nudge.body,
          cta_label: nudge.ctaLabel,
          variant: nudge.variant,
          action: nudge.action,
        },
      })
      sent++
    } catch {
      skipped++
    }
  }

  return NextResponse.json({ ok: true, sent, skipped })
}
