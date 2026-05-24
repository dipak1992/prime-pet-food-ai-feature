import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { loadBudgetPayload } from '@/app/(app)/budget/loader'
import { cleanString, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const budgetPutSchema = z.object({
  weeklyLimit: z.coerce.number().min(0).max(5000).nullable().optional(),
  strictMode: z.coerce.boolean().optional(),
  zipCode: z.string().trim().regex(/^[A-Za-z0-9 -]{3,12}$/).nullable().optional(),
  preferredStore: cleanString(80).nullable().optional(),
}).strict()

// ─── GET /api/budget ──────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paywall = await getPaywallStatus()
  const plan = paywall.isPro ? 'plus' : 'free'

  const payload = await loadBudgetPayload(user.id, plan)
  return NextResponse.json(payload)
}

// ─── PUT /api/budget ──────────────────────────────────────────────────────────

export async function PUT(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paywall = await getPaywallStatus()
  if (!paywall.isPro) {
    return NextResponse.json({ error: 'Plus plan required' }, { status: 403 })
  }

  const parsed = budgetPutSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
  const { weeklyLimit, strictMode, zipCode, preferredStore } = parsed.data

  const { data: existing } = await supabase
    .from('budgets')
    .select('weekly_limit, strict_mode, zip_code, preferred_store')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: user.id,
      weekly_limit: weeklyLimit ?? existing?.weekly_limit ?? null,
      strict_mode: strictMode ?? existing?.strict_mode ?? false,
      zip_code: zipCode ?? existing?.zip_code ?? null,
      preferred_store: preferredStore ?? existing?.preferred_store ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    console.error('[api/budget PUT]', error)
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
