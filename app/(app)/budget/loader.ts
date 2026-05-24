import { createClient } from '@/lib/supabase/server'
import type { BudgetPayload, BudgetSettings, CategorySpend, SpendingHistoryWeek } from '@/lib/budget/types'
import { computeAlertLevel, getCurrentWeekStart, formatWeekStart } from '@/lib/budget/cost-estimator'

// ─── Load budget payload for a user ──────────────────────────────────────────

export async function loadBudgetPayload(
  userId: string,
  plan: 'free' | 'plus',
): Promise<BudgetPayload> {
  const supabase = await createClient()

  // ── Load budget settings ──────────────────────────────────────────────────
  const { data: budgetRow } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const settings: BudgetSettings = {
    weeklyLimit: budgetRow?.weekly_limit ?? null,
    strictMode: budgetRow?.strict_mode ?? false,
    zipCode: budgetRow?.zip_code ?? null,
    preferredStore: budgetRow?.preferred_store ?? null,
  }

  // ── Load current week spend ───────────────────────────────────────────────
  const weekStart = formatWeekStart(getCurrentWeekStart())

  const { data: weekRow } = await supabase
    .from('budget_weekly_spend')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const currentWeek = {
    weekStart,
    spent: weekRow?.spent ?? 0,
    estimated: weekRow?.estimated ?? 0,
    mealsCooked: weekRow?.meals_cooked ?? 0,
    breakdown: (weekRow?.breakdown as CategorySpend[]) ?? [],
  }

  // ── Load spending history (last 8 weeks) ──────────────────────────────────
  const { data: historyRows } = await supabase
    .from('budget_weekly_spend')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(8)

  const history: SpendingHistoryWeek[] = (historyRows ?? [])
    .map((row) => ({
      weekStart: row.week_start as string,
      spent: row.spent as number,
      estimated: row.estimated as number,
      mealsCooked: row.meals_cooked as number,
      breakdown: (row.breakdown as CategorySpend[]) ?? [],
    }))
    .reverse() // oldest first for chart

  return {
    settings,
    currentWeek,
    history,
    plan,
  }
}
