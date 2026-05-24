/**
 * Rate limiter with Upstash Redis (production) and in-memory fallback (dev).
 *
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars to enable
 * the Redis-backed sliding-window limiter. Without them, a per-instance
 * in-memory Map is used (adequate for local dev, NOT for serverless prod).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ─── Upstash Redis limiter (production) ────────────────────────────────────────

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

function upstashLimiter(limit: number, windowMs: number) {
  if (!redis) return null
  const windowSec = `${Math.ceil(windowMs / 1000)} s` as `${number} s`
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, windowSec) })
}

// ─── In-memory fallback (development) ──────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function prune() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  if (Math.random() < 0.02) prune()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, reset: now + windowMs }
  }

  entry.count += 1
  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt }
  }
  return { success: true, remaining: limit - entry.count, reset: entry.resetAt }
}

// ─── Public API (unchanged interface) ──────────────────────────────────────────

export interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimit({ key, limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const rl = upstashLimiter(limit, windowMs)
  if (rl) {
    const res = await rl.limit(key)
    return { success: res.success, remaining: res.remaining, reset: res.reset }
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production')
    return { success: false, remaining: 0, reset: Date.now() + windowMs }
  }
  return memoryLimit(key, limit, windowMs)
}

/**
 * Derive a rate-limit key from a Next.js request.
 * Prefers x-real-ip (set by Vercel/reverse proxy, not user-spoofable)
 * before falling back to x-forwarded-for.
 */
export function rateLimitKeyFromRequest(req: { headers: { get(name: string): string | null } }): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return `ip:${realIp.trim()}`

  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return `ip:${forwarded.split(',')[0].trim()}`

  return 'ip:unknown'
}
