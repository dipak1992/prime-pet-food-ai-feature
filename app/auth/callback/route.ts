import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmail, alertAdminNewUser } from '@/lib/email/triggers'
import { logSecurityEvent, requestIp } from '@/lib/security'

/**
 * Supabase PKCE auth callback handler.
 * Handles:
 *  - Email confirmation (after signup)
 *  - Password recovery (after reset email)
 *  - OAuth provider redirects (e.g. Google)
 *
 * Query params:
 *  ?code=<pkce_code>           — the one-time exchange code from Supabase
 *  ?next=<path>                — relative path to redirect after success (default: /dashboard)
 *  ?error=<msg>                — propagated from Supabase on failure
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Surface provider-level errors (e.g. user denied OAuth consent)
  if (errorParam) {
    logSecurityEvent('auth_callback_provider_error', {
      error: errorParam,
      ip: requestIp(request.headers),
    }, 'info')
    const msg = encodeURIComponent(errorDescription ?? errorParam)
    return NextResponse.redirect(`${origin}/login?error=${msg}`)
  }

  if (!code) {
    logSecurityEvent('auth_callback_missing_code', {
      ip: requestIp(request.headers),
    })
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // Protect against open redirects — only allow local relative paths
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('\\')
      ? rawNext
      : '/dashboard'
  if (next !== rawNext) {
    logSecurityEvent('auth_callback_unsafe_next', {
      rawNext,
      ip: requestIp(request.headers),
    })
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    logSecurityEvent('auth_callback_exchange_failed', {
      error: error.message,
      ip: requestIp(request.headers),
    })
    const msg = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/login?error=${msg}`)
  }

  // Fire welcome email on new signup (signalled by ?next=/onboarding)
  if (next === '/onboarding') {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.user_metadata?.name?.split(' ')[0]
      void sendWelcomeEmail({ to: user.email, firstName })
      void alertAdminNewUser({ userEmail: user.email, userId: user.id })
    }
  }

  logSecurityEvent('auth_callback_success', {
    next,
    ip: requestIp(request.headers),
  }, 'info')

  return NextResponse.redirect(`${origin}${next}`)
}
