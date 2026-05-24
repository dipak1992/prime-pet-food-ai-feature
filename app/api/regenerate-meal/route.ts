import { NextRequest, NextResponse } from 'next/server'
import { regenerateMeals } from '@/lib/ai/meal-generator'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import logger from '@/lib/logger'
import { aiGenerationRequestSchema, cleanString, promptInjectionIssue, validationError } from '@/lib/validation/input'
import type { AIGenerationRequest } from '@/types'
import { z } from 'zod'

const REGENERATE_QUOTA = {
  key: 'ai_meal_regeneration',
  limit: 20,
  label: 'meal regeneration',
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)
  const quotaResponse = await enforceFeatureQuota(supabase, user.id, REGENERATE_QUOTA)
  if (quotaResponse) return quotaResponse

  try {
    const requestSchema = z.object({
      request: aiGenerationRequestSchema,
      modifier: cleanString(160),
      currentMealContext: z.record(z.string(), z.unknown()).optional(),
    }).strict()
    const parsed = requestSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const injectionIssue = promptInjectionIssue(parsed.data)
    if (injectionIssue) return NextResponse.json({ error: injectionIssue }, { status: 400 })
    const body = parsed.data as unknown as { request: AIGenerationRequest; modifier: string; currentMealContext?: Record<string, unknown> }

    const plan = await regenerateMeals(body.request, body.modifier, body.currentMealContext)
    await incrementFeatureQuota(supabase, REGENERATE_QUOTA)
    // Track last meaningful activity for reactivation/winback emails
    supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('user_id', user.id).then(() => {}, () => {})
    return NextResponse.json(plan)
  } catch (err) {
    logger.error('[regenerate-meal] Error', { error: err instanceof Error ? err.message : String(err) })
    return apiError('Failed to regenerate meals')
  }
}
