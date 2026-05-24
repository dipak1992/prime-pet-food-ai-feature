import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { optionalCleanString, stringArraySchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const settingsPatchSchema = z.object({
  firstName: optionalCleanString(80),
  full_name: optionalCleanString(120),
  dietary: stringArraySchema(30, 80).optional(),
  dislikes: stringArraySchema(60, 80).optional(),
  notifications: z.record(z.string().max(60), z.boolean()).optional(),
}).strict()

// ─── PATCH /api/settings ──────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = settingsPatchSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const body = parsed.data

    // Update profile fields
    const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.firstName !== undefined)     profileUpdate.first_name = body.firstName
    if (body.full_name !== undefined)     profileUpdate.full_name = body.full_name
    if (body.dietary !== undefined)       profileUpdate.dietary_preferences = body.dietary
    if (body.dislikes !== undefined)      profileUpdate.disliked_foods = body.dislikes
    if (body.notifications !== undefined) profileUpdate.notification_prefs = body.notifications

    if (Object.keys(profileUpdate).length > 1) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[settings PATCH]', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// ─── DELETE /api/settings ─────────────────────────────────────────────────────

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createSupabaseServiceClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      console.error('[settings DELETE] account deletion failed:', error.message)
      return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 })
    }

    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[settings DELETE] unexpected error:', err)
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 })
  }
}
