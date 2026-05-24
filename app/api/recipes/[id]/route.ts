import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/recipes/[id] ────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 120, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('meals')
      .select('*, variations:meal_variations(*)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
