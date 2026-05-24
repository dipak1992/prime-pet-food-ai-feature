export type GrowthClusterId =
  | 'tonight'
  | 'weekly'
  | 'leftovers'
  | 'budget'
  | 'pantry'
  | 'commercial'

export type GrowthPageKind = 'cluster' | 'programmatic' | 'system'

export type GrowthPage = {
  slug: string
  kind: GrowthPageKind
  cluster: GrowthClusterId
  title: string
  description: string
  h1: string
  eyebrow: string
  intent: string
  primaryCta: string
  primaryHref: string
  secondaryCta?: string
  secondaryHref?: string
  meals: string[]
  groceryList: string[]
  steps: string[]
  tips: string[]
  faqs: Array<{ question: string; answer: string }>
  keywords: string[]
  budget?: string
  time?: string
  imagePrompt: string
}

export type GrowthTool = {
  slug: string
  title: string
  description: string
  h1: string
  cluster: GrowthClusterId
  mode:
    | 'tonight'
    | 'pantry'
    | 'budget'
    | 'family'
    | 'leftovers'
    | 'cost'
    | 'scanner'
    | 'macro'
    | 'pregnancy'
  cta: string
  sampleInputs: string[]
  outcomes: string[]
}

export const growthClusters: Record<
  GrowthClusterId,
  {
    label: string
    slug: string
    description: string
    keywords: string[]
  }
> = {
  tonight: {
    label: 'Tonight Dinner',
    slug: 'dinner-ideas-tonight',
    description: 'Fast dinner ideas for the nightly decision moment.',
    keywords: [
      "what's for dinner tonight",
      'easy dinner after work',
      '30 minute dinner ideas',
      'healthy dinner tonight',
      'family dinner ideas tonight',
    ],
  },
  weekly: {
    label: 'Weekly Planning',
    slug: 'weekly-meal-planner',
    description: 'Weekly dinner plans that turn into grocery lists.',
    keywords: [
      'weekly meal plan families',
      'cheap weekly meal plan',
      'meal prep for busy parents',
      '7 day dinner planner',
    ],
  },
  leftovers: {
    label: 'Leftovers',
    slug: 'leftover-recipe-ideas',
    description: 'Turn yesterday into lunches, dinners, and less waste.',
    keywords: ['what to do with leftover chicken', 'leftover rice recipes', 'use leftovers for lunch'],
  },
  budget: {
    label: 'Budget Meals',
    slug: 'cheap-weekly-meal-plan',
    description: 'Meal plans built around real grocery budgets.',
    keywords: ['$80 weekly meal plan', 'cheap healthy dinners', 'family meals under $15'],
  },
  pantry: {
    label: 'Pantry and Fridge',
    slug: 'pantry-recipe-finder',
    description: 'Recipe ideas from ingredients already in the kitchen.',
    keywords: [
      'what to cook with eggs rice chicken',
      'recipes from pantry ingredients',
      "what's in my fridge recipes",
    ],
  },
  commercial: {
    label: 'Meal Planning Apps',
    slug: 'ai-meal-planner',
    description: 'High-intent comparisons and app education.',
    keywords: ['best meal planning app for families', 'AI meal planner app', 'MealEase vs ChatGPT meal planning'],
  },
}

export const growthTools: GrowthTool[] = [
  {
    slug: 'tonight-dinner-generator',
    title: 'Tonight Dinner Generator',
    description: 'Generate a practical dinner idea for tonight based on time, energy, budget, and household size.',
    h1: 'Tonight Dinner Generator',
    cluster: 'tonight',
    mode: 'tonight',
    cta: "Plan tonight's dinner free",
    sampleInputs: ['20 minutes', 'family of 4', 'tired after work'],
    outcomes: ['one dinner idea', 'simple grocery gaps', 'leftover plan'],
  },
  {
    slug: 'pantry-recipe-finder',
    title: 'Pantry Recipe Finder',
    description: 'Enter pantry and fridge ingredients to get dinner ideas that use what you already have.',
    h1: 'Pantry Recipe Finder',
    cluster: 'pantry',
    mode: 'pantry',
    cta: "See what's in your fridge free",
    sampleInputs: ['eggs', 'rice', 'chicken', 'spinach'],
    outcomes: ['pantry-first recipes', 'missing ingredients', 'waste-reduction ideas'],
  },
  {
    slug: 'grocery-budget-calculator',
    title: 'Grocery Budget Calculator',
    description: 'Estimate a weekly dinner budget and turn it into meal ideas that fit your household.',
    h1: 'Grocery Budget Calculator',
    cluster: 'budget',
    mode: 'budget',
    cta: 'Generate a budget meal plan free',
    sampleInputs: ['$80 budget', '5 dinners', 'family of 4'],
    outcomes: ['target cost per dinner', 'budget meal mix', 'savings card'],
  },
  {
    slug: 'family-meal-plan-generator',
    title: 'Family Meal Plan Generator',
    description: 'Build a family-friendly dinner plan with leftovers and grocery categories.',
    h1: 'Family Meal Plan Generator',
    cluster: 'weekly',
    mode: 'family',
    cta: "Generate this week's dinners free",
    sampleInputs: ['2 adults', '2 kids', '5 weeknights'],
    outcomes: ['7-day dinner plan', 'kid-friendly swaps', 'grocery list'],
  },
  {
    slug: 'leftovers-converter',
    title: 'Leftovers Converter',
    description: 'Turn leftover chicken, rice, vegetables, pasta, or beans into a fresh meal.',
    h1: 'Leftovers Converter',
    cluster: 'leftovers',
    mode: 'leftovers',
    cta: 'Convert leftovers free',
    sampleInputs: ['leftover chicken', 'rice', 'roasted vegetables'],
    outcomes: ['next-day lunch', 'new dinner idea', 'freezer option'],
  },
  {
    slug: 'dinner-cost-estimator',
    title: 'Dinner Cost Estimator',
    description: 'Estimate the cost of a dinner before you shop and find cheaper swaps.',
    h1: 'Dinner Cost Estimator',
    cluster: 'budget',
    mode: 'cost',
    cta: 'Estimate dinner cost free',
    sampleInputs: ['chicken tacos', '4 servings', '$15 target'],
    outcomes: ['cost per serving', 'swap suggestions', 'shareable savings result'],
  },
  {
    slug: 'calories-meal-scanner',
    title: 'Meal Balance Scanner Teaser',
    description: 'Preview how MealEase can scan a meal and give nutrition-aware context without turning dinner into manual logging.',
    h1: 'Meal Balance Scanner',
    cluster: 'commercial',
    mode: 'scanner',
    cta: 'Try the scanner teaser',
    sampleInputs: ['plate photo', 'serving guess', 'meal goal'],
    outcomes: ['nutrition context', 'balanced swaps', 'saved meal history prompt'],
  },
  {
    slug: 'macro-target-meal-planner',
    title: 'Portion-Guided Dinner Planner',
    description:
      'Enter a dinner goal to get a portion-sized meal plan without tedious nutrition logging.',
    h1: 'Portion-Guided Dinner Planner',
    cluster: 'commercial',
    mode: 'macro',
    cta: 'Build a portion-guided dinner',
    sampleInputs: ['lighter dinner', 'protein-forward', 'chicken', 'rice', 'vegetables'],
    outcomes: ['portion sizing', 'nutrition-aware swaps', 'simple dinner plan'],
  },
  {
    slug: 'pregnancy-safe-meal-planner',
    title: 'Pregnancy-Safe Meal Planner',
    description:
      'Plan pregnancy-aware dinners using a due date, trimester cues, food safety rules, and household servings.',
    h1: 'Pregnancy-Safe Meal Planner',
    cluster: 'commercial',
    mode: 'pregnancy',
    cta: 'Plan a pregnancy-safe dinner',
    sampleInputs: ['due 2026-10-15', 'chicken', 'rice', 'spinach', 'nausea-friendly'],
    outcomes: ['trimester-aware', 'food safety checks', 'family servings'],
  },
]

const baseFaqs = [
  {
    question: 'Can I customize this for my household?',
    answer:
      'Yes. Use the free MealEase planner to adjust servings, budget, dislikes, leftovers, and weeknight time limits.',
  },
  {
    question: 'Does this replace a recipe blog?',
    answer:
      'No. These pages are meant to solve a planning problem first, then help you generate a plan that fits your kitchen.',
  },
]

const planSteps = [
  'Pick the nights that need dinner and mark the busiest evenings.',
  'Choose one easy anchor meal, one leftovers-friendly meal, and one pantry meal.',
  'Build the grocery list by produce, protein, pantry, dairy, and freezer.',
  'Save the plan so next week starts from what worked instead of a blank page.',
]

const pantrySteps = [
  'List the proteins, grains, vegetables, sauces, and dairy you already have.',
  'Start with meals that use the most perishable ingredient first.',
  'Add only one or two missing items to make the meal feel complete.',
  'Save the idea to your MealEase pantry so the next match is faster.',
]

const budgetSteps = [
  'Set a weekly dinner budget before choosing meals.',
  'Use beans, rice, pasta, eggs, rotisserie chicken, and frozen vegetables as flexible anchors.',
  'Plan leftovers as lunches so the grocery spend covers more meals.',
  'Track the estimate against your real receipt and reuse the winning plan.',
]

function makeFaq(topic: string) {
  return [
    {
      question: `What makes this ${topic} plan useful?`,
      answer:
        'It includes meal ideas, grocery categories, prep notes, and a direct path into a personalized MealEase plan.',
    },
    ...baseFaqs,
  ]
}

const clusterPages: GrowthPage[] = [
  {
    slug: 'dinner-ideas-tonight',
    kind: 'cluster',
    cluster: 'tonight',
    title: "Dinner Ideas Tonight | MealEase",
    description: 'Get practical dinner ideas for tonight based on time, energy, budget, and what is already in your kitchen.',
    h1: 'Dinner ideas for tonight',
    eyebrow: 'Tonight Dinner',
    intent: 'For the moment when everyone is hungry and nobody wants to decide.',
    primaryCta: "Plan tonight's dinner free",
    primaryHref: '/tools/tonight-dinner-generator',
    secondaryCta: 'Try pantry ideas',
    secondaryHref: '/tools/pantry-recipe-finder',
    meals: ['Lemon chicken rice bowls', 'Egg fried rice with frozen vegetables', 'Turkey taco skillet', 'Creamy tomato pasta with spinach'],
    groceryList: ['rice or pasta', 'quick protein', 'frozen vegetables', 'sauce or salsa', 'salad kit'],
    steps: ['Choose your energy level.', 'Use one ingredient you already have.', 'Pick a 20 to 30 minute meal.', 'Save the result for next week.'],
    tips: ['Keep one pantry dinner for tired nights.', 'Choose sheet-pan or skillet meals after work.', 'Plan tomorrow lunch from tonight leftovers.'],
    faqs: makeFaq('tonight dinner'),
    keywords: growthClusters.tonight.keywords,
    time: '15 to 30 minutes',
    imagePrompt: 'A warm overhead dinner card with chicken rice bowls, grocery notes, and a clean MealEase brand strip.',
  },
  {
    slug: 'weekly-meal-planner',
    kind: 'cluster',
    cluster: 'weekly',
    title: 'Weekly Meal Planner for Families | MealEase',
    description: 'Plan a week of family dinners with grocery lists, leftovers, busy-night meals, and budget awareness.',
    h1: 'Weekly meal planner for families',
    eyebrow: 'Weekly Planning',
    intent: 'For households that want fewer nightly decisions and fewer grocery surprises.',
    primaryCta: "Generate this week's dinners free",
    primaryHref: '/tools/family-meal-plan-generator',
    secondaryCta: 'See budget plans',
    secondaryHref: '/cheap-weekly-meal-plan',
    meals: ['Sheet-pan sausage and peppers', 'Chicken tortilla soup', 'Pesto pasta with peas', 'Rice bowl leftovers night'],
    groceryList: ['2 proteins', '2 grains', '3 vegetables', 'breakfast-for-dinner backup', 'lunch containers'],
    steps: planSteps,
    tips: ['Repeat one family favorite weekly.', 'Put the easiest meal on the hardest night.', 'Plan one leftovers night on purpose.'],
    faqs: makeFaq('weekly meal'),
    keywords: growthClusters.weekly.keywords,
    time: '7 dinners in 5 minutes',
    imagePrompt: 'A clean weekly dinner calendar with grocery categories and family-friendly meals.',
  },
  {
    slug: 'cheap-weekly-meal-plan',
    kind: 'cluster',
    cluster: 'budget',
    title: 'Cheap Weekly Meal Plan | MealEase',
    description: 'Build a budget-friendly weekly meal plan with cheap healthy dinners, leftovers, and grocery savings ideas.',
    h1: 'Cheap weekly meal plan',
    eyebrow: 'Budget Meals',
    intent: 'For families who need dinner to stay realistic and affordable.',
    primaryCta: 'Generate a budget meal plan free',
    primaryHref: '/tools/grocery-budget-calculator',
    secondaryCta: 'Estimate dinner costs',
    secondaryHref: '/tools/dinner-cost-estimator',
    meals: ['Bean and cheese burrito bowls', 'Chicken rice soup', 'Pasta with lentil marinara', 'Egg and potato skillet'],
    groceryList: ['rice', 'beans', 'eggs', 'pasta', 'frozen vegetables', 'budget protein'],
    steps: budgetSteps,
    tips: ['Anchor meals around low-cost staples.', 'Use meat as flavor in two meals instead of the center of every plate.', 'Cook once, reuse twice.'],
    faqs: makeFaq('budget meal'),
    keywords: growthClusters.budget.keywords,
    budget: '$80 to $120 weekly dinner range',
    imagePrompt: 'A grocery savings graphic showing a weekly meal plan, estimated total, and low-cost staple ingredients.',
  },
  {
    slug: 'pantry-recipe-finder',
    kind: 'cluster',
    cluster: 'pantry',
    title: 'Pantry Recipe Finder | MealEase',
    description: 'Find recipes from pantry and fridge ingredients you already have, then save the best ideas into MealEase.',
    h1: 'Pantry recipe finder',
    eyebrow: 'Pantry and Fridge',
    intent: 'For turning odds and ends into dinner before buying more groceries.',
    primaryCta: "See what's in your fridge free",
    primaryHref: '/tools/pantry-recipe-finder',
    secondaryCta: 'Try tonight generator',
    secondaryHref: '/tools/tonight-dinner-generator',
    meals: ['Chicken and rice skillet', 'Egg rice bowls', 'Chickpea pasta salad', 'Vegetable quesadillas'],
    groceryList: ['use what you have first', 'one fresh herb or sauce', 'one missing protein if needed'],
    steps: pantrySteps,
    tips: ['Sort by perishables first.', 'Use sauces to make repeat staples feel new.', 'Save pantry wins to repeat them.'],
    faqs: makeFaq('pantry recipe'),
    keywords: growthClusters.pantry.keywords,
    imagePrompt: 'A tidy fridge and pantry recipe board with ingredient chips and three dinner matches.',
  },
  {
    slug: 'leftover-recipe-ideas',
    kind: 'cluster',
    cluster: 'leftovers',
    title: 'Leftover Recipe Ideas | MealEase',
    description: 'Turn leftover chicken, rice, vegetables, pasta, and beans into lunches and dinners that feel new.',
    h1: 'Leftover recipe ideas',
    eyebrow: 'Leftovers',
    intent: 'For reducing food waste without eating the same dinner twice.',
    primaryCta: 'Convert leftovers free',
    primaryHref: '/tools/leftovers-converter',
    secondaryCta: 'Plan pantry meals',
    secondaryHref: '/tools/pantry-recipe-finder',
    meals: ['Leftover chicken tacos', 'Rice fritter bowls', 'Vegetable fried rice', 'Pasta frittata'],
    groceryList: ['wraps or rice', 'eggs', 'fresh greens', 'sauce', 'cheese or yogurt'],
    steps: ['Name the leftover anchor.', 'Choose a new format: bowl, wrap, soup, skillet, or salad.', 'Add texture and sauce.', 'Save the transformation.'],
    tips: ['Change the format, not every ingredient.', 'Use leftovers for lunch when dinner needs to feel fresh.', 'Freeze plain proteins before they expire.'],
    faqs: makeFaq('leftovers'),
    keywords: growthClusters.leftovers.keywords,
    imagePrompt: 'A before and after leftovers card turning roast chicken and rice into colorful lunch bowls.',
  },
  {
    slug: 'ai-meal-planner',
    kind: 'cluster',
    cluster: 'commercial',
    title: 'AI Meal Planner App for Families | MealEase',
    description: 'MealEase is an AI meal planner built for households, grocery lists, leftovers, budgets, and nightly dinner decisions.',
    h1: 'AI meal planner app for real households',
    eyebrow: 'Meal Planning Apps',
    intent: 'For people comparing AI meal planners and looking for a product built around daily dinner use.',
    primaryCta: 'Start planning free',
    primaryHref: '/signup',
    secondaryCta: 'Compare with ChatGPT',
    secondaryHref: '/blog/mealease-vs-chatgpt-for-meal-planning',
    meals: ['personalized tonight picks', 'weekly dinner plans', 'pantry-first recipes', 'leftovers reuse plans'],
    groceryList: ['household memory', 'budget mode', 'grocery list', 'pantry context', 'shareable plans'],
    steps: ['Set household size and preferences.', 'Generate tonight or weekly dinners.', 'Save the grocery list.', 'Reuse what worked next week.'],
    tips: ['MealEase remembers the kitchen context that generic prompts forget.', 'Use it before grocery shopping and again at 5 p.m.', 'Share weekly plans with the household.'],
    faqs: makeFaq('AI meal planner'),
    keywords: growthClusters.commercial.keywords,
    imagePrompt: 'A premium app interface showing AI weekly meal planning, grocery list, budget, and pantry panels.',
  },
]

const pageSeed: Array<{
  slug: string
  cluster: GrowthClusterId
  h1: string
  intent: string
  budget?: string
  time?: string
  meals: string[]
  groceryList: string[]
  steps: string[]
  tips: string[]
  primaryHref: string
}> = [
  {
    slug: 'meal-plan-for-family-of-4',
    cluster: 'weekly',
    h1: 'Meal plan for family of 4',
    intent: 'A practical week of dinners sized for two adults and two kids.',
    meals: ['Turkey taco bowls', 'Chicken pesto pasta', 'Breakfast-for-dinner eggs', 'Sheet-pan sausage', 'Rice bowl leftovers'],
    groceryList: ['ground turkey', 'chicken', 'pasta', 'eggs', 'rice', 'frozen vegetables'],
    steps: planSteps,
    tips: ['Use one protein twice.', 'Keep one flexible kid plate.', 'Make Friday a leftovers remix.'],
    primaryHref: '/tools/family-meal-plan-generator',
  },
  {
    slug: 'cheap-meal-plan-under-100',
    cluster: 'budget',
    h1: 'Cheap meal plan under $100',
    intent: 'A dinner plan that keeps the weekly grocery target under control.',
    budget: 'Under $100',
    meals: ['Bean chili', 'Chicken rice soup', 'Pasta marinara with lentils', 'Quesadillas', 'Egg fried rice'],
    groceryList: ['beans', 'rice', 'pasta', 'eggs', 'chicken thighs', 'frozen vegetables'],
    steps: budgetSteps,
    tips: ['Buy one larger protein pack.', 'Stretch meals with beans and rice.', 'Use sauces to avoid boredom.'],
    primaryHref: '/tools/grocery-budget-calculator',
  },
  {
    slug: 'high-protein-weekly-meal-plan',
    cluster: 'weekly',
    h1: 'High protein weekly meal plan',
    intent: 'A week of satisfying dinners with protein at the center.',
    meals: ['Greek chicken bowls', 'Turkey meatballs', 'Salmon rice plates', 'Egg and cottage cheese skillet', 'Bean chili'],
    groceryList: ['chicken breast', 'turkey', 'salmon', 'eggs', 'Greek yogurt', 'beans'],
    steps: planSteps,
    tips: ['Prep protein once for two meals.', 'Pair lean protein with filling grains.', 'Use yogurt sauces for flavor.'],
    primaryHref: '/tools/family-meal-plan-generator',
  },
  {
    slug: 'dinner-ideas-for-toddlers',
    cluster: 'tonight',
    h1: 'Dinner ideas for toddlers',
    intent: 'Simple family dinners that can be served toddler-friendly without cooking twice.',
    time: '20 to 35 minutes',
    meals: ['Mini turkey meatballs', 'Cheesy egg rice', 'Soft chicken quesadillas', 'Pasta with hidden veggie sauce'],
    groceryList: ['eggs', 'pasta', 'ground turkey', 'cheese', 'soft vegetables'],
    steps: ['Pick a soft texture.', 'Serve sauce on the side.', 'Cut pieces small.', 'Save the accepted meals.'],
    tips: ['Offer one familiar side.', 'Avoid making a separate dinner.', 'Repeat winning formats weekly.'],
    primaryHref: '/tools/tonight-dinner-generator',
  },
  {
    slug: 'meal-plan-for-busy-couples',
    cluster: 'weekly',
    h1: 'Meal plan for busy couples',
    intent: 'Low-effort dinners for two people with leftovers that do not take over the fridge.',
    meals: ['Salmon rice bowls', 'Chicken Caesar wraps', 'Pesto tortellini', 'Turkey lettuce cups', 'Soup and toast'],
    groceryList: ['salmon', 'tortellini', 'rotisserie chicken', 'greens', 'rice', 'soup vegetables'],
    steps: planSteps,
    tips: ['Plan three cooked meals and two assembly meals.', 'Use lunch leftovers intentionally.', 'Keep portions tight.'],
    primaryHref: '/tools/family-meal-plan-generator',
  },
]

const ingredientCombos = [
  ['chicken', 'rice'],
  ['eggs', 'rice'],
  ['eggs', 'rice', 'chicken'],
  ['ground beef', 'potatoes'],
  ['pasta', 'spinach'],
  ['chickpeas', 'rice'],
  ['tortillas', 'cheese'],
  ['rotisserie chicken', 'tortillas'],
  ['salmon', 'rice'],
  ['beans', 'corn'],
  ['canned tuna', 'pasta'],
  ['tofu', 'broccoli'],
  ['sausage', 'peppers'],
  ['lentils', 'tomatoes'],
  ['chicken', 'broccoli'],
  ['eggs', 'potatoes'],
  ['rice', 'frozen vegetables'],
  ['pasta', 'ground turkey'],
  ['sweet potatoes', 'black beans'],
  ['cottage cheese', 'eggs'],
]

const ingredientPages: GrowthPage[] = ingredientCombos.map((ingredients) => {
  const label = ingredients.join(' and ')
  return {
    slug: `what-to-cook-with-${ingredients.map((item) => item.replace(/\s+/g, '-')).join('-and-')}`,
    kind: 'programmatic',
    cluster: 'pantry',
    title: `What to Cook With ${titleCase(label)} | MealEase`,
    description: `Meal ideas, grocery gaps, and pantry-friendly dinner options for ${label}.`,
    h1: `What to cook with ${label}`,
    eyebrow: 'Pantry Dinner Ideas',
    intent: `For using ${label} before buying more groceries.`,
    primaryCta: "See what's in your fridge free",
    primaryHref: '/tools/pantry-recipe-finder',
    secondaryCta: 'Plan tonight free',
    secondaryHref: '/tools/tonight-dinner-generator',
    meals: [`${titleCase(label)} skillet`, `${titleCase(ingredients[0])} bowls`, `Fast ${ingredients.at(-1)} dinner`, 'Soup, wrap, or fried rice remix'],
    groceryList: [...ingredients, 'sauce', 'fresh greens', 'lemon or vinegar'],
    steps: pantrySteps,
    tips: ['Start with the most perishable item.', 'Use a sauce to connect the ingredients.', 'Turn extras into lunch bowls.'],
    faqs: makeFaq(label),
    keywords: [`what to cook with ${label}`, `${label} recipes`, 'pantry recipe finder'],
    time: '20 to 35 minutes',
    imagePrompt: `A Pinterest-ready pantry meal graphic featuring ${label}, recipe cards, and grocery gap chips.`,
  }
})

const audiencePages = [
  ['meal-plan-for-family-of-3', 'weekly', 'Meal plan for family of 3', 'A balanced dinner week for smaller households.'],
  ['meal-plan-for-family-of-5', 'weekly', 'Meal plan for family of 5', 'Flexible dinners with enough leftovers for lunch.'],
  ['meal-plan-for-two-adults', 'weekly', 'Meal plan for two adults', 'Simple dinners for two without overbuying groceries.'],
  ['meal-plan-for-picky-eaters', 'weekly', 'Meal plan for picky eaters', 'Family dinners with flexible components and safe sides.'],
  ['meal-plan-for-busy-parents', 'weekly', 'Meal plan for busy parents', 'Weeknight meals that fit school, work, and low energy.'],
  ['healthy-dinner-ideas-tonight', 'tonight', 'Healthy dinner ideas tonight', 'Fast dinners that feel balanced without a complicated recipe.'],
  ['easy-dinner-after-work', 'tonight', 'Easy dinner after work', 'Low-effort meals for tired weeknights.'],
  ['30-minute-dinner-ideas', 'tonight', '30 minute dinner ideas', 'Dinner ideas that can be cooked before the evening unravels.'],
  ['family-dinner-ideas-tonight', 'tonight', 'Family dinner ideas tonight', 'Dinner ideas that work for adults and kids.'],
  ['what-to-do-with-leftover-chicken', 'leftovers', 'What to do with leftover chicken', 'Turn leftover chicken into dinners and lunches that feel new.'],
  ['leftover-rice-recipes', 'leftovers', 'Leftover rice recipes', 'Fast ways to turn leftover rice into a full meal.'],
  ['use-leftovers-for-lunch', 'leftovers', 'Use leftovers for lunch', 'Lunch ideas that reduce waste and save money.'],
  ['family-meals-under-15', 'budget', 'Family meals under $15', 'Affordable dinners sized for a household.'],
  ['80-weekly-meal-plan', 'budget', '$80 weekly meal plan', 'A low-cost week of dinners built around staple ingredients.'],
  ['cheap-healthy-dinners', 'budget', 'Cheap healthy dinners', 'Budget dinners that still feel balanced.'],
  ['meal-prep-for-busy-parents', 'weekly', 'Meal prep for busy parents', 'Prep light dinners without spending Sunday in the kitchen.'],
  ['7-day-dinner-planner', 'weekly', '7 day dinner planner', 'A simple dinner calendar with grocery planning built in.'],
  ['best-meal-planning-app-for-families', 'commercial', 'Best meal planning app for families', 'How to choose a meal planner that fits household life.'],
  ['mealease-vs-chatgpt-meal-planning', 'commercial', 'MealEase vs ChatGPT meal planning', 'A practical comparison for recurring dinner planning.'],
  ['ai-meal-planner-for-budget-groceries', 'commercial', 'AI meal planner for budget groceries', 'Use AI to plan dinners around a real grocery budget.'],
  ['grocery-list-generator-for-meal-plans', 'weekly', 'Grocery list generator for meal plans', 'Turn dinner ideas into a categorized shopping list.'],
  ['dinner-cost-estimator-for-families', 'budget', 'Dinner cost estimator for families', 'Estimate dinner cost before the grocery trip.'],
  ['leftover-rotisserie-chicken-ideas', 'leftovers', 'Leftover rotisserie chicken ideas', 'Stretch a rotisserie chicken into more than one meal.'],
  ['pantry-meals-no-shopping', 'pantry', 'Pantry meals with no shopping', 'Dinner ideas that start with what is already at home.'],
  ['fridge-cleanout-dinner-ideas', 'pantry', 'Fridge cleanout dinner ideas', 'Use perishable ingredients before they become waste.'],
] as const

const audienceGrowthPages: GrowthPage[] = audiencePages.map(([slug, cluster, h1, intent]) => {
  const clusterId = cluster as GrowthClusterId
  const isBudget = clusterId === 'budget'
  const isPantry = clusterId === 'pantry'
  const isLeftovers = clusterId === 'leftovers'
  const isTonight = clusterId === 'tonight'

  return {
    slug,
    kind: 'programmatic',
    cluster: clusterId,
    title: `${h1} | MealEase`,
    description: `${intent} Includes meal ideas, grocery notes, planning steps, and a free MealEase tool.`,
    h1,
    eyebrow: growthClusters[clusterId].label,
    intent,
    primaryCta: isBudget
      ? 'Generate a budget meal plan free'
      : isPantry
        ? "See what's in your fridge free"
        : isLeftovers
          ? 'Convert leftovers free'
          : isTonight
            ? "Plan tonight's dinner free"
            : 'Generate this plan free',
    primaryHref: isBudget
      ? '/tools/grocery-budget-calculator'
      : isPantry
        ? '/tools/pantry-recipe-finder'
        : isLeftovers
          ? '/tools/leftovers-converter'
          : isTonight
            ? '/tools/tonight-dinner-generator'
            : clusterId === 'commercial'
              ? '/signup'
              : '/tools/family-meal-plan-generator',
    secondaryCta: 'Browse free tools',
    secondaryHref: '/tools',
    meals: isLeftovers
      ? ['Chicken taco bowls', 'Rice fritters', 'Vegetable soup', 'Pasta frittata']
      : isBudget
        ? ['Bean chili', 'Egg fried rice', 'Pasta with lentil sauce', 'Chicken potato skillet']
        : ['Chicken rice bowls', 'Turkey taco skillet', 'Pasta with greens', 'Sheet-pan sausage'],
    groceryList: isBudget
      ? ['beans', 'rice', 'eggs', 'pasta', 'frozen vegetables']
      : ['protein', 'grain', 'vegetables', 'sauce', 'leftover container'],
    steps: isBudget ? budgetSteps : isPantry ? pantrySteps : planSteps,
    tips: ['Keep the plan flexible.', 'Reuse what works.', 'Save the result so the next plan starts faster.'],
    faqs: makeFaq(h1.toLowerCase()),
    keywords: [h1.toLowerCase(), ...growthClusters[clusterId].keywords],
    budget: isBudget ? '$15 or less per family dinner' : undefined,
    time: isTonight ? '30 minutes or less' : undefined,
    imagePrompt: `A premium MealEase visual for ${h1}, including dinner cards, grocery notes, and a clear CTA.`,
  }
})

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const growthPages: GrowthPage[] = [...clusterPages, ...pageSeed.map(seedToPage), ...ingredientPages, ...audienceGrowthPages].slice(0, 56)

function seedToPage(seed: (typeof pageSeed)[number]): GrowthPage {
  return {
    slug: seed.slug,
    kind: 'programmatic',
    cluster: seed.cluster,
    title: `${seed.h1} | MealEase`,
    description: `${seed.intent} Includes dinner ideas, grocery categories, prep steps, and a free MealEase generator.`,
    h1: seed.h1,
    eyebrow: growthClusters[seed.cluster].label,
    intent: seed.intent,
    primaryCta: seed.cluster === 'budget' ? 'Generate a budget meal plan free' : 'Generate this plan free',
    primaryHref: seed.primaryHref,
    secondaryCta: 'Browse free tools',
    secondaryHref: '/tools',
    meals: seed.meals,
    groceryList: seed.groceryList,
    steps: seed.steps,
    tips: seed.tips,
    faqs: makeFaq(seed.h1.toLowerCase()),
    keywords: [seed.h1.toLowerCase(), ...growthClusters[seed.cluster].keywords],
    budget: seed.budget,
    time: seed.time,
    imagePrompt: `A clean MealEase Pinterest graphic for ${seed.h1}, with a meal calendar, grocery list, and savings note.`,
  }
}

export const contentRepurposingPipeline = [
  'SEO page or article',
  '3 short-form scripts',
  '5 Pinterest pin prompts',
  '1 email idea',
  '1 Facebook group prompt',
  '1 in-app CTA',
]

export const analyticsKpis = [
  'organic_sessions_by_cluster',
  'tool_start',
  'tool_completion',
  'tool_to_signup_rate',
  'share_card_created',
  'pinterest_pin_generated',
  'referral_invite_sent',
  'referral_signup',
  'programmatic_page_signup_rate',
  'free_to_paid_by_source',
]

export function getGrowthPage(slug: string) {
  return growthPages.find((page) => page.slug === slug)
}

export function getGrowthTool(slug: string) {
  return growthTools.find((tool) => tool.slug === slug)
}

export function getRelatedGrowthPages(page: GrowthPage, limit = 6) {
  return growthPages
    .filter((candidate) => candidate.slug !== page.slug && candidate.cluster === page.cluster)
    .slice(0, limit)
}
