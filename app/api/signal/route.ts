import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess } from '@/lib/api-response'
import { onSignal } from '@/lib/learning/learn'
import logger from '@/lib/logger'
import { cleanString, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const VALID_SIGNALS = ['accepted', 'rejected', 'swapped', 'cooked', 'skipped', 'saved'] as const
type Signal = typeof VALID_SIGNALS[number]

const signalSchema = z.object({
  mealId: cleanString(120),
  signal: z.enum(VALID_SIGNALS),
  context: z.record(z.string().max(80), z.union([z.string().max(500), z.number(), z.boolean(), z.null()])).optional(),
}).strict()

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 60, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  let body: z.infer<typeof signalSchema>
  try {
    const parsed = signalSchema.safeParse(await req.json())
    if (!parsed.success) return apiError(validationError(parsed.error), 400)
    body = parsed.data
  } catch {
    return apiError('Invalid JSON', 400)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  const now = new Date()

  try {
    await onSignal(supabase, {
      userId: user.id,
      mealId: body.mealId,
      signal: body.signal,
      context: {
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        ...(body.context ?? {}),
      },
    })
  } catch (err) {
    logger.error('[signal] onSignal failed', { error: err instanceof Error ? err.message : String(err) })
    return apiError('Failed to record signal')
  }

  return apiSuccess({ recorded: true })
}
