import { z } from 'zod'

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const COLLAPSE_WS = /\s+/g
const MAX_IMAGE_BASE64_CHARS = 7_000_000
const MAX_DATA_URL_CHARS = 14_000_000
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above|system|developer) (instructions|messages|prompt)/i,
  /reveal (the )?(system|developer) (prompt|message|instructions)/i,
  /print (the )?(system|developer) (prompt|message|instructions)/i,
  /you are now/i,
  /jailbreak/i,
  /do anything now/i,
  /act as (?:an? )?(?:unfiltered|uncensored|developer|system)/i,
  /bypass (safety|policy|guardrails|filters)/i,
]

export const uuidSchema = z.string().uuid()
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const emailSchema = z.string().trim().toLowerCase().email().max(254)

export function cleanText(value: string, max = 200): string {
  return value.replace(CONTROL_CHARS, '').replace(COLLAPSE_WS, ' ').trim().slice(0, max)
}

export function safeSearchParam(value: string | null, fallback: string, max = 120): string {
  if (!value) return fallback
  const cleaned = cleanText(value, max)
  return cleaned || fallback
}

export const cleanString = (max = 200) =>
  z.string().transform((value) => cleanText(value, max)).pipe(z.string().min(1).max(max))

export const optionalCleanString = (max = 200) =>
  z.string().transform((value) => cleanText(value, max)).pipe(z.string().max(max)).optional()

export const stringArraySchema = (maxItems = 30, maxLen = 80) =>
  z.array(z.string())
    .max(maxItems)
    .transform((values) => Array.from(new Set(values.map((value) => cleanText(value, maxLen)).filter(Boolean))))

export function containsPromptInjection(value: unknown): boolean {
  if (typeof value === 'string') {
    return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(value))
  }
  if (Array.isArray(value)) return value.some(containsPromptInjection)
  if (value && typeof value === 'object') return Object.values(value).some(containsPromptInjection)
  return false
}

export function promptInjectionIssue(value: unknown): string | null {
  return containsPromptInjection(value) ? 'Input contains unsafe prompt-control instructions' : null
}

const householdCountsSchema = z.object({
  adultsCount: z.coerce.number().int().min(0).max(12).default(0),
  kidsCount: z.coerce.number().int().min(0).max(12).default(0),
  toddlersCount: z.coerce.number().int().min(0).max(8).default(0),
  babiesCount: z.coerce.number().int().min(0).max(6).default(0),
}).refine((value) => value.adultsCount + value.kidsCount + value.toddlersCount + value.babiesCount > 0, {
  message: 'Household must have at least one member',
})

export const smartMealRequestSchema = z.object({
  pantryItems: stringArraySchema(60, 80).optional(),
  inspirationMeal: optionalCleanString(120),
  household: householdCountsSchema,
  pickyEater: z.object({
    active: z.coerce.boolean().default(false),
    dislikedFoods: stringArraySchema(50, 80).optional(),
    texturePreference: z.enum(['normal', 'soft', 'pureed', 'finger_foods']).optional(),
    safeFoods: stringArraySchema(50, 80).optional(),
  }).optional(),
  lowEnergy: z.coerce.boolean().optional(),
  locality: optionalCleanString(80),
  cuisinePreferences: stringArraySchema(25, 60).optional(),
  allergies: stringArraySchema(30, 60).optional(),
  dietaryRestrictions: stringArraySchema(30, 60).optional(),
  budget: z.enum(['low', 'medium', 'high']).optional(),
  maxCookTime: z.coerce.number().int().min(5).max(240).optional(),
  preferredProteins: stringArraySchema(30, 60).optional(),
  excludeIds: stringArraySchema(100, 80).optional(),
  mode: z.enum(['tonight', 'tonight-swap']).optional(),
}).strict()

export const aiGenerationRequestSchema = z.object({
  household: z.object({
    name: cleanString(80).default('My household'),
    budget_level: z.enum(['low', 'medium', 'high']).default('medium'),
    cooking_time_preference: z.enum(['quick', 'moderate', 'any']).default('any'),
    cuisine_preferences: stringArraySchema(25, 60).default([]),
    preferred_proteins: stringArraySchema(25, 60).default([]),
    meals_per_day: z.coerce.number().int().min(1).max(5).default(1),
    low_energy_mode: z.coerce.boolean().default(false),
    one_pot_preference: z.coerce.boolean().default(false),
    leftovers_preference: z.coerce.boolean().default(true),
  }).passthrough(),
  members: z.array(z.object({
    name: cleanString(80).default('Member'),
    stage: z.enum(['adult', 'kid', 'toddler', 'baby']).default('adult'),
    age: z.coerce.number().int().min(0).max(120).nullable().optional(),
    allergies: z.array(z.object({ allergy: cleanString(60) }).passthrough()).max(20).optional(),
    conditions: z.array(z.object({ condition: cleanString(60) }).passthrough()).max(20).optional(),
    disliked_foods: stringArraySchema(50, 80).default([]),
    cuisine_preference: stringArraySchema(25, 60).default([]),
    picky_eater: z.coerce.boolean().default(false),
    texture_needs: z.enum(['normal', 'soft', 'pureed', 'finger_foods']).nullable().optional(),
    school_lunch_needed: z.coerce.boolean().default(false),
  }).passthrough()).min(1).max(20),
  week_start: isoDateSchema,
  pantry_items: stringArraySchema(80, 80).optional(),
  feedback_history: z.array(z.unknown()).max(50).optional(),
}).strict()

export const base64ImagePayloadSchema = z.object({
  image: z.string().min(1).max(MAX_IMAGE_BASE64_CHARS).regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64 image data'),
  mimeType: z.string().refine((value) => ALLOWED_IMAGE_MIME.has(value), 'Unsupported image type'),
})

export const dataUrlImageSchema = z.object({
  image: z.string().min(1).max(MAX_DATA_URL_CHARS).refine((value) => {
    const match = value.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/=]+)$/)
    return Boolean(match)
  }, 'Invalid image data URL'),
})

export function parseDataUrlImage(value: string): { mimeType: string; base64: string } | null {
  const match = value.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

export function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid input'
}
