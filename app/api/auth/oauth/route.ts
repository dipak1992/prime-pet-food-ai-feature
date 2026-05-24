import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimited } from '@/lib/api-response'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { authRedirectUrl, safeRelativePath } from '@/lib/auth/redirect'
import { logSecurityEvent, requestIp } from '@/lib/security'

export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    key: `auth-oauth:${rateLimitKeyFromRequest(req)}`,
    limit: 10,
    windowMs: 60_000,
  })
  if (!rl.success) {
    logSecurityEvent('auth_oauth_rate_limited', {
      ip: requestIp(req.headers),
    })
    return apiRateLimited(rl.reset)
  }

  const body = (await req.json().catch(() => ({}))) as { provider?: string; next?: string }
  if (body.provider !== 'google') {
    logSecurityEvent('auth_oauth_unsupported_provider', {
      provider: body.provider ?? 'missing',
      ip: requestIp(req.headers),
    })
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  const supabase = await createClient()
  const next = safeRelativePath(body.next, '/dashboard')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error || !data.url) {
    logSecurityEvent('auth_oauth_provider_error', {
      error: error?.message ?? 'missing redirect url',
      ip: requestIp(req.headers),
    }, 'error')
    return NextResponse.json({ error: 'Could not start sign-in' }, { status: 500 })
  }

  logSecurityEvent('auth_oauth_started', {
    provider: 'google',
    ip: requestIp(req.headers),
  }, 'info')

  return NextResponse.json({ url: data.url })
}
