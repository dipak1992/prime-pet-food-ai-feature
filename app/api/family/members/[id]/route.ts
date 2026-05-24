import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/family/service'
import { cleanString, stringArraySchema, uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

type MemberOwnership = {
  id: string
  household_id: string
  household?: { owner_user_id: string } | Array<{ owner_user_id: string }> | null
}

function ownerIdFor(row: MemberOwnership): string | null {
  const household = Array.isArray(row.household) ? row.household[0] : row.household
  return household?.owner_user_id ?? null
}

async function loadOwnedMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  memberId: string,
  userId: string,
) {
  const { data } = await supabase
    .from('household_members')
    .select('id, household_id, household:household_id(owner_user_id)')
    .eq('id', memberId)
    .maybeSingle()

  if (!data) return { error: NextResponse.json({ error: 'Member not found' }, { status: 404 }) }
  if (ownerIdFor(data as MemberOwnership) !== userId) {
    return { error: NextResponse.json({ error: 'Member not found' }, { status: 404 }) }
  }
  return { error: null, householdId: (data as MemberOwnership).household_id }
}

const memberPatchSchema = z.object({
  first_name: cleanString(80).optional(),
  role: z.enum(['adult', 'teen', 'child', 'toddler', 'baby']).optional(),
  age_years: z.coerce.number().int().min(0).max(120).nullable().optional(),
  age_range: z.string().max(40).nullable().optional(),
  dietary_type: z.string().max(80).nullable().optional(),
  spice_tolerance: z.enum(['none', 'mild', 'medium', 'hot']).nullable().optional(),
  picky_eater_level: z.coerce.number().int().min(0).max(5).optional(),
  portion_size: z.enum(['small', 'medium', 'large']).nullable().optional(),
  school_lunch_needed: z.coerce.boolean().optional(),
  snack_frequency: z.enum(['low', 'normal', 'high']).nullable().optional(),
  texture_sensitivity: z.string().max(80).nullable().optional(),
  allergy_notes: z.string().transform((v) => v.trim().slice(0, 500)).nullable().optional(),
  notes: z.string().transform((v) => v.trim().slice(0, 1000)).nullable().optional(),
  is_primary_shopper: z.coerce.boolean().optional(),
  is_primary_cook: z.coerce.boolean().optional(),
  display_order: z.coerce.number().int().min(0).max(100).optional(),
  allergies_json: stringArraySchema(30, 80).optional(),
  foods_loved_json: stringArraySchema(60, 80).optional(),
  foods_disliked_json: stringArraySchema(60, 80).optional(),
  protein_preferences_json: stringArraySchema(40, 80).optional(),
  cuisine_likes_json: stringArraySchema(40, 80).optional(),
  foods_accepted_json: stringArraySchema(60, 80).optional(),
  foods_rejected_json: stringArraySchema(60, 80).optional(),
}).strict()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params
  const parsedId = uuidSchema.safeParse(rawParams.id)
  if (!parsedId.success) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  const id = parsedId.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = await getUserTier(supabase as any, user.id)
  if (tier !== 'pro') {
    return NextResponse.json(
      { error: 'Upgrade to Pro to personalize meals for every family member.' },
      { status: 403 },
    )
  }

  const parsedBody = memberPatchSchema.safeParse(await req.json().catch(() => null))
  if (!parsedBody.success) return NextResponse.json({ error: validationError(parsedBody.error) }, { status: 400 })
  const body = parsedBody.data
  const ownership = await loadOwnedMember(supabase, id, user.id)
  if (ownership.error) return ownership.error

  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) patch[key] = value

  if ('first_name' in patch && typeof patch.first_name === 'string') {
    patch.member_name = patch.first_name
  }

  const { data, error } = await supabase
    .from('household_members')
    .update(patch)
    .eq('id', id)
    .eq('household_id', ownership.householdId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 })
  return NextResponse.json({ ok: true, member: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params
  const parsedId = uuidSchema.safeParse(rawParams.id)
  if (!parsedId.success) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  const id = parsedId.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = await getUserTier(supabase as any, user.id)
  if (tier !== 'pro') {
    return NextResponse.json(
      { error: 'Upgrade to Pro to personalize meals for every family member.' },
      { status: 403 },
    )
  }
  const ownership = await loadOwnedMember(supabase, id, user.id)
  if (ownership.error) return ownership.error

  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('id', id)
    .eq('household_id', ownership.householdId)

  if (error) return NextResponse.json({ error: 'Failed to remove family member' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
