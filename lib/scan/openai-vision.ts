import OpenAI from 'openai'
import type { ClassifyResponse, FoodResult, FridgeResult, MenuResult, ScanMode } from '@/lib/scan/types'
import {
  classifyVisionSchema,
  foodVisionSchema,
  fridgeVisionSchema,
  menuVisionSchema,
  parseVisionJson,
} from '@/lib/scan/vision-schemas'

let openai: OpenAI | null = null

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const mime = file.type || 'image/jpeg'
  return `data:${mime};base64,${buffer.toString('base64')}`
}

async function analyzeImageJson(input: {
  image: File
  prompt: string
  detail?: 'low' | 'high' | 'auto'
  maxOutputTokens?: number
}): Promise<string> {
  const imageUrl = await fileToDataUrl(input.image)
  const response = await getOpenAI().responses.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
    max_output_tokens: input.maxOutputTokens ?? 1200,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: input.prompt },
          {
            type: 'input_image',
            image_url: imageUrl,
            detail: input.detail ?? 'low',
          },
        ],
      },
    ],
  })

  return response.output_text
}

export async function classifyScanImage(image: File, mode: ScanMode): Promise<ClassifyResponse> {
  if (mode !== 'auto') return { type: mode, confidence: 0.98 }

  const raw = await analyzeImageJson({
    image,
    detail: 'low',
    maxOutputTokens: 200,
    prompt: `Classify this image for MealEase scanning.

Return JSON only:
{
  "type": "fridge" | "menu" | "food",
  "confidence": number
}

Definitions:
- "fridge": fridge, pantry, grocery items, loose ingredients, kitchen inventory
- "menu": restaurant menu, food truck menu, cafe board, list of orderable dishes
- "food": a prepared meal, single plate, packaged food nutrition estimate target

Be conservative. If it shows ingredients or a fridge/pantry, choose "fridge".`,
  })

  return parseVisionJson(raw, classifyVisionSchema)
}

export async function analyzeFridgeImage(image: File): Promise<FridgeResult> {
  const raw = await analyzeImageJson({
    image,
    detail: 'low',
    maxOutputTokens: 1800,
    prompt: `You are MealEase Snap & Cook. Analyze this fridge, pantry, counter, or grocery photo.

STRICT RULES:
- Return JSON only. No markdown.
- Identify only food ingredients that are VISIBLE or strongly label-supported.
- Do NOT invent meat, dairy, or allergens if they are not visible.
- Quantities can be approximate, like "1", "half bag", "small bunch", or "".
- Suggest exactly 3 realistic, low-friction recipes.
- Use stable ids with lowercase words and hyphens.

CRITICAL RECIPE RULES:
- Recipe 1: MUST use ONLY ingredients detected in the image. Zero missing ingredients.
- Recipe 2: May require at most 1 basic pantry staple (salt, pepper, oil, butter, garlic) as missing.
- Recipe 3: May require at most 2 basic pantry staples as missing.
- NEVER suggest a recipe with a protein or main ingredient that is NOT visible in the image.
- If you see chicken, do NOT suggest fish. If you see eggs, do NOT suggest beef.
- "matchedIngredients" must ONLY contain items from your detected ingredients list.
- "missingIngredients" must ONLY contain basic pantry staples (salt, pepper, oil, butter, garlic, onion, soy sauce, flour).
- Do NOT suggest recipes with proteins or main ingredients not visible in the image.

Return this exact shape:
{
  "ingredients": [
    { "id": "ing-1", "name": "Eggs", "quantity": "6", "unit": "", "emoji": "🥚" }
  ],
  "recipes": [
    {
      "id": "spinach-egg-scramble",
      "title": "Spinach Egg Scramble",
      "cookTime": 12,
      "servings": 2,
      "estimatedCost": 4.5,
      "matchedIngredients": ["Eggs", "Spinach"],
      "missingIngredients": []
    }
  ],
  "savedToPantry": false
}`,
  })

  return parseVisionJson(raw, fridgeVisionSchema)
}

export async function analyzeMenuImage(image: File): Promise<MenuResult> {
  const raw = await analyzeImageJson({
    image,
    detail: 'high',
    maxOutputTokens: 1600,
    prompt: `You are MealEase Smart Menu Scan. Read this menu image and rank healthier choices.

Rules:
- Return JSON only. No markdown.
- If restaurant name is visible, include it.
- Pick 1-5 menu items that are reasonable healthier choices.
- Health score is 0-100 based on protein, vegetables, whole foods, fried/creamy/sugary load, and portion reasonableness.
- Calories are estimates only when inferable.
- Price is optional and only if visible.

Return this exact shape:
{
  "restaurantName": "Restaurant name if visible",
  "picks": [
    {
      "id": "grilled-chicken-bowl",
      "name": "Grilled Chicken Bowl",
      "description": "Short explanation from visible menu text",
      "price": 14.99,
      "healthScore": 82,
      "calories": 520,
      "tags": ["High protein", "Vegetable forward"],
      "rank": 1
    }
  ]
}`,
  })

  const parsed = parseVisionJson(raw, menuVisionSchema)
  return {
    ...parsed,
    picks: parsed.picks
      .sort((a, b) => a.rank - b.rank)
      .map((pick, index) => ({ ...pick, rank: index + 1 })),
  }
}

export async function analyzeFoodImage(image: File): Promise<FoodResult> {
  const raw = await analyzeImageJson({
    image,
    detail: 'low',
    maxOutputTokens: 1200,
    prompt: `You are MealEase Food Check. Estimate what prepared food is shown.

Rules:
- Return JSON only. No markdown.
- Nutrition values are estimates from the image, not medical facts.
- If uncertain, use a broad generic name and include uncertainty in warnings.
- Add at least one warning saying image-based nutrition is approximate.

Return this exact shape:
{
  "name": "Chicken Caesar Salad",
  "calories": 480,
  "protein": 38,
  "carbs": 22,
  "fat": 28,
  "fiber": 4,
  "sugar": 3,
  "sodium": 820,
  "servingSize": "1 large bowl",
  "warnings": ["Image-based nutrition is an estimate."],
  "positives": ["Good protein source."]
}`,
  })

  const parsed = parseVisionJson(raw, foodVisionSchema)
  const warnings = parsed.warnings.some((warning) => warning.toLowerCase().includes('estimate'))
    ? parsed.warnings
    : ['Image-based nutrition is an estimate.', ...parsed.warnings]

  return { ...parsed, warnings }
}
