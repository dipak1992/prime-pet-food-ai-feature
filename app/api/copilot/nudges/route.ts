import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { buildUserContext } from '@/lib/ai/context'
import { computeCopilotNudges, loadRecentCopilotNudgeTypes } from '@/lib/copilot/nudges'
import type { CopilotScreen } from '@/stores/copilotStore'

const patchSchema = z.object({
  nudgeId: z.string().min(3),
  event: z.enum(['accepted', 'dismissed']),
}).strict()

function getCurrentWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const paywall = await getPaywallStatus()
  if (!paywall.isPro) return NextResponse.json({ nudges: [] })

  const url = new URL(req.url)
  const screen = (url.searchParams.get('screen') ?? 'home') as CopilotScreen
  const [ctx, recentTypes, weeklyPlan] = await Promise.all([
    buildUserContext(supabase, user.id, { includeLearning: false }),
    loadRecentCopilotNudgeTypes(supabase, user.id, 8),
    supabase
      .from('weekly_plans')
      .select('planner_payload, grocery_list')
      .eq('user_id', user.id)
      .eq('week_of', getCurrentWeekStart())
      .maybeSingle(),
  ])

  const planPayload = weeklyPlan.data?.planner_payload as { days?: Array<{ meal?: unknown; recipe?: unknown }> } | null | undefined
  const groceryList = weeklyPlan.data?.grocery_list as { items?: Array<{ isChecked?: boolean }> } | null | undefined
  const plannedCount = planPayload?.days?.filter((day) => day.meal || day.recipe).length ?? 0
  const dayCount = planPayload?.days?.length ?? 7
  const groceryItems = groceryList?.items ?? []

  const nudges = computeCopilotNudges({
    userId: user.id,
    screen,
    leftovers: ctx.leftovers.map((leftover) => ({
      id: leftover.name,
      name: leftover.name,
      daysUntilExpiry: leftover.expiresInDays,
    })),
    budget: {
      weeklyLimit: ctx.budget.weeklyLimit,
      spent: ctx.budget.spentThisWeek,
      estimated: 0,
      remaining: ctx.budget.remainingBudget,
    },
    plan: {
      hasPlan: plannedCount > 0,
      plannedCount,
      emptyCount: Math.max(0, dayCount - plannedCount),
    },
    grocery: {
      itemCount: groceryItems.length,
      checkedCount: groceryItems.filter((item) => item.isChecked).length,
    },
    recentlySentTypes: recentTypes,
  })

  return NextResponse.json({ nudges })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid nudge event' }, { status: 400 })

  const [type, subjectId] = parsed.data.nudgeId.split(':')

  await supabase.from('proactive_nudges').insert({
    user_id: user.id,
    nudge_type: type || 'copilot_nudge',
    subject_id: subjectId ?? null,
    payload: {
      source: 'copilot',
      event: parsed.data.event,
      client_id: parsed.data.nudgeId,
    },
  })

  return NextResponse.json({ ok: true })
}
