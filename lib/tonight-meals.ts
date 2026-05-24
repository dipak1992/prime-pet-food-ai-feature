// ============================================================
// MealEase — Tonight Mode Pre-built Meals
// Curated meals for instant, magical generation
// ============================================================

export interface TonightMealVariation {
  stage: 'adult' | 'kid' | 'toddler' | 'baby'
  label: string
  emoji: string
  title: string
  modifications: string[]
  safetyNotes: string[]
  servingTip: string
}

export interface TonightMeal {
  id: string
  title: string
  tagline: string
  description: string
  cuisineType: string
  prepTime: number
  cookTime: number
  estimatedCost: number
  servings: number
  difficulty: 'easy' | 'moderate'
  tags: string[]
  ingredients: { name: string; quantity: string; note?: string }[]
  steps: string[]
  variations: TonightMealVariation[]
  leftoverTip: string | null
  mode: 'quick' | 'tired' | 'pantry' | 'any'
}

// ── Quick Demo Meals (no input required, universally appealing) ──

const QUICK_MEALS: TonightMeal[] = [
  {
    id: 'tonight-lemon-chicken',
    title: 'One-Pan Lemon Herb Chicken Thighs',
    tagline: 'Golden, juicy, and on the table in 30 minutes',
    description: 'Tender chicken thighs seared golden and finished with lemon, garlic, and fresh herbs alongside roasted baby potatoes and green beans. One pan, minimal cleanup.',
    cuisineType: 'Mediterranean',
    prepTime: 8,
    cookTime: 22,
    estimatedCost: 14.5,
    servings: 4,
    difficulty: 'easy',
    tags: ['one-pan', 'gluten-free', 'high-protein', 'family-favorite'],
    ingredients: [
      { name: 'Chicken thighs (bone-in)', quantity: '4 pieces' },
      { name: 'Baby potatoes', quantity: '1 lb', note: 'halved' },
      { name: 'Green beans', quantity: '2 cups', note: 'trimmed' },
      { name: 'Lemon', quantity: '2 whole' },
      { name: 'Garlic cloves', quantity: '4', note: 'smashed' },
      { name: 'Olive oil', quantity: '2 tbsp' },
      { name: 'Fresh thyme', quantity: '4 sprigs' },
      { name: 'Salt & pepper', quantity: 'to taste' },
    ],
    steps: [
      'Preheat oven to 425°F (220°C).',
      'Season chicken thighs with salt, pepper, and lemon zest.',
      'Sear chicken skin-side down in an oven-safe skillet for 5 minutes until golden.',
      'Flip chicken. Scatter potatoes and green beans around the pan.',
      'Add smashed garlic, thyme sprigs, and lemon halves.',
      'Drizzle vegetables with olive oil, roast 22 minutes until chicken reaches 165°F.',
      'Squeeze roasted lemon halves over everything. Serve family-style.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Full Portion — Season to Taste',
        modifications: ['Season generously with salt, pepper, red pepper flakes if desired', 'Add a splash of white wine to the pan before roasting for extra depth', 'Serve with crusty bread to soak up the pan juices'],
        safetyNotes: [],
        servingTip: 'Plate directly from the pan — restaurant style',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Mild & Deconstructed',
        modifications: ['Remove skin if preferred for mild flavor', 'Shred chicken into bite-sized strips', 'Serve potatoes and green beans separately — let them choose', 'Light squeeze of lemon only'],
        safetyNotes: ['Check temperature before serving — no hot spots from pan'],
        servingTip: 'Use a fun divided plate so foods don\'t touch',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Soft Bites, No Bones',
        modifications: ['Pull chicken off the bone — shred into small soft pieces', 'Smash potatoes gently with a fork for easy handling', 'Cut green beans into 1-inch pieces', 'Skip all seasoning except a tiny bit of thyme', 'Cool to safe temperature before serving'],
        safetyNotes: ['Remove all bones and cartilage', 'Cut grapes/round foods in quarters (if serving fruit alongside)'],
        servingTip: 'Let them self-feed with fingers — it\'s messy but great for development',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Puréed Chicken & Veg',
        modifications: ['Blend chicken with a small amount of cooking liquid to smooth purée', 'Steam potatoes separately (softer than roasted) and mash thoroughly', 'Steam green beans and purée or offer as soft finger food strips', 'NO salt or seasoning', 'NO lemon juice on baby portion'],
        safetyNotes: ['No honey', 'No added salt or sugar', 'Ensure purée is smooth with no lumps for younger babies', 'Chicken must be fully cooked through — no pink'],
        servingTip: 'Offer one new food at a time if still in early introduction',
      },
    ],
    leftoverTip: 'Shred leftover chicken and toss with rice and veggies for tomorrow\'s lunch bowls',
    mode: 'quick',
  },
  {
    id: 'tonight-pasta-bolognese',
    title: 'Quick Turkey Bolognese',
    tagline: 'Comfort food that the whole family actually eats',
    description: 'A lighter, faster take on classic bolognese using ground turkey, grated vegetables, and crushed tomatoes. Hidden nutrition in every bite.',
    cuisineType: 'Italian',
    prepTime: 10,
    cookTime: 20,
    estimatedCost: 12.0,
    servings: 4,
    difficulty: 'easy',
    tags: ['kid-approved', 'hidden-veggies', 'comfort-food', 'one-pot'],
    ingredients: [
      { name: 'Ground turkey', quantity: '1 lb' },
      { name: 'Pasta (penne or fusilli)', quantity: '12 oz' },
      { name: 'Crushed tomatoes', quantity: '1 can (28oz)' },
      { name: 'Carrots', quantity: '2', note: 'finely grated' },
      { name: 'Zucchini', quantity: '1', note: 'finely grated' },
      { name: 'Onion', quantity: '1', note: 'diced small' },
      { name: 'Garlic cloves', quantity: '3', note: 'minced' },
      { name: 'Olive oil', quantity: '1 tbsp' },
      { name: 'Italian seasoning', quantity: '1 tsp' },
      { name: 'Parmesan cheese', quantity: 'for topping' },
    ],
    steps: [
      'Start boiling a large pot of salted water for pasta.',
      'Heat olive oil in a deep skillet over medium-high heat.',
      'Cook ground turkey, breaking apart, until browned (5 minutes).',
      'Add diced onion and garlic — sauté 2 minutes.',
      'Stir in grated carrots and zucchini (they disappear into the sauce!).',
      'Pour in crushed tomatoes and Italian seasoning. Simmer 15 minutes.',
      'Cook pasta al dente, drain, and toss with bolognese sauce.',
      'Top with parmesan and serve from the pot.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Full Flavor Bolognese',
        modifications: ['Season with salt, pepper, and a pinch of red pepper flakes', 'Add a splash of red wine to the sauce while simmering', 'Generous parmesan and fresh basil on top'],
        safetyNotes: [],
        servingTip: 'Pair with garlic bread and a simple side salad',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Pasta with Sneaky-Veggie Sauce',
        modifications: ['Use fun pasta shapes (wheels, bow-ties)', 'The grated veggies are invisible in the sauce — don\'t mention them 😉', 'Mild seasoning only — skip the red pepper flakes', 'Let them sprinkle their own parmesan'],
        safetyNotes: ['Cool pasta slightly before serving'],
        servingTip: 'Serve with a small side of raw carrot sticks for crunch variety',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Mini Pasta & Soft Meat Sauce',
        modifications: ['Use small pasta shapes (ditalini, orzo, or stars)', 'Chop or mash the meat sauce extra fine', 'Skip all salt and seasoning', 'Mix a small amount of sauce with pasta — not too saucy', 'Cool thoroughly before serving'],
        safetyNotes: ['Ensure pasta is very soft', 'No large chunks of meat — break everything down'],
        servingTip: 'A suction-cup bowl helps contain the mess',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Turkey & Tomato Purée + Pasta Fingers',
        modifications: ['Blend turkey and sauce to smooth purée for spoon feeding', 'Or: offer soft overcooked pasta as finger food (large pieces they can grip)', 'NO salt, NO parmesan (sodium)', 'Very small amount of tomato — some babies react to acidity', 'Cook pasta until very soft and slightly mushy'],
        safetyNotes: ['No honey', 'No added salt or cheese for babies under 12mo', 'Watch for tomato sensitivity — start small', 'Pasta should be soft enough to squish between fingers'],
        servingTip: 'Large fusilli spirals are great for baby-led weaning — easy to grip',
      },
    ],
    leftoverTip: 'Freeze leftover bolognese in ice cube trays for quick baby meals or fast weeknight dinners',
    mode: 'quick',
  },
  {
    id: 'tonight-stir-fry',
    title: 'Teriyaki Chicken Stir-Fry',
    tagline: '15-minute dinner that tastes like takeout',
    description: 'Tender chicken strips with colorful vegetables in a sweet-savory homemade teriyaki glaze, served over fluffy rice.',
    cuisineType: 'Asian-Fusion',
    prepTime: 10,
    cookTime: 12,
    estimatedCost: 11.0,
    servings: 4,
    difficulty: 'easy',
    tags: ['quick', 'kid-approved', 'high-protein', 'colorful'],
    ingredients: [
      { name: 'Chicken breast', quantity: '1.5 lbs', note: 'sliced thin' },
      { name: 'Broccoli florets', quantity: '2 cups' },
      { name: 'Bell pepper (red)', quantity: '1', note: 'sliced' },
      { name: 'Snap peas', quantity: '1 cup' },
      { name: 'Soy sauce (low-sodium)', quantity: '3 tbsp' },
      { name: 'Honey', quantity: '2 tbsp' },
      { name: 'Rice vinegar', quantity: '1 tbsp' },
      { name: 'Cornstarch', quantity: '1 tsp' },
      { name: 'Sesame oil', quantity: '1 tsp' },
      { name: 'Jasmine rice', quantity: '2 cups', note: 'cooked' },
      { name: 'Sesame seeds', quantity: 'for garnish' },
    ],
    steps: [
      'Cook jasmine rice according to package directions (or use instant rice).',
      'Mix soy sauce, honey, rice vinegar, cornstarch, and sesame oil into teriyaki sauce.',
      'Heat a large skillet or wok over high heat with 1 tbsp oil.',
      'Stir-fry chicken strips 4-5 minutes until golden and cooked through.',
      'Add broccoli, bell pepper, and snap peas. Stir-fry 3 minutes.',
      'Pour teriyaki sauce over everything. Toss until glazed and thickened (1 minute).',
      'Serve over rice. Sprinkle with sesame seeds.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Full Teriyaki with Sriracha',
        modifications: ['Generous teriyaki glaze', 'Add sriracha or chili flakes for heat', 'Top with sliced green onions and extra sesame seeds', 'Add edamame for extra protein if desired'],
        safetyNotes: [],
        servingTip: 'Serve in a deep bowl over rice — restaurant-style',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Sweet Chicken & Rice Bowl',
        modifications: ['Extra honey in the sauce (kids love the sweetness)', 'Chicken cut into nugget-sized cubes', 'Serve vegetables on the side — don\'t force mixing', 'Plain rice underneath with sauce drizzled on top'],
        safetyNotes: ['No spicy additions'],
        servingTip: 'Let them dip chicken pieces into sauce — makes it fun',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Plain Chicken Bites & Soft Veggies',
        modifications: ['Plain cooked chicken — no teriyaki sauce (too much sugar/sodium)', 'Cut into pea-sized pieces for safety', 'Steam broccoli extra soft separately', 'Plain rice formed into small balls for easy gripping', 'Skip snap peas (stringy texture is a choking hazard)'],
        safetyNotes: ['Remove stringy parts from snap peas if offering', 'Cut all round foods in quarters', 'No honey for babies under 12mo (but OK for toddlers over 1)'],
        servingTip: 'Tiny fork or let them use fingers — both are fine at this age',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Puréed Chicken & Steamed Veg',
        modifications: ['Plain chicken blended with breastmilk/formula to smooth purée', 'Steamed broccoli florets as finger food (large tree-shaped pieces)', 'NO soy sauce, NO honey (botulism risk under 12mo)', 'NO teriyaki sauce', 'Soft steamed bell pepper strips as finger food', 'Very soft rice mashed slightly'],
        safetyNotes: ['NEVER give honey to babies under 12 months', 'No soy sauce (extremely high sodium)', 'Broccoli florets should be softened until easily squished', 'Chicken must be thoroughly cooked — no pink'],
        servingTip: 'Offer broccoli "trees" — babies love grabbing the stem',
      },
    ],
    leftoverTip: 'Pack leftover stir-fry into lunch containers — reheats beautifully in the microwave',
    mode: 'quick',
  },
]

// ── "I'm Tired" Meals (absolute minimum effort) ──

const TIRED_MEALS: TonightMeal[] = [
  {
    id: 'tonight-sheet-pan-sausage',
    title: 'Sheet Pan Sausage & Roasted Veggies',
    tagline: 'Dump everything on a pan. Walk away. Dinner\'s done.',
    description: 'Pre-cooked sausage links with roasted sweet potatoes, bell peppers, and onions. Zero prep skill required. The oven does all the work.',
    cuisineType: 'American',
    prepTime: 5,
    cookTime: 25,
    estimatedCost: 10.5,
    servings: 4,
    difficulty: 'easy',
    tags: ['sheet-pan', 'no-skill-needed', 'low-energy', 'minimal-cleanup'],
    ingredients: [
      { name: 'Pre-cooked chicken sausage', quantity: '1 pack (4 links)' },
      { name: 'Sweet potatoes', quantity: '2 medium', note: 'cubed' },
      { name: 'Bell peppers', quantity: '2', note: 'rough chop' },
      { name: 'Red onion', quantity: '1', note: 'wedged' },
      { name: 'Olive oil', quantity: '2 tbsp' },
      { name: 'Smoked paprika', quantity: '1 tsp' },
      { name: 'Garlic powder', quantity: '½ tsp' },
    ],
    steps: [
      'Preheat oven to 425°F. Line a sheet pan with foil (even less cleanup).',
      'Dump cubed sweet potatoes, peppers, and onion onto the pan.',
      'Drizzle with olive oil, sprinkle paprika and garlic powder. Toss with hands.',
      'Nestle sausage links among the vegetables.',
      'Roast 25 minutes. That\'s it. You\'re done.',
      'Slice sausage on the pan. Serve straight from the sheet.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Season & Enjoy',
        modifications: ['Add hot sauce or Dijon mustard on top', 'Season with salt and pepper at the table', 'Squeeze of lemon if you have one'],
        safetyNotes: [],
        servingTip: 'Eat off the sheet pan if you want. No judgment. You\'re tired.',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Sausage Coins & Sweet Potato',
        modifications: ['Slice sausage into fun coin-shaped rounds', 'Sweet potato wedges as "fries"', 'Ketchup on the side for dipping', 'Skip onion if they don\'t like it'],
        safetyNotes: ['Let cool slightly — sausage retains heat'],
        servingTip: 'Call the sweet potatoes "orange fries" — instant appeal',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Tiny Bites, Super Soft',
        modifications: ['Dice sausage into very small pieces (pea-sized)', 'Mash sweet potato chunks with a fork', 'Skip bell pepper skin (hard to chew) or peel it', 'No seasoning needed — the sausage has flavor', 'Cool everything thoroughly'],
        safetyNotes: ['Sausage skin can be tough — remove casing if present', 'Cut all round foods into quarters', 'Sweet potato must be soft enough to squish between fingers'],
        servingTip: 'Put a few pieces at a time on their tray — don\'t overwhelm',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Mashed Sweet Potato + Soft Veg',
        modifications: ['Mash roasted sweet potato with a bit of breastmilk/formula', 'Skip the sausage entirely (too much sodium for babies)', 'Offer soft roasted pepper strips as finger food (remove skin)', 'No salt, no seasoning on baby portion', 'If baby is 9mo+ with good pincer grasp: tiny soft sweet potato cubes'],
        safetyNotes: ['Sausage is too high in sodium for babies', 'Remove all pepper skins', 'No salt or spices on baby portion', 'Ensure all food is mashable between thumb and finger'],
        servingTip: 'Sweet potato is usually a baby crowd-pleaser',
      },
    ],
    leftoverTip: 'Toss leftovers into a tortilla with cheese for tomorrow\'s quick quesadilla',
    mode: 'tired',
  },
  {
    id: 'tonight-egg-fried-rice',
    title: '10-Minute Egg Fried Rice',
    tagline: 'The "I have nothing" dinner that always delivers',
    description: 'Fluffy fried rice with scrambled eggs, frozen peas, and a splash of soy sauce. Uses leftover rice or instant rice. Absolute pantry champion.',
    cuisineType: 'Asian',
    prepTime: 3,
    cookTime: 8,
    estimatedCost: 4.5,
    servings: 4,
    difficulty: 'easy',
    tags: ['10-minute', 'pantry-staples', 'budget-friendly', 'low-energy'],
    ingredients: [
      { name: 'Cooked rice', quantity: '4 cups', note: 'day-old works best' },
      { name: 'Eggs', quantity: '4' },
      { name: 'Frozen peas & carrots', quantity: '1 cup' },
      { name: 'Soy sauce', quantity: '2 tbsp' },
      { name: 'Sesame oil', quantity: '1 tsp' },
      { name: 'Green onions', quantity: '2', note: 'sliced' },
      { name: 'Vegetable oil', quantity: '2 tbsp' },
      { name: 'Garlic', quantity: '2 cloves', note: 'minced' },
    ],
    steps: [
      'Heat oil in a large skillet or wok over high heat.',
      'Scramble eggs quickly, break into small pieces. Set aside.',
      'Add garlic and frozen peas/carrots — stir-fry 2 minutes.',
      'Add cooked rice. Press and toss for 3-4 minutes until slightly crispy.',
      'Pour soy sauce and sesame oil. Toss everything together.',
      'Fold eggs back in. Top with green onions. Done.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Classic Fried Rice',
        modifications: ['Add extra soy sauce and a drizzle of chili oil', 'Top with a fried egg for extra protein', 'Sriracha on the side'],
        safetyNotes: [],
        servingTip: 'Best eaten hot from the wok',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Kid-Friendly Fried Rice',
        modifications: ['Light soy sauce (not too salty)', 'Extra scrambled egg mixed in', 'Skip green onions if they\'re picky about "green things"', 'Ketchup packet on the side — yes, really, kids love it'],
        safetyNotes: ['Check temperature — rice holds heat'],
        servingTip: 'Serve in a bowl with chopsticks for fun factor',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Soft Rice, Egg & Peas',
        modifications: ['Plain rice with scrambled egg mixed in — skip soy sauce', 'Peas are great for toddlers (soft, easy to pick up)', 'Skip any crunchy bits', 'Serve slightly warm, not hot', 'Form into small rice balls if they\'re at the self-feeding stage'],
        safetyNotes: ['Egg allergy? Skip eggs — use plain rice with peas and mashed carrots', 'Ensure rice is soft, not dried out or crunchy'],
        servingTip: 'Rice balls with hidden peas inside = toddler treasure hunt',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Mashed Rice & Egg Purée',
        modifications: ['Mash soft-cooked rice (overcooked so it\'s mushy)', 'Well-scrambled egg mashed fine (if egg has been introduced)', 'Steamed peas mashed or offered whole for 9mo+ with pincer grasp', 'NO soy sauce', 'NO sesame oil', 'Mix with a splash of breastmilk/formula for easier texture'],
        safetyNotes: ['Egg is a top allergen — ensure it has been safely introduced first', 'No salt or soy sauce for babies', 'Rice should be very soft — not sticky clumps that could be a choking risk'],
        servingTip: 'Preloaded spoon method works great for mushy rice',
      },
    ],
    leftoverTip: 'Fried rice actually tastes better reheated the next day',
    mode: 'tired',
  },
]

// ── "Use What I Have" Meals (pantry-friendly) ──

const PANTRY_MEALS: TonightMeal[] = [
  {
    id: 'tonight-bean-tacos',
    title: 'Crispy Black Bean Tacos',
    tagline: 'Canned beans + tortillas = dinner hero',
    description: 'Seasoned black beans with quick pickled onions, avocado, and lime crema in warm corn tortillas. A family taco night from pantry staples.',
    cuisineType: 'Mexican',
    prepTime: 10,
    cookTime: 10,
    estimatedCost: 8.0,
    servings: 4,
    difficulty: 'easy',
    tags: ['vegetarian', 'pantry-staples', 'kid-approved', 'customizable'],
    ingredients: [
      { name: 'Black beans', quantity: '2 cans (15oz)', note: 'drained & rinsed' },
      { name: 'Corn tortillas', quantity: '12 small' },
      { name: 'Avocado', quantity: '2' },
      { name: 'Lime', quantity: '2' },
      { name: 'Sour cream or Greek yogurt', quantity: '½ cup' },
      { name: 'Cumin', quantity: '1 tsp' },
      { name: 'Chili powder', quantity: '½ tsp' },
      { name: 'Garlic powder', quantity: '½ tsp' },
      { name: 'Shredded cheese', quantity: '1 cup' },
      { name: 'Salsa', quantity: 'for topping' },
    ],
    steps: [
      'Heat beans in a skillet with cumin, chili powder, garlic powder. Mash slightly.',
      'Warm tortillas in a dry pan or directly over a gas flame.',
      'Mix sour cream with lime juice for quick crema.',
      'Slice avocado.',
      'Set up a taco bar — let everyone build their own.',
      'Base: tortilla → beans → cheese → avocado → crema → salsa.',
    ],
    variations: [
      {
        stage: 'adult',
        label: 'Adult',
        emoji: '🧑',
        title: 'Loaded Tacos',
        modifications: ['Full seasoning with extra chili powder and hot sauce', 'Quick pickled red onions if you have them', 'Cilantro, lime, the works', 'Double up on tortillas for structural integrity'],
        safetyNotes: [],
        servingTip: 'Two tacos per person minimum — they\'re small and addictive',
      },
      {
        stage: 'kid',
        label: 'Kid (5-12)',
        emoji: '👦',
        title: 'Bean & Cheese Tacos',
        modifications: ['Skip the spicy seasoning — use just a pinch of cumin', 'Extra cheese (melted on the tortilla first)', 'Avocado on the side', 'Sour cream as a dip', 'They can build their own — kids love assembly!'],
        safetyNotes: [],
        servingTip: 'Make it a "taco bar" and let them customize',
      },
      {
        stage: 'toddler',
        label: 'Toddler (1-4)',
        emoji: '👶',
        title: 'Bean & Cheese Quesadilla',
        modifications: ['Skip taco shells (they can shatter and be hard to eat)', 'Instead: spread beans + cheese on a soft flour tortilla, fold, and warm', 'Cut into triangles or strips for easy gripping', 'Mashed avocado on the side', 'No spicy seasoning'],
        safetyNotes: ['Large pieces of shredded cheese can be a choking hazard — melt it', 'Avocado is soft and safe but cut appropriately'],
        servingTip: 'Quesadilla strips are the toddler version of tacos — same delicious idea, safer format',
      },
      {
        stage: 'baby',
        label: 'Baby (6-12mo)',
        emoji: '🍼',
        title: 'Mashed Beans & Avocado',
        modifications: ['Mash black beans thoroughly (or blend with a splash of water)', 'Ripe avocado mashed smooth', 'Soft tortilla torn into strips for baby-led weaning (9mo+)', 'NO seasoning, NO salt, NO salsa', 'NO cheese for babies under 9mo (unless pediatrician approved)'],
        safetyNotes: ['Beans are a great iron source for babies', 'Ensure beans are fully mashed — whole beans are a choking hazard', 'No spices, no salt on baby portion'],
        servingTip: 'Preload a spoon with mashed beans — let baby bring it to their mouth',
      },
    ],
    leftoverTip: 'Leftover seasoned beans make a great dip or burrito filling tomorrow',
    mode: 'pantry',
  },
]

// ── All meals indexed by mode ──

export const TONIGHT_MEALS = {
  quick: QUICK_MEALS,
  tired: TIRED_MEALS,
  pantry: PANTRY_MEALS,
}

const SEEN_KEY = 'mealease-tonight-seen'

function getSeenIds(mode: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(`${SEEN_KEY}-${mode}`)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function recordSeen(mode: string, id: string, poolSize: number) {
  if (typeof window === 'undefined') return
  try {
    const seen = getSeenIds(mode)
    const updated = [...seen, id].slice(-(poolSize - 1)) // keep at most pool-1 so there's always a fresh option
    sessionStorage.setItem(`${SEEN_KEY}-${mode}`, JSON.stringify(updated))
  } catch {
    // ignore storage errors
  }
}

export function getRandomTonightMeal(mode: 'quick' | 'tired' | 'pantry'): TonightMeal {
  const pool = TONIGHT_MEALS[mode]
  const seen = getSeenIds(mode)
  const unseen = pool.filter((m) => !seen.includes(m.id))
  const candidates = unseen.length > 0 ? unseen : pool
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  recordSeen(mode, pick.id, pool.length)
  return pick
}

export function getTonightMealById(id: string): TonightMeal | null {
  const all = [...QUICK_MEALS, ...TIRED_MEALS, ...PANTRY_MEALS]
  return all.find((m) => m.id === id) ?? null
}

// ── Blurred weekly plan preview (fake data for upsell) ──

export const BLURRED_PLAN_PREVIEW = [
  { day: 'Monday', meal: 'Lemon Herb Chicken with Roasted Potatoes' },
  { day: 'Tuesday', meal: 'Turkey Bolognese with Hidden Veggies' },
  { day: 'Wednesday', meal: 'Teriyaki Chicken Stir-Fry' },
  { day: 'Thursday', meal: 'Sheet Pan Sausage & Sweet Potatoes' },
  { day: 'Friday', meal: 'Crispy Black Bean Tacos' },
  { day: 'Saturday', meal: 'Coconut Curry Lentil Soup' },
  { day: 'Sunday', meal: 'Slow Cooker Pot Roast & Veggies' },
]
