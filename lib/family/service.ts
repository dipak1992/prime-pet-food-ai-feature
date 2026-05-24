import { normalizeTier } from '@/lib/paywall/config'
import type { SubscriptionTier } from '@/types'
import type { FamilyEngineOverrides, FamilyHouseholdSummary, FamilyMemberRecord } from '@/lib/family/types'

// ── Tier-based member limits ──────────────────────────────────────────────
// Free: 1 profile (yourself), Plus: up to 6 profiles
const TIER_MEMBER_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  pro: 6,
}

export function getMaxMembersForTier(tier: SubscriptionTier): number {
  return TIER_MEMBER_LIMITS[tier] ?? 1
}

export function getTierUpgradeMessage(tier: SubscriptionTier): string | null {
  switch (tier) {
    case 'free':
      return 'Upgrade to Plus for up to 6 profiles.'
    case 'pro':
      return null
    default:
      return 'Upgrade to add more profiles.'
  }
}

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => any
    insert: (values: Record<string, unknown> | Array<Record<string, unknown>>) => any
    update: (values: Record<string, unknown>) => any
    upsert: (values: Record<string, unknown>, opts?: Record<string, unknown>) => any
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean)))
}

export async function getUserTier(supabase: SupabaseLike, userId: string): Promise<SubscriptionTier> {
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .maybeSingle()

  return normalizeTier(data?.subscription_tier)
}

export async function ensureHousehold(supabase: SupabaseLike, userId: string, fallbackName?: string) {
  const { data: existing } = await supabase
    .from('households')
    .select('id, owner_user_id, name, max_members')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (existing) return existing

  const payload = {
    owner_user_id: userId,
    name: fallbackName?.trim() || 'My Household',
    max_members: 6,
  }

  const { data: created, error } = await supabase
    .from('households')
    .insert(payload)
    .select('id, owner_user_id, name, max_members')
    .single()

  if (error) throw error
  return created
}

export async function getHouseholdForUser(supabase: SupabaseLike, userId: string) {
  const { data: owned } = await supabase
    .from('households')
    .select('id, owner_user_id, name, max_members')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (owned) {
    return {
      ...owned,
      currentUserRole: 'owner' as const,
      canEdit: true,
    }
  }

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, invite_role, invite_status, households:household_id(id, owner_user_id, name, max_members)')
    .eq('user_id', userId)
    .maybeSingle()

  const household = Array.isArray(membership?.households)
    ? membership?.households[0]
    : membership?.households

  if (!household) return null

  const role = membership?.invite_role === 'editor' ? 'editor' : 'viewer'
  return {
    ...household,
    currentUserRole: role as 'editor' | 'viewer',
    canEdit: role === 'editor' && membership?.invite_status !== 'revoked',
  }
}

export async function getFamilyMembers(supabase: SupabaseLike, userId: string): Promise<FamilyMemberRecord[]> {
  const household = await getHouseholdForUser(supabase, userId) ?? await ensureHousehold(supabase, userId)

  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', household.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    allergies_json: asStringArray(row.allergies_json),
    foods_loved_json: asStringArray(row.foods_loved_json),
    foods_disliked_json: asStringArray(row.foods_disliked_json),
    protein_preferences_json: asStringArray(row.protein_preferences_json),
    cuisine_likes_json: asStringArray(row.cuisine_likes_json),
    foods_accepted_json: asStringArray(row.foods_accepted_json),
    foods_rejected_json: asStringArray(row.foods_rejected_json),
  }))
}

export function summarizeHousehold(members: FamilyMemberRecord[]): FamilyHouseholdSummary {
  const adults = members.filter((m) => m.role === 'adult' || m.role === 'teen').length
  const kids = members.filter((m) => m.role === 'child').length
  const toddlers = members.filter((m) => m.role === 'toddler').length
  const babies = members.filter((m) => m.role === 'baby').length
  const vegetarians = members.filter((m) => (m.dietary_type ?? '').toLowerCase().includes('vegetarian') || (m.dietary_type ?? '').toLowerCase().includes('vegan')).length
  const pickyEaters = members.filter((m) => m.picky_eater_level >= 3).length

  const allAllergies = unique(members.flatMap((m) => m.allergies_json))
  const nutFreeHousehold = allAllergies.includes('peanuts') || allAllergies.includes('tree_nuts') || allAllergies.includes('nuts')

  const totalMembers = members.length
  const headline = totalMembers > 0
    ? `Feeding ${totalMembers} tonight? We built tonight around everyone.`
    : 'Build your family profiles to personalize every meal.'

  const bullets: string[] = []
  bullets.push(`Adults: ${adults}`)
  bullets.push(`Kids: ${kids + toddlers + babies}`)
  if (vegetarians > 0) bullets.push(`${vegetarians} vegetarian`)
  if (pickyEaters > 0) bullets.push(`${pickyEaters} picky eater`)
  if (nutFreeHousehold) bullets.push('Nut-free household')

  return {
    totalMembers,
    adults,
    kids,
    toddlers,
    babies,
    vegetarians,
    pickyEaters,
    nutFreeHousehold,
    headline,
    bullets,
  }
}

export function buildFamilyEngineOverrides(members: FamilyMemberRecord[]): FamilyEngineOverrides {
  const adultsCount = members.filter((m) => m.role === 'adult' || m.role === 'teen').length
  const kidsCount = members.filter((m) => m.role === 'child').length
  const toddlersCount = members.filter((m) => m.role === 'toddler').length
  const babiesCount = members.filter((m) => m.role === 'baby').length

  const allergies = unique(members.flatMap((m) => m.allergies_json))
  const dietaryRestrictions = unique(members.map((m) => m.dietary_type ?? '').filter(Boolean))
  const dislikedFoods = unique([
    ...members.flatMap((m) => m.foods_disliked_json),
    ...members.flatMap((m) => m.foods_rejected_json),
  ])
  const preferredProteins = unique(members.flatMap((m) => m.protein_preferences_json))
  const cuisinePreferences = unique(members.flatMap((m) => m.cuisine_likes_json))

  const pickyEater = {
    active: members.some((m) => m.picky_eater_level >= 2),
    dislikedFoods: dislikedFoods.length > 0 ? dislikedFoods : undefined,
  }
  const familyModeActive = kidsCount + toddlersCount + babiesCount > 0 || pickyEater.active

  return {
    household: {
      adultsCount,
      kidsCount,
      toddlersCount,
      babiesCount,
    },
    allergies,
    dietaryRestrictions,
    dislikedFoods,
    preferredProteins,
    cuisinePreferences,
    pickyEater,
    familyMode: {
      active: familyModeActive,
      guidance: familyModeActive
        ? [
            'Prefer mild seasoning and offer heat/spice on the side.',
            'Provide deconstructed plating options for children and picky eaters.',
            'Use familiar sides or dips when introducing new ingredients.',
          ]
        : [],
    },
    memberCount: members.length,
  }
}

export function mergeUnique(base?: string[], incoming?: string[]): string[] | undefined {
  const merged = unique([...(base ?? []), ...(incoming ?? [])])
  return merged.length > 0 ? merged : undefined
}
