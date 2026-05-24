import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { decideNow } from '@/lib/engine/decide'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'

interface SwapBody {
  currentMealId: string
  household: SmartMealRequest['household']
  allergies?: string[]
  dietaryRestrictions?: string[]
  cuisinePreferences?: string[]
  pantryItems?: string[]
  lowEnergy?: boolean
  budget?: 'low' | 'medium' | 'high'
  maxCookTime?: number
  excludeIds?: string[]
  learnedBoosts?: LearnedBoosts
  chipOverride?: {
    cuisinePreferences?: string[]
    lowEnergy?: boolean
    maxCookTime?: number
    preferredProteins?: string[]
  }
}

export const POST = withErrorHandler('decide/swap', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const body = (await req.json()) as SwapBody
  if (!body.household || !body.currentMealId) {
    return apiError('Missing household or currentMealId', 400)
  }

  // Merge chip overrides into the base request
  const request: SmartMealRequest = {
    household: body.household,
    allergies: body.allergies,
    dietaryRestrictions: body.dietaryRestrictions,
    cuisinePreferences: body.chipOverride?.cuisinePreferences ?? body.cuisinePreferences,
    pantryItems: body.pantryItems,
    lowEnergy: body.chipOverride?.lowEnergy ?? body.lowEnergy,
    budget: body.budget,
    maxCookTime: body.chipOverride?.maxCookTime ?? body.maxCookTime,
    preferredProteins: body.chipOverride?.preferredProteins,
    excludeIds: [...(body.excludeIds ?? []), body.currentMealId],
  }

  const result = decideNow({
    intent: 'surprise',
    request,
    learnedBoosts: body.learnedBoosts,
  })

  return apiSuccess({
    meal: result.meal,
    context: { mode: 'swap', swappedFrom: body.currentMealId },
  })
})
