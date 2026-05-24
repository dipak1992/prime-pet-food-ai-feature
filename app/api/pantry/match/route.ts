import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { matchPantryMeals } from '@/lib/engine/decide'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'
import { promptInjectionIssue, smartMealRequestSchema, stringArraySchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const pantryMatchSchema = smartMealRequestSchema.pick({
  household: true,
  allergies: true,
  dietaryRestrictions: true,
  budget: true,
  maxCookTime: true,
}).extend({
  pantryItems: stringArraySchema(80, 80),
  learnedBoosts: z.unknown().optional(),
  limit: z.coerce.number().int().min(1).max(3).optional(),
}).strict()

export const POST = withErrorHandler('pantry/match', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 20, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const parsed = pantryMatchSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(validationError(parsed.error), 400)
  const injectionIssue = promptInjectionIssue(parsed.data)
  if (injectionIssue) return apiError(injectionIssue, 400)
  const body = parsed.data as z.infer<typeof pantryMatchSchema> & { learnedBoosts?: LearnedBoosts }

  // Optionally pull server-side pantry items if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let allPantryItems = body.pantryItems
  if (user) {
    const { data: serverPantry } = await supabase
      .from('pantry_items')
      .select('name')
      .eq('user_id', user.id)
    if (serverPantry?.length) {
      const serverNames = serverPantry.map(p => p.name)
      allPantryItems = Array.from(new Set([...body.pantryItems, ...serverNames]))
    }
  }

  const request: SmartMealRequest = {
    household: body.household,
    pantryItems: allPantryItems,
    allergies: body.allergies,
    dietaryRestrictions: body.dietaryRestrictions,
    budget: body.budget,
    maxCookTime: body.maxCookTime,
  }

  const mealResults = matchPantryMeals(
    allPantryItems,
    request,
    body.learnedBoosts,
    Math.min(body.limit ?? 3, 3), // cap at 3 per golden rule
  )

  // Normalize into { meal, pantryPercent } shape expected by the client
  const matches = mealResults.map((meal) => ({
    meal,
    pantryPercent: Math.round((meal.meta?.pantryUtilization ?? 0) * 100),
  }))

  return apiSuccess({
    matches,
    meals: mealResults, // keep legacy key for any other consumers
    pantryItemCount: allPantryItems.length,
  })
})
