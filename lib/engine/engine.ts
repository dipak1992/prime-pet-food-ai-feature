// ============================================================
// Smart Meal Engine — Core Logic
// Deterministic, rule-based meal selection + transform pipeline
// ============================================================

import type {
  SmartMealRequest,
  SmartMealResult,
  SmartVariation,
  SmartIngredient,
  SmartShoppingItem,
  MealCandidate,
  EngineMeta,
  Stage,
} from './types'
import { MEAL_DATABASE } from './meals'
import type { LearnedBoosts } from '@/lib/learning/types'
import { applyLearnedBoosts } from '@/lib/learning/engine'

// ── Scoring Weights ─────────────────────────────────────────

const W = {
  PANTRY_PER_ITEM: 12,
  PANTRY_BONUS: 38,
  PANTRY_THRESHOLD: 0.4,
  PROTEIN_MISMATCH_PENALTY: -80,
  INSPIRATION: 50,
  ENERGY_MATCH: 35,
  ENERGY_MISMATCH: -20,
  CUISINE: 15,
  BUDGET_MATCH: 20,
  BUDGET_OVER: -15,
  TIME_OVER: -40,
  PROTEIN: 15,
  KID_FRIENDLY: 5,
  PICKY_DISLIKED: -25,
  HOUSEHOLD_FIT: 10,
  ALLERGEN: -10000,
  DIETARY: -10000,
  // Family intelligence weights
  SPICY_PENALTY: -18,        // penalise spicy meals when kids present
  COMPLEX_PENALTY: -10,      // penalise hard meals when toddlers/babies present
  SIMPLE_TEXTURE_BONUS: 8,   // bonus for easy-texture meals with young kids
  REPEAT_FRIENDLY: 6,        // bonus for meals previously liked with kids present
}

// ── Allergen → Ingredient Terms ─────────────────────────────

const ALLERGEN_MAP: Record<string, string[]> = {
  peanuts: ['peanut', 'peanut butter', 'peanut oil'],
  tree_nuts: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'pine nut', 'hazelnut', 'macadamia', 'nut'],
  milk: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'mozzarella', 'parmesan', 'cheddar', 'sour cream', 'whey', 'cream cheese'],
  eggs: ['egg', 'eggs', 'mayo', 'mayonnaise'],
  wheat: ['flour', 'bread', 'pasta', 'penne', 'spaghetti', 'noodle', 'tortilla', 'breadcrumb', 'panko', 'couscous', 'macaroni'],
  soy: ['soy sauce', 'tofu', 'edamame', 'soybean', 'tempeh', 'miso'],
  fish: ['salmon', 'tuna', 'cod', 'tilapia', 'fish sauce', 'anchovy', 'fish'],
  shellfish: ['shrimp', 'crab', 'lobster', 'mussel', 'clam', 'oyster'],
  sesame: ['sesame', 'sesame oil', 'sesame seeds', 'tahini'],
  honey: ['honey'],
}

// ── Dietary → Protein Exclusion ─────────────────────────────

const DIETARY_EXCLUDED_PROTEINS: Record<string, string[]> = {
  vegetarian: ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'turkey', 'sausage'],
  vegan: ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'turkey', 'sausage', 'eggs'],
  pescatarian: ['chicken', 'beef', 'pork', 'turkey', 'sausage'],
}

// ── Locality Ingredient Swaps ───────────────────────────────

const LOCALITY_SWAPS: Record<string, Record<string, string>> = {
  uk: {
    cilantro: 'fresh coriander', eggplant: 'aubergine', 'bell pepper': 'pepper',
    zucchini: 'courgette', arugula: 'rocket', scallion: 'spring onion',
    'heavy cream': 'double cream', 'all-purpose flour': 'plain flour',
  },
  india: {
    butter: 'ghee', mozzarella: 'paneer', 'sour cream': 'thick yogurt',
    tortillas: 'roti', 'heavy cream': 'fresh cream',
  },
  mexico: {
    'sour cream': 'crema mexicana', cheddar: 'queso fresco',
    'chili flakes': 'chile de árbol',
  },
  japan: {
    'soy sauce': 'shoyu', 'chicken broth': 'dashi', scallion: 'negi',
  },
}

const LOCALITY_NORMALIZE: Record<string, string> = {
  us: 'us', usa: 'us', 'united states': 'us', america: 'us',
  uk: 'uk', england: 'uk', britain: 'uk', 'united kingdom': 'uk',
  india: 'india', in: 'india',
  mexico: 'mexico', mx: 'mexico',
  japan: 'japan', jp: 'japan',
  mediterranean: 'mediterranean', med: 'mediterranean',
  italy: 'mediterranean', spain: 'mediterranean', greece: 'mediterranean',
}

// ── Stage Metadata ──────────────────────────────────────────

const STAGE_META: Record<Stage, { label: string; emoji: string }> = {
  adult: { label: 'Adult', emoji: '🧑' },
  kid: { label: 'Kid (5-12)', emoji: '🧒' },
  toddler: { label: 'Toddler (1-4)', emoji: '👶' },
  baby: { label: 'Baby (6-12mo)', emoji: '🍼' },
}

function clampScore(v: number): number {
  return Math.max(1, Math.min(10, Math.round(v)))
}

// ── Substitute Options for Shopping List ────────────────────

const SUBSTITUTE_MAP: Record<string, string[]> = {
  chicken: ['turkey', 'tofu', 'tempeh'],
  beef: ['ground turkey', 'lentils', 'mushrooms'],
  salmon: ['trout', 'cod', 'canned tuna'],
  fish: ['chicken', 'tofu', 'shrimp'],
  turkey: ['chicken', 'pork', 'tofu'],
  tofu: ['chicken', 'beans', 'tempeh'],
  'heavy cream': ['coconut cream', 'cashew cream', 'evaporated milk'],
  'sour cream': ['greek yogurt', 'coconut cream'],
  butter: ['olive oil', 'coconut oil', 'ghee'],
  parmesan: ['nutritional yeast', 'pecorino'],
  rice: ['quinoa', 'couscous', 'cauliflower rice'],
  pasta: ['rice noodles', 'zucchini noodles', 'gluten-free pasta'],
  tortillas: ['lettuce wraps', 'rice paper', 'naan'],
  'soy sauce': ['coconut aminos', 'tamari'],
  'coconut milk': ['heavy cream', 'cashew cream'],
}

// ════════════════════════════════════════════════════════════
// Main Entry Point
// ════════════════════════════════════════════════════════════

export function generateSmartMeal(
  request: SmartMealRequest,
  learnedBoosts?: LearnedBoosts | null,
): SmartMealResult {
  const pantry = normalizePantry(request.pantryItems)
  const allergies = request.allergies?.map(a => a.toLowerCase()) ?? []
  const dietary = request.dietaryRestrictions?.map(d => d.toLowerCase()) ?? []
  const cuisines = request.cuisinePreferences?.map(c => c.toLowerCase()) ?? []
  const proteins = request.preferredProteins?.map(p => p.toLowerCase()) ?? []
  const locality = normalizeLocality(request.locality)
  const targetServings =
    request.household.adultsCount +
    request.household.kidsCount +
    request.household.toddlersCount +
    Math.ceil(request.household.babiesCount * 0.5)

  // ── 1. Score all candidates ──────────────────────────────

  const candidates = request.excludeIds?.length
    ? MEAL_DATABASE.filter(m => !request.excludeIds!.includes(m.id))
    : MEAL_DATABASE

  // Fall back to full database if all meals are excluded
  const pool = candidates.length > 0 ? candidates : MEAL_DATABASE

  const scored = pool.map(meal => {
    let score = 0
    const reasons: string[] = []

    // Allergen elimination
    if (hasAllergen(meal, allergies)) {
      return { meal, score: W.ALLERGEN, reasons: ['Contains allergen'] }
    }

    // Dietary elimination
    if (!meetsDietary(meal, dietary)) {
      return { meal, score: W.DIETARY, reasons: ['Dietary restriction conflict'] }
    }

    // Pantry matching
    const pm = countPantryMatches(meal, pantry)
    score += pm.count * W.PANTRY_PER_ITEM
    if (pm.ratio >= W.PANTRY_THRESHOLD) {
      score += W.PANTRY_BONUS
      reasons.push(`Uses ${pm.count} pantry items (${Math.round(pm.ratio * 100)}%)`)
    }

    // Inspiration matching
    if (request.inspirationMeal && matchesInspiration(meal, request.inspirationMeal)) {
      score += W.INSPIRATION
      reasons.push('Matches meal inspiration')
    }

    // Energy level
    if (request.lowEnergy) {
      if (meal.energyDemand === 'low') {
        score += W.ENERGY_MATCH
        reasons.push('Low-effort — minimal prep, maximum ease')
      } else if (meal.energyDemand === 'medium') {
        score += Math.round(W.ENERGY_MISMATCH * 0.5)
      } else if (meal.energyDemand === 'high') {
        score += W.ENERGY_MISMATCH
      }
      // Bonus for simplified steps availability
      if (meal.simplifiedSteps) {
        score += 10
        reasons.push('Simplified steps available')
      }
    }

    // Cuisine preferences
    for (const pref of cuisines) {
      if (meal.cuisineTags.some(t => t.includes(pref) || pref.includes(t))) {
        score += W.CUISINE
        reasons.push(`Matches ${pref} cuisine`)
        break
      }
    }

    // Budget
    if (request.budget) {
      const levels = { low: 1, medium: 2, high: 3 }
      if (levels[meal.costLevel] <= levels[request.budget]) {
        score += W.BUDGET_MATCH
      } else {
        score += W.BUDGET_OVER
      }
    }

    // Cook time constraint
    if (request.maxCookTime && meal.prepTime + meal.cookTime > request.maxCookTime) {
      score += W.TIME_OVER
    }

    // Protein preference
    for (const pref of proteins) {
      if (meal.proteinType.includes(pref) || pref.includes(meal.proteinType)) {
        score += W.PROTEIN
        reasons.push(`Uses preferred protein: ${meal.proteinType}`)
        break
      }
    }

    // Hard penalty: if pantry has proteins and this meal uses a protein NOT in the pantry
    if (pantry.length > 0 && meal.proteinType) {
      const KNOWN_PROTEINS = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'tofu', 'tempeh', 'eggs', 'sausage', 'lamb', 'tuna', 'cod', 'trout']
      const pantryProteins = pantry.filter(p => KNOWN_PROTEINS.some(kp => p.includes(kp) || kp.includes(p)))
      if (pantryProteins.length > 0) {
        const mealProtein = meal.proteinType.toLowerCase()
        const pantryHasMealProtein = pantryProteins.some(pp => mealProtein.includes(pp) || pp.includes(mealProtein))
        if (!pantryHasMealProtein) {
          score += W.PROTEIN_MISMATCH_PENALTY
          reasons.push(`Protein "${meal.proteinType}" not in pantry — penalized`)
        }
      }
    }

    // Kid-friendliness (when kids/toddlers present)
    const hasYoungKids = request.household.kidsCount + request.household.toddlersCount > 0
    const hasVeryYoung = request.household.toddlersCount + request.household.babiesCount > 0
    if (hasYoungKids) {
      score += meal.kidFriendlyScore * W.KID_FRIENDLY
      if (meal.kidFriendlyScore >= 8) reasons.push('Kid-friendly favourite')

      // Penalise spicy / heat-heavy meals
      const isSpicy = meal.tags.some(t =>
        t === 'spicy' || t === 'hot' || t === 'thai-spicy' || t === 'cajun'
      ) || meal.ingredients.some(i => {
        const n = i.name.toLowerCase()
        return n.includes('chili') || n.includes('jalapeño') || n.includes('sriracha') ||
               n.includes('cayenne') || n.includes('hot sauce') || n.includes('habanero')
      })
      if (isSpicy) {
        score += W.SPICY_PENALTY
        reasons.push('Reduced — spicy ingredients with kids')
      }

      // Penalise complex meals when very young kids present
      if (hasVeryYoung && meal.difficulty === 'hard') {
        score += W.COMPLEX_PENALTY
      }

      // Bonus for simple-texture, easy meals with young kids
      if (hasVeryYoung && meal.difficulty === 'easy' && meal.kidFriendlyScore >= 7) {
        score += W.SIMPLE_TEXTURE_BONUS
        reasons.push('Easy texture for little ones')
      }
    }

    // Picky eater penalty
    if (request.pickyEater?.active && request.pickyEater.dislikedFoods) {
      for (const disliked of request.pickyEater.dislikedFoods) {
        const dl = disliked.toLowerCase()
        if (meal.ingredients.some(i => i.name.toLowerCase().includes(dl))) {
          score += W.PICKY_DISLIKED
        }
      }
    }

    // Adaptive learning boosts
    if (learnedBoosts) {
      const lb = applyLearnedBoosts(
        learnedBoosts,
        meal.id,
        meal.cuisineTags[0] ?? '',
        meal.proteinType,
        meal.tags,
        meal.difficulty,
        meal.prepTime + meal.cookTime,
        null,
        null,
      )
      score += lb.score
      reasons.push(...lb.reasons)

      // Amplify kid-friendly scoring for picky patterns
      if (learnedBoosts.pickyMultiplier > 1 &&
          (request.household.kidsCount + request.household.toddlersCount > 0)) {
        score += Math.round(meal.kidFriendlyScore * (learnedBoosts.pickyMultiplier - 1) * W.KID_FRIENDLY)
      }
    }

    // Household size fit
    const servingDiff = Math.abs(meal.servings - targetServings)
    if (servingDiff <= 1) score += W.HOUSEHOLD_FIT

    if (reasons.length === 0) reasons.push('Good general fit')

    return { meal, score, reasons }
  })

  // ── 2. Sort by score with weighted random selection ──────

  // Filter out eliminated meals (allergens/dietary)
  const viable = scored.filter(s => s.score > -1000)
  const poolExhausted = viable.length < 2
  const pool2 = viable.length > 0 ? viable : scored

  // Weighted random: pick from top candidates proportionally
  // This ensures variety while still favoring higher-scored meals
  pool2.sort((a, b) => b.score - a.score)
  const topScore = pool2[0].score
  const minScore = pool2[pool2.length - 1].score
  const range = Math.max(topScore - minScore, 1)

  // Normalize scores to weights (0.1 to 1.0) and apply randomization
  const weighted = pool2.map(s => ({
    ...s,
    weight: 0.1 + 0.9 * ((s.score - minScore) / range),
  }))

  // Weighted random pick
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  let rand = Math.random() * totalWeight
  let best = weighted[0]
  for (const w of weighted) {
    rand -= w.weight
    if (rand <= 0) { best = w; break }
  }

  return assembleMeal(best.meal, request, pantry, locality, best.score, best.reasons, poolExhausted)
}

// ── Cuisine → Image URL map (curated Unsplash direct links) ──

const CUISINE_IMAGES: Record<string, string[]> = {
  italian:    ['https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=400&fit=crop', 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=400&fit=crop'],
  mexican:    ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=400&fit=crop&q=80'],
  asian:      ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=400&fit=crop&q=80'],
  chinese:    ['https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=400&fit=crop&q=80'],
  japanese:   ['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=400&fit=crop&q=80'],
  indian:     ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=400&fit=crop&q=80'],
  thai:       ['https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=400&fit=crop&q=80'],
  mediterranean: ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&q=80'],
  american:   ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=800&h=400&fit=crop&q=80'],
  korean:     ['https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=400&fit=crop&q=80'],
  nepali:     ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=400&fit=crop&q=80'],
  comfort:    ['https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=400&fit=crop&q=80'],
  french:     ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=400&fit=crop&q=80'],
  greek:      ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=400&fit=crop&q=80', 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=800&h=400&fit=crop&q=80'],
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800&h=400&fit=crop&q=80',
]

function pickCuisineImage(cuisineType: string, mealId: string): string {
  const key = cuisineType.toLowerCase()
  // Try exact match, then partial match
  const images = CUISINE_IMAGES[key]
    ?? Object.entries(CUISINE_IMAGES).find(([k]) => key.includes(k) || k.includes(key))?.[1]
    ?? FALLBACK_IMAGES
  // Use mealId hash for deterministic but varied selection
  const hash = mealId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return images[hash % images.length]
}

// ════════════════════════════════════════════════════════════
// Assembly Pipeline
// ════════════════════════════════════════════════════════════

function assembleMeal(
  meal: MealCandidate,
  request: SmartMealRequest,
  pantry: string[],
  locality: string,
  score: number,
  reasons: string[],
  poolExhausted = false,
): SmartMealResult {
  const localitySwaps = LOCALITY_SWAPS[locality] ?? {}
  const localityApplied = locality !== 'global' && locality !== 'us' && Object.keys(localitySwaps).length > 0

  // ── Build ingredients with pantry flags & locality swaps ──

  const ingredients: SmartIngredient[] = meal.ingredients.map(i => {
    let name = i.name
    if (localityApplied) {
      for (const [from, to] of Object.entries(localitySwaps)) {
        if (name.toLowerCase().includes(from.toLowerCase())) {
          name = to
          break
        }
      }
    }
    return {
      name,
      quantity: i.quantity,
      unit: i.unit,
      ...(i.note ? { note: i.note } : {}),
      fromPantry: isPantryMatch(i.name, pantry),
      category: i.category,
    }
  })

  // ── Steps (simplify for low energy) ───────────────────────

  let steps = meal.steps
  let effectiveTagline = meal.tagline
  if (request.lowEnergy && meal.simplifiedSteps) {
    steps = meal.simplifiedSteps
    effectiveTagline = `${meal.tagline} — simplified for you`
  }

  // ── Apply simplified swaps to ingredients for low energy ──

  let effectiveIngredients = meal.ingredients
  if (request.lowEnergy && meal.simplifiedSwaps?.length) {
    effectiveIngredients = meal.ingredients.filter(i => {
      return !meal.simplifiedSwaps!.some(swap =>
        swap.from.toLowerCase().includes(i.name.toLowerCase())
      )
    })
  }

  // ── Variations ────────────────────────────────────────────

  const variations = buildVariations(meal, request)

  // ── Shopping list ─────────────────────────────────────────

  const shoppingList = buildShoppingList(ingredients)

  // ── Metadata ──────────────────────────────────────────────

  const pantryMatches = ingredients.filter(i => i.fromPantry)
  const pantryUtil = ingredients.length > 0 ? pantryMatches.length / ingredients.length : 0

  const totalHousehold =
    request.household.adultsCount +
    request.household.kidsCount +
    request.household.toddlersCount +
    request.household.babiesCount
  const hasKids = request.household.kidsCount + request.household.toddlersCount + request.household.babiesCount > 0

  const acceptanceScore = clampScore(
    (hasKids ? meal.kidFriendlyScore : 7)
    - (request.pickyEater?.active ? 1 : 0)
    + (meal.difficulty === 'easy' ? 1 : 0)
  )

  const familyHarmonyScore = clampScore(
    acceptanceScore
    + (meal.variations ? Math.min(Object.keys(meal.variations).length - 1, 2) : 0)
    + (totalHousehold >= 4 ? 1 : 0)
  )

  const easeScore = clampScore(
    (meal.difficulty === 'easy' ? 9 : meal.difficulty === 'moderate' ? 6 : 3)
    + (request.lowEnergy && meal.simplifiedSteps ? 1 : 0)
  )

  const budgetScore = clampScore(
    request.budget
      ? (
          (request.budget === 'low' && meal.costLevel === 'low') ||
          (request.budget === 'medium' && (meal.costLevel === 'low' || meal.costLevel === 'medium')) ||
          request.budget === 'high'
        )
        ? 9
        : 4
      : 7
  )

  const prepTimeScore = clampScore(
    request.maxCookTime
      ? meal.prepTime + meal.cookTime <= request.maxCookTime
        ? 9
        : 3
      : 7
  )

  const meta: EngineMeta = {
    score,
    matchedPantryItems: pantryMatches.map(i => i.name),
    pantryUtilization: Math.round(pantryUtil * 100) / 100,
    simplifiedForEnergy: !!(request.lowEnergy && meal.simplifiedSteps),
    pickyEaterAdjusted: !!(request.pickyEater?.active),
    localityApplied,
    acceptanceScore,
    familyHarmonyScore,
    easeScore,
    budgetScore,
    prepTimeScore,
    selectionReason: reasons.join('. '),
    ...(poolExhausted ? { poolExhausted: true } : {}),
  }

  return {
    id: meal.id,
    title: meal.title,
    tagline: effectiveTagline,
    description: meal.description,
    cuisineType: meal.cuisineTags[0],
    imageUrl: meal.imageUrl ?? pickCuisineImage(meal.cuisineTags[0], meal.id),
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    totalTime: meal.prepTime + meal.cookTime,
    estimatedCost: meal.estimatedCost,
    servings: meal.servings,
    difficulty: request.lowEnergy && meal.simplifiedSteps ? 'easy' : meal.difficulty,
    tags: meal.tags,
    ingredients,
    steps,
    variations,
    leftoverTip: meal.leftoverTip,
    shoppingList,
    meta,
  }
}

// ════════════════════════════════════════════════════════════
// Variation Builder
// ════════════════════════════════════════════════════════════

function buildVariations(meal: MealCandidate, request: SmartMealRequest): SmartVariation[] {
  const stages = getRequiredStages(request.household)

  return stages.map(stage => {
    const data = meal.variations?.[stage]
    const meta = STAGE_META[stage]

    if (!data) {
      // Meal doesn't have a variation for this stage — fall back to adult variation or bare defaults
      const fallback = meal.variations?.['adult']
      return {
        stage,
        label: meta.label,
        emoji: meta.emoji,
        title: fallback?.title ?? meal.title,
        description: fallback?.description ?? meal.description,
        modifications: [],
        safetyNotes: [],
        textureNotes: null,
        servingTip: '',
        allergyWarnings: [],
      }
    }

    const modifications = [...data.modifications]
    const safetyNotes = [...data.safetyNotes]

    // Picky eater texture-first adjustments for kid/toddler
    if (request.pickyEater?.active && (stage === 'kid' || stage === 'toddler')) {
      const tex = request.pickyEater.texturePreference
      if (tex === 'soft') {
        modifications.unshift('Cook all vegetables until very soft')
        modifications.push('Avoid crunchy or raw textures')
      } else if (tex === 'pureed') {
        modifications.unshift('Blend or mash all components smooth')
      } else if (tex === 'finger_foods') {
        modifications.unshift('Cut everything into graspable finger-sized pieces')
      }

      const disliked = request.pickyEater.dislikedFoods ?? []
      if (disliked.length > 0) {
        modifications.push(`Omit or substitute: ${disliked.join(', ')}`)
      }

      const safe = request.pickyEater.safeFoods ?? []
      if (safe.length > 0) {
        modifications.push(`Serve alongside familiar foods: ${safe.join(', ')}`)
      }
    }

    // Populate allergen warnings from request allergens
    const allergyWarnings: string[] = []
    if (request.allergies?.length) {
      for (const allergen of request.allergies) {
        const terms = ALLERGEN_MAP[allergen] ?? [allergen]
        const found = meal.ingredients.some(i =>
          terms.some(t => i.name.toLowerCase().includes(t))
        )
        if (found) {
          allergyWarnings.push(`Contains ${allergen} — meal was filtered but verify labels`)
        }
      }
    }

    return {
      stage,
      label: meta.label,
      emoji: meta.emoji,
      title: data.title,
      description: data.description,
      modifications,
      safetyNotes,
      textureNotes: data.textureNotes,
      servingTip: data.servingTip,
      allergyWarnings,
    }
  })
}

function getRequiredStages(household: SmartMealRequest['household']): Stage[] {
  const stages: Stage[] = []
  if (household.adultsCount > 0) stages.push('adult')
  if (household.kidsCount > 0) stages.push('kid')
  if (household.toddlersCount > 0) stages.push('toddler')
  if (household.babiesCount > 0) stages.push('baby')
  if (stages.length === 0) stages.push('adult')
  return stages
}

// ════════════════════════════════════════════════════════════
// Shopping List Builder
// ════════════════════════════════════════════════════════════

function buildShoppingList(ingredients: SmartIngredient[]): SmartShoppingItem[] {
  return ingredients
    .filter(i => !i.fromPantry && !['spice', 'condiment'].includes(i.category))
    .map(i => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      category: i.category,
      estimatedCost: estimateItemCost(i.category),
      substituteOptions: getSubstitutes(i.name),
    }))
}

function estimateItemCost(category: string): number {
  const costs: Record<string, number> = {
    produce: 1.5,
    protein: 4,
    dairy: 2.5,
    grain: 2,
    pantry_staple: 1.5,
    spice: 0.5,
    condiment: 1,
    other: 2,
  }
  return costs[category] ?? 2
}

function getSubstitutes(name: string): string[] {
  const n = name.toLowerCase()
  for (const [key, subs] of Object.entries(SUBSTITUTE_MAP)) {
    if (n.includes(key)) return subs
  }
  return []
}

// ════════════════════════════════════════════════════════════
// Scoring Helpers
// ════════════════════════════════════════════════════════════

function normalizePantry(items?: string[]): string[] {
  return (items ?? []).map(i => i.toLowerCase().trim()).filter(Boolean)
}

function normalizeLocality(locality?: string): string {
  if (!locality) return 'global'
  return LOCALITY_NORMALIZE[locality.toLowerCase().trim()] ?? 'global'
}

function isPantryMatch(ingredientName: string, pantry: string[]): boolean {
  const n = ingredientName.toLowerCase()
  return pantry.some(p => n.includes(p) || p.includes(n))
}

function countPantryMatches(meal: MealCandidate, pantry: string[]): { count: number; ratio: number } {
  if (pantry.length === 0) return { count: 0, ratio: 0 }
  const matches = meal.keyIngredients.filter(ki =>
    pantry.some(p => ki.includes(p) || p.includes(ki)),
  )
  return {
    count: matches.length,
    ratio: meal.keyIngredients.length > 0 ? matches.length / meal.keyIngredients.length : 0,
  }
}

function hasAllergen(meal: MealCandidate, allergies: string[]): boolean {
  if (allergies.length === 0) return false
  for (const allergy of allergies) {
    const triggers = ALLERGEN_MAP[allergy] ?? [allergy]
    for (const ingredient of meal.ingredients) {
      const n = ingredient.name.toLowerCase()
      if (triggers.some(t => n.includes(t))) return true
    }
  }
  return false
}

function meetsDietary(meal: MealCandidate, dietary: string[]): boolean {
  for (const restriction of dietary) {
    // If diet is explicitly listed as compatible, it's fine
    if (meal.dietaryCompat.includes(restriction)) continue
    // Otherwise check protein exclusions
    const excluded = DIETARY_EXCLUDED_PROTEINS[restriction]
    if (excluded && excluded.includes(meal.proteinType)) return false
  }
  return true
}

function matchesInspiration(meal: MealCandidate, inspiration: string): boolean {
  const norm = inspiration.toLowerCase()
  // Direct match against related terms
  if (meal.relatedTerms.some(t => norm.includes(t) || t.includes(norm))) return true
  // Word-level matching for significant words (>3 chars)
  const words = norm.split(/\s+/).filter(w => w.length > 3)
  return words.some(word => meal.relatedTerms.some(t => t.includes(word)))
}
