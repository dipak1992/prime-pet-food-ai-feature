import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdForUser, ensureHousehold } from '@/lib/family/service'

const actionSchema = z.object({
  actionId: z.string().min(1),
  decision: z.enum(['applied', 'dismissed']),
  actionType: z.enum([
    'budget_rebalance',
    'leftover_rescue',
    'grocery_prepare',
    'timing_adjustment',
    'collaboration_prompt',
  ]).optional(),
  title: z.string().min(1).max(160).optional(),
  ctaHref: z.string().min(1).max(240).optional(),
  weekStart: z.string().min(8).max(16).optional(),
}).strict()

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = actionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid autonomous action payload' }, { status: 400 })
  }

  const household = await getHouseholdForUser(supabase as any, user.id)
    ?? await ensureHousehold(supabase as any, user.id)
  const now = new Date().toISOString()
  const { actionId, decision, actionType, title, ctaHref, weekStart } = parsed.data

  try {
    await supabase
      .from('household_autonomous_actions')
      .update({
        status: decision,
        decided_by: user.id,
        decided_at: now,
        updated_at: now,
      })
      .eq('id', actionId)
      .or(`user_id.eq.${user.id},household_id.eq.${household.id}`)
  } catch {
    // The action may be generated at read time before migration-backed persistence exists.
  }

  try {
    await supabase.from('household_workspace_events').insert({
      household_id: household.id,
      actor_user_id: user.id,
      event_type: decision === 'applied' ? 'autonomous_action_applied' : 'autonomous_action_dismissed',
      subject_type: actionType ?? 'autonomous_action',
      subject_id: actionId,
      payload: {
        actionId,
        actionType,
        title,
        ctaHref,
        weekStart,
        decision,
      },
    })
  } catch {
    // Older databases may not have the expanded event constraint yet.
  }

  return NextResponse.json({
    ok: true,
    status: decision,
    redirectTo: decision === 'applied' ? ctaHref ?? null : null,
  })
}
