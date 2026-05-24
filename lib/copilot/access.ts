import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import type { CopilotChip } from '@/stores/copilotStore'

export const FREE_COPILOT_DAILY_ASSISTS = 3

export const FREE_COPILOT_QUOTA = {
  key: 'copilot_meal_assist',
  limit: FREE_COPILOT_DAILY_ASSISTS,
  label: 'Copilot meal assist',
}

export const FREE_COPILOT_TOOL_NAMES = new Set([
  'suggest_tonight_dinner',
  'swap_tonight_meal',
  'suggest_leftover_meal',
  'navigate_to_screen',
])

export const PLUS_ONLY_COPILOT_FEATURES = new Set([
  'autopilot',
  'plan-swap',
  'budget-swap',
  'budget-filter',
  'weekly-briefing',
  'schedule-plan',
  'grocery-action',
  'recipe-cheaper',
  'plan-five-easy',
  'plan-prep-ahead',
  'budget-takeout',
  'grocery-breakfast',
  'grocery-snacks',
  'grocery-pantry-check',
])

export const PLUS_ONLY_COPILOT_TOOL_NAMES = new Set([
  'add_to_grocery_list',
  'generate_weekly_plan',
  'refine_weekly_plan',
  'optimize_weekly_budget',
  'monitor_leftovers',
  'save_household_preference',
  'set_weekly_instruction',
  'clear_weekly_instruction',
  'build_weekly_briefing',
  'set_weekly_instruction',
  'clear_weekly_instruction',
])

const PLUS_INTENT_PATTERNS = [
  {
    pattern: /\b(under|below|less than|save|cheap|cheaper|budget|cost|over budget|\$\d+)/i,
    message: 'Plus unlocks budget optimization. Copilot can scan the whole week, explain the savings, and route you to lower-cost swaps without breaking the plan.',
  },
  {
    pattern: /\b(keep|change|swap|replace|regenerate|rebalance|fill|plan|generate|create|make).*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|week|weekly|nights|plan)\b/i,
    message: 'Plus unlocks plan-wide Copilot actions. It can keep meals you like, change the rest, rebalance busy nights, and send you to the exact week update flow.',
  },
  {
    pattern: /\b(add|remove|update|check off).*\b(grocery|groceries|shopping list|list)\b/i,
    message: 'Plus unlocks grocery actions. Free Copilot can answer simple meal questions; Plus can update the grocery workflow around your plan and pantry.',
  },
  {
    pattern: /\b(remember|always|every|usually|soccer|practice|date night|schedule)\b/i,
    message: 'Plus unlocks household memory. Copilot can remember recurring schedule patterns, dislikes, budget rules, and weeknight limits when planning.',
  },
  {
    pattern: /\b(this week|weekly|until sunday|next few dinners).*\b(thai|italian|mexican|indian|mediterranean|japanese|korean|nepali|no spicy|quick|under \d{2,3}|budget|no repeat|different cuisine)\b/i,
    message: 'Plus unlocks weekly Copilot instructions. Tell MealEase what kind of food week you want, like “Thai this week” or “no spicy this week,” and Copilot keeps that instruction active until Sunday night.',
  },
  {
    pattern: /\b(brief|briefing|recap|run my week|fix my week|handle my week|food operating system)\b/i,
    message: 'Plus unlocks the weekly Copilot briefing: plan risks, grocery readiness, leftover priorities, budget pressure, and schedule-aware fixes in one view.',
  },
]

export function filterCopilotToolsForPlan(tools: ChatCompletionTool[], isPlus: boolean): ChatCompletionTool[] {
  if (isPlus) return tools
  return tools.filter((tool) => {
    if (tool.type !== 'function') return false
    const name = tool.function.name
    return !!name && FREE_COPILOT_TOOL_NAMES.has(name)
  })
}

export function isPlusOnlyCopilotChip(chip: CopilotChip): boolean {
  return chip.action.type === 'trigger' && PLUS_ONLY_COPILOT_FEATURES.has(chip.action.feature)
}

export function getFreeCopilotUpgradeMessage(text: string): string | null {
  const match = PLUS_INTENT_PATTERNS.find((entry) => entry.pattern.test(text))
  return match?.message ?? null
}

export function buildFreeLimitMessage(): string {
  return `You've used your ${FREE_COPILOT_DAILY_ASSISTS} free Copilot meal assists today. Plus unlocks unlimited Copilot, voice, memory, proactive nudges, plan refinements, budget swaps, and grocery actions.`
}
