import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { cleanString, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const scanBodySchema = z.object({
  items: z.array(z.object({
    name: cleanString(100),
    category: cleanString(50).optional(),
    quantity: z.coerce.number().min(0).max(999).optional(),
    unit: cleanString(20).optional(),
  }).strict()).min(1).max(50),
}).strict()

export const POST = withErrorHandler('pantry/scan', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 10, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Authentication required', 401)

  const parsed = scanBodySchema.safeParse(await req.json())
  if (!parsed.success) return apiError(validationError(parsed.error), 400)
  const body = parsed.data

  // Validate and sanitize items
  const sanitized = body.items
    .map(item => ({
      user_id: user.id,
      name: item.name,
      category: item.category ?? 'other',
      quantity: item.quantity ?? 1,
      unit: item.unit ?? 'unit',
      added_via: 'receipt' as const,
    }))

  if (!sanitized.length) return apiError('No valid items after sanitization', 400)

  const { data, error } = await supabase
    .from('pantry_items')
    .insert(sanitized)
    .select()

  if (error) return apiError('Failed to save pantry items', 500)

  return apiSuccess({ added: data?.length ?? 0, items: data })
})
