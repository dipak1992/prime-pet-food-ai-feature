import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimited } from '@/lib/api-response'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { authRedirectUrl, safeRelativePath } from '@/lib/auth/redirect'
import { hashForLog, logSecurityEvent, requestIp } from '@/lib/security'

type OtpBody = {
  email?: string
  mode?: 'login' | 'signup'
  next?: string
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
  const body = (await req.json().catch(() => ({}))) as OtpBody
  const email = normalizeEmail(body.email)
  const mode = body.mode === 'signup' ? 'signup' : 'login'

  const ipLimit = await rateLimit({
    key: `auth-otp:${rateLimitKeyFromRequest(req)}`,
    limit: 5,
    windowMs: 60_000,
  })
  if (!ipLimit.success) {
    logSecurityEvent('auth_otp_ip_rate_limited', {
      ip: requestIp(req.headers),
      mode,
    })
    return apiRateLimited(ipLimit.reset)
  }

  if (mode === 'signup') {
    const signupLimit = await rateLimit({
      key: `auth-signup:${rateLimitKeyFromRequest(req)}`,
      limit: 10,
      windowMs: 60 * 60_000,
    })
    if (!signupLimit.success) {
      logSecurityEvent('auth_signup_ip_rate_limited', {
        ip: requestIp(req.headers),
      })
      return apiRateLimited(signupLimit.reset)
    }
  }

  if (email) {
    const emailHash = await hashForLog(email)
    const perEmailLimit = await rateLimit({
      key: `auth-otp-email:${await emailKey(email)}`,
      limit: 3,
      windowMs: 15 * 60_000,
    })
    if (!perEmailLimit.success) {
      logSecurityEvent('auth_otp_email_rate_limited', {
        emailHash,
        mode,
        ip: requestIp(req.headers),
      })
      return apiRateLimited(perEmailLimit.reset)
    }
  }

  // Keep response generic to avoid account enumeration.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    logSecurityEvent('auth_otp_invalid_email', {
      ip: requestIp(req.headers),
      mode,
    }, 'info')
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const next = safeRelativePath(body.next, mode === 'signup' ? '/onboarding' : '/dashboard')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: authRedirectUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      shouldCreateUser: mode === 'signup',
      captchaToken: body.captchaToken,
    },
  })

  if (error) {
    logSecurityEvent('auth_otp_provider_error', {
      emailHash: await hashForLog(email),
      mode,
      error: error.message,
      ip: requestIp(req.headers),
    }, 'error')
  } else {
    logSecurityEvent('auth_otp_requested', {
      emailHash: await hashForLog(email),
      mode,
      ip: requestIp(req.headers),
    }, 'info')
  }

  return NextResponse.json({ ok: true })
}
