import type { BudgetState } from './types'

export function calcBudget(
  weeklyLimit: number | null,
  weekSpent: number
): BudgetState {
  if (!weeklyLimit || weeklyLimit <= 0) {
    return {
      weeklyLimit: null,
      weekSpent,
      percentUsed: 0,
      alertLevel: 'safe',
    }
  }

  const percentUsed = Math.round((weekSpent / weeklyLimit) * 100)
  let alertLevel: BudgetState['alertLevel'] = 'safe'
  if (percentUsed >= 100) alertLevel = 'over'
  else if (percentUsed >= 70) alertLevel = 'caution'

  return { weeklyLimit, weekSpent, percentUsed, alertLevel }
}

export function budgetColorClasses(level: BudgetState['alertLevel']) {
  switch (level) {
    case 'over':
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500',
        bgSoft: 'bg-red-50 dark:bg-red-950/40',
      }
    case 'caution':
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500',
        bgSoft: 'bg-amber-50 dark:bg-amber-950/40',
      }
    default:
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-500',
        bgSoft: 'bg-emerald-50 dark:bg-emerald-950/40',
      }
  }
}
