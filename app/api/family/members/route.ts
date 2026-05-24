import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildFamilyEngineOverrides,
  ensureHousehold,
  getFamilyMembers,
  getMaxMembersForTier,
  getTierUpgradeMessage,
  getUserTier,
  summarizeHousehold,
} from '@/lib/family/service'
import { cleanString, stringArraySchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const roleSchema = z.enum(['adult', 'teen', 'child', 'toddler', 'baby'])
const memberCreateSchema = z.object({
  first_name: cleanString(80),
  role: roleSchema,
  age_years: z.coerce.number().int().min(0).max(120).nullable().optional(),
  age_range: z.string().max(40).nullable().optional(),
  dietary_type: z.string().max(80).nullable().optional(),
  allergies_json: stringArraySchema(30, 80).default([]),
  display_order: z.coerce.number().int().min(0).max(100).optional(),
  foods_loved_json: stringArraySchema(60, 80).optional(),
  foods_disliked_json: stringArraySchema(60, 80).optional(),
  protein_preferences_json: stringArraySchema(40, 80).optional(),
  cuisine_likes_json: stringArraySchema(40, 80).optional(),
  spice_tolerance: z.enum(['none', 'mild', 'medium', 'hot']).nullable().optional(),
  picky_eater_level: z.coerce.number().int().min(0).max(5).optional(),
  portion_size: z.enum(['small', 'medium', 'large']).nullable().optional(),
  school_lunch_needed: z.coerce.boolean().optional(),
  snack_frequency: z.enum(['low', 'normal', 'high']).nullable().optional(),
  texture_sensitivity: z.string().max(80).nullable().optional(),
  foods_accepted_json: stringArraySchema(60, 80).optional(),
  foods_rejected_json: stringArraySchema(60, 80).optional(),
  allergy_notes: z.string().transform((v) => v.trim().slice(0, 500)).nullable().optional(),
  notes: z.string().transform((v) => v.trim().slice(0, 1000)).nullable().optional(),
  is_primary_shopper: z.coerce.boolean().optional(),
  is_primary_cook: z.coerce.boolean().optional(),
  weight_goal: z.enum(['maintain', 'lose', 'gain']).nullable().optional(),
}).strict()

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = await getUserTier(supabase as any, user.id)
  const maxMembers = getMaxMembersForTier(tier)
  const household = await ensureHousehold(supabase as any, user.id)
  const members = await getFamilyMembers(supabase as any, user.id)
  const summary = summarizeHousehold(members)

  return NextResponse.json({
    tier,
    maxMembers,
    household,
    members,
    summary,
    upgradeMessage: getTierUpgradeMessage(tier),
    engineOverrides: buildFamilyEngineOverrides(members),
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = await getUserTier(supabase as any, user.id)
  const maxMembers = getMaxMembersForTier(tier)

  const household = await ensureHousehold(supabase as any, user.id)
  const existing = await getFamilyMembers(supabase as any, user.id)

  if (existing.length >= maxMembers) {
    const upgradeMsg = getTierUpgradeMessage(tier)
    const limitMsg = `You've reached your ${maxMembers}-profile limit.`
    return NextResponse.json(
      { error: upgradeMsg ? `${limitMsg} ${upgradeMsg}` : limitMsg },
      { status: 403 },
    )
  }

  const parsed = memberCreateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
  const body = parsed.data
  const firstName = body.first_name
  const role = body.role

  // Pro tier gets full rich profiles
  const isFullProfile = tier === 'pro'

  const payload: Record<string, unknown> = {
    household_id: household.id,
    user_id: user.id,
    member_name: firstName,
    first_name: firstName,
    role,
    age_years: body.age_years ?? null,
    age_range: body.age_range ?? null,
    dietary_type: body.dietary_type ?? null,
    allergies_json: body.allergies_json,
    display_order: body.display_order ?? existing.length,
  }

  // Full profile fields — Plus only
  if (isFullProfile) {
    Object.assign(payload, {
      foods_loved_json: body.foods_loved_json ?? [],
      foods_disliked_json: body.foods_disliked_json ?? [],
      protein_preferences_json: body.protein_preferences_json ?? [],
      cuisine_likes_json: body.cuisine_likes_json ?? [],
      spice_tolerance: body.spice_tolerance ?? null,
      picky_eater_level: body.picky_eater_level ?? 0,
      portion_size: body.portion_size ?? null,
      school_lunch_needed: body.school_lunch_needed ?? false,
      snack_frequency: body.snack_frequency ?? null,
      texture_sensitivity: body.texture_sensitivity ?? null,
      foods_accepted_json: body.foods_accepted_json ?? [],
      foods_rejected_json: body.foods_rejected_json ?? [],
      allergy_notes: body.allergy_notes ?? null,
      notes: body.notes ?? null,
      is_primary_shopper: body.is_primary_shopper ?? false,
      is_primary_cook: body.is_primary_cook ?? false,
      weight_goal: body.weight_goal ?? null,
    })
  }

  const { data, error } = await supabase
    .from('household_members')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, member: data })
}
