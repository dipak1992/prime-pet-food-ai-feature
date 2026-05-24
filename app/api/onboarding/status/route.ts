import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function countSelectedPrefs(row: Record<string, unknown>): number {
  let n = 0
  const cuisines = Array.isArray(row.cuisines) ? row.cuisines : []
  const disliked = Array.isArray(row.disliked_foods) ? row.disliked_foods : []
  if (cuisines.length > 0) n++
  if (typeof row.cooking_time_minutes === 'number' && row.cooking_time_minutes !== 30) n++
  if (row.household_type) n++
  if (row.has_kids != null) n++
  if (row.low_energy === true) n++
  if (disliked.length > 0) n++
  if (row.country) n++
  return n
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ selectedCount: 0, shouldShowPrompt: false })
    }

    const { data: row } = await supabase
      .from('onboarding_preferences')
      .select('cuisines, cooking_time_minutes, household_type, has_kids, low_energy, disliked_foods, country')
      .eq('user_id', user.id)
      .single()

    const selectedCount = row ? countSelectedPrefs(row as Record<string, unknown>) : 0
    const shouldShowPrompt = selectedCount < 3

    return NextResponse.json({ selectedCount, shouldShowPrompt })
  } catch (err) {
    console.error('[onboarding/status]', err)
    return NextResponse.json({ selectedCount: 0, shouldShowPrompt: false })
  }
}
