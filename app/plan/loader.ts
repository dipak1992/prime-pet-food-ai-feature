import { createClient } from '@/lib/supabase/server'
import type { WeekPlan, PlanDay, DayStatus } from '@/lib/plan/types'
import type { Recipe } from '@/lib/dashboard/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function buildEmptyDays(weekStart: string): PlanDay[] {
  return DAY_ABBREVS.map((abbrev, i) => {
    const date = addDays(weekStart, i)
    return {
      id: `${weekStart}-${i}`,
      dayIndex: i,
      dayAbbrev: abbrev,
      dayLabel: DAY_LABELS[i],
      date,
      dateLabel: formatDateLabel(date),
      recipe: null,
      status: 'empty' as DayStatus,
      locked: false,
      estimatedCost: null,
      notes: null,
    }
  })
}

function computeStats(days: PlanDay[]): WeekPlan['stats'] {
  const plannedCount = days.filter((d) => d.recipe && d.status !== 'cooked').length
  const cookedCount = days.filter((d) => d.status === 'cooked').length
  const emptyCount = days.filter((d) => !d.recipe).length
  const totalEstimatedCost = days.reduce((sum, d) => sum + (d.estimatedCost ?? 0), 0)
  const filledCount = days.filter((d) => d.recipe).length
  const completionPercentage = Math.round((cookedCount / Math.max(1, filledCount)) * 100)
  return { plannedCount, cookedCount, emptyCount, totalEstimatedCost, completionPercentage }
}

// ─── Row → Recipe ─────────────────────────────────────────────────────────────

function rowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    name: row.name as string,
    image: (row.image as string) ?? '',
    cookTimeMin: (row.cook_time_min as number) ?? 30,
    difficulty: (row.difficulty as Recipe['difficulty']) ?? 'easy',
    servings: (row.servings as number) ?? 4,
    costTotal: (row.cost_total as number) ?? 0,
    costPerServing: (row.cost_per_serving as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
  }
}

// ─── Main loader ──────────────────────────────────────────────────────────────

export async function loadWeekPlan(
  userId: string,
  weekStart?: string,
): Promise<WeekPlan> {
  const supabase = await createClient()
  const ws = weekStart ?? getCurrentWeekStart()
  const we = addDays(ws, 6)

  // Find or create the week_plan row
  let { data: planRow } = await supabase
    .from('week_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', ws)
    .maybeSingle()

  if (!planRow) {
    const { data: inserted } = await supabase
      .from('week_plans')
      .insert({ user_id: userId, week_start: ws, week_end: we, is_autopilot: false })
      .select()
      .single()
    planRow = inserted
  }

  if (!planRow) {
    // Fallback: return empty plan without DB
    const days = buildEmptyDays(ws)
    return {
      id: `local-${ws}`,
      weekStart: ws,
      weekEnd: we,
      isAutopilot: false,
      days,
      stats: computeStats(days),
    }
  }

  // Load day rows
  const { data: dayRows } = await supabase
    .from('week_plan_days')
    .select('*, recipe:recipe_id(*)')
    .eq('plan_id', planRow.id)
    .order('day_index', { ascending: true })

  // Build 7-day array, merging DB rows into empty scaffold
  const emptyDays = buildEmptyDays(ws)
  const days: PlanDay[] = emptyDays.map((empty) => {
    const row = (dayRows ?? []).find(
      (r: Record<string, unknown>) => (r.day_index as number) === empty.dayIndex,
    )
    if (!row) return empty

    const recipeRaw = row.recipe as Record<string, unknown> | null
    const recipe: Recipe | null = recipeRaw ? rowToRecipe(recipeRaw) : null

    return {
      ...empty,
      id: row.id as string,
      recipe,
      status: (row.status as DayStatus) ?? (recipe ? 'planned' : 'empty'),
      locked: (row.locked as boolean) ?? false,
      estimatedCost: (row.estimated_cost as number | null) ?? null,
      notes: (row.notes as string | null) ?? null,
    }
  })

  return {
    id: planRow.id as string,
    weekStart: ws,
    weekEnd: we,
    isAutopilot: (planRow.is_autopilot as boolean) ?? false,
    days,
    stats: computeStats(days),
  }
}
