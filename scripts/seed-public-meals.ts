/**
 * Seed curated public meals for SEO / Google Recipe rich results.
 *
 * SETUP
 * -----
 * 1. Find your Supabase user ID:
 *    Supabase Dashboard → Authentication → Users → copy your UUID
 *
 * 2. Add it to .env.local:
 *    SEED_USER_ID=<your-uuid>
 *
 * 3. Run:
 *    npx tsx scripts/seed-public-meals.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import type { SmartMealResult } from '../lib/engine/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SEED_USER_ID = process.env.SEED_USER_ID

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

if (!SEED_USER_ID) {
  console.error(
    '❌  Missing SEED_USER_ID in .env.local\n' +
    '    Go to Supabase Dashboard → Authentication → Users → copy your UUID\n' +
    '    Then add: SEED_USER_ID=<your-uuid>'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ---------------------------------------------------------------------------
// Curated public meals
// ---------------------------------------------------------------------------

const PUBLIC_MEALS: Array<{ slug: string; meal: SmartMealResult }> = [
  {
    slug: 'sheet-pan-garlic-herb-chicken-thighs',
    meal: {
      id: 'c6df585f-8569-49d6-8125-797a7d6a1463',
      title: 'Sheet Pan Garlic Herb Chicken Thighs',
      tagline: 'Crispy, juicy chicken thighs roasted on one pan with vegetables',
      description:
        'Bone-in chicken thighs roasted at high heat with garlic, rosemary, and lemon. Everything cooks on one sheet pan with potatoes and green beans, so dinner and sides come out together with minimal cleanup.',
      cuisineType: 'American',
      imageUrl: 'https://source.unsplash.com/800x600/?sheet,pan,chicken,herbs',
      prepTime: 10,
      cookTime: 40,
      totalTime: 50,
      estimatedCost: 14,
      servings: 4,
      difficulty: 'easy',
      tags: ['sheet pan', 'chicken', 'one pan', 'weeknight', 'gluten-free', 'high protein'],
      ingredients: [
        { name: 'bone-in chicken thighs', quantity: '4', unit: 'pieces', fromPantry: false, category: 'protein' },
        { name: 'baby potatoes', quantity: '400', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'green beans', quantity: '200', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'garlic cloves', quantity: '5', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'olive oil', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'dried rosemary', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'dried thyme', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'lemon', quantity: '1', unit: 'whole', fromPantry: false, category: 'produce' },
        { name: 'salt', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'black pepper', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
      ],
      steps: [
        'Preheat oven to 220 °C (425 °F). Line a large rimmed baking sheet with foil.',
        'Halve the baby potatoes and toss with 2 tbsp olive oil, salt, and pepper on the sheet pan. Spread in a single layer and roast for 15 minutes.',
        'Meanwhile, pat chicken thighs dry and rub with remaining olive oil, garlic (minced), rosemary, thyme, salt, and pepper.',
        'Push potatoes to the edges of the pan. Add chicken thighs skin-side up in the centre.',
        'Nestle green beans around the potatoes. Squeeze half the lemon over everything and add lemon slices.',
        'Roast for 25 minutes more until chicken skin is golden and an instant-read thermometer reads 74 °C (165 °F).',
        'Rest for 5 minutes, then serve straight from the pan.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Kid Friendly',
          emoji: '🧒',
          title: 'Mild and boneless',
          description: 'Swap bone-in thighs for boneless, and skip the lemon for younger kids who prefer plain.',
          modifications: ['Use boneless thighs', 'Omit lemon zest and slices', 'Reduce rosemary to a pinch'],
          safetyNotes: ['Ensure chicken reaches 74 °C internally', 'Cut into small pieces for toddlers'],
          textureNotes: 'Boneless thighs are softer and easier to cut for kids.',
          servingTip: 'Serve with a small side of ketchup for dipping.',
          allergyWarnings: [],
        },
        {
          stage: 'adult',
          label: 'Extra flavour',
          emoji: '🌶️',
          title: 'Spicy paprika version',
          description: 'Add smoked paprika and chilli flakes for a smoky, spiced upgrade.',
          modifications: ['Add 1 tsp smoked paprika to rub', 'Add 0.25 tsp chilli flakes', 'Finish with fresh parsley'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'A dollop of Greek yoghurt on the side balances the heat.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Strip cold chicken from the bone and use in wraps, salads, or fried rice the next day.',
      shoppingList: [
        { name: 'bone-in chicken thighs', quantity: '4', unit: 'pieces', category: 'Meat', estimatedCost: 7, substituteOptions: ['boneless thighs', 'drumsticks'] },
        { name: 'baby potatoes', quantity: '400', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['regular potatoes cut into cubes'] },
        { name: 'green beans', quantity: '200', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['broccoli florets', 'asparagus'] },
        { name: 'lemon', quantity: '1', unit: 'whole', category: 'Produce', estimatedCost: 0.5, substituteOptions: ['2 tbsp lemon juice from bottle'] },
      ],
      meta: {
        score: 95,
        matchedPantryItems: ['olive oil', 'garlic cloves', 'dried rosemary', 'dried thyme', 'salt', 'black pepper'],
        pantryUtilization: 0.6,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'High-protein, one-pan weeknight dinner with broad family appeal.',
      },
    },
  },
  {
    slug: 'one-pot-pasta-primavera',
    meal: {
      id: 'd015b54c-adb0-4abd-8c71-e93327a2fd60',
      title: 'One-Pot Pasta Primavera',
      tagline: 'Creamy spring vegetable pasta cooked entirely in one pot',
      description:
        'All the pasta, broth, and vegetables go into one pot and cook together. The starch released from the pasta creates a silky sauce with no draining required. Ready in 20 minutes with one pan to wash.',
      cuisineType: 'Italian',
      imageUrl: 'https://source.unsplash.com/800x600/?pasta,vegetables,one,pot',
      prepTime: 5,
      cookTime: 15,
      totalTime: 20,
      estimatedCost: 9,
      servings: 4,
      difficulty: 'easy',
      tags: ['one pot', 'pasta', 'vegetarian', 'quick', '20 minutes', 'family friendly'],
      ingredients: [
        { name: 'penne or linguine', quantity: '300', unit: 'g', fromPantry: true, category: 'grain' },
        { name: 'vegetable broth', quantity: '700', unit: 'ml', fromPantry: true, category: 'pantry_staple' },
        { name: 'cherry tomatoes', quantity: '200', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'zucchini', quantity: '1', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'frozen peas', quantity: '100', unit: 'g', fromPantry: true, category: 'produce' },
        { name: 'garlic cloves', quantity: '3', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'parmesan cheese', quantity: '40', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'olive oil', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'dried Italian seasoning', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'salt and pepper', quantity: '1', unit: 'pinch', fromPantry: true, category: 'spice' },
      ],
      steps: [
        'Add pasta, broth, cherry tomatoes, sliced zucchini, frozen peas, minced garlic, olive oil, and Italian seasoning to a large pot.',
        'Bring to a boil over high heat, stirring frequently.',
        'Reduce heat to medium and cook, stirring often, for 12–14 minutes until pasta is al dente and most of the liquid is absorbed.',
        'Remove from heat. Season with salt and pepper.',
        'Stir in most of the parmesan. Serve topped with remaining parmesan.',
      ],
      variations: [
        {
          stage: 'toddler',
          label: 'Toddler version',
          emoji: '👶',
          title: 'Soft, small shapes',
          description: 'Use small pasta shapes like ditalini and cook 2 minutes extra so they are very soft.',
          modifications: ['Swap penne for ditalini', 'Cook 2 extra minutes', 'Omit parmesan or use a tiny sprinkle'],
          safetyNotes: ['Cut cherry tomatoes in half before adding to pot', 'Cool portion before serving'],
          textureNotes: 'Extra cooking makes pasta easier for toddlers to chew.',
          servingTip: 'Serve in a shallow bowl with a fork and spoon.',
          allergyWarnings: ['Contains dairy (parmesan) — omit for dairy-free'],
        },
        {
          stage: 'adult',
          label: 'Add protein',
          emoji: '🍗',
          title: 'Chicken or shrimp upgrade',
          description: 'Brown diced chicken breast or shrimp in the pot first, then add remaining ingredients.',
          modifications: ['Sauté 300g diced chicken breast for 5 min before adding pasta', 'Or stir in 200g cooked shrimp at the end'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Finish with a squeeze of lemon and fresh basil.',
          allergyWarnings: ['Contains shellfish if using shrimp'],
        },
      ],
      leftoverTip: 'Add a splash of water or broth before reheating to loosen the sauce.',
      shoppingList: [
        { name: 'penne pasta', quantity: '300', unit: 'g', category: 'Grains', estimatedCost: 1.5, substituteOptions: ['linguine', 'spaghetti'] },
        { name: 'cherry tomatoes', quantity: '200', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['diced canned tomatoes'] },
        { name: 'zucchini', quantity: '1', unit: 'medium', category: 'Produce', estimatedCost: 1, substituteOptions: ['yellow squash', 'broccoli'] },
        { name: 'parmesan cheese', quantity: '40', unit: 'g', category: 'Dairy', estimatedCost: 1.5, substituteOptions: ['pecorino romano', 'nutritional yeast for vegan'] },
      ],
      meta: {
        score: 92,
        matchedPantryItems: ['pasta', 'vegetable broth', 'garlic cloves', 'olive oil', 'frozen peas', 'dried Italian seasoning'],
        pantryUtilization: 0.65,
        simplifiedForEnergy: true,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'Quick vegetarian one-pot dinner with broad pantry utilisation.',
      },
    },
  },
  {
    slug: 'easy-ground-beef-tacos',
    meal: {
      id: '519acb08-3ba8-42fc-80b2-e189446495f6',
      title: 'Easy Ground Beef Tacos',
      tagline: 'Classic weeknight ground beef tacos ready in under 25 minutes',
      description:
        'Seasoned ground beef served in warm corn tortillas with all the toppings. A reliable family dinner that everyone can build to their own taste. The beef mixture works in hard shell tacos, burritos, or taco bowls.',
      cuisineType: 'Mexican',
      imageUrl: 'https://source.unsplash.com/800x600/?taco,beef,dinner',
      prepTime: 5,
      cookTime: 15,
      totalTime: 20,
      estimatedCost: 12,
      servings: 4,
      difficulty: 'easy',
      tags: ['tacos', 'ground beef', 'Mexican', 'quick', 'family dinner', 'weeknight'],
      ingredients: [
        { name: 'ground beef 80/20', quantity: '500', unit: 'g', fromPantry: false, category: 'protein' },
        { name: 'small corn tortillas', quantity: '8', unit: 'pieces', fromPantry: false, category: 'grain' },
        { name: 'chilli powder', quantity: '1.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'cumin', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'garlic powder', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'onion powder', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'tomato paste', quantity: '1', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'water', quantity: '60', unit: 'ml', fromPantry: true, category: 'pantry_staple' },
        { name: 'shredded cheddar', quantity: '80', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'shredded lettuce', quantity: '1', unit: 'cup', fromPantry: false, category: 'produce' },
        { name: 'sour cream', quantity: '60', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'fresh salsa', quantity: '80', unit: 'g', fromPantry: false, category: 'condiment' },
      ],
      steps: [
        'Heat a large skillet over medium-high heat. Add ground beef and cook, breaking it up, until no pink remains, about 7 minutes.',
        'Drain excess fat. Add chilli powder, cumin, garlic powder, onion powder, tomato paste, and water.',
        'Stir well and simmer for 3–4 minutes until mixture is saucy and fragrant.',
        'Warm tortillas directly over a gas burner for 15 seconds per side, or wrap in damp paper towel and microwave for 30 seconds.',
        'Build tacos: spoon beef into tortillas and top with cheese, lettuce, sour cream, and salsa.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Mild for kids',
          emoji: '🧒',
          title: 'Low spice version',
          description: 'Reduce chilli powder to 0.5 tsp and skip the fresh salsa for young kids.',
          modifications: ['Use 0.5 tsp chilli powder only', 'Swap salsa for mild ketchup', 'Offer toppings on the side so kids can build their own'],
          safetyNotes: [],
          textureNotes: 'Soft tortillas are easier for young kids than hard shells.',
          servingTip: 'A taco bar where kids pick their own toppings reduces dinnertime battles.',
          allergyWarnings: ['Contains dairy (cheese, sour cream) — omit for dairy-free'],
        },
        {
          stage: 'adult',
          label: 'Loaded tacos',
          emoji: '🔥',
          title: 'Guacamole and jalapeño upgrade',
          description: 'Add sliced jalapeños and a spoonful of guacamole.',
          modifications: ['Add sliced pickled jalapeños', 'Top with fresh guacamole or diced avocado', 'Add a squeeze of lime juice'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Serve with a cold Mexican beer or agua fresca.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Store the beef mixture separately from tortillas. Reheat beef in a skillet and use in burritos, nachos, or a taco rice bowl.',
      shoppingList: [
        { name: 'ground beef', quantity: '500', unit: 'g', category: 'Meat', estimatedCost: 6, substituteOptions: ['ground turkey', 'ground chicken'] },
        { name: 'corn tortillas', quantity: '8', unit: 'pack', category: 'Grains', estimatedCost: 2, substituteOptions: ['flour tortillas'] },
        { name: 'shredded cheddar', quantity: '80', unit: 'g', category: 'Dairy', estimatedCost: 1.5, substituteOptions: ['Mexican blend shredded cheese'] },
        { name: 'sour cream', quantity: '60', unit: 'g', category: 'Dairy', estimatedCost: 1, substituteOptions: ['plain Greek yoghurt'] },
        { name: 'fresh salsa', quantity: '80', unit: 'g', category: 'Condiments', estimatedCost: 1.5, substituteOptions: ['pico de gallo', 'diced tomato'] },
      ],
      meta: {
        score: 97,
        matchedPantryItems: ['chilli powder', 'cumin', 'garlic powder', 'onion powder', 'tomato paste', 'water'],
        pantryUtilization: 0.5,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'High-demand taco night recipe, fast prep, strong family appeal.',
      },
    },
  },
  {
    slug: 'lemon-herb-baked-salmon',
    meal: {
      id: '4af1173f-403c-419a-8a61-332e40a453d1',
      title: 'Lemon Herb Baked Salmon',
      tagline: 'Flaky oven-baked salmon with garlic, lemon, and fresh herbs',
      description:
        'Salmon fillets baked at high heat with a garlic-butter herb coating. Comes out perfectly flaky every time with a crisp edge. Pairs with roasted asparagus or steamed rice for a complete weeknight dinner in 20 minutes.',
      cuisineType: 'Mediterranean',
      imageUrl: 'https://source.unsplash.com/800x600/?baked,salmon,lemon,herbs',
      prepTime: 5,
      cookTime: 15,
      totalTime: 20,
      estimatedCost: 18,
      servings: 4,
      difficulty: 'easy',
      tags: ['salmon', 'fish', 'baked', 'healthy', 'gluten-free', 'omega-3', 'quick'],
      ingredients: [
        { name: 'salmon fillets', quantity: '4', unit: 'pieces (about 170g each)', fromPantry: false, category: 'protein' },
        { name: 'butter', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'dairy' },
        { name: 'garlic cloves', quantity: '3', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'fresh dill', quantity: '2', unit: 'tbsp', fromPantry: false, category: 'produce' },
        { name: 'lemon', quantity: '1', unit: 'whole', fromPantry: false, category: 'produce' },
        { name: 'olive oil', quantity: '1', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'salt', quantity: '0.75', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'black pepper', quantity: '0.25', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'asparagus', quantity: '300', unit: 'g', fromPantry: false, category: 'produce' },
      ],
      steps: [
        'Preheat oven to 220 °C (425 °F). Line a baking sheet with foil.',
        'Melt butter in a small bowl, add minced garlic, chopped dill, lemon zest, salt, and pepper.',
        'Place salmon fillets and asparagus on the sheet. Drizzle asparagus with olive oil.',
        'Spread the garlic butter over each salmon fillet. Lay 2–3 lemon slices on top.',
        'Bake 12–15 minutes until salmon flakes easily with a fork and asparagus is tender-crisp.',
        'Serve immediately with lemon wedges.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Mild for kids',
          emoji: '🧒',
          title: 'Butter-only version',
          description: 'Skip the dill and garlic for fussy eaters — just butter and a tiny pinch of salt.',
          modifications: ['Use only butter and salt', 'Omit dill and lemon zest', 'Check for small pin bones before serving'],
          safetyNotes: ['Always check fillets for pin bones before serving children'],
          textureNotes: 'Baked salmon is soft and easy for kids to eat.',
          servingTip: 'Flake salmon into small pieces and serve over buttered pasta.',
          allergyWarnings: ['Contains fish', 'Contains dairy (butter)'],
        },
        {
          stage: 'adult',
          label: 'Upgrade',
          emoji: '🌿',
          title: 'Dijon herb crust',
          description: 'Spread a thin layer of Dijon mustard before adding the garlic butter for a tangy crust.',
          modifications: ['Spread 1 tsp Dijon mustard on each fillet', 'Mix panko breadcrumbs with herbs for extra crunch (optional)', 'Add capers to the butter mixture'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'A side of roasted cherry tomatoes rounds out the plate beautifully.',
          allergyWarnings: ['Contains mustard — avoid for mustard allergy'],
        },
      ],
      leftoverTip: 'Cold baked salmon keeps for 2 days in the fridge. Flake over a green salad or mix into cream cheese for a quick dip.',
      shoppingList: [
        { name: 'salmon fillets', quantity: '4', unit: 'pieces', category: 'Seafood', estimatedCost: 14, substituteOptions: ['trout fillets', 'cod fillets'] },
        { name: 'fresh dill', quantity: '1', unit: 'small bunch', category: 'Produce', estimatedCost: 1.5, substituteOptions: ['fresh parsley', '0.5 tsp dried dill'] },
        { name: 'lemon', quantity: '1', unit: 'whole', category: 'Produce', estimatedCost: 0.5, substituteOptions: ['2 tbsp bottled lemon juice'] },
        { name: 'asparagus', quantity: '300', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['green beans', 'broccoli florets'] },
      ],
      meta: {
        score: 93,
        matchedPantryItems: ['butter', 'garlic cloves', 'olive oil', 'salt', 'black pepper'],
        pantryUtilization: 0.55,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'High-demand healthy fish dinner, fast prep, omega-3 SEO value.',
      },
    },
  },
  {
    slug: 'easy-vegetable-stir-fry-with-rice',
    meal: {
      id: '8dcbbc88-bee1-45ff-81bc-0232e52f08e5',
      title: 'Easy Vegetable Stir-Fry with Rice',
      tagline: 'Crisp vegetables tossed in a savory garlic-soy sauce over steamed rice',
      description:
        'A quick high-heat stir-fry of colourful vegetables in a garlic and soy sauce, served over steamed jasmine rice. Uses mostly pantry staples and can be ready before the rice has finished cooking. Works as a main or as a side.',
      cuisineType: 'Asian',
      imageUrl: 'https://source.unsplash.com/800x600/?stir,fry,vegetables,rice',
      prepTime: 10,
      cookTime: 10,
      totalTime: 20,
      estimatedCost: 8,
      servings: 4,
      difficulty: 'easy',
      tags: ['stir fry', 'vegetarian', 'vegan', 'Asian', 'quick', '20 minutes', 'rice'],
      ingredients: [
        { name: 'jasmine rice', quantity: '300', unit: 'g', fromPantry: true, category: 'grain' },
        { name: 'broccoli florets', quantity: '200', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'snap peas', quantity: '150', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'red bell pepper', quantity: '1', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'carrot', quantity: '1', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'garlic cloves', quantity: '3', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'fresh ginger', quantity: '1', unit: 'tsp grated', fromPantry: true, category: 'spice' },
        { name: 'soy sauce', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'condiment' },
        { name: 'sesame oil', quantity: '1', unit: 'tsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'vegetable oil', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'cornstarch', quantity: '1', unit: 'tsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'water', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
      ],
      steps: [
        'Cook rice according to package directions.',
        'Mix soy sauce, cornstarch, water, and sesame oil in a small bowl to make the sauce.',
        'Heat a wok or large skillet over the highest heat until smoking hot. Add vegetable oil.',
        'Add broccoli and carrot. Stir-fry for 2 minutes, tossing constantly.',
        'Add bell pepper, snap peas, garlic, and ginger. Stir-fry for 2 minutes more.',
        'Pour sauce over vegetables and toss for 1 minute until glossy and fragrant.',
        'Serve immediately over steamed rice.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Kid friendly',
          emoji: '🧒',
          title: 'Lighter sauce for kids',
          description: 'Halve the soy sauce and omit ginger to make a milder version.',
          modifications: ['Use 1.5 tbsp soy sauce instead of 3', 'Omit fresh ginger', 'Cut vegetables into small bite-size pieces'],
          safetyNotes: [],
          textureNotes: 'Smaller pieces are easier for children to manage.',
          servingTip: 'Offer vegetables over plain rice with sauce on the side.',
          allergyWarnings: ['Contains soy — use coconut aminos for soy allergy'],
        },
        {
          stage: 'adult',
          label: 'Add protein',
          emoji: '🍳',
          title: 'Tofu or chicken addition',
          description: 'Press and cube firm tofu or slice chicken breast thin and stir-fry before the vegetables.',
          modifications: ['Add 300g pressed/cubed extra-firm tofu or thinly sliced chicken', 'Cook protein first in 1 tbsp oil until golden', 'Remove, cook vegetables, add protein back with sauce'],
          safetyNotes: ['Ensure chicken reaches 74 °C internally'],
          textureNotes: null,
          servingTip: 'Top with sesame seeds and sliced scallions.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Stir-fry reheats well in a skillet with a splash of water. Stays good for 2 days refrigerated.',
      shoppingList: [
        { name: 'broccoli florets', quantity: '200', unit: 'g', category: 'Produce', estimatedCost: 1.5, substituteOptions: ['cauliflower', 'green beans'] },
        { name: 'snap peas', quantity: '150', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['snow peas', 'frozen edamame'] },
        { name: 'red bell pepper', quantity: '1', unit: 'whole', category: 'Produce', estimatedCost: 1.5, substituteOptions: ['any colour bell pepper'] },
        { name: 'carrot', quantity: '1', unit: 'whole', category: 'Produce', estimatedCost: 0.5, substituteOptions: ['baby carrots'] },
      ],
      meta: {
        score: 90,
        matchedPantryItems: ['jasmine rice', 'soy sauce', 'sesame oil', 'vegetable oil', 'garlic cloves', 'fresh ginger', 'cornstarch'],
        pantryUtilization: 0.7,
        simplifiedForEnergy: true,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'Fast vegan weeknight dinner with high pantry utilisation.',
      },
    },
  },
  {
    slug: 'baked-turkey-meatballs-with-marinara',
    meal: {
      id: 'a80385ed-1065-4696-bf82-992cda0848d8',
      title: 'Baked Turkey Meatballs with Marinara',
      tagline: 'Juicy oven-baked turkey meatballs in a simple tomato marinara sauce',
      description:
        'Lighter than traditional beef meatballs but just as satisfying. Baked in the oven rather than fried to reduce mess, then simmered in marinara for extra flavour. Serve with pasta, in a sub roll, or over polenta.',
      cuisineType: 'Italian',
      imageUrl: 'https://source.unsplash.com/800x600/?meatballs,marinara,pasta',
      prepTime: 15,
      cookTime: 25,
      totalTime: 40,
      estimatedCost: 13,
      servings: 4,
      difficulty: 'moderate',
      tags: ['turkey meatballs', 'baked', 'healthy', 'Italian', 'pasta', 'high protein'],
      ingredients: [
        { name: 'ground turkey', quantity: '500', unit: 'g', fromPantry: false, category: 'protein' },
        { name: 'panko breadcrumbs', quantity: '40', unit: 'g', fromPantry: true, category: 'pantry_staple' },
        { name: 'parmesan cheese', quantity: '30', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'egg', quantity: '1', unit: 'large', fromPantry: true, category: 'protein' },
        { name: 'garlic cloves', quantity: '3', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'dried oregano', quantity: '1', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'dried basil', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'salt', quantity: '0.75', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'marinara sauce', quantity: '500', unit: 'g jar', fromPantry: true, category: 'pantry_staple' },
        { name: 'spaghetti or pasta', quantity: '300', unit: 'g', fromPantry: true, category: 'grain' },
      ],
      steps: [
        'Preheat oven to 200 °C (400 °F). Line a baking sheet with foil and spray lightly with oil.',
        'Combine turkey, breadcrumbs, parmesan, egg, minced garlic, oregano, basil, and salt in a bowl. Mix until just combined — do not overmix.',
        'Roll into 24 even meatballs (about 30g each). Arrange on the baking sheet.',
        'Bake 18–20 minutes until cooked through (internal temp 74 °C / 165 °F) and lightly browned.',
        'Transfer meatballs to a large skillet, add marinara sauce, and simmer 5 minutes.',
        'Meanwhile, cook pasta according to package directions. Serve meatballs and sauce over pasta.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Kid-friendly',
          emoji: '🧒',
          title: 'Mini meatballs',
          description: 'Make smaller meatballs (15g each) that are easier for kids to eat.',
          modifications: ['Roll into 40 smaller meatballs', 'Reduce bake time to 13–15 minutes', 'Serve with penne — easier for kids to eat than spaghetti'],
          safetyNotes: ['Ensure all meatballs reach 74 °C internally'],
          textureNotes: 'Smaller meatballs are softer in the centre and easier to cut.',
          servingTip: 'Offer with a side of buttered corn for picky eaters.',
          allergyWarnings: ['Contains egg, dairy, gluten — see variations for substitutions'],
        },
        {
          stage: 'adult',
          label: 'Upgrade',
          emoji: '🧀',
          title: 'Mozzarella-stuffed',
          description: 'Press a cube of mozzarella into the centre of each meatball before rolling.',
          modifications: ['Press a small cube of mozzarella into each meatball', 'Add 0.5 tsp red pepper flakes to the mixture', 'Top finished dish with fresh basil'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Pull apart a meatball at the table — the cheese stretch is very satisfying.',
          allergyWarnings: ['Contains dairy'],
        },
      ],
      leftoverTip: 'Meatballs and sauce keep for 4 days in the fridge. Use leftovers in a meatball sub the next day.',
      shoppingList: [
        { name: 'ground turkey', quantity: '500', unit: 'g', category: 'Meat', estimatedCost: 6, substituteOptions: ['ground chicken', 'lean ground beef'] },
        { name: 'parmesan cheese', quantity: '30', unit: 'g', category: 'Dairy', estimatedCost: 1, substituteOptions: ['pecorino romano'] },
        { name: 'marinara sauce', quantity: '500', unit: 'g jar', category: 'Pantry', estimatedCost: 3, substituteOptions: ['homemade tomato sauce', 'passata + seasoning'] },
        { name: 'spaghetti', quantity: '300', unit: 'g', category: 'Grains', estimatedCost: 1.5, substituteOptions: ['penne', 'linguine'] },
      ],
      meta: {
        score: 91,
        matchedPantryItems: ['egg', 'panko breadcrumbs', 'garlic cloves', 'dried oregano', 'dried basil', 'salt', 'marinara sauce', 'spaghetti'],
        pantryUtilization: 0.8,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'High-protein Italian family dinner, strong pantry utilisation.',
      },
    },
  },
  {
    slug: 'easy-black-bean-quesadillas',
    meal: {
      id: '440ff87e-698d-4a4a-aded-886ef425eba5',
      title: 'Easy Black Bean Quesadillas',
      tagline: 'Crispy flour tortillas stuffed with black beans, cheese, and vegetables',
      description:
        'Quesadillas are the fastest filling vegetarian dinner in the weeknight rotation. Canned black beans, cheddar cheese, and whatever vegetables you have, pressed in a hot skillet until golden and crisp. On the table in under 15 minutes.',
      cuisineType: 'Mexican',
      imageUrl: 'https://source.unsplash.com/800x600/?quesadilla,black,bean,cheese',
      prepTime: 5,
      cookTime: 10,
      totalTime: 15,
      estimatedCost: 7,
      servings: 4,
      difficulty: 'easy',
      tags: ['quesadilla', 'vegetarian', 'black beans', 'quick', '15 minutes', 'budget', 'cheese'],
      ingredients: [
        { name: 'large flour tortillas', quantity: '4', unit: 'pieces', fromPantry: false, category: 'grain' },
        { name: 'canned black beans', quantity: '1', unit: '400g can', fromPantry: true, category: 'pantry_staple' },
        { name: 'shredded cheddar', quantity: '120', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'red bell pepper', quantity: '0.5', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'red onion', quantity: '0.25', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'cumin', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'chilli powder', quantity: '0.5', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'salt', quantity: '0.25', unit: 'tsp', fromPantry: true, category: 'spice' },
        { name: 'sour cream or salsa', quantity: '60', unit: 'g', fromPantry: false, category: 'condiment', note: 'for serving' },
      ],
      steps: [
        'Drain and rinse black beans. Mix with cumin, chilli powder, and salt.',
        'Finely dice red bell pepper and red onion.',
        'Heat a large skillet over medium heat.',
        'Lay a tortilla flat. Sprinkle half with cheese, spoon on beans, add peppers and onion, then fold over.',
        'Cook in the dry skillet for 2–3 minutes until golden and crisp. Flip and cook the other side.',
        'Repeat with remaining tortillas. Slice into wedges and serve with sour cream or salsa.',
      ],
      variations: [
        {
          stage: 'toddler',
          label: 'Toddler version',
          emoji: '👶',
          title: 'Cheese and bean only',
          description: 'Keep it simple: just cheese and mashed beans for toddlers who are wary of peppers.',
          modifications: ['Lightly mash the black beans so they spread easily', 'Omit peppers and onion', 'Use mild cheese like mozzarella'],
          safetyNotes: ['Cool before serving', 'Cut into small strips not triangles for toddlers'],
          textureNotes: 'Mashed beans create a smoother filling easier for toddlers.',
          servingTip: 'Serve with plain yoghurt for dipping.',
          allergyWarnings: ['Contains gluten (flour tortilla), dairy'],
        },
        {
          stage: 'adult',
          label: 'Upgraded',
          emoji: '🥑',
          title: 'Avocado and chipotle',
          description: 'Add sliced avocado inside and a pinch of chipotle powder for smokiness.',
          modifications: ['Add 0.5 sliced avocado per quesadilla', 'Replace chilli powder with chipotle powder', 'Add fresh coriander (cilantro)'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Serve with a lime wedge to squeeze over.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Reheat cold quesadillas in a dry skillet for 2 minutes per side to restore the crispiness.',
      shoppingList: [
        { name: 'large flour tortillas', quantity: '4', unit: 'pack', category: 'Grains', estimatedCost: 2, substituteOptions: ['whole wheat tortillas', 'corn tortillas'] },
        { name: 'canned black beans', quantity: '1', unit: '400g can', category: 'Pantry', estimatedCost: 1, substituteOptions: ['canned pinto beans', 'canned kidney beans'] },
        { name: 'shredded cheddar', quantity: '120', unit: 'g', category: 'Dairy', estimatedCost: 2, substituteOptions: ['Monterey Jack', 'Mexican blend'] },
        { name: 'red bell pepper', quantity: '0.5', unit: 'whole', category: 'Produce', estimatedCost: 0.75, substituteOptions: ['frozen diced peppers'] },
      ],
      meta: {
        score: 88,
        matchedPantryItems: ['canned black beans', 'cumin', 'chilli powder', 'salt'],
        pantryUtilization: 0.45,
        simplifiedForEnergy: true,
        pickyEaterAdjusted: true,
        localityApplied: false,
        selectionReason: 'Ultra-fast budget vegetarian dinner with picky-eater customisation.',
      },
    },
  },
  {
    slug: 'loaded-baked-potato-soup',
    meal: {
      id: 'fec39099-821b-4cdc-a04e-9094e952b6a7',
      title: 'Loaded Baked Potato Soup',
      tagline: 'Thick, creamy potato soup topped with sour cream, cheese, and bacon',
      description:
        'All the flavours of a loaded baked potato in a cosy, filling soup. Chunks of potato in a creamy broth, finished with cheddar, sour cream, and crispy bacon bits. Hearty enough for a complete meal with crusty bread.',
      cuisineType: 'American',
      imageUrl: 'https://source.unsplash.com/800x600/?potato,soup,creamy,bowl',
      prepTime: 10,
      cookTime: 30,
      totalTime: 40,
      estimatedCost: 10,
      servings: 6,
      difficulty: 'moderate',
      tags: ['soup', 'potato', 'comfort food', 'creamy', 'American', 'weeknight', 'filling'],
      ingredients: [
        { name: 'russet potatoes', quantity: '1', unit: 'kg', fromPantry: false, category: 'produce' },
        { name: 'chicken broth', quantity: '750', unit: 'ml', fromPantry: true, category: 'pantry_staple' },
        { name: 'whole milk', quantity: '250', unit: 'ml', fromPantry: true, category: 'dairy' },
        { name: 'sour cream', quantity: '120', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'shredded cheddar', quantity: '100', unit: 'g', fromPantry: false, category: 'dairy' },
        { name: 'bacon strips', quantity: '4', unit: 'strips', fromPantry: false, category: 'protein' },
        { name: 'butter', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'dairy' },
        { name: 'all-purpose flour', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'garlic cloves', quantity: '2', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'onion', quantity: '0.5', unit: 'medium', fromPantry: false, category: 'produce' },
        { name: 'salt and pepper', quantity: '1', unit: 'to taste', fromPantry: true, category: 'spice' },
        { name: 'chives', quantity: '2', unit: 'tbsp', fromPantry: false, category: 'produce', note: 'for garnish' },
      ],
      steps: [
        'Peel and cube potatoes into 2cm pieces. Cook bacon in a large pot until crisp; remove and crumble. Set aside.',
        'In the same pot, melt butter over medium heat. Sauté diced onion and garlic for 3 minutes until soft.',
        'Whisk in flour and cook 1 minute to make a roux.',
        'Gradually whisk in chicken broth. Add potatoes. Bring to a boil, then reduce to a simmer for 15–18 minutes until potatoes are very tender.',
        'Use a potato masher to mash about half the potatoes directly in the pot for a thick, chunky texture.',
        'Stir in milk and sour cream. Simmer 5 minutes more. Season with salt and pepper.',
        'Serve topped with cheddar, bacon crumbles, and chives.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Kid version',
          emoji: '🧒',
          title: 'Mild and smooth',
          description: 'Blend the soup fully smooth and skip the bacon topping for young children.',
          modifications: ['Use an immersion blender to fully smooth the soup', 'Omit bacon (or use very finely crumbled)', 'Mild toppings only: cheese and sour cream'],
          safetyNotes: ['Allow soup to cool slightly before blending', 'Serve at safe temperature'],
          textureNotes: 'Smooth soup is easier for toddlers and younger kids.',
          servingTip: 'Serve in a small bowl with a soft bread roll.',
          allergyWarnings: ['Contains dairy, gluten'],
        },
        {
          stage: 'adult',
          label: 'Upgrade',
          emoji: '🧄',
          title: 'Smoked gouda and leek',
          description: 'Swap cheddar for smoked gouda and replace onion with leeks for a deeper flavour.',
          modifications: ['Use 2 leeks instead of onion', 'Swap cheddar for smoked gouda', 'Add a splash of cream at the end'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Serve in a bread bowl for extra impact.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Keeps for 4 days in the fridge. Reheat gently on the stovetop — add a splash of milk if it has thickened.',
      shoppingList: [
        { name: 'russet potatoes', quantity: '1', unit: 'kg', category: 'Produce', estimatedCost: 2.5, substituteOptions: ['Yukon gold potatoes'] },
        { name: 'bacon strips', quantity: '4', unit: 'strips', category: 'Meat', estimatedCost: 2, substituteOptions: ['turkey bacon', 'omit for vegetarian'] },
        { name: 'shredded cheddar', quantity: '100', unit: 'g', category: 'Dairy', estimatedCost: 1.5, substituteOptions: ['Gruyere', 'smoked gouda'] },
        { name: 'sour cream', quantity: '120', unit: 'g', category: 'Dairy', estimatedCost: 1, substituteOptions: ['plain Greek yoghurt'] },
        { name: 'chives', quantity: '1', unit: 'small bunch', category: 'Produce', estimatedCost: 0.75, substituteOptions: ['sliced scallions', 'omit'] },
      ],
      meta: {
        score: 89,
        matchedPantryItems: ['chicken broth', 'milk', 'butter', 'flour', 'garlic cloves', 'salt', 'pepper'],
        pantryUtilization: 0.58,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'Comfort food soup with strong search demand and high family appeal.',
      },
    },
  },
  {
    slug: 'easy-chicken-fried-rice',
    meal: {
      id: 'e0e01591-2148-4e2f-815d-0d6d65d6e2ce',
      title: 'Easy Chicken Fried Rice',
      tagline: 'Better-than-takeout fried rice made with leftover rice and chicken',
      description:
        'The secret to great fried rice is cold day-old rice and a screaming-hot wok. This version uses diced chicken breast, eggs, and frozen peas and carrots, seasoned with soy sauce and sesame oil. Faster than ordering delivery.',
      cuisineType: 'Asian',
      imageUrl: 'https://source.unsplash.com/800x600/?fried,rice,chicken,wok',
      prepTime: 5,
      cookTime: 12,
      totalTime: 17,
      estimatedCost: 9,
      servings: 4,
      difficulty: 'easy',
      tags: ['fried rice', 'chicken', 'leftover rice', 'Asian', 'quick', 'budget', 'one pan'],
      ingredients: [
        { name: 'cooked day-old jasmine rice', quantity: '600', unit: 'g (about 3 cups)', fromPantry: true, category: 'grain' },
        { name: 'chicken breast', quantity: '300', unit: 'g', fromPantry: false, category: 'protein' },
        { name: 'eggs', quantity: '2', unit: 'large', fromPantry: true, category: 'protein' },
        { name: 'frozen peas and carrots', quantity: '150', unit: 'g', fromPantry: true, category: 'produce' },
        { name: 'garlic cloves', quantity: '3', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'soy sauce', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'condiment' },
        { name: 'oyster sauce', quantity: '1', unit: 'tbsp', fromPantry: true, category: 'condiment' },
        { name: 'sesame oil', quantity: '1', unit: 'tsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'vegetable oil', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'scallions', quantity: '3', unit: 'stalks', fromPantry: false, category: 'produce' },
        { name: 'white pepper', quantity: '0.25', unit: 'tsp', fromPantry: true, category: 'spice' },
      ],
      steps: [
        'Dice chicken breast into 1cm cubes. Mince garlic and slice scallions.',
        'Heat wok or large skillet over high heat until almost smoking. Add 1 tbsp oil.',
        'Add chicken and stir-fry 3–4 minutes until cooked through. Push to the side.',
        'Add 1 tbsp oil, then eggs. Scramble until just set, then break into small pieces. Mix with chicken.',
        'Add remaining oil, then cold rice. Press and stir-fry 3 minutes until rice separates and starts to crisp.',
        'Add frozen peas and carrots, garlic, soy sauce, oyster sauce, sesame oil, and white pepper. Toss everything for 2 minutes.',
        'Remove from heat, stir in scallions, and serve.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Mild for kids',
          emoji: '🧒',
          title: 'Low sodium and mild',
          description: 'Reduce soy sauce to 1.5 tbsp and omit oyster sauce for a milder, less salty version.',
          modifications: ['Use 1.5 tbsp soy sauce only', 'Omit oyster sauce', 'Skip white pepper'],
          safetyNotes: [],
          textureNotes: 'No texture changes needed — fried rice is naturally kid-friendly.',
          servingTip: 'Serve in a bowl with a spoon — easier than chopsticks for kids.',
          allergyWarnings: ['Contains egg, soy, shellfish (oyster sauce) — omit oyster sauce for shellfish allergy'],
        },
        {
          stage: 'adult',
          label: 'Upgrade',
          emoji: '🥚',
          title: 'Extra crispy with chilli oil',
          description: 'Press rice firmly against a very hot wok for 2 extra minutes to get crispy bits. Drizzle with chilli crisp oil to serve.',
          modifications: ['Use maximum heat throughout', 'Press rice and leave untouched for 2 minutes to develop crust', 'Drizzle with chilli crisp oil at the end'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Top with a fried egg for a richer bowl.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Fried rice keeps for 3 days in the fridge. Reheat in a skillet with a drizzle of oil to restore the texture.',
      shoppingList: [
        { name: 'chicken breast', quantity: '300', unit: 'g', category: 'Meat', estimatedCost: 4, substituteOptions: ['leftover rotisserie chicken', 'shrimp', 'tofu'] },
        { name: 'scallions', quantity: '3', unit: 'stalks', category: 'Produce', estimatedCost: 0.75, substituteOptions: ['chives', 'diced onion'] },
        { name: 'frozen peas and carrots', quantity: '150', unit: 'g', category: 'Frozen', estimatedCost: 1, substituteOptions: ['any frozen mixed vegetables'] },
      ],
      meta: {
        score: 96,
        matchedPantryItems: ['day-old rice', 'eggs', 'soy sauce', 'oyster sauce', 'sesame oil', 'vegetable oil', 'garlic cloves', 'frozen peas and carrots', 'white pepper'],
        pantryUtilization: 0.82,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'Classic fried rice is the #1 leftover rice use case; very high pantry utilisation.',
      },
    },
  },
  {
    slug: 'honey-garlic-shrimp-with-broccoli',
    meal: {
      id: 'd9cf9dc6-08d4-4957-8ea9-b5a89ee47b6e',
      title: 'Honey Garlic Shrimp with Broccoli',
      tagline: 'Sweet and savory glazed shrimp with tender broccoli in 15 minutes',
      description:
        'Large shrimp tossed in a sticky honey-garlic-soy glaze with crisp-tender broccoli. The glaze caramelises quickly in a hot pan to create big flavour with minimal effort. Serve over steamed rice for a complete dinner.',
      cuisineType: 'Asian',
      imageUrl: 'https://source.unsplash.com/800x600/?shrimp,honey,garlic,broccoli',
      prepTime: 5,
      cookTime: 10,
      totalTime: 15,
      estimatedCost: 15,
      servings: 4,
      difficulty: 'easy',
      tags: ['shrimp', 'honey garlic', 'Asian', 'quick', '15 minutes', 'broccoli', 'gluten-free option'],
      ingredients: [
        { name: 'large raw shrimp', quantity: '500', unit: 'g peeled and deveined', fromPantry: false, category: 'protein' },
        { name: 'broccoli florets', quantity: '300', unit: 'g', fromPantry: false, category: 'produce' },
        { name: 'garlic cloves', quantity: '4', unit: 'cloves', fromPantry: true, category: 'produce' },
        { name: 'honey', quantity: '3', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'soy sauce', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'condiment' },
        { name: 'rice vinegar', quantity: '1', unit: 'tbsp', fromPantry: true, category: 'condiment' },
        { name: 'cornstarch', quantity: '1', unit: 'tsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'vegetable oil', quantity: '2', unit: 'tbsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'sesame oil', quantity: '1', unit: 'tsp', fromPantry: true, category: 'pantry_staple' },
        { name: 'red pepper flakes', quantity: '0.25', unit: 'tsp', fromPantry: true, category: 'spice', note: 'optional' },
        { name: 'steamed jasmine rice', quantity: '300', unit: 'g dry', fromPantry: true, category: 'grain', note: 'for serving' },
        { name: 'sesame seeds and scallions', quantity: '1', unit: 'tbsp', fromPantry: false, category: 'produce', note: 'for garnish' },
      ],
      steps: [
        'Mix honey, soy sauce, rice vinegar, minced garlic, cornstarch, and sesame oil in a bowl. Set sauce aside.',
        'Heat a large skillet over high heat. Add 1 tbsp oil.',
        'Add broccoli florets and stir-fry for 3 minutes until bright green and tender-crisp. Remove and set aside.',
        'Add remaining oil to the skillet. Add shrimp in a single layer; cook 1 minute without touching.',
        'Flip shrimp. Add sauce and broccoli back to the pan. Toss for 1–2 minutes until sauce thickens and shrimp are cooked through.',
        'Serve over steamed rice, garnished with sesame seeds and sliced scallions.',
      ],
      variations: [
        {
          stage: 'kid',
          label: 'Mild for kids',
          emoji: '🧒',
          title: 'Sweeter, no heat',
          description: 'Skip the red pepper flakes and use a little more honey for a sweeter, kid-friendly version.',
          modifications: ['Omit red pepper flakes', 'Use 4 tbsp honey instead of 3', 'Check shrimp carefully for shells before serving'],
          safetyNotes: ['Check shrimp for shells', 'Cool before serving to children', 'Shrimp is a common allergen — check before serving'],
          textureNotes: 'Cooked shrimp is soft and easy to eat; cut in half for younger kids.',
          servingTip: 'Serve over rice with broccoli on the side for picky eaters who prefer things not mixed.',
          allergyWarnings: ['Contains shellfish — confirm no allergy first'],
        },
        {
          stage: 'adult',
          label: 'Upgrade',
          emoji: '🌶️',
          title: 'Spicy ginger upgrade',
          description: 'Add fresh grated ginger and increase red pepper flakes for a restaurant-quality kick.',
          modifications: ['Add 1 tsp fresh grated ginger to the sauce', 'Increase red pepper flakes to 0.5 tsp', 'Finish with a squeeze of lime'],
          safetyNotes: [],
          textureNotes: null,
          servingTip: 'Serve in a deep bowl and eat with chopsticks.',
          allergyWarnings: [],
        },
      ],
      leftoverTip: 'Best eaten fresh. If you have leftovers, reheat gently in a skillet — shrimp can become rubbery if overheated.',
      shoppingList: [
        { name: 'raw shrimp peeled', quantity: '500', unit: 'g', category: 'Seafood', estimatedCost: 10, substituteOptions: ['large scallops', 'chicken breast cubed'] },
        { name: 'broccoli florets', quantity: '300', unit: 'g', category: 'Produce', estimatedCost: 2, substituteOptions: ['broccolini', 'snap peas', 'green beans'] },
        { name: 'sesame seeds and scallions', quantity: '1', unit: 'tbsp', category: 'Produce', estimatedCost: 0.5, substituteOptions: ['omit for garnish'] },
      ],
      meta: {
        score: 94,
        matchedPantryItems: ['garlic cloves', 'honey', 'soy sauce', 'rice vinegar', 'cornstarch', 'vegetable oil', 'sesame oil', 'red pepper flakes', 'jasmine rice'],
        pantryUtilization: 0.75,
        simplifiedForEnergy: false,
        pickyEaterAdjusted: false,
        localityApplied: false,
        selectionReason: 'High-search-volume shrimp dish, fast prep, strong pantry utilisation.',
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Main insert
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🌱  Seeding ${PUBLIC_MEALS.length} public meals into Supabase...\n`)
  console.log(`👤  Using user_id: ${SEED_USER_ID}\n`)

  let successCount = 0
  let skipCount = 0

  for (const { slug, meal } of PUBLIC_MEALS) {
    const { data, error } = await supabase
      .from('saved_meals')
      .upsert(
        {
          user_id: SEED_USER_ID,
          slug,
          title: meal.title,
          description: meal.description,
          cuisine_type: meal.cuisineType,
          meal_data: meal,
          is_public: true,
          published_at: new Date().toISOString(),
        },
        { onConflict: 'slug', ignoreDuplicates: false }
      )
      .select('id, slug')
      .single()

    if (error) {
      console.error(`  ❌  ${slug}: ${error.message}`)
    } else if (data) {
      console.log(`  ✅  ${slug}`)
      successCount++
    } else {
      console.log(`  ⏭️   ${slug} (already up to date)`)
      skipCount++
    }
  }

  console.log(`\n✅  Done — ${successCount} inserted/updated, ${skipCount} skipped\n`)
  console.log('🔗  Meals are now live at:')
  for (const { slug } of PUBLIC_MEALS) {
    console.log(`    https://mealeaseai.com/meals/${slug}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
