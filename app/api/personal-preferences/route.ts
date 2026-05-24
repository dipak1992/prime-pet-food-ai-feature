// ============================================================
// API: GET /api/personal-preferences
//      PATCH /api/personal-preferences
//
// GET  — returns the authenticated user's personal preferences
// PATCH — upserts (merge) partial preference fields
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
// Inline type (was in types/cook-tools.ts, now removed)
interface PersonalPreferences {
  user_id: string
  weight_goal: 'lose' | 'maintain' | 'gain'
  protein_focus: boolean
  is_vegetarian: boolean
  allergies: string[]
  avoid_foods: string[]
}

const DEFAULT_PERSONAL_PREFS: Omit<PersonalPreferences, 'user_id'> = {
  weight_goal: 'maintain',
  protein_focus: false,
  is_vegetarian: false,
  allergies: [],
  avoid_foods: [],
}

export async function GET(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 60, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  const { data, error } = await supabase
    .from('personal_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return apiError('Failed to fetch personal preferences', 500)
  }

  return NextResponse.json(data ?? { user_id: user.id, ...DEFAULT_PERSONAL_PREFS })
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

  const ALLOWED_FIELDS: (keyof PersonalPreferences)[] = [
    'weight_goal',
    'protein_focus',
    'is_vegetarian',
    'allergies',
    'avoid_foods',
  ]

  const patch: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      patch[field] = body[field]
    }
  }

  const { data, error } = await supabase
    .from('personal_preferences')
    .upsert(patch, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    return apiError('Failed to save personal preferences', 500)
  }

  return NextResponse.json(data)
}
