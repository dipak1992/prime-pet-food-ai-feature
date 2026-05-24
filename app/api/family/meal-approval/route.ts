import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdForUser, ensureHousehold } from '@/lib/family/service'

const approvalSchema = z.object({
  weekStart: z.string().min(8).max(16),
  mealId: z.string().min(1).max(120),
  mealTitle: z.string().min(1).max(180),
  vote: z.enum(['approve', 'maybe', 'reject', 'request_swap']),
  comment: z.string().max(500).optional(),
}).strict()

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = approvalSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid meal approval payload' }, { status: 400 })
  }

  const household = await getHouseholdForUser(supabase as any, user.id)
    ?? await ensureHousehold(supabase as any, user.id)
  const { weekStart, mealId, mealTitle, vote, comment } = parsed.data

  const { data, error } = await supabase
    .from('household_meal_votes')
    .upsert(
      {
        household_id: household.id,
        user_id: user.id,
        week_start: weekStart,
        meal_id: mealId,
        meal_title: mealTitle,
        vote,
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'household_id,week_start,meal_id,user_id' },
    )
    .select('id, user_id, week_start, meal_id, meal_title, vote, comment, updated_at')
    .single()

  if (error) {
    console.error('[family/meal-approval]', error.message)
    return NextResponse.json({ error: 'Could not save meal vote' }, { status: 500 })
  }

  await supabase.from('household_workspace_events').insert({
    household_id: household.id,
    actor_user_id: user.id,
    event_type: vote === 'approve' ? 'meal_approved' : vote === 'request_swap' || vote === 'reject' ? 'meal_changes_requested' : 'meal_vote',
    subject_type: 'meal',
    subject_id: mealId,
    payload: { weekStart, mealTitle, vote, comment: comment?.trim() || null },
  })

  return NextResponse.json({ vote: data })
}
