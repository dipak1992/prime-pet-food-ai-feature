import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import { normalizeTier } from '@/lib/paywall/config'
import { cleanText, dataUrlImageSchema, validationError } from '@/lib/validation/input'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI()
  return _openai
}

const SYSTEM_PROMPT = `You are a kitchen-inventory scanner. The user will show you a photo of their fridge, pantry shelf, or grocery items. List every distinct food ingredient you can see. Return ONLY a JSON array of lowercase English strings — no quantities, no brands, no packaging. Example: ["eggs","milk","cheddar cheese","spinach","chicken breast"]. If you cannot identify any food, return [].`

export const POST = withErrorHandler('pantry/vision', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 5, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Authentication required', 401)

  // Snap & Cook paywall: keep visible for free users, allow 3 scans/week, then gate.
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, temp_pro_until')
    .eq('id', user.id)
    .maybeSingle()

  const tier = normalizeTier(profile?.subscription_tier)
  const isTempPro = !!profile?.temp_pro_until && new Date(profile.temp_pro_until) > new Date()
  const isPaidOrTrial = tier === 'pro' || isTempPro

  if (!isPaidOrTrial) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)

    const weekStartIso = weekStart.toISOString().slice(0, 10)
    const todayIso = now.toISOString().slice(0, 10)

    const { data: weeklyUsage } = await supabase
      .from('feature_usage')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('feature_key', 'snap_cook_scan')
      .gte('usage_date', weekStartIso)

    const used = (weeklyUsage ?? []).reduce((acc, row) => acc + (row.usage_count ?? 0), 0)
    const limit = 3

    if (used >= limit) {
      return Response.json(
        {
          success: false,
          error: 'Free Snap & Cook limit reached (3 scans/week). Upgrade for unlimited scans.',
          code: 'snap_cook_quota_exceeded',
          quota: { used, limit, period: 'week' },
        },
        { status: 402 },
      )
    }

    const { data: todayUsage } = await supabase
      .from('feature_usage')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('feature_key', 'snap_cook_scan')
      .eq('usage_date', todayIso)
      .maybeSingle()

    if (todayUsage) {
      await supabase
        .from('feature_usage')
        .update({ usage_count: (todayUsage.usage_count ?? 0) + 1 })
        .eq('user_id', user.id)
        .eq('feature_key', 'snap_cook_scan')
        .eq('usage_date', todayIso)
    } else {
      await supabase
        .from('feature_usage')
        .insert({
          user_id: user.id,
          feature_key: 'snap_cook_scan',
          usage_date: todayIso,
          usage_count: 1,
        })
    }
  }

  const parsedImage = dataUrlImageSchema.safeParse(await req.json())
  if (!parsedImage.success) return apiError(validationError(parsedImage.error), 400)
  const { image } = parsedImage.data

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: image, detail: 'low' },
          },
          { type: 'text', text: 'What food ingredients do you see?' },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? '[]'

  // Parse the JSON array — strip markdown fences if present
  let items: string[]
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    items = JSON.parse(cleaned)
    if (!Array.isArray(items)) throw new Error('not an array')
    items = items
      .filter((i): i is string => typeof i === 'string' && i.length > 0)
      .map(i => cleanText(i.toLowerCase(), 100))
      .slice(0, 50)
  } catch {
    return apiError('Failed to parse vision response', 502)
  }

  return apiSuccess({ items })
})
