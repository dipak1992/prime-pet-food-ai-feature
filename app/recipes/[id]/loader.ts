import { createClient } from '@/lib/supabase/server'
import { detectAllergens, buildSafetyNotes, type AllergenWarning } from '@/lib/safety/allergen-detector'
import { findRelevantCulinaryRules, type CulinaryRule } from '@/lib/safety/culinary-rules'
import { enrichStepsWithTimers } from '@/lib/recipes/timer-extractor'

// ─── LoadedRecipe type ────────────────────────────────────────────────────────

export type LoadedRecipe = {
  id: string
  name: string
  image: string | null
  description: string | null
  servings: number
  cookTimeMin: number
  prepTimeMin: number
  difficulty: 'easy' | 'medium' | 'hard'
  costTotal: number
  costPerServing: number
  tags: string[]
  ingredients: Array<{ name: string; quantity: number; unit: string }>
  steps: Array<{ order: number; instruction: string; timerSeconds?: number }>
  nutrition?: { calories: number; protein: number; carbs: number; fat: number }
  verifiedStatus: 'unverified' | 'chef_verified' | 'safety_reviewed'
  verifiedBy: string | null
  verifiedAt: string | null
  allergenWarnings: AllergenWarning[]
  safetyNotes: string[]
  culinaryRules: CulinaryRule[]
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_RECIPE: LoadedRecipe = {
  id: 'mock',
  name: 'Classic Spaghetti Bolognese',
  image: null,
  description: 'A hearty Italian meat sauce served over al dente spaghetti.',
  servings: 4,
  cookTimeMin: 30,
  prepTimeMin: 10,
  difficulty: 'easy',
  costTotal: 12.50,
  costPerServing: 3.13,
  tags: ['italian', 'pasta', 'high_protein'],
  ingredients: [
    { name: 'Spaghetti', quantity: 400, unit: 'g' },
    { name: 'Ground beef', quantity: 500, unit: 'g' },
    { name: 'Tomato sauce', quantity: 400, unit: 'ml' },
    { name: 'Onion', quantity: 1, unit: 'medium' },
    { name: 'Garlic cloves', quantity: 3, unit: 'cloves' },
    { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
    { name: 'Salt & pepper', quantity: 1, unit: 'to taste' },
  ],
  steps: [
    { order: 1, instruction: 'Bring a large pot of salted water to a boil.', timerSeconds: 300 },
    { order: 2, instruction: 'Dice the onion and mince the garlic.' },
    { order: 3, instruction: 'Heat olive oil in a large pan over medium heat. Sauté onion for 3 minutes until softened.', timerSeconds: 180 },
    { order: 4, instruction: 'Add garlic and cook for 1 minute until fragrant.', timerSeconds: 60 },
    { order: 5, instruction: 'Add ground beef and cook, breaking it up, until browned — about 5 minutes.', timerSeconds: 300 },
    { order: 6, instruction: 'Pour in tomato sauce, season with salt and pepper, and simmer for 15 minutes.', timerSeconds: 900 },
    { order: 7, instruction: 'Cook spaghetti according to package directions until al dente. Drain and serve topped with the Bolognese sauce.' },
  ],
  nutrition: { calories: 520, protein: 34, carbs: 58, fat: 14 },
  verifiedStatus: 'safety_reviewed',
  verifiedBy: 'MealEase safety rules',
  verifiedAt: null,
  allergenWarnings: detectAllergens(['Spaghetti', 'Ground beef', 'Tomato sauce', 'Onion', 'Garlic cloves', 'Olive oil', 'Salt & pepper']),
  safetyNotes: buildSafetyNotes({
    ingredients: ['Spaghetti', 'Ground beef', 'Tomato sauce', 'Onion', 'Garlic cloves', 'Olive oil', 'Salt & pepper'],
  }),
  culinaryRules: findRelevantCulinaryRules({
    ingredients: ['Spaghetti', 'Ground beef', 'Tomato sauce', 'Onion', 'Garlic cloves', 'Olive oil', 'Salt & pepper'],
    instructions: [
      'Add ground beef and cook, breaking it up, until browned — about 5 minutes.',
      'Pour in tomato sauce, season with salt and pepper, and simmer for 15 minutes.',
    ],
  }),
}

// ─── loadRecipe ───────────────────────────────────────────────────────────────

export class RecipeNotFoundError extends Error {
  constructor(id: string) {
    super(`Recipe not found: ${id}`)
    this.name = 'RecipeNotFoundError'
  }
}

export async function loadRecipe(id: string): Promise<LoadedRecipe> {
  // Return mock for the mock id
  if (id === 'mock') return MOCK_RECIPE

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) throw new RecipeNotFoundError(id)

    const ingredients = data.ingredients ?? []
    const steps = enrichStepsWithTimers((data.steps ?? data.base_instructions?.map((instruction: string, i: number) => ({
      order: i + 1,
      instruction,
    })) ?? []) as Array<{ order: number; instruction: string; timerSeconds?: number }>)
    const ingredientNames = ingredients.map((ingredient: { name?: string } | string) =>
      typeof ingredient === 'string' ? ingredient : ingredient.name ?? '',
    )
    const instructionTexts = steps.map((step: { instruction: string }) => step.instruction)
    const allergenWarnings = data.allergen_warnings ?? detectAllergens(ingredientNames)
    const culinaryRules = data.culinary_rules ?? findRelevantCulinaryRules({
      ingredients: ingredientNames,
      instructions: instructionTexts,
      tags: data.tags ?? [],
    })
    const safetyNotes = data.safety_notes ?? buildSafetyNotes({
      ingredients: ingredientNames,
      instructions: instructionTexts,
    })

    // Map DB row → LoadedRecipe
    return {
      id: data.id,
      name: data.name ?? data.title ?? 'Untitled Recipe',
      image: data.image_url ?? data.image ?? null,
      description: data.description ?? null,
      servings: data.servings ?? 4,
      cookTimeMin: data.cook_time_minutes ?? data.cook_time_min ?? data.cook_time ?? 30,
      prepTimeMin: data.prep_time_minutes ?? data.prep_time_min ?? data.prep_time ?? 10,
      difficulty: data.difficulty ?? 'easy',
      costTotal: data.cost_total ?? data.estimated_cost ?? 0,
      costPerServing: data.cost_per_serving ?? 0,
      tags: data.tags ?? [],
      ingredients,
      steps,
      nutrition: data.nutrition ?? undefined,
      verifiedStatus: data.verified_status ?? 'unverified',
      verifiedBy: data.verified_by ?? null,
      verifiedAt: data.verified_at ?? null,
      allergenWarnings,
      safetyNotes,
      culinaryRules,
    }
  } catch (error) {
    if (error instanceof RecipeNotFoundError) throw error
    throw new RecipeNotFoundError(id)
  }
}
