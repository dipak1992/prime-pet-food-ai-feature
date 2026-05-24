import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdForUser, ensureHousehold } from '@/lib/family/service'

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const household = await getHouseholdForUser(supabase as any, user.id)
    ?? await ensureHousehold(supabase as any, user.id)
  const url = new URL(req.url)
  const weekStart = url.searchParams.get('weekStart') ?? getWeekStart()

  const [membersResult, votesResult, eventsResult, handoffsResult] = await Promise.allSettled([
    supabase
      .from('household_members')
      .select('id, first_name, member_name, role, invite_role, invite_status, is_primary_shopper, is_primary_cook')
      .eq('household_id', household.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('household_meal_votes')
      .select('id, user_id, week_start, meal_id, meal_title, vote, comment, updated_at')
      .eq('household_id', household.id)
      .eq('week_start', weekStart)
      .order('updated_at', { ascending: false }),
    supabase
      .from('household_workspace_events')
      .select('id, actor_user_id, event_type, subject_type, subject_id, payload, created_at')
      .eq('household_id', household.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('grocery_handoffs')
      .select('id, provider, status, external_cart_url, item_count, estimated_total_usd, created_at')
      .eq('household_id', household.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const members = membersResult.status === 'fulfilled' ? membersResult.value.data ?? [] : []
  const votes = votesResult.status === 'fulfilled' ? votesResult.value.data ?? [] : []
  const events = eventsResult.status === 'fulfilled' ? eventsResult.value.data ?? [] : []
  const handoffs = handoffsResult.status === 'fulfilled' ? handoffsResult.value.data ?? [] : []

  return NextResponse.json({
    household,
    weekStart,
    members,
    votes,
    events,
    handoffs,
    coordination: {
      approvalCount: votes.filter((vote: any) => vote.vote === 'approve').length,
      changeRequestCount: votes.filter((vote: any) => vote.vote === 'reject' || vote.vote === 'request_swap').length,
      lastActivityAt: events[0]?.created_at ?? handoffs[0]?.created_at ?? null,
    },
  })
}
