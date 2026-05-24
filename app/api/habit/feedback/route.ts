import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── Shared streak update helper ──────────────────────────────────────────────

async function touchStreak(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('habit_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await supabase.from('habit_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    })
    return
  }

  if (existing.last_active_date === today) return // already active today

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak =
    existing.last_active_date === yesterdayStr ? existing.current_streak + 1 : 1
  const newLongest = Math.max(newStreak, existing.longest_streak ?? 0)

  await supabase
    .from('habit_streaks')
    .update({ current_streak: newStreak, longest_streak: newLongest, last_active_date: today, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

// ── POST /api/habit/feedback ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { meal_id, meal_title, meal_cuisine, rating } = body ?? {}

    if (!meal_id || !meal_title || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validRatings = ['loved', 'okay', 'didnt_work']
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Anonymous — silently skip DB save but acknowledge
      return NextResponse.json({ saved: false })
    }

    await supabase.from('meal_feedback').insert({
      user_id: user.id,
      meal_id,
      meal_title,
      meal_cuisine: meal_cuisine ?? null,
      rating,
    })

    await touchStreak(supabase, user.id)

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('[habit/feedback] error:', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
