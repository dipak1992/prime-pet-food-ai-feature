/**
 * Dashboard Support Message System
 *
 * Three layers:
 *  1. Main line — one per day, household-personalized
 *  2. Context line — rotates by time block (morning/afternoon/evening/late)
 *  3. Reward line — ephemeral, triggered by user actions (handled client-side via toast)
 *
 * Rules:
 *  - Max 12 words per line (8 preferred)
 *  - One visible line at a time
 *  - No repeats within 14 days
 *  - Context line can replace main line when relevant
 */

import type { HouseholdType } from '@/lib/hooks/use-household-config'

// ── Types ──────────────────────────────────────────────────────────────────────

export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'late'

export interface DashboardMessage {
  heroHeading: string
  supportLine: string
  variant?: 'control' | 'support-line'
  rewardLine?: string
  expiresAt: string          // ISO timestamp — when this message should be replaced
  timeBlock: TimeBlock
}

// ── Message Corpus ─────────────────────────────────────────────────────────────

/** Household-personalized main lines (rotate daily). */
const mainLines: Record<HouseholdType, string[]> = {
  solo: [
    'Good food, less overthinking.',
    'One less thing to decide.',
    'Tonight is handled.',
    "Let's make today calmer.",
    'Dinner solved. Mind freed.',
    "You've got enough going on.",
    'Keep it simple tonight.',
    'Less planning, more eating.',
  ],
  couple: [
    'Easier dinners, better evenings.',
    'One less thing to decide together.',
    'Tonight is handled.',
    "Let's make tonight calmer.",
    'Dinner sorted. Evening yours.',
    'More time together, less stress.',
    'Two plates, zero planning.',
    'Good dinners start easy.',
  ],
  family: [
    "Let's make tonight calmer.",
    'One less family decision.',
    'Tonight is handled.',
    'Dinner solved for everyone.',
    'Less chaos, more dinner.',
    "Everyone's covered tonight.",
    'Feed the crew, skip the stress.',
    'Good family dinners start easy.',
  ],
}

/** Budget-aware lines (replace main line when applicable). */
export const budgetLines: string[] = [
  'Smart meals save more.',
  'Good dinners, gentle on the wallet.',
  'Eating well costs less than you think.',
]

/** Health-focused lines (replace main line when applicable). */
export const healthLines: string[] = [
  'Small wins count today.',
  'Good food is self-care.',
  'One healthy choice at a time.',
]

/** Context lines — by time block. */
const contextLines: Record<TimeBlock, string[]> = {
  morning: [
    'Lunchbox help is ready.',
    "Let's start simple.",
    'Plan ahead, stress less later.',
    'Morning sorted. Dinner next.',
  ],
  afternoon: [
    'One less dinner decision later.',
    'Dinner sorted before the rush.',
    'Afternoon calm, dinner planned.',
    "Tonight won't sneak up on you.",
  ],
  evening: [
    'Dinner should be easy tonight.',
    "We handled tonight's hardest question.",
    'Relax. Dinner is figured out.',
    'One tap away from done.',
  ],
  late: [
    'Tomorrow can be easier.',
    'Rest up. Tomorrow is planned.',
    "Good night — we've got tomorrow.",
    'Sleep well. Meals are handled.',
  ],
}

/** Reward lines — ephemeral toasts after actions. */
export const rewardMessages = {
  mealGenerated: 'Nice. One more decision done.',
  snapCook: 'Smart move.',
  weekPlanned: 'Whole week handled.',
  mealCooked: 'Another win.',
} as const

// ── Time Block Resolution ──────────────────────────────────────────────────────

export function getTimeBlock(date: Date = new Date()): TimeBlock {
  const h = date.getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'late'
}

/** Day key for deduplication (YYYY-MM-DD). */
export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

// ── Rotation Logic ─────────────────────────────────────────────────────────────

const RECENT_WINDOW = 14 // don't repeat within 14 days

/**
 * Deterministic-ish daily pick that avoids recently used lines.
 * Uses day-of-year as seed so same user sees the same line all day.
 */
export function pickMainLine(
  householdType: HouseholdType,
  recentLines: string[] = [],
  date: Date = new Date(),
): string {
  const pool = mainLines[householdType]
  const filtered = pool.filter((l) => !recentLines.includes(l))
  const candidates = filtered.length > 0 ? filtered : pool

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return candidates[dayOfYear % candidates.length]
}

export function pickContextLine(
  timeBlock: TimeBlock,
  date: Date = new Date(),
): string {
  const pool = contextLines[timeBlock]
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  // Offset by hour so different time blocks on the same day don't collide
  const idx = (dayOfYear + date.getHours()) % pool.length
  return pool[idx]
}

function pickFromPool(pool: string[], date: Date = new Date(), offset = 0): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return pool[(dayOfYear + offset) % pool.length]
}

// ── Hero Heading (time-of-day) ─────────────────────────────────────────────────

export function getHeroHeading(): string {
  const h = new Date().getHours()
  if (h < 12) return 'What do you need this morning?'
  if (h < 17) return "What's for dinner tonight?"
  return 'What do you need tonight?'
}

// ── Main Service Function ──────────────────────────────────────────────────────

export interface GetMessageOptions {
  householdType: HouseholdType
  recentLines?: string[]
  budgetSensitive?: boolean
  healthFocused?: boolean
}

/**
 * getDashboardSupportMessage(options)
 *
 * Returns the message payload for the dashboard. Designed to be called
 * client-side with data from the store — no DB round-trip needed.
 */
export function getDashboardSupportMessage(
  options: GetMessageOptions,
): DashboardMessage {
  const {
    householdType,
    recentLines = [],
    budgetSensitive = false,
    healthFocused = false,
  } = options

  const now = new Date()
  const timeBlock = getTimeBlock(now)
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )

  let supportLine: string

  // Budget/health overrides (contextual)
  if (budgetSensitive && dayOfYear % 10 < 3) {
    supportLine = pickFromPool(budgetLines, now)
  } else if (healthFocused && (dayOfYear + 4) % 10 < 3) {
    supportLine = pickFromPool(healthLines, now)
  } else {
    // Decide: main line (60%) vs context line (40%) weighted by time
    const useContext = timeBlock !== 'evening' && dayOfYear % 5 < 2
    supportLine = useContext
      ? pickContextLine(timeBlock, now)
      : pickMainLine(householdType, recentLines, now)
  }

  // Expires at end of current time block
  const blockEnd = new Date(now)
  if (timeBlock === 'morning') blockEnd.setHours(12, 0, 0, 0)
  else if (timeBlock === 'afternoon') blockEnd.setHours(17, 0, 0, 0)
  else if (timeBlock === 'evening') blockEnd.setHours(21, 0, 0, 0)
  else blockEnd.setDate(blockEnd.getDate() + 1), blockEnd.setHours(6, 0, 0, 0)

  return {
    heroHeading: getHeroHeading(),
    supportLine,
    expiresAt: blockEnd.toISOString(),
    timeBlock,
  }
}
