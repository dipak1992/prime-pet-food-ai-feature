import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isoDateSchema, uuidSchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const groceryRequestSchema = z.object({
  recipeIds: z.array(uuidSchema).min(1).max(21),
  weekStart: isoDateSchema,
}).strict()

// ─── Types ────────────────────────────────────────────────────────────────────

type GroceryItem = {
  id: string
  name: string
  quantity: string
  unit: string
  category: string
  checked: boolean
  recipeNames: string[]
}

type GrocerySection = {
  category: string
  items: GroceryItem[]
}

type EmptyReason = 'no_plan' | 'no_meals' | 'no_recipes' | 'empty_ingredients'

type EmptyAction = {
  label: string
  href: string
}

type GroceryMeta = {
  reason: EmptyReason
  message: string
  actions: EmptyAction[]
}

function emptyResponse(reason: EmptyReason): NextResponse {
  const META: Record<EmptyReason, { message: string; actions: EmptyAction[] }> = {
    no_plan: {
      message: 'You haven\u2019t created a weekly meal plan yet. Generate one to automatically build your grocery list.',
      actions: [
        { label: 'Generate Weekly Plan', href: '/planner' },
        { label: 'Plan Tonight\u2019s Dinner', href: '/dashboard/tonight' },
      ],
    },
    no_meals: {
      message: 'Your weekly plan doesn\u2019t have any meals assigned yet. Add meals to your plan to build a grocery list.',
      actions: [
        { label: 'Open Weekly Plan', href: '/planner' },
        { label: 'Plan Tonight\u2019s Dinner', href: '/dashboard/tonight' },
      ],
    },
    no_recipes: {
      message: 'We couldn\u2019t find recipes for the meals in your plan. Try regenerating your weekly plan.',
      actions: [
        { label: 'Regenerate Weekly Plan', href: '/planner' },
      ],
    },
    empty_ingredients: {
      message: 'The recipes in your plan don\u2019t have ingredient data yet. Try regenerating your plan or adding meals with ingredients.',
      actions: [
        { label: 'Open Weekly Plan', href: '/planner' },
        { label: 'Plan Tonight\u2019s Dinner', href: '/dashboard/tonight' },
      ],
    },
  }

  const meta: GroceryMeta = { reason, ...META[reason] }
  return NextResponse.json({ sections: [], meta })
}

// ─── Category mapping ─────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Produce: [
    'onion', 'garlic', 'tomato', 'lettuce', 'spinach', 'kale', 'carrot', 'celery',
    'pepper', 'zucchini', 'broccoli', 'cauliflower', 'mushroom', 'potato', 'sweet potato',
    'lemon', 'lime', 'avocado', 'cucumber', 'corn', 'pea', 'bean', 'herb', 'basil',
    'cilantro', 'parsley', 'ginger', 'scallion', 'green onion', 'shallot',
  ],
  Meat: [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'sausage', 'bacon', 'ham',
    'ground beef', 'ground turkey', 'steak', 'thigh', 'breast', 'drumstick',
  ],
  Seafood: ['salmon', 'tuna', 'shrimp', 'cod', 'tilapia', 'fish', 'crab', 'lobster', 'scallop'],
  Dairy: [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'sour cream',
    'heavy cream', 'parmesan', 'mozzarella', 'cheddar', 'feta',
  ],
  Pantry: [
    'oil', 'olive oil', 'flour', 'sugar', 'salt', 'pepper', 'spice', 'sauce',
    'paste', 'vinegar', 'soy sauce', 'stock', 'broth', 'can', 'canned', 'rice',
    'pasta', 'noodle', 'bread', 'tortilla', 'cracker', 'oat', 'cereal',
  ],
  'Canned & Dry': [
    'lentil', 'chickpea', 'black bean', 'kidney bean', 'diced tomato',
    'tomato sauce', 'coconut milk', 'quinoa', 'barley',
  ],
}

function categorize(name: string): string {
  const lower = name.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Other'
}

// ─── POST /api/plan/grocery ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = groceryRequestSchema.safeParse(await req.json())
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'recipeIds')) {
      return emptyResponse('no_meals')
    }
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
  }
  const { recipeIds, weekStart } = parsed.data

  if (recipeIds.length === 0) {
    return emptyResponse('no_meals')
  }

  try {
    const { data: planRow } = await supabase
      .from('week_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (!planRow?.id) {
      return emptyResponse('no_plan')
    }

    const requestedIds = Array.from(new Set(recipeIds.filter((id): id is string => typeof id === 'string')))
    const { data: ownedDays } = await supabase
      .from('week_plan_days')
      .select('recipe_id')
      .eq('plan_id', planRow.id)
      .in('recipe_id', requestedIds)

    const ownedRecipeIds = Array.from(new Set(
      (ownedDays ?? [])
        .map((row) => row.recipe_id)
        .filter((id): id is string => typeof id === 'string'),
    ))

    if (ownedRecipeIds.length === 0) {
      return emptyResponse('no_meals')
    }

    // Load recipes with their ingredients
    const { data: recipeRows } = await supabase
      .from('recipes')
      .select('id, name, ingredients')
      .in('id', ownedRecipeIds)

    if (!recipeRows || recipeRows.length === 0) {
      return emptyResponse('no_recipes')
    }

    // Aggregate ingredients across all recipes
    // Map: normalized ingredient name → { quantity, unit, recipeNames }
    const aggregated = new Map<
      string,
      { quantity: number; unit: string; recipeNames: string[] }
    >()

    for (const recipe of recipeRows) {
      const ingredients = (recipe.ingredients as string[]) ?? []
      const recipeName = recipe.name as string

      for (const raw of ingredients) {
        // Parse "2 cups flour" → { qty: 2, unit: 'cups', name: 'flour' }
        const parsed = parseIngredient(raw)
        const key = parsed.name.toLowerCase().trim()

        if (!key) continue

        const existing = aggregated.get(key)
        if (existing) {
          // Same unit: add quantities
          if (existing.unit === parsed.unit) {
            existing.quantity += parsed.quantity
          }
          if (!existing.recipeNames.includes(recipeName)) {
            existing.recipeNames.push(recipeName)
          }
        } else {
          aggregated.set(key, {
            quantity: parsed.quantity,
            unit: parsed.unit,
            recipeNames: [recipeName],
          })
        }
      }
    }

    if (aggregated.size === 0) {
      return emptyResponse('empty_ingredients')
    }

    // Build sections
    const itemsByCategory = new Map<string, GroceryItem[]>()

    let idx = 0
    for (const [name, data] of aggregated.entries()) {
      const category = categorize(name)
      const item: GroceryItem = {
        id: `item-${idx++}`,
        name: capitalize(name),
        quantity: data.quantity > 0 ? formatQty(data.quantity) : '',
        unit: data.unit,
        category,
        checked: false,
        recipeNames: data.recipeNames,
      }

      if (!itemsByCategory.has(category)) {
        itemsByCategory.set(category, [])
      }
      itemsByCategory.get(category)!.push(item)
    }

    // Sort categories: Produce first, Other last
    const CATEGORY_ORDER = ['Produce', 'Meat', 'Seafood', 'Dairy', 'Pantry', 'Canned & Dry', 'Other']
    const sections: GrocerySection[] = [...itemsByCategory.entries()]
      .sort(([a], [b]) => {
        const ai = CATEGORY_ORDER.indexOf(a)
        const bi = CATEGORY_ORDER.indexOf(b)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))

    return NextResponse.json({ sections })
  } catch (e) {
    console.error('[POST /api/plan/grocery]', e)
    return NextResponse.json({ error: 'Failed to build grocery list' }, { status: 500 })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIngredient(raw: string): { quantity: number; unit: string; name: string } {
  // Match patterns like "2 cups flour", "1/2 tsp salt", "3 chicken breasts"
  const match = raw.match(
    /^([\d./]+)?\s*(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|clove|cloves|slice|slices|piece|pieces|can|cans|bunch|bunches|head|heads|stalk|stalks)?\s*(.+)$/i,
  )

  if (!match) return { quantity: 0, unit: '', name: raw.trim() }

  const qtyStr = match[1] ?? '0'
  const unit = (match[2] ?? '').toLowerCase()
  const name = (match[3] ?? raw).trim()

  // Handle fractions like "1/2"
  let quantity = 0
  if (qtyStr.includes('/')) {
    const [num, den] = qtyStr.split('/')
    quantity = parseFloat(num) / parseFloat(den)
  } else {
    quantity = parseFloat(qtyStr) || 0
  }

  return { quantity, unit, name }
}

function formatQty(n: number): string {
  if (n === Math.floor(n)) return String(n)
  // Common fractions
  const fractions: Record<number, string> = {
    0.25: '¼', 0.5: '½', 0.75: '¾',
    0.33: '⅓', 0.67: '⅔',
  }
  const rounded = Math.round(n * 100) / 100
  const whole = Math.floor(rounded)
  const frac = rounded - whole
  const fracStr = fractions[Math.round(frac * 100) / 100] ?? frac.toFixed(1).replace('0.', '.')
  return whole > 0 ? `${whole}${fracStr}` : fracStr
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
