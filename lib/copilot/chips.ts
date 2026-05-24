import type { CopilotChip, CopilotScreen } from '@/stores/copilotStore'

interface ChipContext {
  screen: CopilotScreen
  hour: number // 0-23
  hasPantryItems: boolean
  hasWeeklyPlan: boolean
  hasLeftovers: boolean
  budgetRemaining: number | null
}

export function generateChips(ctx: ChipContext): CopilotChip[] {
  const chips: CopilotChip[] = []

  // Screen-specific chips
  switch (ctx.screen) {
    case 'tonight':
      chips.push(
        { id: 'swap', label: 'Make tonight quicker', icon: '⚡', action: { type: 'trigger', feature: 'tonight-swap', params: { mode: 'quick' } } },
        { id: 'kid-friendly-tonight', label: 'Make kid-friendly', icon: '😊', action: { type: 'trigger', feature: 'recipe-kid-friendly' } },
        { id: 'veggie', label: 'Swap to vegetarian', icon: '🥬', action: { type: 'trigger', feature: 'tonight-swap', params: { mode: 'vegetarian' } } },
        { id: 'budget', label: 'Lower tonight’s cost', icon: '💰', action: { type: 'trigger', feature: 'tonight-swap', params: { mode: 'budget' } } },
      )
      break
    case 'cook':
      chips.push(
        { id: 'recipe-kid-friendly', label: 'Make kid-friendly', icon: '😊', action: { type: 'trigger', feature: 'recipe-kid-friendly' } },
        { id: 'recipe-quick', label: 'I only have 15 min', icon: '⏱️', action: { type: 'trigger', feature: 'recipe-quick' } },
        { id: 'recipe-protein-swap', label: 'Swap the protein', icon: '🔄', action: { type: 'trigger', feature: 'recipe-protein-swap' } },
        { id: 'recipe-cheaper', label: 'Make this cheaper', icon: '💰', action: { type: 'trigger', feature: 'recipe-cheaper' } },
      )
      if (ctx.hasPantryItems) {
        chips.push({ id: 'pantry-cook', label: 'Cook from pantry', icon: '🧊', action: { type: 'trigger', feature: 'pantry-match' } })
      }
      break
    case 'plan':
      if (!ctx.hasWeeklyPlan) {
        chips.push(
          { id: 'generate-plan', label: 'Plan my week', icon: '📅', action: { type: 'trigger', feature: 'autopilot' } },
          { id: 'five-easy-dinners', label: '5 easy dinners', icon: '🍽️', action: { type: 'trigger', feature: 'plan-five-easy' } },
          { id: 'weekly-briefing', label: 'Brief my food week', icon: '✨', action: { type: 'trigger', feature: 'weekly-briefing' } },
        )
      } else {
        chips.push(
          { id: 'grocery', label: 'Review grocery list', icon: '🛒', action: { type: 'navigate', href: '/grocery-list' } },
          { id: 'swap-day', label: 'Fix one night', icon: '🔄', action: { type: 'trigger', feature: 'plan-swap' } },
          { id: 'prep-ahead', label: 'Prep-ahead plan', icon: '🥣', action: { type: 'trigger', feature: 'plan-prep-ahead' } },
          { id: 'weekly-briefing', label: 'Brief my week', icon: '✨', action: { type: 'trigger', feature: 'weekly-briefing' } },
        )
      }
      break
    case 'leftovers':
      chips.push(
        { id: 'use-leftovers', label: 'Use leftovers tonight', icon: '♻️', action: { type: 'trigger', feature: 'leftover-suggest' } },
        { id: 'leftover-risk', label: 'Check expiry risk', icon: '⏱️', action: { type: 'trigger', feature: 'weekly-briefing', params: { focus: 'leftovers' } } },
      )
      break
    case 'budget':
      chips.push(
        { id: 'cheaper-swaps', label: 'Optimize this week', icon: '💡', action: { type: 'trigger', feature: 'budget-swap' } },
        { id: 'avoid-takeout', label: 'Avoid takeout night', icon: '🧾', action: { type: 'trigger', feature: 'budget-takeout' } },
      )
      if (ctx.budgetRemaining !== null && ctx.budgetRemaining < 20) {
        chips.push({ id: 'budget-meals', label: 'Keep plan under budget', icon: '🏷️', action: { type: 'trigger', feature: 'budget-filter' } })
      }
      break
    case 'grocery':
      chips.push(
        { id: 'grocery-store-handoff', label: 'Compare stores', icon: '🛒', action: { type: 'navigate', href: '/grocery-list?source=copilot&handoff=1' } },
        { id: 'grocery-breakfast', label: 'Add quick breakfasts', icon: '☀️', action: { type: 'trigger', feature: 'grocery-breakfast' } },
        { id: 'grocery-cheaper', label: 'Lower list cost', icon: '🏷️', action: { type: 'trigger', feature: 'grocery-cheaper' } },
        { id: 'grocery-check', label: 'Check pantry first', icon: '🧊', action: { type: 'trigger', feature: 'grocery-pantry-check' } },
      )
      break
    case 'home':
      chips.push(
        { id: 'home-tonight', label: "What's for dinner?", icon: '🍽️', action: { type: 'navigate', href: '/dashboard/tonight' } },
        { id: 'home-scan', label: 'Scan fridge', icon: '📸', action: { type: 'navigate', href: '/demo/scan?source=copilot' } },
        { id: 'home-brief', label: 'Brief my food week', icon: '✨', action: { type: 'trigger', feature: 'weekly-briefing' } },
        { id: 'home-grocery', label: 'Review groceries', icon: '🛒', action: { type: 'navigate', href: '/grocery-list' } },
      )
      break
  }

  // Time-based universal chips
  if (ctx.hour >= 16 && ctx.hour <= 19 && ctx.screen !== 'tonight') {
    chips.push({ id: 'tonight-quick', label: "What's for dinner?", icon: '🍽️', action: { type: 'navigate', href: '/dashboard/tonight' } })
  }
  if (ctx.hour >= 8 && ctx.hour <= 11 && !ctx.hasWeeklyPlan && ctx.screen !== 'plan') {
    chips.push({ id: 'plan-week', label: 'Plan this week', icon: '📅', action: { type: 'navigate', href: '/planner' } })
  }
  if (ctx.hasLeftovers && ctx.screen !== 'leftovers') {
    chips.push({ id: 'leftover-nudge', label: 'Use leftovers first', icon: '♻️', action: { type: 'navigate', href: '/leftovers' } })
  }

  return chips.slice(0, 5) // Max 5 chips
}
