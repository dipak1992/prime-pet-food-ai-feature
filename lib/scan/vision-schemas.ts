import { z } from 'zod'

export const classifyVisionSchema = z.object({
  type: z.enum(['fridge', 'menu', 'food']),
  confidence: z.coerce.number().min(0).max(1),
})

export const fridgeVisionSchema = z.object({
  ingredients: z.array(z.object({
    id: z.string().min(1).max(80),
    name: z.string().min(1).max(80),
    quantity: z.string().max(40).optional(),
    unit: z.string().max(40).optional(),
    emoji: z.string().max(8).optional(),
  })).max(30),
  recipes: z.array(z.object({
    id: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    cookTime: z.coerce.number().int().min(1).max(240),
    servings: z.coerce.number().int().min(1).max(20),
    estimatedCost: z.coerce.number().min(0).max(500),
    matchedIngredients: z.array(z.string().max(80)).max(30),
    missingIngredients: z.array(z.string().max(80)).max(20),
  })).length(3),
  savedToPantry: z.boolean().default(false),
})

export const menuVisionSchema = z.object({
  restaurantName: z.string().max(120).optional(),
  picks: z.array(z.object({
    id: z.string().min(1).max(80),
    name: z.string().min(1).max(120),
    description: z.string().max(260).optional(),
    price: z.coerce.number().min(0).max(1000).optional(),
    healthScore: z.coerce.number().int().min(0).max(100),
    calories: z.coerce.number().int().min(0).max(5000).optional(),
    tags: z.array(z.string().max(40)).max(8),
    rank: z.coerce.number().int().min(1).max(10),
  })).min(1).max(5),
})

export const foodVisionSchema = z.object({
  name: z.string().min(1).max(120),
  calories: z.coerce.number().int().min(0).max(5000),
  protein: z.coerce.number().min(0).max(500),
  carbs: z.coerce.number().min(0).max(500),
  fat: z.coerce.number().min(0).max(500),
  fiber: z.coerce.number().min(0).max(200).optional(),
  sugar: z.coerce.number().min(0).max(300).optional(),
  sodium: z.coerce.number().min(0).max(10000).optional(),
  servingSize: z.string().max(120).optional(),
  warnings: z.array(z.string().max(180)).max(6),
  positives: z.array(z.string().max(180)).max(6),
})

export function parseVisionJson<T>(raw: string, schema: z.ZodSchema<T>): T {
  const cleaned = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const parsed = JSON.parse(cleaned)
  return schema.parse(parsed)
}
