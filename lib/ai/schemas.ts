import { z } from 'zod'

// ── Zod schemas mirroring AIGenerated* types from @/types ───

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  notes: z.string().optional(),
  category: z.string().optional(),
})

const lifeStageSchema = z.enum(['adult', 'baby', 'toddler', 'kid'])
const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])

const mealVariationSchema = z.object({
  member_id: z.string(),
  member_name: z.string(),
  member_stage: lifeStageSchema,
  title: z.string(),
  description: z.string(),
  modifications: z.array(z.string()),
  texture_notes: z.string().nullable(),
  safety_notes: z.array(z.string()),
  serving_description: z.string(),
  lunchbox_adaptation: z.string().nullable(),
})

const mealSchema = z.object({
  meal_type: mealTypeSchema,
  title: z.string(),
  description: z.string(),
  base_ingredients: z.array(ingredientSchema),
  base_instructions: z.array(z.string()),
  prep_time: z.number(),
  cook_time: z.number(),
  estimated_cost: z.number(),
  tags: z.array(z.string()),
  allergy_notes: z.record(z.string(), z.string()),
  safety_notes: z.array(z.string()),
  leftover_notes: z.string().nullable(),
  lunchbox_notes: z.string().nullable(),
  member_variations: z.array(mealVariationSchema),
})

const daySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  date: z.string(),
  meals: z.array(mealSchema).min(1),
})

const groceryCategorySchema = z.enum([
  'produce', 'protein', 'dairy', 'grains', 'pantry',
  'frozen', 'beverages', 'spices', 'condiments', 'snacks', 'baby', 'other',
])

const groceryItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  category: groceryCategorySchema,
  estimated_cost: z.number(),
  meal_usage: z.array(z.string()),
  substitution_options: z.array(z.string()),
})

const weeklyInsightsSchema = z.object({
  shared_meals_count: z.number(),
  school_lunches_ready: z.number(),
  ingredient_overlap_wins: z.array(z.string()),
  estimated_grocery_savings: z.number(),
  picky_eater_adaptations: z.number(),
  high_protein_meals: z.number(),
  low_sodium_meals: z.number(),
  allergy_safe_count: z.number(),
  leftover_conversions: z.number(),
  avg_prep_time: z.number(),
})

export const aiGeneratedPlanSchema = z.object({
  week_start: z.string(),
  week_end: z.string(),
  days: z.array(daySchema).min(1),
  grocery_list: z.object({
    items: z.array(groceryItemSchema),
    estimated_total: z.number(),
  }),
  insights: weeklyInsightsSchema,
})
