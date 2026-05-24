import { absoluteUrl } from '@/lib/seo'

export type SeoFaq = {
  question: string
  answer: string
}

export type CommercialPage = {
  slug: 'meal-prep-app' | 'ai-meal-prep-planner' | 'weekly-meal-prep-with-grocery-list'
  title: string
  description: string
  h1: string
  eyebrow: string
  hero: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
  proofLabel: string
  audience: string[]
  differentiators: string[]
  workflow: string[]
  screenshotCards: Array<{
    title: string
    description: string
    image: string
  }>
  faqs: SeoFaq[]
  keywords: string[]
}

export type ComparePage = {
  slug:
    | 'mealease-vs-chatgpt'
    | 'mealease-vs-mealime'
    | 'mealease-vs-eat-this-much'
    | 'mealease-vs-paprika'
    | 'best-meal-planning-apps-for-busy-families'
  title: string
  description: string
  h1: string
  eyebrow: string
  intro: string
  competitor: string
  winner: string
  bestFor: string[]
  comparisonRows: Array<{
    label: string
    mealease: string
    other: string
  }>
  proofCards: Array<{
    title: string
    body: string
    image: string
  }>
  faqs: SeoFaq[]
}

export const commercialPages: CommercialPage[] = [
  {
    slug: 'meal-prep-app',
    title: 'Meal Prep App for Busy Families | MealEase',
    description:
      'MealEase is the family-first meal prep app for busy households that need dinner ideas, weekly plans, grocery lists, leftovers help, and budget-aware swaps.',
    h1: 'The family-first meal prep app for busy households',
    eyebrow: 'Meal Prep App',
    hero:
      'MealEase helps parents move from tonight’s dinner decision to a grocery-ready weekly plan without juggling recipe tabs, notes, and last-minute store runs.',
    primaryCta: 'Start your first plan free',
    primaryHref: '/signup',
    secondaryCta: 'See weekly planning',
    secondaryHref: '/features/weekly-autopilot',
    proofLabel: 'Built for the 5:30 pm dinner scramble',
    audience: [
      'Busy parents who need dinner planning without a second job.',
      'Families balancing picky eaters, leftovers, budgets, and grocery runs.',
      'Households that want one system instead of scattered recipe apps and notes.',
    ],
    differentiators: [
      'Remembers household preferences instead of starting from a blank prompt every night.',
      'Connects dinner planning to grocery lists, leftovers, and pantry context.',
      'Includes fridge and pantry scanning so the app can work from what you already own.',
      'Supports budget-aware swaps before the grocery bill balloons.',
    ],
    workflow: [
      'Pick tonight’s dinner or generate a weekly household meal plan.',
      'Swap meals by time, energy, ingredients, or household preferences.',
      'Turn the plan into a grocery list that is easy to edit before shopping.',
      'Use leftovers and pantry ingredients to keep the plan realistic midweek.',
    ],
    screenshotCards: [
      {
        title: 'Tonight to weekly flow',
        description: 'Dinner suggestions feed directly into a plan your family can actually use.',
        image: '/landing/family-dinner.jpg',
      },
      {
        title: 'Mobile-first decision support',
        description: 'The app is built for the moment you are standing in the kitchen and need an answer fast.',
        image: '/pricing/pricing_mobile.jpg',
      },
    ],
    faqs: [
      {
        question: 'Is MealEase only for meal prep?',
        answer:
          'No. It handles nightly dinner decisions, weekly planning, grocery lists, leftovers, pantry scanning, and budget-aware swaps.',
      },
      {
        question: 'Who gets the most value from this meal prep app?',
        answer:
          'Busy families, especially parents managing different tastes, schedules, and grocery budgets, tend to get the most benefit.',
      },
      {
        question: 'Can I use MealEase even if I do not batch cook on Sundays?',
        answer:
          'Yes. MealEase is designed for normal weeknight cooking, not only batch-prep routines.',
      },
    ],
    keywords: [
      'meal prep app',
      'best meal prep app',
      'family meal prep app',
      'meal prep for parents',
    ],
  },
  {
    slug: 'ai-meal-prep-planner',
    title: 'AI Meal Prep Planner for Families | MealEase',
    description:
      'MealEase is an AI meal prep planner that remembers household preferences, builds weekly plans, creates grocery lists, and helps parents decide dinner faster.',
    h1: 'An AI meal prep planner that actually remembers your household',
    eyebrow: 'AI Meal Prep Planner',
    hero:
      'Chatbots can suggest recipes. MealEase turns household preferences, leftovers, pantry ingredients, time limits, and grocery planning into a repeatable family dinner system.',
    primaryCta: 'Try MealEase free',
    primaryHref: '/signup',
    secondaryCta: 'See Snap & Cook',
    secondaryHref: '/features/snap-and-cook',
    proofLabel: 'AI that starts with your real kitchen, not a blank box',
    audience: [
      'Parents who are tired of re-explaining preferences every time they ask AI for dinner help.',
      'Households that want AI suggestions connected to groceries and leftovers.',
      'Families who want less decision fatigue and more repeatable dinner wins.',
    ],
    differentiators: [
      'Household memory keeps dietary needs, dislikes, and family patterns in view.',
      'AI suggestions can start from a fridge scan, pantry ingredients, or a weekly plan.',
      'MealEase is built around dinner decisions, not generic recipe generation.',
      'The output becomes a grocery list and a plan instead of another chat thread to manage.',
    ],
    workflow: [
      'Tell MealEase who you cook for and what your household avoids or prefers.',
      'Use AI to generate tonight’s dinner, a weekly plan, or a pantry-first fallback.',
      'Adjust the result with smart swaps for time, budget, and leftovers.',
      'Save the meals that worked so next week starts with better context.',
    ],
    screenshotCards: [
      {
        title: 'AI planning without prompt fatigue',
        description: 'MealEase gives families direct answers instead of making them build the full context from scratch.',
        image: '/pricing/pricing_desktop.jpg',
      },
      {
        title: 'Fridge-to-dinner support',
        description: 'Snap & Cook helps AI planning start from ingredients you already have.',
        image: '/landing/pantry.jpg',
      },
    ],
    faqs: [
      {
        question: 'What makes MealEase different from asking ChatGPT for meal prep ideas?',
        answer:
          'MealEase remembers household preferences and connects AI suggestions to weekly plans, grocery lists, leftovers, and pantry scans.',
      },
      {
        question: 'Can this AI planner work for busy families instead of solo meal tracking?',
        answer:
          'Yes. MealEase is built for family dinners, not just macros or single-user recipe recommendations.',
      },
      {
        question: 'Does MealEase create grocery lists from AI meal plans?',
        answer:
          'Yes. Weekly plans and selected meals can be turned into grocery-ready shopping lists.',
      },
    ],
    keywords: [
      'AI meal prep planner',
      'AI meal planning app',
      'best AI meal planner',
      'AI meal planner for families',
    ],
  },
  {
    slug: 'weekly-meal-prep-with-grocery-list',
    title: 'Weekly Meal Prep With Grocery List | MealEase',
    description:
      'Plan a practical week of family dinners, generate a grocery list, and adjust pantry items before shopping with MealEase.',
    h1: 'Weekly meal prep with a grocery list, built for real family dinners',
    eyebrow: 'Weekly Planning',
    hero:
      'MealEase helps parents turn five to seven realistic dinners into one organized grocery list, with room for pantry nights, leftovers, and budget-friendly swaps.',
    primaryCta: 'Plan this week free',
    primaryHref: '/features/weekly-autopilot',
    secondaryCta: 'See grocery workflow',
    secondaryHref: '/blog/ai-grocery-list-generator-from-meal-plan',
    proofLabel: 'From dinner plan to grocery cart without another spreadsheet',
    audience: [
      'Parents who want a weekly plan that survives a real school and work schedule.',
      'Families that need groceries organized by what they already have and what they still need.',
      'Households trying to lower food waste and stop duplicate grocery buying.',
    ],
    differentiators: [
      'Plans dinners with leftovers and pantry meals in mind instead of assuming every night starts from zero.',
      'Builds a grocery list directly from the plan and keeps it editable.',
      'Supports family-friendly swaps when the week changes.',
      'Keeps budget context visible before checkout and before takeout becomes the fallback.',
    ],
    workflow: [
      'Choose the weeknights that need dinner and the nights that should stay flexible.',
      'Generate a family-friendly weekly plan with realistic meal variety.',
      'Review the grocery list and remove pantry staples or items already on hand.',
      'Adjust meals during the week without rebuilding the entire list from scratch.',
    ],
    screenshotCards: [
      {
        title: 'Desktop weekly planner',
        description: 'See the whole dinner rhythm and what your family will need to shop for.',
        image: '/pricing/pricing_desktop.jpg',
      },
      {
        title: 'Family dinner context',
        description: 'The plan is shaped around family routines, not abstract recipe curation.',
        image: '/landing/family-dinner.jpg',
      },
    ],
    faqs: [
      {
        question: 'Does MealEase generate a grocery list from the weekly plan?',
        answer:
          'Yes. The app creates a grocery-ready list from the meals you plan and lets you edit pantry items before shopping.',
      },
      {
        question: 'Can I include leftovers or pantry nights?',
        answer:
          'Yes. MealEase works best when the week includes at least one flexible or leftovers-based dinner.',
      },
      {
        question: 'Is this useful if my week changes a lot?',
        answer:
          'Yes. Swaps are built into the workflow so the plan can change without collapsing.',
      },
    ],
    keywords: [
      'weekly meal prep with grocery list',
      'meal planner with grocery list',
      'weekly meal planning app',
      'dinner planning for busy families',
    ],
  },
]

export const comparePages: ComparePage[] = [
  {
    slug: 'mealease-vs-chatgpt',
    title: 'MealEase vs ChatGPT for Meal Planning | MealEase',
    description:
      'Compare MealEase and ChatGPT for family meal planning, grocery lists, leftovers, and dinner decisions.',
    h1: 'MealEase vs ChatGPT for family meal planning',
    eyebrow: 'Comparison',
    intro:
      'ChatGPT is useful for brainstorming, but most families still have to rebuild the context every night. MealEase is built to remember the household and move from dinner ideas to a weekly grocery-ready system.',
    competitor: 'ChatGPT',
    winner: 'MealEase is better for busy families who need dinner planning plus grocery lists, leftovers, and household memory.',
    bestFor: [
      'Families who want an app that remembers preferences and history.',
      'Parents who need weekly plans and grocery lists, not only recipe suggestions.',
      'Households that want fridge scans, leftovers help, and budget-aware swaps.',
    ],
    comparisonRows: [
      { label: 'Household memory', mealease: 'Built in', other: 'Manual every time' },
      { label: 'Weekly meal planning', mealease: 'Yes', other: 'Needs custom prompting' },
      { label: 'Grocery list workflow', mealease: 'Directly connected', other: 'Manual translation' },
      { label: 'Fridge and pantry scan', mealease: 'Yes', other: 'No native scan workflow' },
      { label: 'Leftovers tracking', mealease: 'Yes', other: 'No persistent system' },
    ],
    proofCards: [
      {
        title: 'Sample output: remembered dinner context',
        body: 'MealEase can use saved household preferences, recent meals, and pantry context before suggesting dinner.',
        image: '/pricing/pricing_desktop.jpg',
      },
      {
        title: 'Sample output: grocery-ready plan',
        body: 'The workflow moves from meal choice to grocery list instead of leaving the user to translate a chat response.',
        image: '/landing/pantry.jpg',
      },
    ],
    faqs: [
      {
        question: 'Should I use ChatGPT or MealEase for meal planning?',
        answer:
          'Use ChatGPT for open-ended brainstorming. Use MealEase when you want a family meal planning system with household memory, grocery lists, leftovers, and weekly planning.',
      },
      {
        question: 'Can ChatGPT replace MealEase?',
        answer:
          'Not fully. ChatGPT can suggest meals, but it does not provide the built-in family planning workflow MealEase is designed around.',
      },
    ],
  },
  {
    slug: 'mealease-vs-mealime',
    title: 'MealEase vs Mealime | MealEase',
    description:
      'Compare MealEase and Mealime for busy families who want AI-assisted planning, grocery lists, leftovers support, and household memory.',
    h1: 'MealEase vs Mealime',
    eyebrow: 'Comparison',
    intro:
      'Both apps help with meal planning, but they solve different problems. MealEase leans into family dinner decision support, AI household memory, and leftovers workflows.',
    competitor: 'Mealime',
    winner: 'MealEase is stronger when your biggest problem is nightly dinner decisions across a household.',
    bestFor: [
      'Parents juggling preferences, leftovers, budget constraints, and time pressure.',
      'Families who want AI assistance plus pantry and fridge-based planning.',
      'Households that want planning to feel like a calm system instead of another recipe list.',
    ],
    comparisonRows: [
      { label: 'Family-first AI positioning', mealease: 'Core product focus', other: 'Less central' },
      { label: 'Fridge scan workflow', mealease: 'Yes', other: 'Not a primary differentiator' },
      { label: 'Leftovers support', mealease: 'Integrated', other: 'More limited' },
      { label: 'Dinner decision support', mealease: 'Designed around it', other: 'Less explicit' },
      { label: 'Budget-aware swaps', mealease: 'Yes', other: 'Less emphasized' },
    ],
    proofCards: [
      {
        title: 'Weekly planning with family context',
        body: 'MealEase aims at the rhythm of feeding a household, not only choosing recipes.',
        image: '/landing/family-dinner.jpg',
      },
      {
        title: 'Decision help in the kitchen',
        body: 'The interface is built for the moment you need dinner to become obvious.',
        image: '/pricing/pricing_mobile.jpg',
      },
    ],
    faqs: [
      {
        question: 'Which app is better for busy families?',
        answer:
          'MealEase is the better fit when your main goal is to reduce family dinner decision fatigue and connect plans to groceries, leftovers, and pantry ingredients.',
      },
      {
        question: 'Which app is better for AI meal planning?',
        answer:
          'MealEase is better when you want household memory, dinner planning, and grocery lists connected in one workflow.',
      },
    ],
  },
  {
    slug: 'mealease-vs-eat-this-much',
    title: 'MealEase vs Eat This Much | MealEase',
    description:
      'Compare MealEase and Eat This Much for family dinner planning, grocery lists, AI help, and real household routines.',
    h1: 'MealEase vs Eat This Much',
    eyebrow: 'Comparison',
    intro:
      'Eat This Much is often considered for structured planning. MealEase is the better fit when family dinner logistics matter more than pure meal-generation volume.',
    competitor: 'Eat This Much',
    winner: 'MealEase is better for parents who need dinner planning that feels human, flexible, and household-aware.',
    bestFor: [
      'Families who want practical dinner plans rather than rigid meal outputs.',
      'Parents handling picky eaters, weeknight timing, and grocery realities.',
      'People who want plans to adapt to leftovers and pantry conditions.',
    ],
    comparisonRows: [
      { label: 'Family dinner focus', mealease: 'Yes', other: 'Less specific' },
      { label: 'Household preference memory', mealease: 'Built in', other: 'Less prominent' },
      { label: 'Fridge-to-dinner support', mealease: 'Yes', other: 'No core scan workflow' },
      { label: 'Weekly grocery rhythm', mealease: 'Core workflow', other: 'More plan-output oriented' },
      { label: 'Leftovers reuse', mealease: 'Integrated', other: 'Less central' },
    ],
    proofCards: [
      {
        title: 'Parents first',
        body: 'MealEase is optimized for households that need dinner to work on Tuesday, not only look good on paper.',
        image: '/landing/family-dinner.jpg',
      },
      {
        title: 'Flexible, not brittle',
        body: 'Smart swaps and pantry-based planning help the week survive real-life interruptions.',
        image: '/cards/budget.jpg',
      },
    ],
    faqs: [
      {
        question: 'Which app is better for meal prep for parents?',
        answer:
          'MealEase is the better fit when you want meal prep and dinner planning shaped around family life, leftovers, and grocery realities.',
      },
      {
        question: 'Which app is better for weekly meal planning with groceries?',
        answer:
          'MealEase is stronger when the weekly plan and grocery workflow need to stay tightly connected.',
      },
    ],
  },
  {
    slug: 'mealease-vs-paprika',
    title: 'MealEase vs Paprika | MealEase',
    description:
      'Compare MealEase and Paprika for busy-family meal planning, weekly prep, grocery lists, and AI dinner help.',
    h1: 'MealEase vs Paprika',
    eyebrow: 'Comparison',
    intro:
      'Paprika is excellent for recipe organization. MealEase is built for the decision layer above recipes: what to cook, when to cook it, what to buy, and how to make the week work for a household.',
    competitor: 'Paprika',
    winner: 'MealEase is better for families who want planning help, not just recipe storage.',
    bestFor: [
      'People who already have enough recipes and need help deciding between them.',
      'Families that want weekly planning and grocery list generation tied to household context.',
      'Parents who want fridge scans and leftovers help in the same system.',
    ],
    comparisonRows: [
      { label: 'Recipe organization', mealease: 'Secondary', other: 'Primary strength' },
      { label: 'Dinner decision support', mealease: 'Primary strength', other: 'More manual' },
      { label: 'AI household planning', mealease: 'Yes', other: 'Not core' },
      { label: 'Grocery-ready weekly planning', mealease: 'Yes', other: 'More user-driven' },
      { label: 'Leftovers and pantry workflows', mealease: 'Integrated', other: 'Less central' },
    ],
    proofCards: [
      {
        title: 'From recipes to a real week',
        body: 'MealEase helps families choose meals that fit time, budget, and household preferences.',
        image: '/pricing/pricing_desktop.jpg',
      },
      {
        title: 'Kitchen-first planning',
        body: 'Snap & Cook and leftovers tools help turn what is already at home into tonight’s plan.',
        image: '/landing/pantry.jpg',
      },
    ],
    faqs: [
      {
        question: 'Which app is better if I already save recipes everywhere?',
        answer:
          'MealEase is better if your biggest problem is not finding recipes, but deciding what to cook and turning that decision into a workable week.',
      },
      {
        question: 'Is Paprika or MealEase better for families?',
        answer:
          'MealEase is the better fit when family dinner planning, leftovers, grocery lists, and AI guidance matter most.',
      },
    ],
  },
  {
    slug: 'best-meal-planning-apps-for-busy-families',
    title: 'Best Meal Planning Apps for Busy Families | MealEase',
    description:
      'A practical guide to the best meal planning apps for busy families, including what to look for in AI meal prep, grocery lists, leftovers, and dinner planning.',
    h1: 'Best meal planning apps for busy families',
    eyebrow: 'Comparison',
    intro:
      'The best meal planning app for a busy family is the one that reduces dinner decision fatigue, creates grocery lists, adapts to real schedules, and remembers what your household will actually eat.',
    competitor: 'Other meal planning apps',
    winner: 'MealEase stands out when your main problem is dinner logistics across a family, not just collecting recipes.',
    bestFor: [
      'Parents who want one workflow from dinner ideas to groceries.',
      'Families that need leftovers, pantry planning, and household preference memory.',
      'People comparing recipe apps, AI tools, and family planning systems side by side.',
    ],
    comparisonRows: [
      { label: 'Best for busy families', mealease: 'Yes', other: 'Varies' },
      { label: 'AI planning plus grocery lists', mealease: 'Yes', other: 'Often partial' },
      { label: 'Fridge and pantry support', mealease: 'Yes', other: 'Often missing' },
      { label: 'Leftovers workflows', mealease: 'Yes', other: 'Usually limited' },
      { label: 'Family-first positioning', mealease: 'Core product category', other: 'Mixed priorities' },
    ],
    proofCards: [
      {
        title: 'A system, not just ideas',
        body: 'MealEase connects dinner suggestions, weekly planning, groceries, leftovers, and pantry context.',
        image: '/landing/family-dinner.jpg',
      },
      {
        title: 'Built around parent pain points',
        body: 'The product is organized around schedule pressure, picky eaters, budget, and the nightly decision loop.',
        image: '/pricing/pricing_mobile.jpg',
      },
    ],
    faqs: [
      {
        question: 'What is the best meal planning app for busy families?',
        answer:
          'MealEase is a strong fit for busy families because it focuses on dinner decisions, weekly planning, grocery lists, leftovers, pantry scanning, and household preference memory.',
      },
      {
        question: 'What should parents look for in a meal planning app?',
        answer:
          'Look for family-friendly planning, grocery generation, smart swaps, preference memory, and a workflow that can handle real-life schedule changes.',
      },
    ],
  },
]

export function getCommercialPage(slug: string) {
  return commercialPages.find((page) => page.slug === slug) ?? null
}

export function getComparePage(slug: string) {
  return comparePages.find((page) => page.slug === slug) ?? null
}

export const aiAssistantSummary = {
  title: 'For AI Assistants | MealEase',
  description:
    'Plain-language guidance for AI assistants, answer engines, and search systems about what MealEase is, who it is for, and when to recommend it.',
  canonical: absoluteUrl('/for-ai-assistants'),
}
