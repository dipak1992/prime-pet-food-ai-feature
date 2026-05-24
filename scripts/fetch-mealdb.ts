/**
 * One-time script: fetch TheMealDB and output meals-extended.ts
 * Run: npx tsx scripts/fetch-mealdb.ts > lib/engine/meals-extended.ts
 *
 * TheMealDB free tier: https://themealdb.com/api/json/v1/1/search.php?f=a
 * No API key needed. Filters to dinner-relevant categories only.
 */

export {}

// Exclude only Breakfast and Dessert — everything else is dinner-compatible
const EXCLUDED_CATEGORIES = new Set(['Breakfast', 'Dessert'])

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

interface RawMeal {
  idMeal: string; strMeal: string; strCategory: string; strArea: string
  strInstructions: string; strTags: string | null
  [key: string]: string | null
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

function inferProtein(cat: string, meal: string): string {
  const lc = (cat + meal).toLowerCase()
  if (lc.includes('chicken')) return 'chicken'
  if (lc.includes('beef') || lc.includes('steak')) return 'beef'
  if (lc.includes('pork') || lc.includes('bacon')) return 'pork'
  if (lc.includes('lamb')) return 'beef'
  if (lc.includes('seafood') || lc.includes('fish') || lc.includes('salmon') || lc.includes('cod')) return 'fish'
  if (lc.includes('shrimp') || lc.includes('prawn')) return 'shrimp'
  if (lc.includes('tofu')) return 'tofu'
  if (lc.includes('vegan') || lc.includes('vegetarian') || lc.includes('bean')) return 'beans'
  if (lc.includes('egg')) return 'eggs'
  if (lc.includes('lentil')) return 'lentils'
  if (lc.includes('turkey')) return 'turkey'
  if (lc.includes('sausage')) return 'sausage'
  return 'none'
}

function inferCuisine(area: string): string {
  const a = area.toLowerCase()
  if (['american','canadian'].includes(a)) return 'american'
  if (['mexican'].includes(a)) return 'mexican'
  if (['chinese','japanese','thai','vietnamese','korean','malaysian','filipino','asian'].includes(a)) return 'asian'
  if (['greek','turkish','tunisian','moroccan','egyptian','mediterranean'].includes(a)) return 'mediterranean'
  if (['indian'].includes(a)) return 'indian'
  if (['italian'].includes(a)) return 'italian'
  if (['british','irish','dutch','french','spanish','portuguese','polish','russian'].includes(a)) return 'comfort'
  return 'global'
}

function inferCost(ings: string[]): { level: string; est: number } {
  const expensive = ['beef','steak','lamb','salmon','shrimp','prawn','lobster','crab','scallop']
  const hasExpensive = ings.some(i => expensive.some(e => i.toLowerCase().includes(e)))
  return hasExpensive ? { level: 'high', est: 18 } : { level: 'medium', est: 12 }
}

function inferDietary(ings: string[], cat: string): string[] {
  const all = ings.join(' ').toLowerCase()
  const result = ['nut-free']
  if (!all.includes('gluten') && !all.includes('flour') && !all.includes('pasta') && !all.includes('bread') && !all.includes('soy sauce')) result.push('gluten-free')
  if (!all.includes('milk') && !all.includes('cream') && !all.includes('cheese') && !all.includes('butter') && !all.includes('yogurt') && !all.includes('dairy')) result.push('dairy-free')
  if (cat.toLowerCase() === 'vegan') result.push('vegan','vegetarian')
  else if (cat.toLowerCase() === 'vegetarian') result.push('vegetarian')
  return result
}

function extractIngredients(meal: RawMeal): Array<{ name: string; qty: string; unit: string }> {
  const out: Array<{ name: string; qty: string; unit: string }> = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    if (!name) continue
    const measure = (meal[`strMeasure${i}`] ?? '').trim()
    const parts = measure.match(/^([\d./\s]+)?\s*(.*)$/) || []
    out.push({ name, qty: (parts[1] ?? '1').trim() || '1', unit: (parts[2] ?? '').trim() })
  }
  return out
}

function extractSteps(instructions: string): string[] {
  return instructions
    .split(/\r?\n|\.\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 8)
}

function toMealCandidate(meal: RawMeal): string {
  const id = slugify(meal.strMeal)
  const ings = extractIngredients(meal)
  const ingNames = ings.map(i => i.name)
  const cost = inferCost(ingNames)
  const protein = inferProtein(meal.strCategory, meal.strMeal)
  const cuisine = inferCuisine(meal.strArea)
  const dietary = inferDietary(ingNames, meal.strCategory)
  const steps = extractSteps(meal.strInstructions)
  const tags = (meal.strTags ?? '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  const ingLines = ings
    .map(i => {
      const cat = guessCategory(i.name)
      return `    ing(${JSON.stringify(i.name)}, ${JSON.stringify(i.qty)}, ${JSON.stringify(i.unit)}, '${cat}')` 
    })
    .join(',\n')

  const vData = `v('Standard', 'Prepared as described', [], ['suitable-for-all'], 'varied', 'Taste and adjust seasoning')`

  return `  {
    id: ${JSON.stringify(id)},
    title: ${JSON.stringify(meal.strMeal)},
    tagline: ${JSON.stringify(`A delicious ${meal.strArea} ${meal.strCategory.toLowerCase()} dish`)},
    description: ${JSON.stringify(meal.strInstructions.slice(0, 120).replace(/\n/g,' ').trim() + '...')},
    cuisineTags: [${JSON.stringify(cuisine)}],
    proteinType: ${JSON.stringify(protein)},
    prepTime: 15,
    cookTime: 30,
    estimatedCost: ${cost.est},
    costLevel: ${JSON.stringify(cost.level)},
    servings: 4,
    difficulty: 'moderate',
    energyDemand: 'medium',
    tags: ${JSON.stringify(tags.length ? tags : ['dinner'])},
    kidFriendlyScore: 6,
    dietaryCompat: ${JSON.stringify(dietary)},
    ingredients: [
${ingLines}
    ],
    steps: ${JSON.stringify(steps)},
    variations: {
      adult:   ${vData},
      kid:     v('Kid-Friendly', 'Reduce spice, serve with plain rice or bread', [], ['suitable-for-all'], 'soft', 'Cut into small pieces'),
      toddler: v('Toddler', 'Mash or finely chop, reduce salt', [], ['suitable-for-all'], 'mashed', 'Serve in small portions'),
      baby:    v('Baby 8m+', 'Puree smooth, no salt, no honey', [], ['no-honey', 'no-salt'], 'pureed', 'Introduce one ingredient at a time'),
    },
    leftoverTip: 'Store in airtight container up to 3 days. Reheat gently.',
    keyIngredients: ${JSON.stringify(ingNames.slice(0, 4))},
    relatedTerms: ${JSON.stringify([meal.strArea.toLowerCase(), meal.strCategory.toLowerCase(), ...ingNames.slice(0,3).map(s=>s.toLowerCase())])},
  }`
}

function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (['chicken','beef','pork','salmon','tuna','lamb','shrimp','turkey','fish','egg','bacon','sausage'].some(p=>n.includes(p))) return 'protein'
  if (['milk','cream','cheese','butter','yogurt'].some(p=>n.includes(p))) return 'dairy'
  if (['rice','pasta','flour','bread','noodle','oat','quinoa'].some(p=>n.includes(p))) return 'grain'
  if (['oil','salt','pepper','sugar','vinegar','soy sauce','stock','water','tomato paste','cornstarch'].some(p=>n.includes(p))) return 'pantry_staple'
  if (['cumin','paprika','turmeric','cinnamon','oregano','thyme','basil','chili','garlic powder'].some(p=>n.includes(p))) return 'spice'
  if (['ketchup','mustard','mayo','sauce','dressing','hot sauce'].some(p=>n.includes(p))) return 'condiment'
  if (['carrot','onion','garlic','tomato','pepper','spinach','broccoli','potato','mushroom','lettuce','celery','zucchini','lemon'].some(p=>n.includes(p))) return 'produce'
  return 'other'
}

async function main() {
  const seen = new Set<string>()
  const meals: RawMeal[] = []

  for (const letter of LETTERS) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
    const data = await res.json() as { meals: RawMeal[] | null }
    if (!data.meals) continue
    for (const m of data.meals) {
      if (EXCLUDED_CATEGORIES.has(m.strCategory)) continue
      if (seen.has(m.idMeal)) continue
      seen.add(m.idMeal)
      meals.push(m)
    }
    await new Promise(r => setTimeout(r, 150)) // be polite to free API
  }

  const candidates = meals.map(toMealCandidate)

  process.stdout.write(`// AUTO-GENERATED by scripts/fetch-mealdb.ts — DO NOT EDIT BY HAND\n`)
  process.stdout.write(`import { ing, v } from './meals'\n`)
  process.stdout.write(`import type { MealCandidate } from './types'\n\n`)
  process.stdout.write(`export const MEALS_EXTENDED: MealCandidate[] = [\n`)
  process.stdout.write(candidates.join(',\n'))
  process.stdout.write(`\n]\n`)

  process.stderr.write(`✓ Wrote ${candidates.length} meals\n`)
}

main()
