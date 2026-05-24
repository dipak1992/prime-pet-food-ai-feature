import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess, withErrorHandler } from '@/lib/api-response'
import type { VisionScanResult } from '@/lib/pantry/types'
import { cleanText, dataUrlImageSchema, validationError } from '@/lib/validation/input'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI()
  return _openai
}

/**
 * ============================================================
 * IMPROVED VISION DETECTION WITH CONFIDENCE TIERS
 * ============================================================
 * 
 * This prompt asks GPT-4o to categorize detected ingredients
 * by confidence level, preventing hallucinated items from
 * appearing as "definitely available"
 */

const SYSTEM_PROMPT = `You are a kitchen-inventory scanner with a critical accuracy requirement:
TRUST IS EVERYTHING. If ingredients are hallucinated, trust is destroyed.

RULES:
1. Only categorize ingredients you can CLEARLY SEE in the photo
2. Organize by confidence level:
   - CONFIRMED: Clearly visible, identifiable by label, packaging, or distinctive appearance
   - PROBABLE: Visible but slightly uncertain (e.g., unlabeled can, partially obscured item)
   - UNCERTAIN: Barely visible, or could be misidentified

3. NEVER guess major proteins, dairy, or fresh items unless clearly visible
4. NEVER assume common pantry items just because the shelf looks like a pantry
5. When in doubt, categorize lower

EXAMPLES OF CONFIDENT DETECTIONS:
✅ Labeled pasta box "Barilla Penne"
✅ Clearly visible rice bag with brand name
✅ Labeled canned beans with "DEL MONTE" clearly shown
✅ Distinctive cereal box
✅ Visible olive oil bottle

EXAMPLES OF UNCERTAIN DETECTIONS:
❌ Unlabeled brown container (could be sugar, flour, cocoa, etc.)
❌ Blurry text on label
❌ Item partially hidden behind another item
❌ Generic-looking jar without clear contents visible
❌ Assuming "chicken" because it's a kitchen (NEVER assume proteins)

RETURN ONLY THIS JSON STRUCTURE:
{
  "confirmed_items": ["pasta", "canned beans", "olive oil"],
  "probable_items": ["rice", "some kind of sauce"],
  "uncertain_items": ["unlabeled jar", "brown container"],
  "notes": "Short explanation of any ambiguous items"
}

Use lowercase names, singular form, generic names (e.g., "canned tomatoes" not "Del Monte brand tomato sauce").
Be conservative. Better to miss something than hallucinate.`

export const POST = withErrorHandler('pantry/vision/v2', async (req: Request) => {
  const nextReq = req as unknown as NextRequest
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(nextReq), limit: 5, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Authentication required', 401)

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
          { type: 'text', text: 'Analyze this pantry/fridge photo. What food items can you see? Categorize by confidence.' },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? '{}'

  // Parse the structured JSON response
  let result: VisionScanResult
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const parsed = JSON.parse(cleaned)
    
    // Validate and normalize
    const sanitize = (arr: any[]): string[] =>
      (Array.isArray(arr) ? arr : [])
        .filter((i): i is string => typeof i === 'string' && i.length > 0)
        .map(i => cleanText(i.toLowerCase(), 100))
        .slice(0, 50)

    result = {
      confirmed_items: sanitize(parsed.confirmed_items ?? []),
      probable_items: sanitize(parsed.probable_items ?? []),
      uncertain_items: sanitize(parsed.uncertain_items ?? []),
      raw_response: raw,
      timestamp: new Date().toISOString(),
    }

    // Validate we got something
    const total = result.confirmed_items.length + result.probable_items.length + result.uncertain_items.length
    if (total === 0) {
      return apiSuccess({
        confirmed_items: [],
        probable_items: [],
        uncertain_items: [],
        raw_response: raw,
        timestamp: result.timestamp,
        note: 'No food items detected in photo',
      })
    }

    return apiSuccess(result)
  } catch (err) {
    console.error('Vision parse error:', err, 'raw:', raw)
    return apiError('Failed to parse vision response', 502)
  }
})
