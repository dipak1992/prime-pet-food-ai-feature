import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceTonightSwapQuota, incrementTonightSwapQuota, isTonightSwapUnlimited } from '@/lib/paywall/tonight-quota'
import { getSwapSuggestion } from '@/lib/tonight/engine'
import type { Plan } from '@/lib/dashboard/types'

/**
 * POST /api/dashboard/tonight/regenerate
 * Returns a new tonight suggestion different from the current one.
 * For Plus users: respects dietary restrictions and dislikes.
 */

type RegenerateBody = {
  currentMealId?: string
  excludeIds?: string[]
}

async function readBody(req: Request): Promise<RegenerateBody> {
  try {
    const text = await req.text()
    if (!text) return {}
    const parsed = JSON.parse(text) as RegenerateBody
    return {
      currentMealId: typeof parsed.currentMealId === 'string' ? parsed.currentMealId : undefined,
      excludeIds: Array.isArray(parsed.excludeIds)
        ? parsed.excludeIds.filter((id): id is string => typeof id === 'string').slice(0, 25)
        : [],
    }
  } catch {
    return {}
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, plan')
    .eq('id', user.id)
    .maybeSingle()

  const tierMap: Record<string, Plan> = {
    pro: 'plus',
    plus: 'plus',
    free: 'free',
  }
  const isUnlimited = await isTonightSwapUnlimited(supabase, user.id)
  const plan = isUnlimited
    ? 'plus'
    : (
        tierMap[profile?.subscription_tier ?? 'free'] ??
        tierMap[profile?.plan ?? 'free'] ??
        'free'
      )

  if (!isUnlimited) {
    const quotaResponse = await enforceTonightSwapQuota(supabase, user.id)
    if (quotaResponse) return quotaResponse
  }

  const body = await readBody(req)
  const excludeIds = Array.from(
    new Set([
      ...(body.excludeIds ?? []),
      ...(body.currentMealId ? [body.currentMealId] : []),
    ]),
  ).slice(0, 25)

  // For Plus users, load dietary context so swaps respect preferences
  let prefContext: { dietary: string[]; dislikes: string[]; cuisines: string[] } | undefined

  if (plan === 'plus') {
    try {
      // Try household_preferences first (written by onboarding)
      const { data: householdPrefs } = await supabase
        .from('household_preferences')
        .select('dietary_restrictions, disliked_ingredients, cuisines')
        .eq('user_id', user.id)
        .maybeSingle()

      if (householdPrefs) {
        prefContext = {
          dietary: Array.isArray(householdPrefs.dietary_restrictions)
            ? (householdPrefs.dietary_restrictions as string[]).filter(Boolean)
            : [],
          dislikes: Array.isArray(householdPrefs.disliked_ingredients)
            ? (householdPrefs.disliked_ingredients as string[]).filter(Boolean)
            : [],
          cuisines: Array.isArray(householdPrefs.cuisines)
            ? (householdPrefs.cuisines as string[]).filter(Boolean)
            : [],
        }
      }

      // Fallback to user_dietary_preferences
      if (!prefContext || (prefContext.dietary.length === 0 && prefContext.dislikes.length === 0)) {
        const { data: prefs } = await supabase
          .from('user_dietary_preferences')
          .select('eating_style, dislikes')
          .eq('user_id', user.id)
          .maybeSingle()

        if (prefs) {
          prefContext = {
            dietary: [prefs.eating_style].filter(Boolean) as string[],
            dislikes: Array.isArray(prefs.dislikes) ? (prefs.dislikes as string[]) : [],
            cuisines: prefContext?.cuisines ?? [],
          }
        }
      }
    } catch {
      // Non-fatal — fall through without context
    }
  }

  const suggestion = getSwapSuggestion(user.id, excludeIds, plan, prefContext)
  if (!isUnlimited) await incrementTonightSwapQuota(supabase)

  return NextResponse.json(suggestion, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
