import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSlug } from '@/lib/content/types'
import { sanitizePublicPlan } from '@/lib/content/sanitize-public'
import type { WeeklyPlan } from '@/lib/planner/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { plan?: WeeklyPlan }
  const plan = body?.plan

  if (!plan?.weekStart || !Array.isArray(plan?.days)) {
    return NextResponse.json({ error: 'Invalid plan data' }, { status: 400 })
  }

  const weekDate = new Date(plan.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const mealCount = plan.days.filter((d) => d.meal !== null).length
  const title = `${mealCount}-meal plan · Week of ${weekDate}`
  const slug = generateSlug(title)
  const publicPlan = sanitizePublicPlan(plan)

  const { data, error } = await supabase
    .from('published_plans')
    .insert({
      user_id: user.id,
      slug,
      title,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan_data: publicPlan as any,
      is_public: true,
    })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 })
}
