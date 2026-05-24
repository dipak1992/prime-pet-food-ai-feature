import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureHousehold, getUserTier } from '@/lib/family/service'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = await getUserTier(supabase as any, user.id)
  if (tier !== 'pro') {
    return NextResponse.json(
      { error: 'Upgrade to Pro to personalize meals for every family member.' },
      { status: 403 },
    )
  }

  const household = await ensureHousehold(supabase as any, user.id)
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''

  if (!name) return NextResponse.json({ error: 'Household name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', household.id)
    .eq('owner_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update household' }, { status: 500 })

  await supabase.auth.updateUser({ data: { household_name: name } })

  return NextResponse.json({ ok: true, household: data })
}
