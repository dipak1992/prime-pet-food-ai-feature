import { NextRequest, NextResponse } from 'next/server'
import { generateSmartMeal } from '@/lib/engine/engine'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'
import { stringArraySchema } from '@/lib/validation/input'
import { z } from 'zod'

const guestMealSchema = z.object({
  excludeIds: stringArraySchema(20, 80).optional(),
}).strict()

/**
 * Guest meal endpoint — no auth required.
 * Returns generic (non-personalised) meal suggestions using the local engine.
 * Rate-limited per IP to 10 requests/minute.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: `guest:${rateLimitKeyFromRequest(req)}`, limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  let excludeIds: string[] = []
  try {
    const parsed = guestMealSchema.safeParse(await req.json())
    if (parsed.success) excludeIds = parsed.data.excludeIds ?? []
  } catch {
    // body is optional — continue with defaults
  }

  const now = new Date()
  const hour = now.getHours()
  const isWeekend = [0, 6].includes(now.getDay())
  const maxCookTime = isWeekend ? 50 : hour < 11 ? 20 : hour < 17 ? 25 : 35
  const lowEnergy = hour < 17

  const result = generateSmartMeal(
    {
      household: { adultsCount: 2, kidsCount: 0, toddlersCount: 0, babiesCount: 0 },
      lowEnergy,
      maxCookTime,
      excludeIds,
    },
    undefined, // no personalisation for guests
  )

  return NextResponse.json(result)
}
