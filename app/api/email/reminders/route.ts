import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import {
  sendDinnerReminderEmail,
  sendWeeklyReminderEmail,
  sendAdminWeeklySummary,
  sendTrialEndingSoonEmail,
  sendReactivationEmail,
  sendChurnWinbackEmail,
} from '@/lib/email/triggers'
import { isDinnerReminderDue, isWeeklyReminderDue } from '@/lib/email/scheduler'

/**
 * Cron endpoint — called by Vercel Cron or any scheduler.
 *
 * Schedule (vercel.json):
 *   Dinner:        "0 * * * *"    (hourly — timezone-aware per user via isDinnerReminderDue)
 *   Weekly:        "0 0 * * *"    (daily midnight UTC — timezone-aware per user)
 *  *   Admin summary: "0 10 * * 1"   (Monday 10 AM UTC)
 *
 * Protected by CRON_SECRET env var.
 */
export async function GET(request: NextRequest) {
  // Auth guard
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'CRON_SECRET is required' }, { status: 500 })
  }
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const type = request.nextUrl.searchParams.get('type') ?? 'dinner'
  const supabase = createSupabaseServiceClient()

  if (type === 'dinner') return handleDinnerReminders(supabase)
  if (type === 'weekly') return handleWeeklyReminders(supabase)
  if (type === 'admin-summary') return handleAdminSummary(supabase)
  if (type === 'trial-ending') return handleTrialEndingReminders(supabase)
  if (type === 'reactivation') return handleReactivationEmails(supabase)
  if (type === 'winback') return handleWinbackEmails(supabase)

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createSupabaseServiceClient>
type ProfileRow = { id: string; email: string; full_name: string | null; subscription_tier?: string }

/** Batch-fetch profiles for a list of user IDs. Returns a map keyed by user_id. */
async function batchFetchProfiles(
  supabase: SupabaseClient,
  userIds: string[],
  includePro = false,
): Promise<Record<string, ProfileRow>> {
  if (!userIds.length) return {}
  const select = includePro ? 'id, email, full_name, subscription_tier' : 'id, email, full_name'
  const { data } = await supabase.from('profiles').select(select).in('id', userIds)
  return Object.fromEntries(((data as unknown as ProfileRow[]) ?? []).map((p: ProfileRow) => [p.id, p]))
}

function getFirstName(profile: Pick<ProfileRow, 'full_name'>): string | undefined {
  return profile.full_name?.split(' ')[0] || undefined
}

// ─── Dinner reminders ────────────────────────────────────────────────────────

async function handleDinnerReminders(supabase: SupabaseClient) {
  // Step 1: get users who have dinner_reminders enabled in notification_preferences
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('dinner_reminders', true)

  if (prefsError) {
    console.error('[cron] dinner reminder fetch error:', prefsError)
    return NextResponse.json({ error: prefsError.message }, { status: 500 })
  }

  const prefUserIds = (prefs ?? []).map((p: { user_id: string }) => p.user_id)
  if (!prefUserIds.length) return NextResponse.json({ ok: true, sent: 0, skipped: 0 })

  // Step 2: get reminder schedules for those users
  const { data: users, error } = await supabase
    .from('reminder_schedules')
    .select('user_id, dinner_enabled, dinner_hour, timezone, last_dinner_sent_at')
    .eq('dinner_enabled', true)
    .in('user_id', prefUserIds)

  if (error) {
    console.error('[cron] dinner reminder fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const profileMap = await batchFetchProfiles(supabase, (users ?? []).map(u => u.user_id))

  let sent = 0
  let skipped = 0

  for (const row of (users ?? [])) {
    if (!isDinnerReminderDue(row)) { skipped++; continue }

    const profile = profileMap[row.user_id]
    if (!profile?.email) { skipped++; continue }

    const result = await sendDinnerReminderEmail({
      to: profile.email,
      firstName: getFirstName(profile),
    })

    if (result.success) {
      await supabase
        .from('reminder_schedules')
        .update({ last_dinner_sent_at: new Date().toISOString() })
        .eq('user_id', row.user_id)
      sent++
    }
  }

  return NextResponse.json({ ok: true, sent, skipped })
}

// ─── Weekly reminders ────────────────────────────────────────────────────────

async function handleWeeklyReminders(supabase: SupabaseClient) {
  // Step 1: get users who have weekly_reminders enabled in notification_preferences
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('weekly_reminders', true)

  if (prefsError) {
    return NextResponse.json({ error: prefsError.message }, { status: 500 })
  }

  const prefUserIds = (prefs ?? []).map((p: { user_id: string }) => p.user_id)
  if (!prefUserIds.length) return NextResponse.json({ ok: true, sent: 0, skipped: 0 })

  // Step 2: get reminder schedules for those users
  const { data: users, error } = await supabase
    .from('reminder_schedules')
    .select('user_id, weekly_enabled, weekly_day, timezone, last_weekly_sent_at')
    .eq('weekly_enabled', true)
    .in('user_id', prefUserIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const profileMap = await batchFetchProfiles(supabase, (users ?? []).map(u => u.user_id))

  let sent = 0
  let skipped = 0

  for (const row of (users ?? [])) {
    if (!isWeeklyReminderDue(row)) { skipped++; continue }

    const profile = profileMap[row.user_id]
    if (!profile?.email) { skipped++; continue }

    const result = await sendWeeklyReminderEmail({
      to: profile.email,
      firstName: getFirstName(profile),
    })

    if (result.success) {
      await supabase
        .from('reminder_schedules')
        .update({ last_weekly_sent_at: new Date().toISOString() })
        .eq('user_id', row.user_id)
      sent++
    }
  }

  return NextResponse.json({ ok: true, sent, skipped })
}


// ─── Admin weekly summary ────────────────────────────────────────────────────

async function handleAdminSummary(supabase: SupabaseClient) {
  const weekStart = getWeekStart()

  const [
    { count: newUsers },
    { count: newPro },
    { count: totalUsers },
    { count: emailsSent },
    { count: failures },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro').gte('updated_at', weekStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('email_logs').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', weekStart),
    supabase.from('email_logs').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', weekStart),
  ])

  await sendAdminWeeklySummary({
    weekStart,
    newUsers: newUsers ?? 0,
    newPro: newPro ?? 0,
    totalUsers: totalUsers ?? 0,
    emailsSent: emailsSent ?? 0,
    failures: failures ?? 0,
  })

  return NextResponse.json({ ok: true })
}

// ─── Trial ending reminders ──────────────────────────────────────────────────

async function handleTrialEndingReminders(supabase: SupabaseClient) {
  // Find profiles whose trial ends within the next 3 days and haven't been emailed yet.
  // Requires a `trial_ends_at` column on profiles (populated when trial starts via Stripe webhook).
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, trial_ends_at, trial_ending_email_sent_at')
    .not('trial_ends_at', 'is', null)
    .gte('trial_ends_at', now)
    .lte('trial_ends_at', threeDaysFromNow)
    .is('trial_ending_email_sent_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  for (const profile of (profiles ?? [])) {
    if (!profile.email) continue

    const trialEnd = new Date(profile.trial_ends_at as string)
    const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const firstName = (profile.full_name as string | null)?.split(' ')[0] ?? undefined
    const trialEndDate = trialEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const result = await sendTrialEndingSoonEmail({
      to: profile.email as string,
      firstName,
      daysLeft,
      trialEndDate,
    })

    if (result.success) {
      await supabase
        .from('profiles')
        .update({ trial_ending_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id)
      sent++
    }
  }

  return NextResponse.json({ ok: true, sent })
}

/** Monday of the current week as YYYY-MM-DD (UTC). Consistent with weekStartKey() in lib/email/scheduler.ts. */
function getWeekStart(): string {
  const d = new Date()
  const dow = d.getUTCDay()
  const diff = dow === 0 ? -6 : 1 - dow   // Monday = 1
  const start = new Date(d)
  start.setUTCDate(d.getUTCDate() + diff)
  return start.toISOString().slice(0, 10)
}

// ─── Reactivation emails (7-day inactive users) ──────────────────────────────

async function handleReactivationEmails(supabase: SupabaseClient) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Users inactive for 7–30 days (not so far gone they need winback) — cap at 100 per run
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, last_active_at')
    .not('email', 'is', null)
    .lte('last_active_at', sevenDaysAgo)
    .gte('last_active_at', thirtyDaysAgo)
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  const eligibleUserIds = await getUsersOptedIntoProductUpdates(
    supabase,
    ((profiles ?? []) as Array<{ id: string }>).map((profile) => profile.id),
  )

  for (const profile of (profiles ?? []) as Array<{ id: string; email: string; full_name: string | null; last_active_at: string | null }>) {
    if (!profile.email) continue
    if (!eligibleUserIds.has(profile.id)) continue

    const lastActiveDate = profile.last_active_at
      ? new Date(profile.last_active_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : undefined

    const result = await sendReactivationEmail({
      to: profile.email,
      firstName: profile.full_name?.split(' ')[0] || undefined,
      lastActiveDate,
      userId: profile.id,
    })

    if (result.success) sent++
  }

  return NextResponse.json({ ok: true, sent })
}

// ─── Churn winback emails (30-day inactive users) ────────────────────────────

async function handleWinbackEmails(supabase: SupabaseClient) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Users inactive for 30+ days — cap at 50 per run to stay within Resend free tier
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, last_active_at')
    .not('email', 'is', null)
    .lte('last_active_at', thirtyDaysAgo)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  const eligibleUserIds = await getUsersOptedIntoProductUpdates(
    supabase,
    ((profiles ?? []) as Array<{ id: string }>).map((profile) => profile.id),
  )

  for (const profile of (profiles ?? []) as Array<{ id: string; email: string; full_name: string | null; last_active_at: string | null }>) {
    if (!profile.email) continue
    if (!eligibleUserIds.has(profile.id)) continue

    const daysSince = profile.last_active_at
      ? Math.floor((Date.now() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
      : 30

    const result = await sendChurnWinbackEmail({
      to: profile.email,
      firstName: profile.full_name?.split(' ')[0] || undefined,
      daysSince,
      userId: profile.id,
    })

    if (result.success) sent++
  }

  return NextResponse.json({ ok: true, sent })
}

async function getUsersOptedIntoProductUpdates(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Set<string>> {
  if (!userIds.length) return new Set()

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id, product_updates')
    .in('user_id', userIds)

  if (error) {
    console.error('[cron] product preference fetch error:', error.message)
    return new Set()
  }

  const explicit = new Map(
    ((data ?? []) as Array<{ user_id: string; product_updates: boolean }>).map((row) => [
      row.user_id,
      row.product_updates,
    ]),
  )

  return new Set(userIds.filter((userId) => explicit.get(userId) !== false))
}
