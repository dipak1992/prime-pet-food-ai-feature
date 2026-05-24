import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const familyModeSchema = z.object({
  enabled: z.coerce.boolean(),
}).strict()

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = familyModeSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid family mode value' }, { status: 400 })

  const { error } = await supabase
    .from('household_preferences')
    .upsert(
      {
        user_id: user.id,
        family_mode_enabled: parsed.data.enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) return NextResponse.json({ error: 'Unable to save family mode' }, { status: 500 })
  return NextResponse.json({ ok: true, familyModeEnabled: parsed.data.enabled })
}
