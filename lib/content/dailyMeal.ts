/**
 * Daily meal rotation system for the landing page hero.
 *
 * Rules:
 * - One meal per day — same meal shown all day, changes at midnight
 * - Weekday logic: Mon=quick reset, Tue=budget, Wed=family-friendly, Thu=pantry
 * - Weekend logic: Fri 11AM+ = date night/fun, Sat = movie night/treat, Sun = comfort/reset
 * - No hydration mismatch — selection is computed client-side after mount
 * - No random rotation on reload — deterministic by date string
 */

export type MealCategory =
  | 'quick'      // Monday — quick reset meals
  | 'budget'     // Tuesday — budget meals
  | 'family'     // Wednesday — family-friendly easy dinners
  | 'pantry'     // Thursday — use-what-you-have / pantry meals
  | 'date-night' // Friday 11AM+ — date night / fun dinner / weekend kickoff
  | 'movie-night'// Saturday — movie night / treat meal / family fun
  | 'comfort'    // Sunday — comfort meal / family prep / easy reset

export interface DailyMeal {
  name: string
  time: string          // e.g. "22 min"
  tags: [string, string] // exactly 2 short tags shown as pills
  swapNote: string      // "Swap suggestions" body text
  pantryNote: string    // "Pantry matched" body text
  groceryItems: [string, string, string] // exactly 3 grocery list items
  category: MealCategory
  isWeekend: boolean
}

// ─── MEAL LIBRARY ────────────────────────────────────────────────────────────

const QUICK_MEALS: DailyMeal[] = [
  {
    name: 'Chicken Fajita Bowls',
    time: '20 min',
    tags: ['High Protein', 'Family Favorite'],
    swapNote: 'Swap chicken for black beans for a vegetarian version. Use lettuce wraps instead of rice for low-carb.',
    pantryNote: 'Uses rice, canned black beans, and taco seasoning you already have.',
    groceryItems: ['Chicken breast', 'Bell peppers', 'Sour cream + lime'],
    category: 'quick',
    isWeekend: false,
  },
  {
    name: 'Garlic Butter Shrimp Pasta',
    time: '18 min',
    tags: ['Quick & Easy', 'Crowd Pleaser'],
    swapNote: 'Use gluten-free pasta for dietary needs. Swap shrimp for chicken if preferred.',
    pantryNote: 'Uses pasta, garlic, and butter from your pantry staples.',
    groceryItems: ['Shrimp (frozen ok)', 'Linguine pasta', 'Fresh parsley'],
    category: 'quick',
    isWeekend: false,
  },
  {
    name: 'Turkey Taco Skillet',
    time: '15 min',
    tags: ['One Pan', 'High Protein'],
    swapNote: 'Dairy-free cheese for lactose-sensitive family members. Add jalapeños for heat lovers.',
    pantryNote: 'Uses canned tomatoes, taco seasoning, and rice already in your pantry.',
    groceryItems: ['Ground turkey', 'Shredded cheese', 'Flour tortillas'],
    category: 'quick',
    isWeekend: false,
  },
  {
    name: 'Lemon Herb Salmon',
    time: '22 min',
    tags: ['Healthy', 'Omega-3 Rich'],
    swapNote: 'Swap salmon for tilapia for a budget-friendly option. Works great with frozen fish.',
    pantryNote: 'Uses olive oil, garlic, and dried herbs from your spice rack.',
    groceryItems: ['Salmon fillets', 'Asparagus', 'Lemon + capers'],
    category: 'quick',
    isWeekend: false,
  },
  {
    name: 'Egg Fried Rice',
    time: '12 min',
    tags: ['Budget Friendly', 'Pantry Staple'],
    swapNote: 'Add edamame or tofu for extra protein. Use cauliflower rice for low-carb.',
    pantryNote: 'Uses leftover rice, soy sauce, and frozen peas you already have.',
    groceryItems: ['Eggs (4)', 'Frozen mixed veg', 'Sesame oil'],
    category: 'quick',
    isWeekend: false,
  },
]

const BUDGET_MEALS: DailyMeal[] = [
  {
    name: 'Black Bean Quesadillas',
    time: '15 min',
    tags: ['Under $8', 'Vegetarian'],
    swapNote: 'Add rotisserie chicken for extra protein. Use dairy-free cheese if needed.',
    pantryNote: 'Uses canned black beans, cheese, and tortillas — all pantry staples.',
    groceryItems: ['Flour tortillas', 'Canned black beans', 'Shredded cheddar'],
    category: 'budget',
    isWeekend: false,
  },
  {
    name: 'Lentil Vegetable Soup',
    time: '30 min',
    tags: ['Under $6', 'High Fiber'],
    swapNote: 'Add a parmesan rind while simmering for extra depth. Serve with crusty bread.',
    pantryNote: 'Uses dried lentils, canned tomatoes, and vegetable broth from your pantry.',
    groceryItems: ['Red lentils', 'Carrots + celery', 'Crusty bread'],
    category: 'budget',
    isWeekend: false,
  },
  {
    name: 'Pasta e Fagioli',
    time: '25 min',
    tags: ['Under $7', 'Italian Classic'],
    swapNote: 'Use any small pasta shape. Add Italian sausage for a heartier version.',
    pantryNote: 'Uses canned cannellini beans, pasta, and canned tomatoes you already have.',
    groceryItems: ['Ditalini pasta', 'Cannellini beans', 'Parmesan rind'],
    category: 'budget',
    isWeekend: false,
  },
  {
    name: 'Chicken Thigh Rice Bake',
    time: '35 min',
    tags: ['Under $10', 'One Pan'],
    swapNote: 'Chicken thighs are more forgiving than breasts — hard to overcook. Great for meal prep.',
    pantryNote: 'Uses rice, chicken broth, and garlic powder from your pantry.',
    groceryItems: ['Bone-in chicken thighs', 'Long grain rice', 'Chicken broth'],
    category: 'budget',
    isWeekend: false,
  },
  {
    name: 'Shakshuka',
    time: '20 min',
    tags: ['Under $5', 'Protein Rich'],
    swapNote: 'Add feta cheese on top for a Mediterranean twist. Serve with pita or crusty bread.',
    pantryNote: 'Uses canned crushed tomatoes, eggs, and spices from your pantry.',
    groceryItems: ['Eggs (6)', 'Canned crushed tomatoes', 'Feta cheese'],
    category: 'budget',
    isWeekend: false,
  },
]

const FAMILY_MEALS: DailyMeal[] = [
  {
    name: 'Creamy Pesto Salmon Bowls',
    time: '22 min',
    tags: ['High Protein', 'Family Favorite'],
    swapNote: 'Dairy-free sauce for mom, soft veggie sides for the kids.',
    pantryNote: 'Uses rice, frozen peas, and garlic you already have.',
    groceryItems: ['Salmon fillets', 'Basil pesto', 'Cucumber + avocado'],
    category: 'family',
    isWeekend: false,
  },
  {
    name: 'Sheet Pan Chicken & Veggies',
    time: '35 min',
    tags: ['Kid Approved', 'Easy Cleanup'],
    swapNote: 'Let kids pick their own veggie section on the pan — increases acceptance.',
    pantryNote: 'Uses olive oil, garlic powder, and Italian seasoning from your spice rack.',
    groceryItems: ['Chicken breasts', 'Broccoli + carrots', 'Baby potatoes'],
    category: 'family',
    isWeekend: false,
  },
  {
    name: 'Cheesy Beef Taco Pasta',
    time: '25 min',
    tags: ['Kid Favorite', 'One Pot'],
    swapNote: 'Use ground turkey for a lighter version. Add mild salsa for extra flavor.',
    pantryNote: 'Uses pasta, taco seasoning, and canned tomatoes from your pantry.',
    groceryItems: ['Ground beef', 'Rotini pasta', 'Mexican cheese blend'],
    category: 'family',
    isWeekend: false,
  },
  {
    name: 'Honey Garlic Chicken Stir-Fry',
    time: '20 min',
    tags: ['Balanced Meal', 'Quick Weeknight'],
    swapNote: 'Swap broccoli for snap peas or bok choy. Serve over rice or noodles.',
    pantryNote: 'Uses soy sauce, honey, and garlic — all pantry staples.',
    groceryItems: ['Chicken breast', 'Broccoli florets', 'Jasmine rice'],
    category: 'family',
    isWeekend: false,
  },
  {
    name: 'Homemade Pizza Night',
    time: '30 min',
    tags: ['Family Fun', 'Customizable'],
    swapNote: 'Set up a topping bar — everyone builds their own. Great for picky eaters.',
    pantryNote: 'Uses pizza sauce, mozzarella, and olive oil from your pantry.',
    groceryItems: ['Pizza dough (store-bought)', 'Mozzarella', 'Favorite toppings'],
    category: 'family',
    isWeekend: false,
  },
]

const PANTRY_MEALS: DailyMeal[] = [
  {
    name: 'Pantry Pasta Arrabbiata',
    time: '20 min',
    tags: ['Pantry Only', 'Bold Flavor'],
    swapNote: 'Reduce chili flakes for kids. Add a fried egg on top for extra protein.',
    pantryNote: 'Uses canned tomatoes, pasta, garlic, and olive oil — nothing to buy.',
    groceryItems: ['Penne pasta', 'Canned San Marzano tomatoes', 'Parmesan (optional)'],
    category: 'pantry',
    isWeekend: false,
  },
  {
    name: 'Chickpea Coconut Curry',
    time: '25 min',
    tags: ['Pantry Staples', 'Vegan'],
    swapNote: 'Add spinach in the last 2 minutes for extra nutrition. Serve over rice or with naan.',
    pantryNote: 'Uses canned chickpeas, coconut milk, and curry powder you already have.',
    groceryItems: ['Canned chickpeas', 'Coconut milk', 'Basmati rice'],
    category: 'pantry',
    isWeekend: false,
  },
  {
    name: 'Tuna Noodle Casserole',
    time: '30 min',
    tags: ['Comfort Classic', 'Pantry Hero'],
    swapNote: 'Use cream of mushroom soup from the can. Top with crushed crackers for crunch.',
    pantryNote: 'Uses canned tuna, egg noodles, and cream of mushroom soup from your pantry.',
    groceryItems: ['Canned tuna (2 cans)', 'Egg noodles', 'Frozen peas'],
    category: 'pantry',
    isWeekend: false,
  },
  {
    name: 'White Bean & Kale Soup',
    time: '20 min',
    tags: ['Pantry Staples', 'Nutrient Dense'],
    swapNote: 'Use spinach instead of kale. Add a parmesan rind for depth.',
    pantryNote: 'Uses canned white beans, vegetable broth, and dried herbs from your pantry.',
    groceryItems: ['Canned white beans', 'Kale or spinach', 'Crusty bread'],
    category: 'pantry',
    isWeekend: false,
  },
  {
    name: 'Fried Rice with Whatever You Have',
    time: '15 min',
    tags: ['Zero Waste', 'Pantry Cleaner'],
    swapNote: 'This is the perfect leftover meal — use any protein and vegetables you have.',
    pantryNote: 'Uses leftover rice, eggs, soy sauce, and whatever vegetables are in the fridge.',
    groceryItems: ['Eggs (3–4)', 'Soy sauce + sesame oil', 'Green onions'],
    category: 'pantry',
    isWeekend: false,
  },
]

const DATE_NIGHT_MEALS: DailyMeal[] = [
  {
    name: 'Seared Scallops with Risotto',
    time: '35 min',
    tags: ['Date Night', 'Restaurant Quality'],
    swapNote: 'Scallops cook in 90 seconds per side — don\'t overcook. Pair with a crisp white wine.',
    pantryNote: 'Uses arborio rice, white wine, and parmesan from your pantry.',
    groceryItems: ['Sea scallops', 'Arborio rice', 'Dry white wine'],
    category: 'date-night',
    isWeekend: true,
  },
  {
    name: 'Steak with Herb Butter & Frites',
    time: '30 min',
    tags: ['Date Night', 'Indulgent'],
    swapNote: 'Let the steak rest 5 minutes before cutting. Compound butter makes it restaurant-level.',
    pantryNote: 'Uses butter, garlic, and fresh herbs from your fridge.',
    groceryItems: ['Ribeye or NY strip', 'Baby potatoes', 'Fresh thyme + rosemary'],
    category: 'date-night',
    isWeekend: true,
  },
  {
    name: 'Shrimp Tacos with Mango Salsa',
    time: '25 min',
    tags: ['Weekend Kickoff', 'Bright & Fresh'],
    swapNote: 'Make the mango salsa ahead — it gets better as it sits. Add chipotle mayo for heat.',
    pantryNote: 'Uses lime juice, cumin, and chili powder from your spice rack.',
    groceryItems: ['Large shrimp', 'Ripe mango', 'Corn tortillas'],
    category: 'date-night',
    isWeekend: true,
  },
  {
    name: 'Pasta Carbonara for Two',
    time: '20 min',
    tags: ['Date Night', 'Italian Classic'],
    swapNote: 'The key is removing the pan from heat before adding eggs — no scrambling.',
    pantryNote: 'Uses pasta, eggs, and parmesan — a true pantry date night.',
    groceryItems: ['Guanciale or pancetta', 'Spaghetti', 'Pecorino Romano'],
    category: 'date-night',
    isWeekend: true,
  },
  {
    name: 'Honey Harissa Salmon',
    time: '22 min',
    tags: ['Date Night', 'Bold Flavors'],
    swapNote: 'Adjust harissa to taste — it can be spicy. Serve over couscous or roasted veg.',
    pantryNote: 'Uses honey, harissa paste, and olive oil from your pantry.',
    groceryItems: ['Salmon fillets', 'Harissa paste', 'Couscous + lemon'],
    category: 'date-night',
    isWeekend: true,
  },
]

const MOVIE_NIGHT_MEALS: DailyMeal[] = [
  {
    name: 'Movie Night Sliders',
    time: '25 min',
    tags: ['Fun', 'Crowd Favorite'],
    swapNote: 'Make a slider bar — set out toppings and let everyone build their own.',
    pantryNote: 'Uses ketchup, mustard, and pickles from your fridge door.',
    groceryItems: ['Slider buns', 'Ground beef patties', 'American cheese'],
    category: 'movie-night',
    isWeekend: true,
  },
  {
    name: 'Loaded Nachos Night',
    time: '20 min',
    tags: ['Movie Night', 'Shareable'],
    swapNote: 'Layer chips and cheese twice for maximum coverage. Add jalapeños for heat lovers.',
    pantryNote: 'Uses canned black beans, salsa, and sour cream from your fridge.',
    groceryItems: ['Tortilla chips', 'Shredded Mexican cheese', 'Guacamole'],
    category: 'movie-night',
    isWeekend: true,
  },
  {
    name: 'BBQ Pulled Chicken Sandwiches',
    time: '20 min',
    tags: ['Crowd Pleaser', 'Easy'],
    swapNote: 'Use rotisserie chicken for a 10-minute version. Top with coleslaw for crunch.',
    pantryNote: 'Uses BBQ sauce and coleslaw mix from your pantry and fridge.',
    groceryItems: ['Rotisserie chicken', 'Brioche buns', 'BBQ sauce'],
    category: 'movie-night',
    isWeekend: true,
  },
  {
    name: 'Homemade Popcorn Chicken',
    time: '30 min',
    tags: ['Family Fun', 'Kid Approved'],
    swapNote: 'Air fryer works great for a lighter version. Serve with dipping sauces.',
    pantryNote: 'Uses flour, eggs, and breadcrumbs from your pantry.',
    groceryItems: ['Chicken breast (cubed)', 'Panko breadcrumbs', 'Dipping sauces'],
    category: 'movie-night',
    isWeekend: true,
  },
  {
    name: 'Flatbread Pizza Bar',
    time: '20 min',
    tags: ['Movie Night', 'Customizable'],
    swapNote: 'Set up a topping station — everyone makes their own. Great for groups.',
    pantryNote: 'Uses pizza sauce, mozzarella, and olive oil from your pantry.',
    groceryItems: ['Naan or flatbreads', 'Pizza sauce', 'Assorted toppings'],
    category: 'movie-night',
    isWeekend: true,
  },
]

const COMFORT_MEALS: DailyMeal[] = [
  {
    name: 'Classic Chicken Pot Pie',
    time: '40 min',
    tags: ['Sunday Comfort', 'Family Classic'],
    swapNote: 'Use store-bought pie crust to save time. Add peas and carrots for color.',
    pantryNote: 'Uses cream of chicken soup, frozen vegetables, and pie crust from the freezer.',
    groceryItems: ['Rotisserie chicken', 'Refrigerated pie crust', 'Frozen mixed veg'],
    category: 'comfort',
    isWeekend: true,
  },
  {
    name: 'Slow-Cooked Beef Stew',
    time: '35 min',
    tags: ['Sunday Reset', 'Hearty'],
    swapNote: 'Serve over mashed potatoes or with crusty bread to soak up the broth.',
    pantryNote: 'Uses beef broth, tomato paste, and Worcestershire sauce from your pantry.',
    groceryItems: ['Beef chuck (cubed)', 'Baby potatoes + carrots', 'Fresh thyme'],
    category: 'comfort',
    isWeekend: true,
  },
  {
    name: 'Baked Mac & Cheese',
    time: '35 min',
    tags: ['Ultimate Comfort', 'Family Prep'],
    swapNote: 'Make a double batch — it reheats perfectly for Monday night.',
    pantryNote: 'Uses pasta, butter, flour, and milk — all pantry staples.',
    groceryItems: ['Elbow macaroni', 'Sharp cheddar + gruyère', 'Breadcrumbs'],
    category: 'comfort',
    isWeekend: true,
  },
  {
    name: 'French Onion Soup',
    time: '45 min',
    tags: ['Sunday Cozy', 'Restaurant Classic'],
    swapNote: 'The long caramelization is worth it — don\'t rush it. Use gruyère for authenticity.',
    pantryNote: 'Uses beef broth, butter, and thyme from your pantry.',
    groceryItems: ['Yellow onions (4)', 'Gruyère cheese', 'Baguette slices'],
    category: 'comfort',
    isWeekend: true,
  },
  {
    name: 'Roast Chicken with Vegetables',
    time: '50 min',
    tags: ['Sunday Tradition', 'Meal Prep'],
    swapNote: 'Leftovers become Monday\'s chicken tacos or Tuesday\'s soup. Zero waste.',
    pantryNote: 'Uses olive oil, garlic, and herbs from your pantry.',
    groceryItems: ['Whole chicken', 'Root vegetables', 'Fresh lemon + herbs'],
    category: 'comfort',
    isWeekend: true,
  },
]

// ─── ALL MEALS BY CATEGORY ────────────────────────────────────────────────────

const MEALS_BY_CATEGORY: Record<MealCategory, DailyMeal[]> = {
  'quick': QUICK_MEALS,
  'budget': BUDGET_MEALS,
  'family': FAMILY_MEALS,
  'pantry': PANTRY_MEALS,
  'date-night': DATE_NIGHT_MEALS,
  'movie-night': MOVIE_NIGHT_MEALS,
  'comfort': COMFORT_MEALS,
}

// ─── ROTATION LOGIC ───────────────────────────────────────────────────────────

/**
 * Returns the category for a given date.
 * Weekend logic: Fri 11AM+ → date-night, Sat → movie-night, Sun → comfort
 * Weekday logic: Mon → quick, Tue → budget, Wed → family, Thu → pantry
 * Fri before 11AM → quick (treat it as a late weekday)
 */
export function getCategoryForDate(date: Date): MealCategory {
  const day = date.getDay()   // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const hour = date.getHours()

  if (day === 5 && hour >= 11) return 'date-night'  // Friday 11AM+
  if (day === 6) return 'movie-night'                // Saturday
  if (day === 0) return 'comfort'                    // Sunday

  // Weekdays
  switch (day) {
    case 1: return 'quick'    // Monday
    case 2: return 'budget'   // Tuesday
    case 3: return 'family'   // Wednesday
    case 4: return 'pantry'   // Thursday
    case 5: return 'quick'    // Friday before 11AM — treat as quick weekday
    default: return 'family'
  }
}

/**
 * Returns a deterministic index for a given date string.
 * Same date always returns the same index — no randomness on reload.
 * Uses a simple hash of the date string (YYYY-MM-DD).
 */
function getDailyIndex(dateStr: string, poolSize: number): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return hash % poolSize
}

/**
 * Returns the meal to show today.
 * Call this client-side only (after mount) to avoid hydration mismatch.
 */
export function getTodaysMeal(): DailyMeal {
  const now = new Date()
  const category = getCategoryForDate(now)
  const pool = MEALS_BY_CATEGORY[category]

  // Date string as YYYY-MM-DD for deterministic daily selection
  const dateStr = now.toISOString().slice(0, 10)
  const index = getDailyIndex(dateStr, pool.length)

  return pool[index]
}

/**
 * Returns the label for the hero card header based on category.
 */
export function getPickLabel(category: MealCategory): string {
  switch (category) {
    case 'date-night':  return "Weekend Pick"
    case 'movie-night': return "Weekend Pick"
    case 'comfort':     return "Weekend Pick"
    default:            return "Tonight's Smart Pick"
  }
}

/**
 * Returns the day context string shown below the meal name.
 */
export function getDayContext(category: MealCategory): string {
  switch (category) {
    case 'quick':       return 'Monday reset — fast and satisfying'
    case 'budget':      return 'Tuesday budget pick — delicious under $10'
    case 'family':      return 'Wednesday family dinner — everyone eats'
    case 'pantry':      return 'Thursday pantry clear — use what you have'
    case 'date-night':  return 'Weekend kickoff — dinner worth looking forward to'
    case 'movie-night': return 'Saturday night — fun food for the whole crew'
    case 'comfort':     return 'Sunday comfort — slow down and enjoy'
  }
}
