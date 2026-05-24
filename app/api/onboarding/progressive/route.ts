import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ProgressiveProfileField } from '@/lib/onboarding/progressive'

const progressiveSchema = z.object({
  field: z.enum([
    'disliked_ingredients',
    'cuisine_preferences',
    'weekly_budget',
    'budget_style',
    'family_mode_enabled',
    'skill_level',
  ]),
  value: z.union([z.string().min(1).max(80), z.number().min(0).max(5000), z.boolean()]),
}).strict()

function uniqueStrings(values: unknown[]) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

function buildPreferencePatch(
  field: ProgressiveProfileField,
  value: string | number | boolean,
  existing: Record<string, unknown> | null,
) {
  switch (field) {
    case 'disliked_ingredients':
      return typeof value === 'string'
        ? { disliked_ingredients: uniqueStrings([...(Array.isArray(existing?.disliked_ingredients) ? existing.disliked_ingredients : []), value]) }
        : null
    case 'cuisine_preferences':
      return typeof value === 'string'
        ? { cuisine_preferences: uniqueStrings([...(Array.isArray(existing?.cuisine_preferences) ? existing.cuisine_preferences : []), value]) }
        : null
    case 'weekly_budget':
      return typeof value === 'number' ? { weekly_budget: value } : null
    case 'budget_style':
      return typeof value === 'number' ? { budget_style: Math.round(value) } : null
    case 'family_mode_enabled':
      return typeof value === 'boolean' ? { family_mode_enabled: value } : null
    case 'skill_level':
      return typeof value === 'string' ? { skill_level: value } : null
    default:
      return null
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = progressiveSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile prompt payload' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('household_preferences')
    .select('disliked_ingredients,cuisine_preferences')
    .eq('user_id', user.id)
    .maybeSingle()

  const patch = buildPreferencePatch(parsed.data.field, parsed.data.value, existing)
  if (!patch) {
    return NextResponse.json({ error: 'Unsupported profile value' }, { status: 400 })
  }

  const { error } = await supabase
    .from('household_preferences')
    .upsert(
      {
        user_id: user.id,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('[onboarding/progressive]', error.message)
    return NextResponse.json({ error: 'Could not save preference' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
