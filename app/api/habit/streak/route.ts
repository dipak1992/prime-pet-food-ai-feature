import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── GET /api/habit/streak ────────────────────────────────────────────────────
// Opens the app = counts as an active day. Updates streak automatically.

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ current_streak: 0, longest_streak: 0 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('habit_streaks')
      .select('current_streak, longest_streak, last_active_date')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabase.from('habit_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
      })
      return NextResponse.json({ current_streak: 1, longest_streak: 1 })
    }

    if (existing.last_active_date === today) {
      return NextResponse.json({
        current_streak: existing.current_streak,
        longest_streak: existing.longest_streak,
      })
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak =
      existing.last_active_date === yesterdayStr ? existing.current_streak + 1 : 1
    const newLongest = Math.max(newStreak, existing.longest_streak ?? 0)

    await supabase
      .from('habit_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({ current_streak: newStreak, longest_streak: newLongest })
  } catch (err) {
    console.error('[habit/streak] error:', err)
    return NextResponse.json({ current_streak: 0, longest_streak: 0 })
  }
}
