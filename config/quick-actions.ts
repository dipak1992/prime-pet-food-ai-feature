import type { QuickAction, Plan } from '@/lib/dashboard/types'

export const quickActionsConfig: QuickAction[] = [
  {
    id: 'scan',
    label: 'Snap & Cook',
    icon: '📸',
    href: '/dashboard/cook',
    requiredPlan: 'free',
  },
  {
    id: 'leftovers',
    label: 'Leftovers AI',
    icon: '🍱',
    href: '/leftovers',
    requiredPlan: 'plus',
  },
  {
    id: 'grocery',
    label: 'Grocery List',
    icon: '🛒',
    href: '/grocery-list',
    requiredPlan: 'plus',
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    href: '/budget',
    requiredPlan: 'plus',
  },
]

export function isActionGated(
  required: Plan,
  userPlan: Plan
): boolean {
  const rank: Record<Plan, number> = { free: 0, plus: 1 }
  return rank[userPlan] < rank[required]
}
