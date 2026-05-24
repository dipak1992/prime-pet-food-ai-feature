export type MacroPlanResult = {
  title: string
  summary: string
  savings?: string
  lines: string[]
}

type ProteinProfile = {
  label: string
  gramsPerUnit: number
  unit: string
  caloriesPerUnit: number
}

const proteinProfiles: ProteinProfile[] = [
  { label: 'chicken breast', gramsPerUnit: 8, unit: 'cooked ounce', caloriesPerUnit: 47 },
  { label: 'lean turkey', gramsPerUnit: 7, unit: 'cooked ounce', caloriesPerUnit: 50 },
  { label: 'salmon', gramsPerUnit: 7, unit: 'cooked ounce', caloriesPerUnit: 58 },
  { label: 'tofu', gramsPerUnit: 3, unit: 'ounce', caloriesPerUnit: 23 },
  { label: 'black beans', gramsPerUnit: 8, unit: 'half cup', caloriesPerUnit: 114 },
  { label: 'eggs', gramsPerUnit: 6, unit: 'egg', caloriesPerUnit: 72 },
]

function readNumber(text: string, patterns: RegExp[], fallback: number) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return Number(match[1])
  }
  return fallback
}

function chooseProtein(text: string) {
  const lower = text.toLowerCase()
  return proteinProfiles.find((item) => lower.includes(item.label.split(' ')[0])) ?? proteinProfiles[0]
}

export function buildMacroTargetPlan(input: string, householdSize: number, budget: number): MacroPlanResult {
  const text = input.trim() || '550 calories, 40g protein, chicken, rice, vegetables'
  const calories = readNumber(text, [/(\d{3,4})\s*(?:cal|calories|kcal)/i], 550)
  const protein = readNumber(text, [/(\d{2,3})\s*g?\s*(?:protein|prot)/i, /protein\s*(?:target)?\s*(\d{2,3})/i], 40)
  const people = Math.max(1, householdSize || 1)
  const dinnerBudget = Math.max(8, Math.round((budget || 80) / 5))
  const profile = chooseProtein(text)
  const units = Math.max(1, Math.ceil(protein / profile.gramsPerUnit))
  const proteinCalories = units * profile.caloriesPerUnit
  const remainingCalories = Math.max(120, calories - proteinCalories)
  const carbCalories = Math.round(remainingCalories * 0.58)
  const fatCalories = Math.max(60, Math.round(remainingCalories * 0.25))

  return {
    title: `Portion-guided ${profile.label} dinner`,
    summary: `Sized for ${people} ${people === 1 ? 'person' : 'people'} with a rough $${dinnerBudget} dinner target.`,
    savings: `Portion math: ${units} ${profile.unit}${units === 1 ? '' : 's'} of ${profile.label} gets close to ${protein}g protein.`,
    lines: [
      `Protein base: ${units} ${profile.unit}${units === 1 ? '' : 's'} ${profile.label} per serving, then multiply by ${people}.`,
      `Energy range: about ${carbCalories} calories from rice, potatoes, tortillas, pasta, or beans.`,
      `Sauce and fat range: about ${fatCalories} calories from olive oil, avocado, cheese, yogurt sauce, or dressing.`,
      'Add at least 2 cups of vegetables per serving when possible so the plate feels full without blowing the target.',
      'MealEase can save this as a repeatable portion preference so future dinners start from your goal, budget, and pantry.',
    ],
  }
}

export type PregnancyPlanResult = {
  title: string
  summary: string
  trimester: 'first trimester' | 'second trimester' | 'third trimester' | 'unknown trimester'
  lines: string[]
}

function getTrimesterFromDueDate(input: string): PregnancyPlanResult['trimester'] {
  const match = input.match(/(?:due|date)?\s*(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i)
  if (!match?.[1]) return 'unknown trimester'

  const dueDate = new Date(match[1])
  if (Number.isNaN(dueDate.getTime())) return 'unknown trimester'

  const today = new Date()
  const msUntilDue = dueDate.getTime() - today.getTime()
  const weeksUntilDue = msUntilDue / (1000 * 60 * 60 * 24 * 7)
  const gestationalWeeks = 40 - weeksUntilDue

  if (gestationalWeeks <= 0 || gestationalWeeks > 43) return 'unknown trimester'
  if (gestationalWeeks <= 13) return 'first trimester'
  if (gestationalWeeks <= 27) return 'second trimester'
  return 'third trimester'
}

export function buildPregnancySafePlan(input: string, householdSize: number): PregnancyPlanResult {
  const text = input.trim() || 'due 2026-10-15, chicken, rice, spinach, nausea-friendly'
  const trimester = getTrimesterFromDueDate(text)
  const people = Math.max(1, householdSize || 1)

  const trimesterCue =
    trimester === 'first trimester'
      ? 'nausea-friendly, gentle smells, smaller portions, folate-rich greens, and simple starches'
      : trimester === 'second trimester'
        ? 'protein, iron, calcium, fiber, and steady energy'
        : trimester === 'third trimester'
          ? 'smaller meals, protein, choline, iron, and heartburn-aware seasoning'
          : 'pregnancy-safe ingredient rules with trimester noted when a due date is supplied'

  return {
    title: `Pregnancy-safe dinner plan (${trimester})`,
    trimester,
    summary: `Drafted for ${people} ${people === 1 ? 'person' : 'people'} using ${trimesterCue}.`,
    lines: [
      'Start with a fully cooked protein such as chicken, turkey, lentils, tofu, beans, or low-mercury fish.',
      'Avoid raw or undercooked meat, fish, and eggs; unpasteurized dairy; raw sprouts; and high-mercury fish.',
      'Heat deli meats or smoked seafood until steaming if used, and keep cold foods properly chilled.',
      `Trimester adjustment: prioritize ${trimesterCue}.`,
      'This is planning support, not medical advice. Confirm dietary restrictions, gestational diabetes guidance, allergies, and supplement needs with a clinician.',
    ],
  }
}
