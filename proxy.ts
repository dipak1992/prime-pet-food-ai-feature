import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { isSuspiciousPath, isTrustedOrigin, logSecurityEvent, requestIp } from '@/lib/security'
import { rateLimit } from '@/lib/rate-limit'

const AI_ENDPOINTS = [
  '/api/analyze-image',
  '/api/generate-plan',
  '/api/regenerate-meal',
  '/api/smart-meal',
  '/api/weekly-plan',
  '/api/plan/autopilot',
  '/api/dashboard/tonight/regenerate',
  '/api/scan/',
  '/api/pantry/vision',
  '/api/pantry/vision-v2',
]

const PAYMENT_ENDPOINTS = [
  '/api/stripe/',
  '/api/webhook/stripe',
  '/api/paywall/start-trial',
]

const AUTH_ENDPOINTS = [
  '/api/auth/',
  '/auth/callback',
]

const PUBLIC_READ_ENDPOINTS = [
  '/api/recipes/',
  '/api/content/',
]

function buildCsp({ upgradeInsecureRequests = true }: { upgradeInsecureRequests?: boolean } = {}) {
  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    // 'unsafe-inline' is required by Next.js 15 for its own injected scripts.
    // 'unsafe-eval' has been removed — it is not required and enables code injection attacks.
    `script-src 'self' 'unsafe-inline' https://*.posthog.com https://*.sentry.io`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.sentry.io https://api.resend.com https://api.openai.com https://api.anthropic.com`,
    `frame-ancestors 'none'`,
    upgradeInsecureRequests ? `upgrade-insecure-requests` : null,
  ].filter(Boolean).join('; ')
}

function isLocalHost(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const host = request.headers.get('host') ?? ''
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1:')
  )
}

function shouldForceHttps(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production' || isLocalHost(request)) {
    return false
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')
  return request.nextUrl.protocol === 'http:' || forwardedProto === 'http'
}

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const pathname = request.nextUrl.pathname
  const origin = request.headers.get('origin')
  const isApi = pathname.startsWith('/api/')
  const method = request.method.toUpperCase()

  if (shouldForceHttps(request)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    logSecurityEvent('http_redirect', {
      requestId,
      path: pathname,
      ip: requestIp(request.headers),
    }, 'info')
    return NextResponse.redirect(url, 308)
  }

  if (isSuspiciousPath(pathname)) {
    logSecurityEvent('suspicious_path', {
      requestId,
      path: pathname,
      method,
      ip: requestIp(request.headers),
      userAgent: request.headers.get('user-agent') ?? 'unknown',
    })
  }

  if (isApi && origin && !isTrustedOrigin(origin)) {
    logSecurityEvent('blocked_origin', {
      requestId,
      path: pathname,
      method,
      origin,
      ip: requestIp(request.headers),
    })
    return new NextResponse(null, { status: 403, headers: { 'x-request-id': requestId } })
  }

  if (isApi && method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    setCommonHeaders(response, requestId, request)
    setCorsHeaders(response, origin)
    return response
  }

  if (isApi) {
    const abuseResponse = await enforceAbuseLimits(request, requestId)
    if (abuseResponse) return abuseResponse
  }

  try {
    const response = await updateSession(request)
    setCommonHeaders(response, requestId, request)
    if (isApi) setCorsHeaders(response, origin)
    return response
  } catch {
    // Supabase unavailable (e.g. missing env vars) — pass through
    const response = NextResponse.next()
    setCommonHeaders(response, requestId, request)
    if (isApi) setCorsHeaders(response, origin)
    return response
  }
}

async function enforceAbuseLimits(request: NextRequest, requestId: string): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  const ip = requestIp(request.headers)
  const method = request.method.toUpperCase()
  const userAgent = request.headers.get('user-agent') ?? ''

  const automationUserAgent = isAutomationUserAgent(userAgent)
  if (automationUserAgent) {
    logSecurityEvent('automation_user_agent', {
      requestId,
      path: pathname,
      method,
      ip,
      userAgent: userAgent || 'missing',
    }, 'info')
  }

  const sensitiveEndpoint =
    matchesEndpoint(pathname, AI_ENDPOINTS) ||
    matchesEndpoint(pathname, PAYMENT_ENDPOINTS) ||
    matchesEndpoint(pathname, AUTH_ENDPOINTS)

  if (sensitiveEndpoint && automationUserAgent) {
    logSecurityEvent('blocked_automation_user_agent', {
      requestId,
      path: pathname,
      method,
      ip,
      userAgent: userAgent || 'missing',
    })
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403, headers: { 'x-request-id': requestId } },
    )
  }

  const limits = [
    { name: 'api-global-minute', limit: 120, windowMs: 60_000 },
    { name: 'api-global-hour', limit: 1_500, windowMs: 60 * 60_000 },
  ]

  if (matchesEndpoint(pathname, AUTH_ENDPOINTS)) {
    limits.push(
      { name: 'auth-minute', limit: 15, windowMs: 60_000 },
      { name: 'auth-hour', limit: 80, windowMs: 60 * 60_000 },
    )
  }

  if (matchesEndpoint(pathname, PAYMENT_ENDPOINTS)) {
    limits.push(
      { name: 'payment-minute', limit: 10, windowMs: 60_000 },
      { name: 'payment-hour', limit: 60, windowMs: 60 * 60_000 },
    )
  }

  if (matchesEndpoint(pathname, AI_ENDPOINTS)) {
    limits.push(
      { name: 'ai-minute', limit: 5, windowMs: 60_000 },
      { name: 'ai-hour', limit: 40, windowMs: 60 * 60_000 },
    )
  }

  if (matchesEndpoint(pathname, PUBLIC_READ_ENDPOINTS)) {
    limits.push(
      { name: 'public-read-minute', limit: 60, windowMs: 60_000 },
      { name: 'public-read-hour', limit: 600, windowMs: 60 * 60_000 },
    )
  }

  for (const limit of limits) {
    const result = await rateLimit({
      key: `${limit.name}:${ip}`,
      limit: limit.limit,
      windowMs: limit.windowMs,
    })

    if (!result.success) {
      logSecurityEvent('rate_limited', {
        requestId,
        bucket: limit.name,
        path: pathname,
        method,
        ip,
        reset: result.reset,
      })

      return NextResponse.json(
        { success: false, error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
            'x-request-id': requestId,
          },
        },
      )
    }
  }

  return null
}

function matchesEndpoint(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

function isAutomationUserAgent(userAgent: string) {
  return !userAgent || /\b(curl|wget|python-requests|httpclient|scrapy|aiohttp|libwww-perl)\b/i.test(userAgent)
}

function setCommonHeaders(response: NextResponse, requestId: string, request?: NextRequest) {
  response.headers.set(
    'Content-Security-Policy',
    buildCsp({ upgradeInsecureRequests: request ? !isLocalHost(request) : true })
  )
  response.headers.set('x-request-id', requestId)
}

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && isTrustedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID')
  response.headers.set('Access-Control-Max-Age', '600')
  response.headers.append('Vary', 'Origin')
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
