import { getSiteUrl } from '@/lib/seo'

export function safeRelativePath(value: unknown, fallback = '/dashboard') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  return value
}

export function authRedirectUrl(path: string) {
  return new URL(path, getSiteUrl()).toString()
}
