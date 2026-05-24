import { aiGeneratedPlanSchema } from './schemas'
import type {
  AIGenerationRequest,
  AIGeneratedPlan,
  AIGeneratedMeal,
  AIGeneratedMealVariation,
  Household,
  HouseholdMember,
} from '@/types';
import { DEMO_WEEKLY_PLAN } from '@/lib/demo-data';
import { format, addDays } from 'date-fns';
import logger from '@/lib/logger';
import { formatRulesForPrompt, findRelevantCulinaryRules } from '@/lib/safety/culinary-rules';
import { generateText, stripJsonFences } from './service';

// ── Prompt Builder ──────────────────────────────────────────

function buildHouseholdContext(household: Household, members: HouseholdMember[]): string {
  const memberDescriptions = members.map((m) => {
    const allergyList = m.allergies?.map((a) => a.allergy).join(', ') || 'none';
    const conditionList = m.conditions?.map((c) => c.condition).join(', ') || 'none';
    const disliked = m.disliked_foods?.join(', ') || 'none';
    return `
  - ${m.name} (${m.stage}, age: ${m.age || 'unknown'})
    Allergies: ${allergyList}
    Medical conditions: ${conditionList}
    Picky eater: ${m.picky_eater ? 'yes' : 'no'}
    Texture needs: ${m.texture_needs || 'normal'}
    School lunch needed: ${m.school_lunch_needed ? 'yes' : 'no'}
    Disliked foods: ${disliked}
    Cuisine preferences: ${m.cuisine_preference?.join(', ') || 'any'}`;
  }).join('\n');

  return `
HOUSEHOLD: ${household.name}
Budget: ${household.budget_level}
Cooking time preference: ${household.cooking_time_preference}
Low-energy mode: ${household.low_energy_mode ? 'YES — CRITICALLY IMPORTANT: maximum 5 steps, 20 min total, use frozen/canned/pre-cut ingredients, dump-and-stir or sheet-pan only' : 'no'}
One-pot preference: ${household.one_pot_preference ? 'yes' : 'no'}
Leftovers preference: ${household.leftovers_preference ? 'yes' : 'no'}
Cuisine preferences: ${household.cuisine_preferences?.join(', ') || 'any'}
Preferred proteins: ${household.preferred_proteins?.join(', ') || 'any'}
Meals per day: ${household.meals_per_day}

FAMILY MEMBERS:${memberDescriptions}`;
}

function buildSystemPrompt(): string {
  return `You are MealEase AI, an expert family nutritionist and practical meal planner for real, busy households.

Your core purpose: Generate ONE weekly family meal plan where each meal has a BASE version plus safe, realistic, age-appropriate modifications for EVERY family member.

MEAL REALISM RULES:
- Every meal must be something a tired parent could actually make on a Tuesday night
- Use common, affordable supermarket ingredients — no specialty stores needed
- Cooking steps should be practical, not restaurant-style (e.g., "Cook pasta while you chop vegetables" not "blanch al dente in salted water")
- Keep prep+cook under 45 minutes for weekday meals, max 60 minutes on weekends
- Portions should be realistic: adults ~1.5 cups protein dishes, kids ~0.75 cups, toddlers ~0.5 cups
- Include at least one 15-minute meal and one sheet-pan/slow-cooker/dump meal per week

INGREDIENT OVERLAP (CRITICAL):
- Reuse key proteins across 2-3 meals (e.g., rotisserie chicken Mon → chicken tacos Wed → chicken soup Fri)
- Share produce across meals (e.g., bell peppers in stir-fry and fajitas)
- Plan intentional leftovers: cook 2x rice on Monday, use half for fried rice Thursday
- Target max 25-30 unique grocery items for the entire week
- When listing ingredients, use exact useful quantities (not "some" or "a handful")

SAFETY RULES (NON-NEGOTIABLE):
1. Respect ALL allergies absolutely — never include allergens in any form, including hidden sources
2. Baby-safe: NO honey (botulism risk under 1 year), no whole nuts, no whole grapes, no raw carrot sticks, no added salt/sugar. All food must be soft enough to mash between fingers
3. Toddler-safe: soft bite-sized pieces, deconstructed when needed, avoid round/hard choking hazards
4. Picky eaters: modify presentation, texture, and plating FIRST. Serve new foods alongside 1-2 safe/familiar foods. Never force new textures
5. Medical conditions must meaningfully influence meal choices (low-sodium for hypertension, low-glycemic for diabetes, anti-inflammatory where relevant)
6. Low-sodium for hypertension members — no added salt, avoid soy sauce/processed meats, use herbs/citrus for flavor
7. School lunch versions must be portable, mess-friendly, stay safe at room temp 4+ hours, nut-free if school requires

VARIATION QUALITY:
- Kid variations should be genuinely appealing, not just "smaller portion" — rename dishes playfully, offer dips, use familiar shapes
- Toddler modifications must specify exact texture changes and cutting instructions
- Baby modifications must specify exact preparation method (purée, mash, soft strips) appropriate for their age range
- Each variation should feel like its own mini-meal, not an afterthought

LOW-ENERGY MODE (when enabled):
- Maximum 5 steps per meal, preferably 3
- Maximum 20 minutes total cook time
- Use pre-cut, pre-washed, canned, or frozen ingredients where possible
- "Dump and stir" or "sheet pan" style preferred
- No techniques requiring attention (no sautéing, no careful timing)

OUTPUT: Return valid JSON only matching the AIGeneratedPlan schema — no markdown, no commentary, no extra text.`;
}

function buildUserPrompt(request: AIGenerationRequest): string {
  const household = buildHouseholdContext(request.household, request.members);
  const weekStart = format(new Date(request.week_start), 'MMMM d, yyyy');
  const groundedRules = formatRulesForPrompt(findRelevantCulinaryRules({
    ingredients: request.pantry_items ?? [],
    tags: [
      ...(request.household.preferred_proteins ?? []),
      ...(request.household.cuisine_preferences ?? []),
      ...request.members.flatMap((member) => [
        member.stage,
        ...(member.allergies?.map((allergy) => allergy.allergy) ?? []),
        ...(member.disliked_foods ?? []),
      ]),
    ],
  }))
  const pantryNote = request.pantry_items?.length
    ? `\nUse these pantry items first: ${request.pantry_items.join(', ')}`
    : '';
  const regenerateNote = request.regenerate_params
    ? `\nREGENERATE with modifier: "${request.regenerate_params.modifier}". Keep the overall structure but apply this modifier to the affected meals.${
        request.regenerate_params.current_meal_context
          ? `\n\nCURRENT MEAL CONTEXT (JSON):\n${JSON.stringify(request.regenerate_params.current_meal_context, null, 2)}`
          : ''
      }`
    : '';

  return `Generate a complete 7-day family meal plan for the week starting ${weekStart}.

${household}
${pantryNote}
${regenerateNote}

GROUNDED SAFETY REFERENCES:
${groundedRules}

PLANNING STRATEGY:
1. Pick 3-4 core proteins for the week and rotate them across meals
2. Plan "cook once, use twice" — e.g., roast chicken Sunday → chicken quesadillas Tuesday
3. Build a shared vegetable base (onions, garlic, bell peppers, tomatoes appear in multiple meals)
4. Include 2 ultra-easy meals (15 min or less) for the busiest days
5. Weekend meals can be slightly more involved (up to 45 min)

For each meal, provide:
- base_meal: A single recipe the whole family can share (with exact prep/cook times)
- member_variations: Specific, creative modifications for EACH family member (not just "smaller portion")
- Practical step-by-step instructions written for a tired parent, not a chef
- Complete ingredient list with exact quantities optimized for grocery shopping
- Estimated total cost per meal

Make kid variations genuinely appealing — rename dishes fun names, suggest dips and sauces, use shapes they like.
Make baby/toddler variations specify exact texture and cutting instructions.

Return a complete AIGeneratedPlan JSON object.`;
}

// ── AI Service ──────────────────────────────────────────────

export async function generateMealPlan(request: AIGenerationRequest): Promise<AIGeneratedPlan> {
  // Check if we have any AI provider key available
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock';

  if (hasOpenAI || hasAnthropic) {
    return generateWithAI(request);
  }

  // Fallback to mock/demo data
  console.info('[MealEase] Using mock meal plan — set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable live generation');
  return generateMockPlan(request);
}

async function generateWithAI(request: AIGenerationRequest): Promise<AIGeneratedPlan> {
  const result = await generateText({
    system: buildSystemPrompt(),
    user: buildUserPrompt(request),
    task: 'weekly-plan',
    maxTokens: 8192,
    temperature: 0.7,
    jsonMode: true,
  });

  logger.info('[meal-generator] Plan generated', {
    feature: 'generate-plan',
    provider: result.provider,
    model: result.model,
    prompt_tokens: result.usage?.prompt_tokens,
    completion_tokens: result.usage?.completion_tokens,
  });

  try {
    const jsonText = stripJsonFences(result.text);
    const parsed = JSON.parse(jsonText);
    return aiGeneratedPlanSchema.parse(parsed) as AIGeneratedPlan;
  } catch (err) {
    console.error('[MealEase] Failed to parse AI response:', err);
    throw new Error('Failed to parse meal plan response from AI');
  }
}

// ── Mock/Demo Generator ─────────────────────────────────────

function generateMockPlan(request: AIGenerationRequest): AIGeneratedPlan {
  // Return the demo plan with updated dates
  const plan = structuredClone(DEMO_WEEKLY_PLAN);
  plan.week_start = request.week_start;
  plan.week_end = format(addDays(new Date(request.week_start), 6), 'yyyy-MM-dd');

  // Update day dates
  plan.days.forEach((day, i) => {
    day.date = format(addDays(new Date(request.week_start), i), 'yyyy-MM-dd');
    day.day_of_week = i;
  });

  return plan;
}

// ── Regenerate with modifier ────────────────────────────────

export async function regenerateMeals(
  request: AIGenerationRequest,
  modifier: string,
  currentMealContext?: Record<string, unknown>,
): Promise<AIGeneratedPlan> {
  return generateMealPlan({
    ...request,
    regenerate_params: { modifier, current_meal_context: currentMealContext },
  });
}
