import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadWeekPlan, getCurrentWeekStart } from '@/app/plan/loader'
import { isoDateSchema, uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

type PlanDayOwnership = {
  locked?: boolean
  plan_id?: string
  plan?: { user_id: string } | Array<{ user_id: string }> | null
}

function planOwner(row: PlanDayOwnership): string | null {
  const plan = Array.isArray(row.plan) ? row.plan[0] : row.plan
  return plan?.user_id ?? null
}

async function loadOwnedPlanDay(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  dayId: string,
  select = 'plan:plan_id(user_id)',
) {
  const { data: row } = await supabase
    .from('week_plan_days')
    .select(select)
    .eq('id', dayId)
    .maybeSingle()

  if (!row) return { row: null, response: NextResponse.json({ error: 'Day not found' }, { status: 404 }) }
  if (planOwner(row as PlanDayOwnership) !== userId) {
    return { row: null, response: NextResponse.json({ error: 'Day not found' }, { status: 404 }) }
  }
  return { row, response: null }
}

const planPatchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('reorder'),
    weekStart: isoDateSchema,
    orderedDayIds: z.array(uuidSchema).min(1).max(14),
  }).strict(),
  z.object({ action: z.literal('toggle_lock'), dayId: uuidSchema }).strict(),
  z.object({ action: z.literal('mark_cooked'), dayId: uuidSchema }).strict(),
  z.object({ action: z.literal('clear'), dayId: uuidSchema }).strict(),
])

// ─── GET /api/plan?weekStart=YYYY-MM-DD ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rawWeekStart = searchParams.get('weekStart') ?? getCurrentWeekStart()
  const parsedWeekStart = isoDateSchema.safeParse(rawWeekStart)
  if (!parsedWeekStart.success) return NextResponse.json({ error: 'Invalid weekStart' }, { status: 400 })
  const weekStart = parsedWeekStart.data

  try {
    const plan = await loadWeekPlan(user.id, weekStart)
    return NextResponse.json(plan)
  } catch (e) {
    console.error('[GET /api/plan]', e)
    return NextResponse.json({ error: 'Failed to load plan' }, { status: 500 })
  }
}

// ─── PATCH /api/plan ──────────────────────────────────────────────────────────
// Actions: reorder | toggle_lock | mark_cooked | clear

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsedBody = planPatchSchema.safeParse(await req.json())
  if (!parsedBody.success) return NextResponse.json({ error: validationError(parsedBody.error) }, { status: 400 })
  const body = parsedBody.data
  const { action } = body

  try {
    switch (action) {
      // ── reorder ─────────────────────────────────────────────────────────────
      case 'reorder': {
        const { weekStart, orderedDayIds } = body as {
          weekStart: string
          orderedDayIds: string[]
        }

        // Get the plan row
        const { data: planRow } = await supabase
          .from('week_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
          .maybeSingle()

        if (!planRow) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

        // Load current day rows in order
        const { data: dayRows } = await supabase
          .from('week_plan_days')
          .select('id, day_index, recipe_id, status, locked, estimated_cost, notes')
          .eq('plan_id', planRow.id)
          .order('day_index', { ascending: true })

        if (!dayRows) return NextResponse.json({ ok: true })

        // Build a map of id → row
        const byId = new Map(dayRows.map((r) => [r.id as string, r]))
        const sortedByIndex = [...dayRows].sort(
          (a, b) => (a.day_index as number) - (b.day_index as number),
        )

        // For each target slot (by dayIndex), assign the recipe from the source id
        const updates = sortedByIndex.map((target, i) => {
          const sourceId = orderedDayIds[i]
          const source = byId.get(sourceId)
          if (!source) return null
          return supabase
            .from('week_plan_days')
            .update({
              recipe_id: source.recipe_id,
              status: source.status,
              locked: source.locked,
              estimated_cost: source.estimated_cost,
              notes: source.notes,
            })
            .eq('id', target.id as string)
            .eq('plan_id', planRow.id as string)
        })

        await Promise.all(updates.filter(Boolean))
        return NextResponse.json({ ok: true })
      }

      // ── toggle_lock ─────────────────────────────────────────────────────────
      case 'toggle_lock': {
        const { dayId } = body as { dayId: string }

        const { row, response } = await loadOwnedPlanDay(
          supabase,
          user.id,
          dayId,
          'locked, plan_id, plan:plan_id(user_id)',
        )
        if (response) return response

        await supabase
          .from('week_plan_days')
          .update({ locked: !((row as PlanDayOwnership).locked as boolean) })
          .eq('id', dayId)
          .eq('plan_id', (row as PlanDayOwnership).plan_id as string)

        return NextResponse.json({ ok: true })
      }

      // ── mark_cooked ─────────────────────────────────────────────────────────
      case 'mark_cooked': {
        const { dayId } = body as { dayId: string }
        const { row, response } = await loadOwnedPlanDay(supabase, user.id, dayId, 'plan_id, plan:plan_id(user_id)')
        if (response) return response

        await supabase
          .from('week_plan_days')
          .update({ status: 'cooked' })
          .eq('id', dayId)
          .eq('plan_id', (row as PlanDayOwnership).plan_id as string)

        return NextResponse.json({ ok: true })
      }

      // ── clear ────────────────────────────────────────────────────────────────
      case 'clear': {
        const { dayId } = body as { dayId: string }
        const { row, response } = await loadOwnedPlanDay(supabase, user.id, dayId, 'plan_id, plan:plan_id(user_id)')
        if (response) return response

        await supabase
          .from('week_plan_days')
          .update({
            recipe_id: null,
            status: 'empty',
            locked: false,
            estimated_cost: null,
            notes: null,
          })
          .eq('id', dayId)
          .eq('plan_id', (row as PlanDayOwnership).plan_id as string)

        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (e) {
    console.error('[PATCH /api/plan]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
