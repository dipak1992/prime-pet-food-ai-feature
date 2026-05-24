export type PlanRefinementOperation =
  | 'swap_day'
  | 'rebalance_week'
  | 'fill_gaps'
  | 'budget_optimize'
  | 'lock_and_regenerate'

export interface PlanRefinementRequest {
  operation: PlanRefinementOperation
  day?: string
  constraint?: string
  keepDays?: string[]
  theme?: string
  budgetCap?: number
}

export interface PlanRefinementResult {
  message: string
  href: string
  params: Record<string, string>
}

function normalizeDay(day?: string): string | undefined {
  if (!day) return undefined
  const lower = day.toLowerCase().slice(0, 3)
  const map: Record<string, string> = {
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    sun: 'sunday',
  }
  return map[lower]
}

export function buildPlanRefinement(request: PlanRefinementRequest): PlanRefinementResult {
  const params: Record<string, string> = {
    source: 'copilot',
    refine: request.operation,
  }

  const day = normalizeDay(request.day)
  if (day) params.day = day
  if (request.constraint) params.constraint = request.constraint
  if (request.keepDays?.length) params.keep = request.keepDays.map((d) => normalizeDay(d) ?? d).join(',')
  if (request.theme) params.theme = request.theme
  if (typeof request.budgetCap === 'number') params.budget = String(request.budgetCap)

  const query = new URLSearchParams(params).toString()

  switch (request.operation) {
    case 'swap_day':
      return {
        message: day
          ? `I'll help swap ${day} for something ${request.constraint ?? 'that fits better'}.`
          : `I'll help swap that meal for something that fits better.`,
        href: `/planner?${query}`,
        params,
      }
    case 'budget_optimize':
      return {
        message: `I'll look for lower-cost swaps across the week.`,
        href: `/budget?${query}`,
        params,
      }
    case 'fill_gaps':
      return {
        message: `I'll fill the open nights without touching meals you've already picked.`,
        href: `/planner?${query}`,
        params,
      }
    case 'lock_and_regenerate':
      return {
        message: `I'll keep ${request.keepDays?.join(' and ') || 'the meals you named'} and rebuild the rest.`,
        href: `/planner?${query}`,
        params,
      }
    case 'rebalance_week':
    default:
      return {
        message: `I'll rebalance the week around ${request.theme ?? request.constraint ?? 'your new constraints'}.`,
        href: `/planner?${query}`,
        params,
      }
  }
}
