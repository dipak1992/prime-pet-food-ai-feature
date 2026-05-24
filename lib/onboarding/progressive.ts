export type ProgressiveProfileField =
  | 'disliked_ingredients'
  | 'cuisine_preferences'
  | 'weekly_budget'
  | 'budget_style'
  | 'family_mode_enabled'
  | 'skill_level'

export type ProgressiveProfilePrompt = {
  id: string
  pathPrefixes: string[]
  field: ProgressiveProfileField
  question: string
  helper: string
  options: Array<{ label: string; value: string | number | boolean }>
}

export const progressiveProfilePrompts: ProgressiveProfilePrompt[] = [
  {
    id: 'tonight-avoid',
    pathPrefixes: ['/tonight'],
    field: 'disliked_ingredients',
    question: 'Want MealEase to avoid anything next time?',
    helper: 'This helps Tonight suggestions skip ingredients your household does not want.',
    options: [
      { label: 'Mushrooms', value: 'mushrooms' },
      { label: 'Seafood', value: 'seafood' },
      { label: 'Spicy food', value: 'spicy food' },
    ],
  },
  {
    id: 'planner-cuisine',
    pathPrefixes: ['/planner'],
    field: 'cuisine_preferences',
    question: 'What style should next week lean toward?',
    helper: 'MealEase can keep weekly plans closer to your usual dinner rotation.',
    options: [
      { label: 'American', value: 'American' },
      { label: 'Mexican', value: 'Mexican' },
      { label: 'Mediterranean', value: 'Mediterranean' },
    ],
  },
  {
    id: 'grocery-budget',
    pathPrefixes: ['/grocery-list'],
    field: 'budget_style',
    question: 'How budget-focused should this list be?',
    helper: 'Budget mode helps MealEase prefer lower-cost swaps and fewer one-off ingredients.',
    options: [
      { label: 'Balanced', value: 3 },
      { label: 'Save more', value: 4 },
      { label: 'Lowest cost', value: 5 },
    ],
  },
  {
    id: 'leftovers-family',
    pathPrefixes: ['/leftovers'],
    field: 'family_mode_enabled',
    question: 'Should leftovers be picky-eater friendly?',
    helper: 'MealEase will bias leftover ideas toward familiar formats and milder flavors.',
    options: [
      { label: 'Yes', value: true },
      { label: 'Not needed', value: false },
    ],
  },
  {
    id: 'budget-weekly',
    pathPrefixes: ['/budget'],
    field: 'weekly_budget',
    question: 'What grocery budget should MealEase remember?',
    helper: 'This gives budget planning a concrete number without blocking the rest of the app.',
    options: [
      { label: '$75', value: 75 },
      { label: '$100', value: 100 },
      { label: '$150', value: 150 },
    ],
  },
]

export function getProgressivePromptForPath(pathname: string) {
  return progressiveProfilePrompts.find((prompt) =>
    prompt.pathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  )
}
