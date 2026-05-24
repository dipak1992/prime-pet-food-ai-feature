import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { persistNormalizedPlanAndGrocery } from '@/lib/planner/persistence'

const saveSchema = z.object({
  plan: z.unknown(),
  groceryList: z.unknown(),
  activation: z.unknown().optional(),
  weekStart: z.string().min(8).max(16),
}).strict()

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = saveSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid first plan payload' }, { status: 400 })
  }

  const { plan, groceryList, activation, weekStart } = parsed.data
  const { error } = await supabase
    .from('weekly_plans')
    .upsert(
      {
        user_id: user.id,
        week_of: weekStart,
        planner_payload: plan,
        grocery_list: groceryList,
        source: 'first_use',
        activation_context: activation ?? null,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,week_of' },
    )

  if (error) {
    console.error('[start-plan/save]', error.message)
    return NextResponse.json({ error: 'Could not save first plan' }, { status: 500 })
  }

  try {
    await persistNormalizedPlanAndGrocery(supabase, {
      userId: user.id,
      weekStart,
      plan,
      groceryList,
      source: 'first_use',
      activation,
    })
  } catch (normalizedError) {
    const message = normalizedError instanceof Error ? normalizedError.message : 'Unknown normalized persistence error'
    console.error('[start-plan/save/normalized]', message)
  }

  return NextResponse.json({ ok: true })
}
