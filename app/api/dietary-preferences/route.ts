// ============================================================
// API: GET /api/dietary-preferences
//      PATCH /api/dietary-preferences
//
// GET  — returns the authenticated user's dietary preferences
// PATCH — upserts (merge) partial preference fields
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
import { DEFAULT_PREFS } from '@/lib/meal-engine/preferences'

export async function GET(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 60, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  const { data, error } = await supabase
    .from('user_dietary_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found — that's fine, return defaults
    return apiError('Failed to fetch preferences', 500)
  }

  return NextResponse.json(data ?? { user_id: user.id, ...DEFAULT_PREFS })
}

export async function PATCH(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  // Whitelist updatable fields to prevent injection of arbitrary columns
  const ALLOWED_FIELDS = [
    'eating_style',
    'avoid_foods',
    'allergies',
    'favorite_proteins',
    'cuisine_love',
    'goals',
    'kids_spice_tolerance',
    'kids_foods_love',
    'kids_foods_reject',
  ]

  const patch: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() }
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      patch[field] = body[field]
    }
  }

  const { data, error } = await supabase
    .from('user_dietary_preferences')
    .upsert(patch, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    return apiError('Failed to save preferences', 500)
  }

  return NextResponse.json(data)
}
