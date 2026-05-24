import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validationError } from '@/lib/validation/input'
import { z } from 'zod'

const notificationPatchSchema = z.object({
  enabled: z.boolean(),
  preferred_hour: z.coerce.number().int().min(0).max(23).optional(),
}).strict()

// ── GET /api/habit/notifications ─────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ enabled: false, preferred_hour: 17 })
    }

    const { data } = await supabase
      .from('notification_preferences')
      .select('enabled, preferred_hour')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json(data ?? { enabled: false, preferred_hour: 17 })
  } catch (err) {
    console.error('[habit/notifications GET] error:', err)
    return NextResponse.json({ enabled: false, preferred_hour: 17 })
  }
}

// ── PATCH /api/habit/notifications ───────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = notificationPatchSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const { enabled, preferred_hour } = parsed.data

    await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      enabled,
      preferred_hour: preferred_hour ?? 17,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('[habit/notifications PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
