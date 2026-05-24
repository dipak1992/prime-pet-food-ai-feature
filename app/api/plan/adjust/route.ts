import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import {
  onMealSkipped,
  onDayBusy,
  replaceDayMeal,
  buildGroceryList,
  type WeeklyPlan,
} from '@/lib/planner/adapt'
import { decideNow } from '@/lib/engine/decide'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { LearnedBoosts, PreferenceSignal } from '@/lib/learning/types'

interface AdjustBody {
  weekOf: string // ISO date string, e.g. '2025-01-06'
  action: 'skip' | 'busy' | 'swap' | 'lock' | 'unlock'
  dayIndex: number
  // For swap action — provide meal generation context
  household?: SmartMealRequest['household']
  allergies?: string[]
  dietary?: string[]
  pantry?: string[]
  learnedBoosts?: LearnedBoosts
  signal?: PreferenceSignal
}

export const POST = withErrorHandler('plan/adjust', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Authentication required', 401)

  const body = (await req.json()) as AdjustBody
  if (!body.weekOf || body.dayIndex == null || !body.action) {
    return apiError('Missing weekOf, dayIndex, or action', 400)
  }
  if (body.dayIndex < 0 || body.dayIndex > 6) {
    return apiError('dayIndex must be 0-6', 400)
  }

  // Load existing plan
  const { data: planRow, error: fetchErr } = await supabase
    .from('weekly_plans')
    .select('id, plan, status')
    .eq('user_id', user.id)
    .eq('week_of', body.weekOf)
    .single()

  if (fetchErr || !planRow) return apiError('Plan not found for this week', 404)

  let plan = planRow.plan as WeeklyPlan

  switch (body.action) {
    case 'skip': {
      // Generate a replacement meal
      let replacement = null
      if (body.household) {
        const existingMealIds = plan
          .filter(d => d.mealId)
          .map(d => d.mealId!)

        const result = await decideNow({
          intent: 'quick',
          request: {
            household: body.household,
            allergies: body.allergies ?? [],
            dietaryRestrictions: body.dietary ?? [],
            pantryItems: body.pantry ?? [],
          },
          learnedBoosts: body.learnedBoosts,
          signal: body.signal,
          recentMealIds: existingMealIds,
        })
        replacement = result.meal
      }
      plan = onMealSkipped(plan, body.dayIndex, replacement)
      break
    }
    case 'busy':
      plan = onDayBusy(plan, body.dayIndex)
      break
    case 'swap': {
      if (!body.household) return apiError('household required for swap', 400)
      const existingMealIds = plan
        .filter(d => d.mealId)
        .map(d => d.mealId!)

      const result = await decideNow({
        intent: 'surprise',
        request: {
          household: body.household,
          allergies: body.allergies ?? [],
          dietaryRestrictions: body.dietary ?? [],
          pantryItems: body.pantry ?? [],
        },
        learnedBoosts: body.learnedBoosts,
        signal: body.signal,
        recentMealIds: existingMealIds,
      })
      if (result.meal) {
        plan = replaceDayMeal(plan, body.dayIndex, result.meal)
      }
      break
    }
    case 'lock': {
      const updated = [...plan]
      if (updated[body.dayIndex]) {
        updated[body.dayIndex] = { ...updated[body.dayIndex], locked: true }
      }
      plan = updated
      break
    }
    case 'unlock': {
      const updated = [...plan]
      if (updated[body.dayIndex]) {
        updated[body.dayIndex] = { ...updated[body.dayIndex], locked: false }
      }
      plan = updated
      break
    }
    default:
      return apiError('Invalid action', 400)
  }

  // Save updated plan
  const { error: updateErr } = await supabase
    .from('weekly_plans')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', planRow.id)
    .eq('user_id', user.id)

  if (updateErr) return apiError('Failed to update plan', 500)

  const groceries = buildGroceryList(plan)

  return apiSuccess({ plan, groceries })
})
