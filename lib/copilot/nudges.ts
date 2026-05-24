import type { SupabaseClient } from '@supabase/supabase-js'
import type { CopilotChipAction, CopilotNudge, CopilotScreen } from '@/stores/copilotStore'

export type CopilotNudgeType =
  | 'leftover_expiry'
  | 'budget_pressure'
  | 'dinner_time'
  | 'plan_gap'
  | 'grocery_ready'

export interface NudgeInput {
  userId: string
  screen: CopilotScreen
  hour?: number
  leftovers?: Array<{ id: string; name: string; expiresAt?: string | null; daysUntilExpiry?: number | null }>
  budget?: { weeklyLimit?: number | null; spent?: number | null; estimated?: number | null; remaining?: number | null }
  plan?: { plannedCount?: number; emptyCount?: number; hasPlan?: boolean }
  grocery?: { itemCount?: number; checkedCount?: number }
  recentlySentTypes?: string[]
}

interface Candidate {
  type: CopilotNudgeType
  title: string
  body: string
  ctaLabel: string
  priority: number
  action: CopilotChipAction
  subjectId?: string
}

function daysUntil(date: string): number {
  const now = new Date()
  const expires = new Date(date)
  return Math.ceil((expires.getTime() - now.getTime()) / 86_400_000)
}

function variantFor(userId: string, type: string): 'a' | 'b' {
  const seed = `${userId}:${type}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return seed % 2 === 0 ? 'a' : 'b'
}

function candidateToNudge(userId: string, candidate: Candidate): CopilotNudge {
  const variant = variantFor(userId, candidate.type)
  return {
    id: `${candidate.type}:${candidate.subjectId ?? 'daily'}:${variant}`,
    type: candidate.type,
    title: candidate.title,
    body: candidate.body,
    ctaLabel: candidate.ctaLabel,
    priority: candidate.priority,
    action: candidate.action,
    variant,
    status: 'active',
  }
}

export function computeCopilotNudges(input: NudgeInput): CopilotNudge[] {
  const hour = input.hour ?? new Date().getHours()
  const suppressed = new Set(input.recentlySentTypes ?? [])
  const candidates: Candidate[] = []

  const urgentLeftover = input.leftovers
    ?.map((leftover) => ({
      ...leftover,
      days: leftover.daysUntilExpiry ?? (leftover.expiresAt ? daysUntil(leftover.expiresAt) : null),
    }))
    .filter((leftover) => leftover.days !== null && leftover.days <= 1 && leftover.days >= 0)
    .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0]

  if (urgentLeftover && !suppressed.has('leftover_expiry')) {
    candidates.push({
      type: 'leftover_expiry',
      subjectId: urgentLeftover.id,
      title: `${urgentLeftover.name} expires soon`,
      body: urgentLeftover.days === 0
        ? `Use it today before it gets wasted.`
        : `It expires tomorrow. I can turn it into a quick dinner idea.`,
      ctaLabel: 'Find a use',
      priority: 95,
      action: { type: 'navigate', href: '/leftovers?source=copilot-nudge' },
    })
  }

  const budgetLimit = input.budget?.weeklyLimit ?? null
  const budgetUsed = (input.budget?.spent ?? 0) + (input.budget?.estimated ?? 0)
  const remaining = input.budget?.remaining ?? (budgetLimit === null ? null : budgetLimit - budgetUsed)

  if (budgetLimit && remaining !== null && remaining <= Math.max(15, budgetLimit * 0.15) && !suppressed.has('budget_pressure')) {
    candidates.push({
      type: 'budget_pressure',
      title: remaining < 0 ? `You're $${Math.abs(Math.round(remaining))} over budget` : `Budget is getting tight`,
      body: 'I can suggest swaps that keep the week cheaper.',
      ctaLabel: 'Find swaps',
      priority: 85,
      action: { type: 'navigate', href: '/budget?source=copilot-nudge' },
    })
  }

  if (hour >= 16 && hour <= 19 && input.screen !== 'tonight' && !suppressed.has('dinner_time')) {
    candidates.push({
      type: 'dinner_time',
      title: `Still deciding dinner?`,
      body: 'I can pull up quick ideas that fit your household.',
      ctaLabel: 'Show tonight',
      priority: 70,
      action: { type: 'navigate', href: '/dashboard/tonight?source=copilot-nudge' },
    })
  }

  if ((input.plan?.emptyCount ?? 0) >= 2 && !suppressed.has('plan_gap')) {
    candidates.push({
      type: 'plan_gap',
      title: `${input.plan?.emptyCount} nights still open`,
      body: 'Want me to fill the gaps around your preferences and leftovers?',
      ctaLabel: 'Fill plan gaps',
      priority: 65,
      action: { type: 'navigate', href: '/planner?source=copilot-nudge&autopilot=empty' },
    })
  }

  const groceryCount = input.grocery?.itemCount ?? 0
  const checkedCount = input.grocery?.checkedCount ?? 0
  if (groceryCount >= 5 && checkedCount === 0 && !suppressed.has('grocery_ready')) {
    candidates.push({
      type: 'grocery_ready',
      title: `${groceryCount} grocery items ready`,
      body: 'Your list is ready to review before shopping.',
      ctaLabel: 'Open list',
      priority: 55,
      action: { type: 'navigate', href: '/grocery-list?source=copilot-nudge' },
    })
  }

  return candidates
    .sort((a, b) => b.priority - a.priority)
    .map((candidate) => candidateToNudge(input.userId, candidate))
}

export async function loadRecentCopilotNudgeTypes(
  supabase: SupabaseClient,
  userId: string,
  sinceHours = 22,
): Promise<string[]> {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('proactive_nudges')
    .select('nudge_type')
    .eq('user_id', userId)
    .gte('sent_at', since)

  return (data ?? []).map((row) => String(row.nudge_type))
}
