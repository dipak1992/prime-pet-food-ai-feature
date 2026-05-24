import { NextRequest, NextResponse } from 'next/server'
import { generateMealPlan } from '@/lib/ai/meal-generator'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import logger from '@/lib/logger'
import { aiGenerationRequestSchema, promptInjectionIssue, validationError } from '@/lib/validation/input'
import type { AIGenerationRequest } from '@/types'

const DAILY_PLAN_LIMIT = 10
const AI_PLAN_QUOTA = {
  key: 'ai_plan_generation',
  limit: DAILY_PLAN_LIMIT,
  label: 'AI plan generation',
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthenticated', 401)

  const quotaResponse = await enforceFeatureQuota(supabase, user.id, AI_PLAN_QUOTA)
  if (quotaResponse) return quotaResponse

  try {
    const parsed = aiGenerationRequestSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const injectionIssue = promptInjectionIssue(parsed.data)
    if (injectionIssue) return NextResponse.json({ error: injectionIssue }, { status: 400 })
    const body = parsed.data as unknown as AIGenerationRequest

    const plan = await generateMealPlan(body)

    await incrementFeatureQuota(supabase, AI_PLAN_QUOTA)

    // Track last meaningful activity for reactivation/winback emails
    supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('user_id', user.id).then(() => {}, () => {})

    return NextResponse.json(plan)
  } catch (err) {
    logger.error('[generate-plan] Unhandled error', { error: err instanceof Error ? err.message : String(err) })
    return apiError('Failed to generate meal plan')
  }
}
