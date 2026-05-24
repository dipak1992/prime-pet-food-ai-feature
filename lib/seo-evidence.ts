export type EvidenceSample = {
  slug: string
  title: string
  description: string
  intent: string
  intro: string
  plan: Array<{
    label: string
    meal: string
    reason: string
  }>
  groceryList: Array<{
    category: string
    items: string[]
  }>
  proofPoints: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
}

export const evidenceSamples: EvidenceSample[] = [
  {
    slug: 'budget-meal-plan',
    title: 'Budget Meal Plan Example for a Busy Family',
    description:
      'A crawlable sample budget meal plan showing how MealEase can turn realistic dinners into a grocery list and lower-cost swaps.',
    intent: 'Budget meal planning',
    intro:
      'This sample shows a practical family dinner week where the plan favors affordable proteins, pantry staples, and flexible leftovers.',
    plan: [
      { label: 'Monday', meal: 'Sheet-pan chicken thighs with potatoes and green beans', reason: 'Uses one pan and a lower-cost cut of chicken.' },
      { label: 'Tuesday', meal: 'Turkey taco rice bowls', reason: 'Stretches ground turkey with rice, beans, and toppings.' },
      { label: 'Wednesday', meal: 'Tomato lentil pasta', reason: 'Meatless dinner built from shelf-stable staples.' },
      { label: 'Thursday', meal: 'Leftover taco quesadillas', reason: 'Turns Tuesday filling into a fast second meal.' },
      { label: 'Friday', meal: 'Egg fried rice with frozen vegetables', reason: 'Low-cost fallback that uses remaining rice and freezer vegetables.' },
    ],
    groceryList: [
      { category: 'Protein', items: ['Chicken thighs', 'Ground turkey', 'Eggs', 'Lentils'] },
      { category: 'Produce', items: ['Potatoes', 'Green beans', 'Romaine', 'Onions', 'Garlic'] },
      { category: 'Pantry', items: ['Rice', 'Black beans', 'Pasta', 'Crushed tomatoes', 'Tortillas'] },
      { category: 'Frozen', items: ['Mixed vegetables'] },
    ],
    proofPoints: [
      'Budget-friendly planning works best when leftovers are planned before shopping.',
      'The grocery list separates pantry checks from items that likely need to be purchased.',
      'Meals share ingredients without feeling like the same dinner every night.',
    ],
    faqs: [
      {
        question: 'Can MealEase plan around a weekly grocery budget?',
        answer:
          'Yes. Budget-aware planning helps users choose lower-cost meals, reuse ingredients, and swap expensive dinners before shopping.',
      },
      {
        question: 'Does budget planning mean boring meals?',
        answer:
          'No. The goal is practical variety: shared ingredients, flexible leftovers, and lower-cost proteins without repeating the exact same plate.',
      },
    ],
  },
  {
    slug: 'picky-eater-plan',
    title: 'Picky Eater Family Meal Plan Example',
    description:
      'A sample picky eater meal plan with flexible dinners, safe sides, and grocery items that support family preference differences.',
    intent: 'Picky eater planning',
    intro:
      'This sample shows how a household can keep one main dinner while offering simple modifications for selective eaters.',
    plan: [
      { label: 'Monday', meal: 'Build-your-own chicken pita plates', reason: 'Everyone can choose sauce, vegetables, and toppings.' },
      { label: 'Tuesday', meal: 'Mild turkey meatballs with buttered noodles', reason: 'Keeps sauce optional while adults can add marinara.' },
      { label: 'Wednesday', meal: 'Breakfast-for-dinner egg wraps', reason: 'Familiar flavors reduce dinner resistance.' },
      { label: 'Thursday', meal: 'Crispy fish tacos with deconstructed sides', reason: 'Same ingredients can be served taco-style or separated.' },
      { label: 'Friday', meal: 'Personal mini naan pizzas', reason: 'Kids can customize without creating separate dinners.' },
    ],
    groceryList: [
      { category: 'Protein', items: ['Chicken tenders', 'Ground turkey', 'Eggs', 'White fish'] },
      { category: 'Carbs', items: ['Pita', 'Noodles', 'Tortillas', 'Naan'] },
      { category: 'Produce', items: ['Cucumbers', 'Carrots', 'Romaine', 'Bell peppers'] },
      { category: 'Dairy', items: ['Mozzarella', 'Greek yogurt', 'Parmesan'] },
    ],
    proofPoints: [
      'Picky eater planning should avoid creating a second full dinner.',
      'Optional sauces and separated toppings make one meal work for more people.',
      'Household memory is more useful than retyping dislikes into a chatbot every week.',
    ],
    faqs: [
      {
        question: 'Can MealEase remember disliked ingredients?',
        answer:
          'Yes. Disliked ingredients and dietary needs can be saved to the household profile and reused in future plans.',
      },
      {
        question: 'Can one meal work for adults and kids?',
        answer:
          'Often yes. MealEase favors modular meals, optional toppings, and simple side swaps when picky eaters are part of the household.',
      },
    ],
  },
  {
    slug: 'leftovers-plan',
    title: 'Leftovers Meal Plan Example',
    description:
      'A sample leftovers meal plan showing how one cooked dinner can become another meal without wasting food.',
    intent: 'Leftover recipe planning',
    intro:
      'This sample starts with a planned larger dinner, then turns cooked food into a faster second meal later in the week.',
    plan: [
      { label: 'Sunday cook once', meal: 'Slow cooker salsa chicken', reason: 'Creates enough protein for two dinners and one lunch.' },
      { label: 'Monday', meal: 'Salsa chicken burrito bowls', reason: 'Uses the fresh cooked batch with rice and beans.' },
      { label: 'Tuesday', meal: 'Loaded chicken sweet potatoes', reason: 'Reuses the chicken in a different format.' },
      { label: 'Wednesday', meal: 'Vegetable frittata', reason: 'Uses leftover vegetables before they spoil.' },
      { label: 'Thursday', meal: 'Chicken tortilla soup', reason: 'Finishes remaining chicken and pantry broth.' },
    ],
    groceryList: [
      { category: 'Protein', items: ['Chicken breasts', 'Eggs'] },
      { category: 'Produce', items: ['Sweet potatoes', 'Avocado', 'Peppers', 'Spinach', 'Limes'] },
      { category: 'Pantry', items: ['Salsa', 'Rice', 'Black beans', 'Chicken broth', 'Tortilla strips'] },
      { category: 'Dairy', items: ['Shredded cheese', 'Sour cream'] },
    ],
    proofPoints: [
      'Leftovers work best when they are designed into the week, not discovered too late.',
      'MealEase can treat cooked food as inventory for future dinner ideas.',
      'The grocery list stays connected to both the original meal and the reuse meals.',
    ],
    faqs: [
      {
        question: 'Does MealEase help reduce food waste?',
        answer:
          'Yes. Leftover-aware planning helps households reuse cooked food and pantry items before buying more.',
      },
      {
        question: 'Can leftovers become a different meal?',
        answer:
          'Yes. The strongest leftover plans change the format so the second dinner does not feel like a repeat.',
      },
    ],
  },
  {
    slug: 'family-grocery-list',
    title: 'Family Grocery List Example from a Weekly Plan',
    description:
      'A sample family grocery list generated from a weekly dinner plan, organized by category and tied back to source meals.',
    intent: 'Grocery list from meal plan',
    intro:
      'This sample shows the grocery output a family should expect after turning a weekly dinner plan into a shopping list.',
    plan: [
      { label: 'Monday', meal: 'Lemon chicken orzo bowls', reason: 'Source for chicken, orzo, cucumber, and feta.' },
      { label: 'Tuesday', meal: 'Bean and cheese enchiladas', reason: 'Source for tortillas, beans, sauce, and cheese.' },
      { label: 'Wednesday', meal: 'Turkey burgers with roasted carrots', reason: 'Source for turkey, buns, carrots, and salad greens.' },
      { label: 'Thursday', meal: 'Pesto pasta with peas', reason: 'Source for pasta, pesto, peas, and parmesan.' },
      { label: 'Friday', meal: 'Leftover burger bowls', reason: 'Reuses burger ingredients and remaining greens.' },
    ],
    groceryList: [
      { category: 'Protein', items: ['Chicken breast', 'Ground turkey'] },
      { category: 'Produce', items: ['Cucumbers', 'Lemons', 'Carrots', 'Salad greens', 'Tomatoes'] },
      { category: 'Pantry', items: ['Orzo', 'Tortillas', 'Black beans', 'Enchilada sauce', 'Pasta', 'Pesto'] },
      { category: 'Frozen', items: ['Peas'] },
      { category: 'Dairy', items: ['Feta', 'Cheddar', 'Parmesan'] },
      { category: 'Bakery', items: ['Burger buns'] },
    ],
    proofPoints: [
      'A good meal planning grocery list should make source meals visible.',
      'Editable pantry checks prevent users from buying duplicates.',
      'The list should survive reloads and remain useful on mobile while shopping.',
    ],
    faqs: [
      {
        question: 'Does MealEase make grocery lists from meal plans?',
        answer:
          'Yes. Weekly plans can be converted into editable grocery lists grouped by category and connected to planned meals.',
      },
      {
        question: 'Can users edit the grocery list?',
        answer:
          'Yes. Users can add custom items, remove pantry items, check off groceries, and keep the list connected to the weekly plan.',
      },
    ],
  },
  {
    slug: 'fridge-scan-meal-plan',
    title: 'Fridge Scan Meal Plan Example',
    description:
      'A sample fridge scan workflow showing how visible ingredients can become dinner ideas and a small grocery top-up list.',
    intent: 'Fridge scan meal planning',
    intro:
      'This sample starts from ingredients a user might already have and turns them into dinner options plus a short top-up list.',
    plan: [
      { label: 'Scan result', meal: 'Eggs, spinach, tortillas, shredded cheese, bell pepper', reason: 'Visible ingredients become the starting point.' },
      { label: 'Dinner idea 1', meal: 'Spinach pepper breakfast tacos', reason: 'Uses nearly everything already on hand.' },
      { label: 'Dinner idea 2', meal: 'Cheesy tortilla frittata wedges', reason: 'Turns eggs and tortillas into a family-style dinner.' },
      { label: 'Dinner idea 3', meal: 'Quesadilla plates with spinach salad', reason: 'Works when energy is low and kids need something familiar.' },
    ],
    groceryList: [
      { category: 'Top-up produce', items: ['Avocado', 'Salsa', 'Limes'] },
      { category: 'Optional protein', items: ['Black beans', 'Rotisserie chicken'] },
      { category: 'Pantry check', items: ['Hot sauce', 'Cooking oil'] },
    ],
    proofPoints: [
      'Fridge scanning is most useful when it reduces the shopping list, not when it creates a brand-new plan.',
      'MealEase can show pantry-first ideas and optional grocery top-ups.',
      'Sample mode lets users understand the value before uploading their own photo.',
    ],
    faqs: [
      {
        question: 'Do users have to upload a fridge photo?',
        answer:
          'No. The first-use flow can use a sample image so visitors can see the output before trying their own scan.',
      },
      {
        question: 'What happens after a fridge scan?',
        answer:
          'MealEase identifies visible ingredients, suggests dinners, and can turn missing items into a small grocery list.',
      },
    ],
  },
]

export function getEvidenceSample(slug: string) {
  return evidenceSamples.find((sample) => sample.slug === slug) ?? null
}

