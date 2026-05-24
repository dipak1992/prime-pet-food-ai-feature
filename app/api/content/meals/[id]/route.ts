import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sanitizePublicMeal } from '@/lib/content/sanitize-public'

type Params = Promise<{ id: string }>

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('saved_meals')
    .select('id, slug, title, description, cuisine_type, meal_data, is_public, created_at, published_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ meal: data })
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    title?: string
    description?: string | null
    is_public?: boolean
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) {
    updates.title = String(body.title).slice(0, 100)
  }
  if (body.description !== undefined) {
    updates.description = body.description ? String(body.description).slice(0, 500) : null
  }
  if (body.is_public !== undefined) {
    updates.is_public = Boolean(body.is_public)
    if (body.is_public) updates.published_at = new Date().toISOString()
  }

  if (body.is_public) {
    const { data: mealRow } = await supabase
      .from('saved_meals')
      .select('meal_data')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!mealRow?.meal_data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    updates.meal_data = sanitizePublicMeal(mealRow.meal_data as Parameters<typeof sanitizePublicMeal>[0])
  }

  const { error } = await supabase
    .from('saved_meals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id) // enforce ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('saved_meals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // enforce ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
