import type { SupabaseClient } from '@supabase/supabase-js'

export type HouseholdMemoryType =
  | 'like'
  | 'dislike'
  | 'schedule'
  | 'budget'
  | 'cooking_time'
  | 'allergy'
  | 'calorie_goal'
  | 'household_rule'
  | 'pantry_inventory'
  | 'leftover_inventory'

export type HouseholdMemoryItem = {
  id: string
  memoryType: HouseholdMemoryType
  subject: string
  details: Record<string, unknown>
  strength: number
  source: string
  lastSeenAt: string
  expiresAt: string | null
}

const INVENTORY_HINTS = /\b(leftover|left over|pantry|fridge|freezer|rice|vegetable|veggie|produce|soft|going soft|expire|expires|use up|clear out|aging|old)\b/i

export function normalizeMemorySubject(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .slice(0, 140)
}

export function inferMemoryType(category: string, value: string): HouseholdMemoryType {
  const normalizedCategory = category.trim().toLowerCase()
  if (normalizedCategory === 'pantry_inventory' || normalizedCategory === 'leftover_inventory') {
    return normalizedCategory
  }
  if (
    normalizedCategory === 'like' ||
    normalizedCategory === 'dislike' ||
    normalizedCategory === 'schedule' ||
    normalizedCategory === 'budget' ||
    normalizedCategory === 'cooking_time' ||
    normalizedCategory === 'allergy' ||
    normalizedCategory === 'calorie_goal'
  ) {
    return normalizedCategory
  }

  const lower = value.toLowerCase()
  if (/\b(allergic|allergy|anaphylaxis|can't have|cannot have)\b/.test(lower)) return 'allergy'
  if (/\b(calorie|calories|kcal|macro|macros|protein goal|weight loss|weight gain)\b/.test(lower)) return 'calorie_goal'
  if (/\b(leftover|left over)\b/.test(lower)) return 'leftover_inventory'
  if (INVENTORY_HINTS.test(lower)) return 'pantry_inventory'
  return 'household_rule'
}

export async function saveHouseholdMemory(
  supabase: SupabaseClient,
  userId: string,
  input: {
    memoryType: HouseholdMemoryType
    subject: string
    details?: Record<string, unknown>
    source?: string
    strength?: number
  },
): Promise<void> {
  const subject = input.subject.trim()
  const normalizedSubject = normalizeMemorySubject(subject)
  if (!normalizedSubject) return

  await supabase
    .from('household_memory_items')
    .upsert({
      user_id: userId,
      memory_type: input.memoryType,
      subject,
      normalized_subject: normalizedSubject,
      details: input.details ?? {},
      source: input.source ?? 'copilot',
      strength: input.strength ?? 0.7,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,memory_type,normalized_subject' })
}

export async function loadHouseholdMemory(
  supabase: SupabaseClient,
  userId: string,
  limit = 24,
): Promise<HouseholdMemoryItem[]> {
  const { data, error } = await supabase
    .from('household_memory_items')
    .select('id, memory_type, subject, details, strength, source, last_seen_at, expires_at')
    .eq('user_id', userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('last_seen_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((row) => ({
    id: String(row.id),
    memoryType: row.memory_type as HouseholdMemoryType,
    subject: String(row.subject),
    details: (row.details && typeof row.details === 'object' ? row.details : {}) as Record<string, unknown>,
    strength: typeof row.strength === 'number' ? row.strength : 0.7,
    source: String(row.source ?? 'unknown'),
    lastSeenAt: String(row.last_seen_at),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
  }))
}
