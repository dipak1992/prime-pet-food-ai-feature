import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { cleanString, isoDateSchema, uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const pantryItemSchema = z.object({
  name: cleanString(100),
  category: cleanString(50).optional(),
  quantity: z.coerce.number().min(0).max(999).optional(),
  unit: cleanString(20).optional(),
  expires_at: isoDateSchema.nullable().optional(),
}).strict()

export const GET = withErrorHandler('pantry/GET', async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data, error } = await supabase
    .from('pantry_items')
    .select('id, name, category, quantity, unit, expires_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})

export const POST = withErrorHandler('pantry/POST', async (req: Request) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const parsed = pantryItemSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(validationError(parsed.error), 400)
  const body = parsed.data

  const { data, error } = await supabase
    .from('pantry_items')
    .insert({
      user_id: user.id,
      name: body.name,
      category: body.category ?? 'Other',
      quantity: body.quantity ?? 1,
      unit: body.unit ?? 'unit',
      expires_at: body.expires_at || null,
      added_via: 'manual',
    })
    .select('id, name, category, quantity, unit, expires_at')
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data, 201)
})

export const DELETE = withErrorHandler('pantry/DELETE', async (req: Request) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL((req as NextRequest).url)
  const parsedId = uuidSchema.safeParse(searchParams.get('id'))
  if (!parsedId.success) return apiError('id is required', 400)
  const id = parsedId.data

  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return apiError(error.message, 500)
  return apiSuccess({ deleted: id })
})
