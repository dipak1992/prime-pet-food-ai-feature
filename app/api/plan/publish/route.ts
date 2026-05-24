import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { buildGroceryList, type WeeklyPlan } from '@/lib/planner/adapt'

interface PublishBody {
  weekOf: string // ISO date string
}

export const POST = withErrorHandler('plan/publish', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Authentication required', 401)

  const body = (await req.json()) as PublishBody
  if (!body.weekOf) return apiError('Missing weekOf', 400)

  // Load plan
  const { data: planRow, error: fetchErr } = await supabase
    .from('weekly_plans')
    .select('id, plan, status')
    .eq('user_id', user.id)
    .eq('week_of', body.weekOf)
    .single()

  if (fetchErr || !planRow) return apiError('Plan not found', 404)

  const plan = planRow.plan as WeeklyPlan
  const activeDays = plan.filter(d => !d.skipped && d.meal)

  if (activeDays.length === 0) return apiError('Plan has no meals to publish', 400)

  // Mark plan as active
  const { error: updateErr } = await supabase
    .from('weekly_plans')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', planRow.id)
    .eq('user_id', user.id)

  if (updateErr) return apiError('Failed to publish plan', 500)

  const groceries = buildGroceryList(plan)

  return apiSuccess({
    published: true,
    weekOf: body.weekOf,
    mealCount: activeDays.length,
    groceries,
  })
})
