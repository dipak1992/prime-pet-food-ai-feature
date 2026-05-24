import type { SmartMealResult } from '@/lib/engine/types'
import type { LearnedBoosts } from '@/lib/learning/types'
import type { HouseholdMember, LifeStage } from '@/types'

export type DecideMode = 'tonight' | 'surprise' | 'swap'

export interface DecideRequest {
  mode: DecideMode
  countsAsTonightSwap?: boolean
  household: {
    adultsCount: number
    kidsCount: number
    toddlersCount: number
    babiesCount: number
  }
  allergies?: string[]
  dietaryRestrictions?: string[]
  cuisinePreferences?: string[]
  pantryItems?: string[]
  lowEnergy?: boolean
  budget?: 'low' | 'medium' | 'high'
  maxCookTime?: number
  excludeIds?: string[]
  learnedBoosts?: LearnedBoosts
  pickyEater?: {
    active: boolean
    dislikedFoods?: string[]
  }
}

export interface DecideResponse {
  meal: SmartMealResult
  context: {
    mode: DecideMode
    isWeekend: boolean
    hour: number
    maxCookTime?: number
    excludedCount: number
  }
}

export async function decideMeal(body: DecideRequest): Promise<DecideResponse> {
  const res = await fetch('/api/decide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw Object.assign(new Error(json.error ?? 'decide failed'), {
      status: res.status,
      code: json.code,
      quota: json.quota,
    })
  }
  return json.data as DecideResponse
}

export type SignalName = 'accepted' | 'rejected' | 'swapped' | 'cooked' | 'skipped' | 'saved'

export function sendSignal(mealId: string, signal: SignalName, context?: Record<string, unknown>): void {
  // Fire-and-forget; do not await.
  fetch('/api/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealId, signal, context }),
    keepalive: true,
  }).catch(() => {})
}

// ── Household derivation ──────────────────────────────────────

type MemberLike = Partial<Pick<HouseholdMember, 'stage'>> & { stage?: LifeStage }

export function householdFromMembers(members: MemberLike[]): DecideRequest['household'] {
  const h = { adultsCount: 0, kidsCount: 0, toddlersCount: 0, babiesCount: 0 }
  for (const m of members ?? []) {
    if (m.stage === 'adult') h.adultsCount += 1
    else if (m.stage === 'kid') h.kidsCount += 1
    else if (m.stage === 'toddler') h.toddlersCount += 1
    else if (m.stage === 'baby') h.babiesCount += 1
  }
  return h
}

export function fallbackHousehold(
  householdType: 'solo' | 'couple' | 'family' | null,
  hasKids: boolean | null,
  kidsAgeGroup?: string | null,
): DecideRequest['household'] {
  const base =
    householdType === 'solo'   ? { adultsCount: 1, kidsCount: 0, toddlersCount: 0, babiesCount: 0 } :
    householdType === 'couple' ? { adultsCount: 2, kidsCount: 0, toddlersCount: 0, babiesCount: 0 } :
    householdType === 'family' ? { adultsCount: 2, kidsCount: 0, toddlersCount: 0, babiesCount: 0 } :
                                 { adultsCount: 1, kidsCount: 0, toddlersCount: 0, babiesCount: 0 }

  if (!hasKids || householdType !== 'family') return base

  if (kidsAgeGroup === 'baby')    return { ...base, babiesCount: 1 }
  if (kidsAgeGroup === 'toddler') return { ...base, toddlersCount: 1 }
  if (kidsAgeGroup === 'mixed')   return { ...base, kidsCount: 1, toddlersCount: 1 }
  return { ...base, kidsCount: 1 } // 'school_age' or unknown default
}
