export type CulinaryRule = {
  id: string
  category: 'temperature' | 'allergen' | 'child_safety' | 'ratio' | 'storage'
  title: string
  detail: string
  keywords: string[]
}

export const CULINARY_RULES: CulinaryRule[] = [
  {
    id: 'temp-poultry',
    category: 'temperature',
    title: 'Poultry safety',
    detail: 'Cook chicken, turkey, and other poultry until the thickest part reaches 165°F.',
    keywords: ['chicken', 'turkey', 'poultry', 'thigh', 'breast'],
  },
  {
    id: 'temp-ground-meat',
    category: 'temperature',
    title: 'Ground meat safety',
    detail: 'Cook ground beef, pork, lamb, and veal to 160°F before serving.',
    keywords: ['ground beef', 'ground pork', 'ground lamb', 'burger', 'meatball'],
  },
  {
    id: 'temp-fish',
    category: 'temperature',
    title: 'Fish safety',
    detail: 'Cook fish until opaque and flaky, or until it reaches 145°F.',
    keywords: ['salmon', 'fish', 'cod', 'tilapia', 'tuna', 'shrimp'],
  },
  {
    id: 'baby-honey',
    category: 'child_safety',
    title: 'No honey for babies',
    detail: 'Do not serve honey to children under 12 months.',
    keywords: ['honey', 'baby', 'infant'],
  },
  {
    id: 'child-choking-round-foods',
    category: 'child_safety',
    title: 'Cut round foods',
    detail: 'For toddlers and young kids, quarter grapes, cherry tomatoes, hot dogs, and other round foods lengthwise.',
    keywords: ['grapes', 'cherry tomatoes', 'hot dogs', 'sausage', 'toddler', 'child'],
  },
  {
    id: 'leftover-storage',
    category: 'storage',
    title: 'Leftover storage',
    detail: 'Refrigerate leftovers within 2 hours and use most cooked leftovers within 3-4 days.',
    keywords: ['leftover', 'meal prep', 'batch cook', 'reheat'],
  },
]

export function findRelevantCulinaryRules(input: {
  ingredients?: string[]
  instructions?: string[]
  tags?: string[]
  maxRules?: number
}): CulinaryRule[] {
  const haystack = [
    ...(input.ingredients ?? []),
    ...(input.instructions ?? []),
    ...(input.tags ?? []),
  ].join(' ').toLowerCase()

  const matches = CULINARY_RULES.filter((rule) =>
    rule.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())),
  )

  return matches.slice(0, input.maxRules ?? 5)
}

export function formatRulesForPrompt(rules: CulinaryRule[]): string {
  if (rules.length === 0) return 'No additional culinary rules matched.'
  return rules.map((rule) => `- ${rule.title}: ${rule.detail}`).join('\n')
}
