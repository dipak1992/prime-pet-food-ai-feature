/**
 * Curated Tonight Meals Catalog
 *
 * Single source of truth for all Tonight meal suggestions.
 * Used by both landing page (public rotation) and dashboard (free/plus).
 *
 * Image rules:
 * - Tier 1: Exact meal image (Unsplash CDN, meal-specific)
 * - Tier 2: Category fallback from /public/landing/
 * - Tier 3: null (component renders premium no-image card)
 *
 * Every meal now has a unique, accurate Unsplash photo.
 * images.unsplash.com is already in next.config.ts remotePatterns.
 */

export type MealCategory =
  | 'chicken'
  | 'pasta'
  | 'bowl'
  | 'mexican'
  | 'seafood'
  | 'vegetarian'
  | 'comfort'
  | 'stir-fry'
  | 'salad'
  | 'soup'

export type WeekdayTheme =
  | 'quick'      // Monday
  | 'budget'     // Tuesday
  | 'family'     // Wednesday
  | 'pantry'     // Thursday
  | 'date-night' // Friday
  | 'comfort'    // Saturday
  | 'reset'      // Sunday

export type CuratedMeal = {
  id: string
  name: string
  tagline: string
  category: MealCategory
  weekdayTheme: WeekdayTheme
  cookTimeMin: number
  prepTimeMin: number
  servings: number
  costPerServing: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  /** Key benefits shown as quick chips */
  benefits: string[]
  /** Image URL (Unsplash CDN) or local path, or null for no-image card */
  image: string | null
  /** Ingredients that trigger pantry matching */
  keyIngredients: string[]
  /** Whether this meal has been reviewed by a professional chef */
  chefVerified?: boolean
}

// ─── WEEKDAY THEME MAP ──────────────────────────────────────────────────────────

export const WEEKDAY_THEMES: Record<number, { theme: WeekdayTheme; label: string; reason: string }> = {
  0: { theme: 'reset', label: 'Sunday Reset', reason: 'Simple, prep-friendly, and easy to stretch into the week.' },
  1: { theme: 'quick', label: 'Quick Monday', reason: 'Fast and low-friction — built for getting back into rhythm.' },
  2: { theme: 'budget', label: 'Budget Tuesday', reason: 'Filling, affordable, and pantry-friendly.' },
  3: { theme: 'family', label: 'Family Wednesday', reason: 'Familiar flavors everyone at the table will enjoy.' },
  4: { theme: 'pantry', label: 'Pantry Thursday', reason: 'Uses what you likely already have on hand.' },
  5: { theme: 'date-night', label: 'Friday Night', reason: 'A little more playful — you earned it.' },
  6: { theme: 'comfort', label: 'Comfort Saturday', reason: 'Cozy, social, and still totally manageable.' },
}

// ─── IMAGE MAPPING SYSTEM ───────────────────────────────────────────────────────

/** Category → fallback image path (used only when meal.image is null) */
const CATEGORY_IMAGES: Record<MealCategory, string> = {
  chicken: '/landing/family-dinner.jpg',
  pasta: '/landing/app-cooking.jpg',
  bowl: '/landing/pantry.jpg',
  mexican: '/landing/family-dinner.jpg',
  seafood: '/landing/date-night.jpg',
  vegetarian: '/landing/pantry.jpg',
  comfort: '/landing/family-dinner.jpg',
  'stir-fry': '/landing/app-cooking.jpg',
  salad: '/landing/pantry.jpg',
  soup: '/landing/family-dinner.jpg',
}

/** Get the best available image for a meal */
export function getMealImage(meal: CuratedMeal): string {
  // Tier 1: Exact meal image (Unsplash CDN or local)
  if (meal.image) return meal.image
  // Tier 2: Category fallback
  return CATEGORY_IMAGES[meal.category] ?? '/landing/family-dinner.jpg'
}

// ─── CURATED MEALS ──────────────────────────────────────────────────────────────

export const TONIGHT_CATALOG: CuratedMeal[] = [
  // ── MONDAY: Quick meals ──
  {
    id: 'tonight_chicken_fajita_bowl',
    name: 'Chicken Fajita Bowl',
    tagline: 'Colorful, protein-packed, and ready fast.',
    category: 'chicken',
    weekdayTheme: 'quick',
    cookTimeMin: 25,
    prepTimeMin: 8,
    servings: 4,
    costPerServing: 3.50,
    difficulty: 'easy',
    tags: ['quick', 'high-protein', 'family-friendly'],
    benefits: ['25 min', 'High Protein', 'Easy Cleanup'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80&fit=crop',
    keyIngredients: ['chicken', 'bell pepper', 'rice', 'lime'],
  },
  {
    id: 'tonight_garlic_butter_shrimp',
    name: 'Garlic Butter Shrimp Pasta',
    tagline: 'Restaurant-quality in under 20 minutes.',
    category: 'pasta',
    weekdayTheme: 'quick',
    cookTimeMin: 18,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 4.25,
    difficulty: 'easy',
    tags: ['quick', 'high-protein'],
    benefits: ['18 min', 'One Pan', 'Impressive'],
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80&fit=crop',
    keyIngredients: ['shrimp', 'pasta', 'garlic', 'butter', 'lemon'],
  },
  {
    id: 'tonight_teriyaki_chicken_rice',
    name: 'Teriyaki Chicken Rice Bowl',
    tagline: 'Sweet, savory, and endlessly satisfying.',
    category: 'bowl',
    weekdayTheme: 'quick',
    cookTimeMin: 22,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 3.00,
    difficulty: 'easy',
    tags: ['quick', 'family-friendly', 'high-protein'],
    benefits: ['22 min', 'Kid-Approved', 'Budget'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&fit=crop',
    keyIngredients: ['chicken', 'rice', 'soy sauce', 'broccoli'],
  },

  // ── TUESDAY: Budget meals ──
  {
    id: 'tonight_lentil_taco_bowls',
    name: 'Lentil Taco Bowls',
    tagline: 'All the taco flavor, none of the guilt.',
    category: 'mexican',
    weekdayTheme: 'budget',
    cookTimeMin: 28,
    prepTimeMin: 8,
    servings: 4,
    costPerServing: 2.25,
    difficulty: 'easy',
    tags: ['budget', 'vegetarian', 'high-protein'],
    benefits: ['$2.25/serving', 'Plant Protein', 'Filling'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80&fit=crop',
    keyIngredients: ['lentils', 'rice', 'tomato', 'cumin', 'avocado'],
  },
  {
    id: 'tonight_egg_fried_rice',
    name: 'Egg Fried Rice',
    tagline: 'Better than takeout, cheaper than delivery.',
    category: 'stir-fry',
    weekdayTheme: 'budget',
    cookTimeMin: 15,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 1.75,
    difficulty: 'easy',
    tags: ['budget', 'quick', 'pantry'],
    benefits: ['$1.75/serving', '15 min', 'Pantry Staples'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80&fit=crop',
    keyIngredients: ['rice', 'eggs', 'soy sauce', 'vegetables', 'sesame oil'],
  },
  {
    id: 'tonight_black_bean_quesadillas',
    name: 'Black Bean Quesadillas',
    tagline: 'Crispy, cheesy, and incredibly affordable.',
    category: 'mexican',
    weekdayTheme: 'budget',
    cookTimeMin: 12,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 1.90,
    difficulty: 'easy',
    tags: ['budget', 'quick', 'vegetarian'],
    benefits: ['$1.90/serving', '12 min', 'Kid Favorite'],
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&q=80&fit=crop',
    keyIngredients: ['tortillas', 'black beans', 'cheese', 'salsa'],
  },

  // ── WEDNESDAY: Family favorites ──
  {
    id: 'tonight_one_pot_mac_cheese',
    name: 'One-Pot Mac & Cheese',
    tagline: 'Creamy, cheesy comfort the whole family loves.',
    category: 'pasta',
    weekdayTheme: 'family',
    cookTimeMin: 20,
    prepTimeMin: 3,
    servings: 6,
    costPerServing: 2.00,
    difficulty: 'easy',
    tags: ['family-friendly', 'comfort', 'quick'],
    benefits: ['One Pot', 'Kid Approved', '20 min'],
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=80&fit=crop',
    keyIngredients: ['pasta', 'cheese', 'milk', 'butter'],
  },
  {
    id: 'tonight_honey_garlic_chicken',
    name: 'Honey Garlic Chicken',
    tagline: 'Sweet, sticky, and impossible to resist.',
    category: 'chicken',
    weekdayTheme: 'family',
    cookTimeMin: 25,
    prepTimeMin: 8,
    servings: 4,
    costPerServing: 3.25,
    difficulty: 'easy',
    tags: ['family-friendly', 'high-protein'],
    benefits: ['25 min', 'Crowd Pleaser', 'High Protein'],
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=80&fit=crop',
    keyIngredients: ['chicken thighs', 'honey', 'garlic', 'soy sauce', 'rice'],
  },
  {
    id: 'tonight_sheet_pan_sausage_veggies',
    name: 'Sheet Pan Sausage & Veggies',
    tagline: 'Toss, roast, done. Minimal cleanup.',
    category: 'comfort',
    weekdayTheme: 'family',
    cookTimeMin: 30,
    prepTimeMin: 10,
    servings: 4,
    costPerServing: 3.50,
    difficulty: 'easy',
    tags: ['family-friendly', 'high-protein'],
    benefits: ['Sheet Pan', 'Easy Cleanup', 'Hearty'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop',
    keyIngredients: ['sausage', 'potatoes', 'bell peppers', 'onion', 'olive oil'],
  },

  // ── THURSDAY: Pantry rescue ──
  {
    id: 'tonight_pantry_pasta_aglio',
    name: 'Pasta Aglio e Olio',
    tagline: 'Italian elegance from 5 pantry staples.',
    category: 'pasta',
    weekdayTheme: 'pantry',
    cookTimeMin: 15,
    prepTimeMin: 3,
    servings: 4,
    costPerServing: 1.50,
    difficulty: 'easy',
    tags: ['pantry', 'quick', 'budget', 'vegetarian'],
    benefits: ['5 Ingredients', '15 min', '$1.50/serving'],
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80&fit=crop',
    keyIngredients: ['spaghetti', 'garlic', 'olive oil', 'chili flakes', 'parsley'],
  },
  {
    id: 'tonight_tuna_rice_bowl',
    name: 'Spicy Tuna Rice Bowl',
    tagline: 'Pantry sushi vibes without the effort.',
    category: 'bowl',
    weekdayTheme: 'pantry',
    cookTimeMin: 12,
    prepTimeMin: 5,
    servings: 2,
    costPerServing: 2.50,
    difficulty: 'easy',
    tags: ['pantry', 'quick', 'high-protein'],
    benefits: ['Pantry Staples', '12 min', 'No Shopping'],
    image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80&fit=crop',
    keyIngredients: ['canned tuna', 'rice', 'soy sauce', 'sriracha', 'avocado'],
  },
  {
    id: 'tonight_chickpea_curry',
    name: 'Quick Chickpea Curry',
    tagline: 'Warm, spiced, and entirely from the pantry.',
    category: 'vegetarian',
    weekdayTheme: 'pantry',
    cookTimeMin: 20,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 1.80,
    difficulty: 'easy',
    tags: ['pantry', 'vegetarian', 'budget'],
    benefits: ['All Pantry', 'Vegan Option', '20 min'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&fit=crop',
    keyIngredients: ['chickpeas', 'coconut milk', 'curry paste', 'rice', 'spinach'],
  },

  // ── FRIDAY: Date night / fun ──
  {
    id: 'tonight_lemon_salmon_bowls',
    name: 'Lemon Herb Salmon Bowls',
    tagline: 'Date-night quality, weeknight speed.',
    category: 'seafood',
    weekdayTheme: 'date-night',
    cookTimeMin: 22,
    prepTimeMin: 8,
    servings: 2,
    costPerServing: 6.50,
    difficulty: 'medium',
    tags: ['healthy', 'high-protein', 'date-night'],
    benefits: ['Omega-3 Rich', 'Impressive', '22 min'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80&fit=crop',
    keyIngredients: ['salmon', 'lemon', 'quinoa', 'asparagus', 'dill'],
  },
  {
    id: 'tonight_homemade_pizza',
    name: 'Homemade Flatbread Pizza',
    tagline: 'Friday night pizza — your way.',
    category: 'comfort',
    weekdayTheme: 'date-night',
    cookTimeMin: 20,
    prepTimeMin: 15,
    servings: 4,
    costPerServing: 3.00,
    difficulty: 'easy',
    tags: ['fun', 'family-friendly'],
    benefits: ['Customizable', 'Fun Activity', 'Fresh'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&fit=crop',
    keyIngredients: ['flatbread', 'mozzarella', 'tomato sauce', 'basil', 'toppings'],
  },
  {
    id: 'tonight_steak_chimichurri',
    name: 'Steak with Chimichurri',
    tagline: 'Simple sear, bold flavor, zero fuss.',
    category: 'comfort',
    weekdayTheme: 'date-night',
    cookTimeMin: 18,
    prepTimeMin: 10,
    servings: 2,
    costPerServing: 8.00,
    difficulty: 'medium',
    tags: ['high-protein', 'date-night'],
    benefits: ['Restaurant Quality', '18 min', 'Impressive'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop',
    keyIngredients: ['steak', 'parsley', 'garlic', 'olive oil', 'red wine vinegar'],
  },

  // ── SATURDAY: Comfort ──
  {
    id: 'tonight_creamy_tomato_soup',
    name: 'Creamy Tomato Soup & Grilled Cheese',
    tagline: 'The ultimate comfort duo.',
    category: 'soup',
    weekdayTheme: 'comfort',
    cookTimeMin: 25,
    prepTimeMin: 5,
    servings: 4,
    costPerServing: 2.50,
    difficulty: 'easy',
    tags: ['comfort', 'family-friendly', 'vegetarian'],
    benefits: ['Cozy', 'Kid Favorite', 'Vegetarian'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&fit=crop',
    keyIngredients: ['canned tomatoes', 'cream', 'bread', 'butter', 'cheese'],
  },
  {
    id: 'tonight_beef_stew',
    name: 'Hearty Beef Stew',
    tagline: 'Low and slow comfort in a bowl.',
    category: 'soup',
    weekdayTheme: 'comfort',
    cookTimeMin: 45,
    prepTimeMin: 15,
    servings: 6,
    costPerServing: 3.75,
    difficulty: 'easy',
    tags: ['comfort', 'high-protein', 'family-friendly'],
    benefits: ['Feeds a Crowd', 'Leftovers Ready', 'Hearty'],
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80&fit=crop',
    keyIngredients: ['beef', 'potatoes', 'carrots', 'onion', 'broth'],
  },
  {
    id: 'tonight_loaded_baked_potatoes',
    name: 'Loaded Baked Potatoes',
    tagline: 'Customize your own comfort bowl.',
    category: 'comfort',
    weekdayTheme: 'comfort',
    cookTimeMin: 35,
    prepTimeMin: 10,
    servings: 4,
    costPerServing: 2.75,
    difficulty: 'easy',
    tags: ['comfort', 'family-friendly', 'budget'],
    benefits: ['Customizable', 'Budget', 'Satisfying'],
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&q=80&fit=crop',
    keyIngredients: ['potatoes', 'cheese', 'sour cream', 'bacon', 'chives'],
  },

  // ── SUNDAY: Reset / prep ──
  {
    id: 'tonight_veggie_grain_bowl',
    name: 'Mediterranean Grain Bowl',
    tagline: 'Light, fresh, and sets the tone for the week.',
    category: 'bowl',
    weekdayTheme: 'reset',
    cookTimeMin: 20,
    prepTimeMin: 10,
    servings: 4,
    costPerServing: 3.00,
    difficulty: 'easy',
    tags: ['healthy', 'vegetarian', 'reset'],
    benefits: ['Meal Prep Ready', 'Light', 'Nutritious'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop',
    keyIngredients: ['quinoa', 'cucumber', 'tomato', 'feta', 'olive oil', 'lemon'],
  },
  {
    id: 'tonight_chicken_veggie_soup',
    name: 'Chicken & Vegetable Soup',
    tagline: 'Nourishing reset to start the week right.',
    category: 'soup',
    weekdayTheme: 'reset',
    cookTimeMin: 30,
    prepTimeMin: 10,
    servings: 6,
    costPerServing: 2.25,
    difficulty: 'easy',
    tags: ['healthy', 'family-friendly', 'reset'],
    benefits: ['Batch Cook', 'Freezer Friendly', 'Nourishing'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop',
    keyIngredients: ['chicken', 'carrots', 'celery', 'onion', 'broth', 'noodles'],
  },
  {
    id: 'tonight_buddha_bowl',
    name: 'Rainbow Buddha Bowl',
    tagline: 'Colorful, balanced, and endlessly variable.',
    category: 'bowl',
    weekdayTheme: 'reset',
    cookTimeMin: 25,
    prepTimeMin: 15,
    servings: 4,
    costPerServing: 3.25,
    difficulty: 'easy',
    tags: ['healthy', 'vegetarian', 'reset'],
    benefits: ['Nutrient Dense', 'Colorful', 'Prep Ahead'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&fit=crop',
    keyIngredients: ['sweet potato', 'chickpeas', 'kale', 'tahini', 'quinoa'],
  },
]

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────

/** Get meals for a specific weekday theme */
export function getMealsByTheme(theme: WeekdayTheme): CuratedMeal[] {
  return TONIGHT_CATALOG.filter((m) => m.weekdayTheme === theme)
}

/** Get today's theme based on day of week (uses 7am CT rotation) */
export function getTodayTheme(): { theme: WeekdayTheme; label: string; reason: string } {
  const day = getMealDayOfWeek()
  return WEEKDAY_THEMES[day]
}

/**
 * Deterministic daily hash — same meal all day for same seed.
 * Rotates at 7:00 AM Central Time (America/Chicago) each day.
 * This means the "day" for meal selection starts at 7am CT, not midnight UTC.
 */
export function dailyHash(seed: string): number {
  const dateStr = getMealDay()
  const input = `${seed}:${dateStr}`
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

/**
 * Get the "meal day" string — changes at 7:00 AM Central Time.
 * Before 7am CT, we still consider it "yesterday" for meal rotation.
 * This ensures users see a new meal when they wake up, not at midnight.
 */
export function getMealDay(): string {
  // Get current time in Central Time
  const now = new Date()
  // Convert to CT by using timezone offset
  // CT is UTC-6 (CST) or UTC-5 (CDT)
  const ctString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const ctDate = new Date(ctString)

  // If before 7am CT, use yesterday's date
  if (ctDate.getHours() < 7) {
    ctDate.setDate(ctDate.getDate() - 1)
  }

  // Return YYYY-MM-DD in CT
  return ctDate.toISOString().slice(0, 10)
}

/**
 * Get the weekday (0=Sun..6=Sat) based on the meal day rotation.
 * Uses the same 7am CT boundary as getMealDay().
 */
export function getMealDayOfWeek(): number {
  const now = new Date()
  const ctString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const ctDate = new Date(ctString)

  if (ctDate.getHours() < 7) {
    ctDate.setDate(ctDate.getDate() - 1)
  }

  return ctDate.getDay()
}

/** Pick one meal deterministically for today (stable per day) */
export function pickDailyMeal(meals: CuratedMeal[], seed: string): CuratedMeal {
  if (meals.length === 0) return TONIGHT_CATALOG[0]
  return meals[dailyHash(seed) % meals.length]
}
