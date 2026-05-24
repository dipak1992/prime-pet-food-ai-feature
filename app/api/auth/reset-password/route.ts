import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimited } from '@/lib/api-response'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { authRedirectUrl } from '@/lib/auth/redirect'
import { hashForLog, logSecurityEvent, requestIp } from '@/lib/security'

type ResetBody = {
  email?: string
  captchaToken?: string
}

function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

async function emailKey(email: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as ResetBody
  const email = normalizeEmail(body.email)

  const ipLimit = await rateLimit({
    key: `auth-reset:${rateLimitKeyFromRequest(req)}`,
    limit: 5,
    windowMs: 60_000,
  })
  if (!ipLimit.success) {
    logSecurityEvent('auth_reset_ip_rate_limited', {
      ip: requestIp(req.headers),
    })
    return apiRateLimited(ipLimit.reset)
  }

  if (email) {
    const emailHash = await hashForLog(email)
    const perEmailLimit = await rateLimit({
      key: `auth-reset-email:${await emailKey(email)}`,
      limit: 3,
      windowMs: 60 * 60_000,
    })
    if (!perEmailLimit.success) {
      logSecurityEvent('auth_reset_email_rate_limited', {
        emailHash,
        ip: requestIp(req.headers),
      })
      return apiRateLimited(perEmailLimit.reset)
    }
  }

  // Keep response generic to avoid account enumeration.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    logSecurityEvent('auth_reset_invalid_email', {
      ip: requestIp(req.headers),
    }, 'info')
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectUrl('/auth/callback?next=/reset-password'),
    captchaToken: body.captchaToken,
  })

  if (error) {
    logSecurityEvent('auth_reset_provider_error', {
      emailHash: await hashForLog(email),
      error: error.message,
      ip: requestIp(req.headers),
    }, 'error')
  } else {
    logSecurityEvent('auth_reset_requested', {
      emailHash: await hashForLog(email),
      ip: requestIp(req.headers),
    }, 'info')
  }

  return NextResponse.json({ ok: true })
}
