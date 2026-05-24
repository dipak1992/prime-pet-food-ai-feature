import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited } from '@/lib/api-response'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import logger from '@/lib/logger'
import { base64ImagePayloadSchema, validationError } from '@/lib/validation/input'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are a food recognition assistant. Analyze the image and determine:
1. Is this a photo of INGREDIENTS/GROCERIES, or a PREPARED MEAL/DISH?
2. Based on what you see, extract the relevant information.

Rules:
- If ingredients/groceries: list each ingredient you can identify, comma-separated. Be specific (e.g. "chicken breast" not just "meat").
- If a prepared meal/dish: describe the meal in one short phrase (e.g. "creamy mushroom pasta with parmesan").
- If you cannot identify food in the image, respond with type "unknown".

Respond ONLY with valid JSON in this exact format:
{"type": "ingredients" | "inspiration" | "unknown", "result": "your comma-separated ingredients OR meal description OR empty string"}`

type ImageAnalysisResult = { type: string; result: string }

const IMAGE_ANALYSIS_QUOTA = {
  key: 'ai_image_analysis',
  limit: 20,
  label: 'image analysis',
}

async function analyzeWithAnthropic(
  image: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
): Promise<{ parsed: ImageAnalysisResult; usage?: { prompt_tokens: number; completion_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
          { type: 'text', text: SYSTEM_PROMPT },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const usage = message.usage
    ? { prompt_tokens: message.usage.input_tokens, completion_tokens: message.usage.output_tokens }
    : undefined

  return { parsed: parseAnalysisResponse(text), usage }
}

async function analyzeWithOpenAI(
  image: string,
  mimeType: string,
): Promise<{ parsed: ImageAnalysisResult; usage?: { prompt_tokens: number; completion_tokens: number } }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
          { type: 'text', text: SYSTEM_PROMPT },
        ],
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const usage = response.usage
    ? { prompt_tokens: response.usage.prompt_tokens ?? 0, completion_tokens: response.usage.completion_tokens ?? 0 }
    : undefined

  return { parsed: parseAnalysisResponse(text), usage }
}

function parseAnalysisResponse(text: string): ImageAnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { type: 'unknown', result: '' }

  const parsed = JSON.parse(jsonMatch[0]) as ImageAnalysisResult
  if (!['ingredients', 'inspiration', 'unknown'].includes(parsed.type)) {
    parsed.type = 'unknown'
  }
  return { type: parsed.type, result: parsed.result || '' }
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 20, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  // Require authentication — this endpoint calls paid AI APIs (Anthropic/OpenAI)
  // and must not be accessible to unauthenticated users to prevent cost abuse.
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const quotaResponse = await enforceFeatureQuota(supabase, user.id, IMAGE_ANALYSIS_QUOTA)
  if (quotaResponse) return quotaResponse

  try {
    const parsed = base64ImagePayloadSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const { image, mimeType } = parsed.data

    const castMime = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    let result: { parsed: ImageAnalysisResult; usage?: { prompt_tokens: number; completion_tokens: number } }
    let provider: string = 'none'

    // Try Anthropic first, fall back to OpenAI vision
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        result = await analyzeWithAnthropic(image, castMime)
        provider = 'anthropic'
      } catch (err) {
        logger.warn('[analyze-image] Anthropic failed, falling back to OpenAI', {
          error: err instanceof Error ? err.message : String(err),
        })
        result = await analyzeWithOpenAI(image, mimeType)
        provider = 'openai'
      }
    } else if (process.env.OPENAI_API_KEY) {
      result = await analyzeWithOpenAI(image, mimeType)
      provider = 'openai'
    } else {
      return NextResponse.json(
        { error: 'Image analysis is not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 503 },
      )
    }

    // Log token usage
    if (result.usage) {
      logger.info('[analyze-image] Token usage', {
        feature: 'analyze-image',
        provider,
        prompt_tokens: result.usage.prompt_tokens,
        completion_tokens: result.usage.completion_tokens,
      })
    }
    await incrementFeatureQuota(supabase, IMAGE_ANALYSIS_QUOTA)

    return NextResponse.json({
      type: result.parsed.type,
      result: result.parsed.result,
    })
  } catch (err) {
    logger.error('[analyze-image] Error', { error: err instanceof Error ? err.message : String(err) })
    return apiError('Failed to analyze image')
  }
}
