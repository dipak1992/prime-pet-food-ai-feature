export const STEPS = [
  { id: 'household', label: 'Household' },
  { id: 'dietary', label: 'Dietary' },
  { id: 'goal', label: 'Goal' },
] as const

export type StepId = (typeof STEPS)[number]['id']
