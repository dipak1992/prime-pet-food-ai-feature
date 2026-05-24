import logger from '@/lib/logger'

const DEFAULT_ALLOWED_ORIGINS = [
  'https://mealeaseai.com',
  'https://www.mealeaseai.com',
]

const SUSPICIOUS_PATH_PATTERNS = [
  /\.env/i,
  /wp-admin/i,
  /wp-login/i,
  /\.php/i,
  /\.\./,
  /%2e%2e/i,
  /\/adminer/i,
  /\/phpmyadmin/i,
]

function normalizeOrigin(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null
    return url.origin
  } catch {
    return null
  }
}

function splitOrigins(value?: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin))
}

export function trustedOrigins(): string[] {
  const origins = new Set<string>(DEFAULT_ALLOWED_ORIGINS)
  for (const origin of [
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null),
    ...splitOrigins(process.env.APP_ALLOWED_ORIGINS),
  ]) {
    if (origin) origins.add(origin)
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }

  return [...origins]
}

export function isTrustedOrigin(origin?: string | null): boolean {
  const normalized = normalizeOrigin(origin)
  return Boolean(normalized && trustedOrigins().includes(normalized))
}

export function requestIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export async function hashForLog(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value.trim().toLowerCase()))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

export function logSecurityEvent(
  event: string,
  meta: Record<string, unknown> = {},
  level: 'info' | 'warn' | 'error' = 'warn',
) {
  logger[level](`security.${event}`, meta)
}

export function isSuspiciousPath(pathname: string): boolean {
  return SUSPICIOUS_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
}
