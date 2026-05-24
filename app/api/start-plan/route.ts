import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSmartMeal } from '@/lib/engine/engine'
import { buildGroceryList } from '@/lib/planner/grocery'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'
import { stringArraySchema, validationError } from '@/lib/validation/input'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { WeekDay, WeeklyPlan } from '@/lib/planner/types'

const goalSchema = z.enum(['quick', 'budget', 'healthy', 'picky', 'leftovers'])

const startPlanSchema = z.object({
  pantryItems: stringArraySchema(40, 80).default([]),
  householdSize: z.coerce.number().int().min(1).max(12).default(2),
  dietary: stringArraySchema(20, 80).default([]),
  goal: goalSchema.default('quick'),
}).strict()

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function buildRequest(input: z.infer<typeof startPlanSchema>): SmartMealRequest {
  const adultsCount = input.householdSize > 1 ? 2 : 1
  const kidsCount = Math.max(0, input.householdSize - adultsCount)

  return {
    household: { adultsCount, kidsCount, toddlersCount: 0, babiesCount: 0 },
    pantryItems: input.pantryItems,
    dietaryRestrictions: input.dietary,
    lowEnergy: input.goal === 'quick' || input.goal === 'leftovers',
    budget: input.goal === 'budget' ? 'low' : 'medium',
    maxCookTime: input.goal === 'quick' ? 25 : 40,
    pickyEater: input.goal === 'picky' ? { active: true } : undefined,
  }
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    key: `start-plan:${rateLimitKeyFromRequest(req)}`,
    limit: 8,
    windowMs: 60_000,
  })
  if (!rl.success) return apiRateLimited(rl.reset)

  const parsed = startPlanSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
  }

  const input = parsed.data
  const meal = generateSmartMeal(buildRequest(input))
  const weekStart = getWeekStart()
  const today = new Date().getDay()
  const dayIndex = today === 0 ? 6 : today - 1
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${weekStart}T00:00:00`)
    d.setDate(d.getDate() + i)
    return {
      dayIndex: i,
      date: d.toISOString().split('T')[0],
      meal: i === dayIndex ? meal : null,
    }
  })
  const plan: WeeklyPlan = {
    id: `start-${weekStart}`,
    weekStart,
    days,
    generatedAt: new Date().toISOString(),
  }
  const groceryList = buildGroceryList([meal], input.pantryItems, 'standard', weekStart)

  return NextResponse.json({
    meal,
    plan,
    groceryList,
    activation: {
      householdSize: input.householdSize,
      dietary: input.dietary,
      goal: input.goal,
      pantryItems: input.pantryItems,
    },
  })
}
