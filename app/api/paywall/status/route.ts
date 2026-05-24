import { NextRequest, NextResponse } from 'next/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 60, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const status = await getPaywallStatus()
  return NextResponse.json(status)
}
