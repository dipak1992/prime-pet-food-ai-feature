import { Resend } from 'resend'

// Lazy getter — avoids throwing at build time when RESEND_API_KEY is absent.
let _resend: Resend | null = null
export function getResendClient(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      console.warn('[email] RESEND_API_KEY is not set — emails will not be sent')
      // Return a dummy instance that will fail gracefully at call time
      _resend = new Resend('placeholder_build_time_only')
    } else {
      _resend = new Resend(key)
    }
  }
  return _resend
}

// Convenience re-export used by legacy callers — initialised lazily on first import
export const resend = {
  emails: {
    send: (...args: Parameters<Resend['emails']['send']>) =>
      getResendClient().emails.send(...args),
  },
} as unknown as Resend

export const EMAIL_PRIMARY = 'hello@mealeaseai.com'
export const EMAIL_FROM = `MealEase <${EMAIL_PRIMARY}>`
export const EMAIL_REPLY_TO = EMAIL_PRIMARY
export const EMAIL_ALERTS = EMAIL_PRIMARY
// Legacy alias kept to avoid breaking existing imports.
export const EMAIL_ADMIN = EMAIL_ALERTS
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mealeaseai.com'
