import type { SupabaseClient } from '@supabase/supabase-js'

const CUISINES = ['thai', 'italian', 'mexican', 'indian', 'mediterranean', 'nepali', 'japanese', 'korean']
const PROTEINS = ['chicken', 'beef', 'pork', 'salmon', 'fish', 'tofu', 'beans', 'lentils', 'eggs', 'turkey']
const SCHEDULE_RE = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b.*\b(soccer|practice|date night|guests|in-laws|school|late|busy|fast|quick)\b/i

function dayName(value: string): string {
  const lower = value.toLowerCase().slice(0, 3)
  const map: Record<string, string> = {
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    sun: 'sunday',
  }
  return map[lower] ?? value.toLowerCase()
}

function extractTags(text: string): string[] {
  const lower = text.toLowerCase()
  return [
    lower.includes('quick') || lower.includes('fast') || lower.includes('under 30') ? 'quick' : null,
    lower.includes('kid') ? 'kid-friendly' : null,
    lower.includes('spicy') ? 'spicy' : null,
    lower.includes('vegetarian') ? 'vegetarian' : null,
    lower.includes('cheap') || lower.includes('budget') ? 'budget' : null,
    lower.includes('impressive') || lower.includes('guest') ? 'impressive' : null,
  ].filter(Boolean) as string[]
}

export function extractCopilotLearning(text: string) {
  const lower = text.toLowerCase()
  const positive = /\b(loved|love|liked|great|again|favorite)\b/.test(lower)
  const negative = /\b(dislike|hate|too spicy|too expensive|boring|not again|don't like|doesn't like)\b/.test(lower)
  const cuisine = CUISINES.find((item) => lower.includes(item))
  const protein = PROTEINS.find((item) => lower.includes(item))
  const tags = extractTags(text)
  const schedule = text.match(SCHEDULE_RE)

  return {
    signal: positive ? 'accepted' as const : negative ? 'rejected' as const : tags.length ? 'saved' as const : null,
    cuisineType: cuisine,
    proteinType: protein,
    tags,
    schedule: schedule
      ? {
          dayOfWeek: dayName(schedule[1] ?? ''),
          constraint: schedule[2]?.toLowerCase() ?? 'busy',
          sourceText: text.slice(0, 240),
        }
      : null,
  }
}

export async function recordCopilotLearning(
  supabase: SupabaseClient,
  userId: string,
  text: string,
  sessionId?: string,
): Promise<void> {
  const learning = extractCopilotLearning(text)
  const now = new Date()

  if (learning.signal || learning.tags.length || learning.schedule) {
    await supabase.from('meal_signals').insert({
      user_id: userId,
      meal_id: `copilot:${sessionId ?? now.getTime()}`,
      signal: learning.signal ?? 'saved',
      context: {
        source: 'copilot',
        cuisineType: learning.cuisineType,
        proteinType: learning.proteinType,
        tags: learning.tags,
        schedule: learning.schedule,
        rawText: text.slice(0, 500),
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
      },
    })
  }

  if (learning.schedule) {
    await supabase
      .from('copilot_schedule_constraints')
      .upsert({
        user_id: userId,
        day_of_week: learning.schedule.dayOfWeek,
        constraint_label: learning.schedule.constraint,
        source_text: learning.schedule.sourceText,
        confidence: 0.7,
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id,day_of_week,constraint_label' })
  }
}
