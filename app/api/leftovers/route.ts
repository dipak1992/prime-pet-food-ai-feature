import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MainIngredient } from '@/lib/leftovers/types'
import { getUrgency, getDaysUntilExpiry } from '@/lib/leftovers/expiration-calculator'

function enrichRow(row: Record<string, unknown>) {
  const expiresAt = row.expires_at as string
  return {
    id: row.id,
    userId: row.user_id,
    householdId: row.household_id ?? null,
    sourceRecipeId: row.source_recipe_id ?? null,
    name: row.name,
    image: row.image ?? null,
    mainIngredients: (row.main_ingredients as MainIngredient[]) ?? [],
    servingsRemaining: row.servings_remaining,
    originalCostPerServing: row.original_cost_per_serving ?? null,
    notes: row.notes ?? null,
    cookedAt: row.cooked_at,
    expiresAt,
    status: row.status,
    usedAt: row.used_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    urgency: getUrgency(expiresAt),
    daysUntilExpiry: getDaysUntilExpiry(expiresAt),
  }
}

// GET /api/leftovers — list active leftovers, auto-expire stale ones
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Auto-expire
  await supabase
    .from('leftovers')
    .update({ status: 'expired' })
    .eq('user_id', user.id)
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())

  const { data, error } = await supabase
    .from('leftovers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []).map(enrichRow))
}

// POST /api/leftovers — create a new leftover
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    sourceRecipeId,
    name,
    image,
    mainIngredients,
    servingsRemaining,
    originalCostPerServing,
    notes,
    cookedAt,
    expiresAt,
  } = body

  if (!name || !servingsRemaining || !expiresAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('leftovers')
    .insert({
      user_id: user.id,
      source_recipe_id: sourceRecipeId ?? null,
      name,
      image: image ?? null,
      main_ingredients: mainIngredients ?? [],
      servings_remaining: servingsRemaining,
      original_cost_per_serving: originalCostPerServing ?? null,
      notes: notes ?? null,
      cooked_at: cookedAt ?? new Date().toISOString(),
      expires_at: expiresAt,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(enrichRow(data as Record<string, unknown>), { status: 201 })
}

// Export helper for other routes (e.g. AI suggestions context)
export async function getActiveLeftoverIngredients(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leftovers')
    .select('main_ingredients')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(10)

  if (!data) return []
  const names: string[] = []
  for (const row of data) {
    const ings = (row.main_ingredients as MainIngredient[]) ?? []
    names.push(...ings.map((i) => i.name))
  }
  return [...new Set(names)]
}
