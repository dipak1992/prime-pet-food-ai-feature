export type AllergenWarning = {
  allergen: string
  matchedTerms: string[]
  severity: 'contains' | 'possible'
}

const ALLERGEN_TERMS: Record<string, string[]> = {
  milk: ['milk', 'butter', 'cheese', 'cream', 'yogurt', 'whey', 'casein', 'ghee'],
  egg: ['egg', 'eggs', 'mayonnaise', 'aioli'],
  peanut: ['peanut', 'peanuts', 'peanut butter'],
  tree_nut: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'tree nut', 'nuts'],
  soy: ['soy', 'soy sauce', 'tofu', 'edamame', 'miso', 'tempeh'],
  wheat: ['wheat', 'flour', 'bread', 'pasta', 'spaghetti', 'noodle', 'breadcrumbs'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy'],
  shellfish: ['shrimp', 'crab', 'lobster', 'scallop', 'clam', 'mussel', 'shellfish'],
  sesame: ['sesame', 'tahini'],
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, ' ').trim()
}

export function detectAllergens(values: string[]): AllergenWarning[] {
  const haystack = values.map(normalize).join(' ')

  const warnings = Object.entries(ALLERGEN_TERMS)
    .map(([allergen, terms]) => {
      const matchedTerms = terms.filter((term) => {
        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        return pattern.test(haystack)
      })

      if (matchedTerms.length === 0) return null

      return {
        allergen,
        matchedTerms,
        severity: 'contains' as const,
      }
    })
    .filter((warning) => warning !== null)

  return warnings
}

export function buildSafetyNotes(input: {
  ingredients: string[]
  instructions?: string[]
  householdAllergies?: string[]
}): string[] {
  const allergens = detectAllergens(input.ingredients)
  const notes = allergens.map((warning) =>
    `Contains ${warning.allergen.replace('_', ' ')} (${warning.matchedTerms.slice(0, 3).join(', ')}).`,
  )

  const allergySet = new Set((input.householdAllergies ?? []).map(normalize))
  for (const warning of allergens) {
    if (allergySet.has(normalize(warning.allergen))) {
      notes.unshift(`Household allergy alert: this recipe appears to contain ${warning.allergen.replace('_', ' ')}.`)
    }
  }

  return Array.from(new Set(notes))
}
