import { NextRequest } from 'next/server'
import { generateSmartMeal } from '@/lib/engine/engine'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiError, apiRateLimited, apiSuccess } from '@/lib/api-response'
import logger from '@/lib/logger'
import { enforceTonightSwapQuota, incrementTonightSwapQuota } from '@/lib/paywall/tonight-quota'
import type { SmartMealRequest } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'
import { buildFamilyEngineOverrides, getFamilyMembers, getUserTier, mergeUnique } from '@/lib/family/service'

type Mode = 'tonight' | 'surprise' | 'swap'

interface DecideBody extends SmartMealRequest {
  mode?: Mode
  countsAsTonightSwap?: boolean
  learnedBoosts?: LearnedBoosts
  /** Client-side excludes (e.g. meal currently shown, for swap). */
  excludeIds?: string[]
}

const BUSY_WEEKDAY_MAX_MIN = 25
const WEEKEND_MAX_MIN = 60

// ── In-memory cache for server-side excludes (5-min TTL) ────
const excludeCache = new Map<string, { ids: string[]; ts: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 30, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  let body: DecideBody
  try {
    body = (await req.json()) as DecideBody
  } catch {
    return apiError('Invalid JSON', 400)
  }

  if (!body.household) return apiError('Missing household', 400)
  const { adultsCount = 0, kidsCount = 0, toddlersCount = 0, babiesCount = 0 } = body.household
  if (adultsCount + kidsCount + toddlersCount + babiesCount === 0) {
    return apiError('Household must have at least one member', 400)
  }

  const mode: Mode = body.mode ?? 'tonight'

  // ── Time-of-day bias ──────────────────────────────────────
  const now = new Date()
  const dow = now.getDay()
  const isWeekend = dow === 0 || dow === 6
  const autoMaxCookTime = isWeekend ? WEEKEND_MAX_MIN : BUSY_WEEKDAY_MAX_MIN

  // ── Pull recent server-side rejects/skips as excludes ─────
  let serverExcludes: string[] = []
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const cached = excludeCache.get(user.id)
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        serverExcludes = cached.ids
      } else {
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: recent } = await supabase
          .from('meal_signals')
          .select('meal_id, signal, created_at')
          .eq('user_id', user.id)
          .in('signal', ['rejected', 'skipped', 'swapped'])
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(40)
        if (recent) {
          serverExcludes = recent.map(r => r.meal_id)
          excludeCache.set(user.id, { ids: serverExcludes, ts: Date.now() })
        }
      }
    }
  } catch {
    // Supabase unavailable — continue without server-side excludes
  }

  const excludeIds = Array.from(new Set([
    ...(body.excludeIds ?? []),
    ...serverExcludes,
  ]))

  const countsAsTonightSwap = mode === 'tonight'
    && (body.countsAsTonightSwap || (body.excludeIds?.length ?? 0) > 0)

  let familyOverrides: ReturnType<typeof buildFamilyEngineOverrides> | null = null
  let supabaseForQuota: Awaited<ReturnType<typeof createClient>> | null = null
  let userIdForQuota: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      supabaseForQuota = supabase
      userIdForQuota = user.id
      const tier = await getUserTier(supabase as any, user.id)
      if (tier === 'pro') {
        const members = await getFamilyMembers(supabase as any, user.id)
        if (members.length > 0) {
          familyOverrides = buildFamilyEngineOverrides(members)
        }
      }
    }
  } catch {
    // Non-fatal: keep existing request behavior when family lookup fails.
  }

  if (countsAsTonightSwap && supabaseForQuota && userIdForQuota) {
    const quotaResponse = await enforceTonightSwapQuota(supabaseForQuota, userIdForQuota)
    if (quotaResponse) return quotaResponse
  }

  const { learnedBoosts, mode: _mode, excludeIds: _ex, countsAsTonightSwap: _countsAsTonightSwap, ...rest } = body
  void _mode; void _ex; void _countsAsTonightSwap

  const mealRequest: SmartMealRequest = {
    ...rest,
    household: familyOverrides?.household ?? { adultsCount, kidsCount, toddlersCount, babiesCount },
    allergies: mergeUnique(rest.allergies, familyOverrides?.allergies),
    dietaryRestrictions: mergeUnique(rest.dietaryRestrictions, familyOverrides?.dietaryRestrictions),
    cuisinePreferences: mergeUnique(rest.cuisinePreferences, familyOverrides?.cuisinePreferences),
    preferredProteins: mergeUnique(rest.preferredProteins, familyOverrides?.preferredProteins),
    pickyEater: familyOverrides?.pickyEater?.active
      ? {
          active: true,
          dislikedFoods: mergeUnique(rest.pickyEater?.dislikedFoods, familyOverrides.pickyEater.dislikedFoods),
        }
      : rest.pickyEater,
    maxCookTime: rest.maxCookTime ?? autoMaxCookTime,
    excludeIds,
  }

  try {
    const result = generateSmartMeal(mealRequest, learnedBoosts)
    if (countsAsTonightSwap && supabaseForQuota && userIdForQuota) {
      await incrementTonightSwapQuota(supabaseForQuota)
    }
    return apiSuccess({
      meal: result,
      context: {
        mode,
        isWeekend,
        hour: now.getHours(),
        maxCookTime: mealRequest.maxCookTime,
        excludedCount: excludeIds.length,
      },
    })
  } catch (err) {
    logger.error('[decide] engine error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return apiError('Failed to decide')
  }
}
