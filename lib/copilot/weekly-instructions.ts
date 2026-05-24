import type { SupabaseClient } from '@supabase/supabase-js'

export type WeeklyInstructionType =
  | 'cuisine_boost'
  | 'avoid'
  | 'time_constraint'
  | 'budget_override'
  | 'variety_rule'

export type WeeklyInstruction = {
  id: string
  instructionType: WeeklyInstructionType
  value: string
  label: string
  emoji: string | null
  weekStart: string
  expiresAt: string
}

export type WeeklyInstructionInput = {
  instructionType: WeeklyInstructionType
  value: string
  label?: string
  emoji?: string
}

export type WeeklyInstructionDetection =
  | ({ action: 'set' } & WeeklyInstructionInput)
  | { action: 'clear'; value?: string }

const CUISINE_EMOJI: Record<string, string> = {
  thai: '🍜',
  italian: '🍝',
  mexican: '🌮',
  indian: '🍛',
  mediterranean: '🥗',
  japanese: '🍱',
  korean: '🥘',
  nepali: '🥟',
  chinese: '🥡',
  american: '🍽️',
}

const CUISINES = Object.keys(CUISINE_EMOJI)

export function getCentralWeekStart(now = new Date()): string {
  const centralNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  centralNow.setDate(centralNow.getDate() - centralNow.getDay())
  centralNow.setHours(0, 0, 0, 0)
  return centralNow.toISOString().slice(0, 10)
}

export function getWeeklyInstructionExpiry(now = new Date()): string {
  const centralNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const expires = new Date(centralNow)
  expires.setDate(centralNow.getDate() + (7 - centralNow.getDay()))
  expires.setHours(23, 59, 59, 999)
  return expires.toISOString()
}

export function extractWeeklyInstruction(text: string): WeeklyInstructionDetection | null {
  const lower = text.toLowerCase()
  const mentionsWeek = /\b(this week|week|weekly|for now|until sunday|next few dinners)\b/.test(lower)

  if (/\b(forget|clear|remove|stop|reset)\b.*\b(instruction|preference|theme|memory|week)\b/.test(lower)) {
    return { action: 'clear' }
  }

  if (!mentionsWeek) return null

  if (/\b(no repeat|no repeated|avoid repeat|different cuisine|variety)\b/.test(lower)) {
    return {
      action: 'set',
      instructionType: 'variety_rule',
      value: 'no_repeat_cuisine',
      label: 'No cuisine repeats',
      emoji: '🔁',
    }
  }

  const budgetMatch = lower.match(/\b(?:under|below|less than|budget)\s*\$?(\d{2,4})\b/)
  if (budgetMatch?.[1]) {
    return {
      action: 'set',
      instructionType: 'budget_override',
      value: budgetMatch[1],
      label: `Under $${budgetMatch[1]}`,
      emoji: '💵',
    }
  }

  const timeMatch = lower.match(/\b(?:under|below|less than|max|maximum)\s*(\d{2,3})\s*(?:min|minute|minutes)\b/)
  if (timeMatch?.[1]) {
    return {
      action: 'set',
      instructionType: 'time_constraint',
      value: timeMatch[1],
      label: `Under ${timeMatch[1]} min`,
      emoji: '⏱️',
    }
  }

  if (/\b(no|avoid|skip|without)\b.*\b(spicy|spice|heat|fried|pork|beef|seafood|dairy|gluten)\b/.test(lower)) {
    const avoidValue = lower.match(/\b(spicy|spice|heat|fried|pork|beef|seafood|dairy|gluten)\b/)?.[1] ?? 'spicy'
    const labelValue = avoidValue === 'spice' || avoidValue === 'heat' ? 'spicy' : avoidValue
    return {
      action: 'set',
      instructionType: 'avoid',
      value: labelValue,
      label: `No ${labelValue}`,
      emoji: '🚫',
    }
  }

  const cuisine = CUISINES.find((item) => lower.includes(item))
  if (cuisine) {
    return {
      action: 'set',
      instructionType: 'cuisine_boost',
      value: cuisine,
      label: `${capitalize(cuisine)} week`,
      emoji: CUISINE_EMOJI[cuisine],
    }
  }

  return null
}

export async function loadActiveWeeklyInstructions(
  supabase: SupabaseClient,
  userId: string,
): Promise<WeeklyInstruction[]> {
  const { data } = await supabase
    .from('copilot_weekly_instructions')
    .select('id, instruction_type, value, label, emoji, week_start, expires_at')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6)

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    instructionType: row.instruction_type as WeeklyInstructionType,
    value: String(row.value),
    label: String(row.label),
    emoji: typeof row.emoji === 'string' ? row.emoji : null,
    weekStart: String(row.week_start),
    expiresAt: String(row.expires_at),
  }))
}

export async function saveWeeklyInstruction(
  supabase: SupabaseClient,
  userId: string,
  input: WeeklyInstructionInput,
): Promise<WeeklyInstruction> {
  const weekStart = getCentralWeekStart()
  const expiresAt = getWeeklyInstructionExpiry()
  const label = input.label ?? defaultLabel(input)
  const emoji = input.emoji ?? defaultEmoji(input)

  const { data, error } = await supabase
    .from('copilot_weekly_instructions')
    .upsert(
      {
        user_id: userId,
        instruction_type: input.instructionType,
        value: input.value.toLowerCase(),
        label,
        emoji,
        week_start: weekStart,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id,instruction_type,value,week_start' },
    )
    .select('id, instruction_type, value, label, emoji, week_start, expires_at')
    .single()

  if (error) throw error
  return {
    id: String(data.id),
    instructionType: data.instruction_type as WeeklyInstructionType,
    value: String(data.value),
    label: String(data.label),
    emoji: typeof data.emoji === 'string' ? data.emoji : null,
    weekStart: String(data.week_start),
    expiresAt: String(data.expires_at),
  }
}

export async function clearWeeklyInstructions(
  supabase: SupabaseClient,
  userId: string,
  value?: string,
): Promise<number> {
  let query = supabase
    .from('copilot_weekly_instructions')
    .delete()
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())

  if (value) query = query.ilike('value', value)

  const { data, error } = await query.select('id')
  if (error) throw error
  return data?.length ?? 0
}

export function formatWeeklyInstructionsForPrompt(instructions: WeeklyInstruction[]): string {
  if (instructions.length === 0) return ''
  return instructions
    .map((item) => `- ${item.label} (${item.instructionType}: ${item.value}, expires Sunday night)`)
    .join('\n')
}

function defaultLabel(input: WeeklyInstructionInput): string {
  if (input.instructionType === 'cuisine_boost') return `${capitalize(input.value)} week`
  if (input.instructionType === 'avoid') return `No ${input.value}`
  if (input.instructionType === 'time_constraint') return `Under ${input.value} min`
  if (input.instructionType === 'budget_override') return `Under $${input.value}`
  return 'No cuisine repeats'
}

function defaultEmoji(input: WeeklyInstructionInput): string {
  if (input.instructionType === 'cuisine_boost') return CUISINE_EMOJI[input.value.toLowerCase()] ?? '🍽️'
  if (input.instructionType === 'avoid') return '🚫'
  if (input.instructionType === 'time_constraint') return '⏱️'
  if (input.instructionType === 'budget_override') return '💵'
  return '🔁'
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
