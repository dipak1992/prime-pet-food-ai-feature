import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { persistNormalizedPlanAndGrocery } from '@/lib/planner/persistence'
import { ensureHousehold, getHouseholdForUser } from '@/lib/family/service'

const grocerySaveSchema = z.object({
  weekStart: z.string().min(8).max(16),
  groceryList: z.unknown(),
}).strict()

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function isSchemaError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false
  const message = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42P01' ||
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('schema cache')
  )
}

async function getHouseholdSafely(supabase: any, userId: string) {
  try {
    return await getHouseholdForUser(supabase, userId) ?? await ensureHousehold(supabase, userId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown household lookup error'
    console.warn('[grocery-list/household/fallback]', message)
    return null
  }
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const weekStart = url.searchParams.get('weekStart') ?? getWeekStart()
  const household = await getHouseholdSafely(supabase as any, user.id)
  const baseQuery = supabase
    .from('weekly_plans')
    .select('week_of, planner_payload, grocery_list, updated_at, household_id, last_edited_by, approval_status, approved_at')
    .eq('week_of', weekStart)
    .order('updated_at', { ascending: false })
    .limit(1)

  const { data, error } = await (household?.id
    ? baseQuery.or(`user_id.eq.${user.id},household_id.eq.${household.id}`)
    : baseQuery.eq('user_id', user.id)
  )
    .maybeSingle()

  if (error) {
    if (isSchemaError(error)) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('weekly_plans')
        .select('week_of, plan, updated_at')
        .eq('user_id', user.id)
        .eq('week_of', weekStart)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!legacyError) {
        return NextResponse.json({
          weekStart,
          plan: legacyData?.plan ?? null,
          groceryList: null,
          updatedAt: legacyData?.updated_at ?? null,
          household,
          approvalStatus: 'draft',
          approvedAt: null,
          schemaWarning: 'weekly_plans is missing persisted grocery list columns',
        })
      }

      if (isSchemaError(legacyError)) {
        return NextResponse.json({
          weekStart,
          plan: null,
          groceryList: null,
          updatedAt: null,
          household,
          approvalStatus: 'draft',
          approvedAt: null,
          schemaWarning: 'weekly_plans table is not available yet',
        })
      }
    }

    console.error('[grocery-list/get]', error.message)
    return NextResponse.json({ error: 'Could not load grocery list' }, { status: 500 })
  }

  return NextResponse.json({
    weekStart,
    plan: data?.planner_payload ?? null,
    groceryList: data?.grocery_list ?? null,
    updatedAt: data?.updated_at ?? null,
    household,
    approvalStatus: data?.approval_status ?? 'draft',
    approvedAt: data?.approved_at ?? null,
  })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = grocerySaveSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid grocery list payload' }, { status: 400 })
  }

  const { weekStart, groceryList } = parsed.data
  const household = await getHouseholdSafely(supabase as any, user.id)
  const existingQuery = supabase
    .from('weekly_plans')
    .select('id')
    .eq('week_of', weekStart)
    .order('updated_at', { ascending: false })
    .limit(1)

  const { data: existingPlan, error: existingError } = await (household?.id
    ? existingQuery.eq('household_id', household.id)
    : existingQuery.eq('user_id', user.id)
  )
    .maybeSingle()

  if (existingError && isSchemaError(existingError)) {
    return NextResponse.json({
      ok: true,
      schemaWarning: 'weekly_plans is not ready for grocery persistence',
    })
  }

  const payload = {
    user_id: household?.owner_user_id ?? user.id,
    household_id: household?.id ?? null,
    last_edited_by: user.id,
    week_of: weekStart,
    grocery_list: groceryList,
    status: 'active',
    approval_status: 'needs_review',
    updated_at: new Date().toISOString(),
  }

  const { error } = existingPlan?.id
    ? await supabase.from('weekly_plans').update(payload).eq('id', existingPlan.id)
    : await supabase.from('weekly_plans').insert(payload)

  if (error) {
    if (isSchemaError(error)) {
      console.warn('[grocery-list/patch/schema-fallback]', error.message)
      return NextResponse.json({
        ok: true,
        schemaWarning: 'weekly_plans is missing persisted grocery list columns',
      })
    }

    console.error('[grocery-list/patch]', error.message)
    return NextResponse.json({ error: 'Could not save grocery list' }, { status: 500 })
  }

  if (household?.id) {
    try {
      await persistNormalizedPlanAndGrocery(supabase, {
        userId: user.id,
        householdId: household.id,
        weekStart,
        groceryList,
        source: 'grocery_edit',
      })
    } catch (normalizedError) {
      const message = normalizedError instanceof Error ? normalizedError.message : 'Unknown normalized persistence error'
      console.error('[grocery-list/patch/normalized]', message)
    }

    await supabase.from('household_workspace_events').insert({
      household_id: household.id,
      actor_user_id: user.id,
      event_type: 'grocery_item_added',
      subject_type: 'grocery_list',
      subject_id: weekStart,
      payload: {
        weekStart,
        itemCount: Array.isArray((groceryList as any)?.items) ? (groceryList as any).items.length : null,
      },
    }).then(({ error: eventError }) => {
      if (eventError && !isSchemaError(eventError)) {
        console.error('[grocery-list/patch/event]', eventError.message)
      }
    })
  }

  return NextResponse.json({ ok: true })
}
