import { NextRequest, NextResponse } from 'next/server'
import { validateScanImageStrict } from '@/lib/scan/upload-validation'
import { analyzeFridgeImage } from '@/lib/scan/openai-vision'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

/**
 * POST /api/scan/demo
 *
 * Public demo endpoint for Snap & Cook — no auth required.
 * Actually analyzes the uploaded image using OpenAI Vision.
 * Rate-limited to 3 requests per IP per hour to prevent abuse.
 */
export async function POST(req: NextRequest) {
  // Strict rate limit for unauthenticated demo usage (3/hour per IP)
  const rl = await rateLimit({
    key: `scan-demo:${rateLimitKeyFromRequest(req)}`,
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  })
  if (!rl.success) return apiRateLimited(rl.reset)

  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null

    const imageError = await validateScanImageStrict(image)
    if (imageError) return imageError

    // Call the real AI vision analysis — same as authenticated fridge scan
    const result = await analyzeFridgeImage(image!)

    // Mark as demo (don't save to pantry)
    result.savedToPantry = false

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/scan/demo]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
