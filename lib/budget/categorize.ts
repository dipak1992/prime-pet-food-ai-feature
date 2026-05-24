import type { IngredientCategory } from './types'

// ─── Keyword maps ─────────────────────────────────────────────────────────────

const PRODUCE_KEYWORDS = [
  'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry',
  'raspberry', 'mango', 'pineapple', 'watermelon', 'avocado', 'tomato', 'potato',
  'onion', 'garlic', 'ginger', 'carrot', 'celery', 'broccoli', 'cauliflower',
  'spinach', 'lettuce', 'kale', 'cabbage', 'cucumber', 'zucchini', 'squash',
  'pepper', 'mushroom', 'corn', 'pea', 'bean', 'asparagus', 'artichoke',
  'eggplant', 'beet', 'radish', 'turnip', 'parsnip', 'leek', 'shallot',
  'scallion', 'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary',
  'sage', 'dill', 'chive', 'arugula', 'chard', 'fennel', 'okra', 'yam',
  'sweet potato', 'butternut', 'acorn squash', 'bok choy', 'brussels sprout',
]

const MEAT_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'bison',
  'venison', 'sausage', 'bacon', 'ham', 'prosciutto', 'salami', 'pepperoni',
  'ground beef', 'ground turkey', 'ground pork', 'steak', 'ribs', 'chop',
  'breast', 'thigh', 'drumstick', 'wing', 'tenderloin', 'loin', 'roast',
  'brisket', 'chuck', 'sirloin', 'ribeye', 'flank', 'skirt', 'short rib',
]

const SEAFOOD_KEYWORDS = [
  'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'shrimp', 'crab', 'lobster',
  'scallop', 'clam', 'mussel', 'oyster', 'squid', 'octopus', 'anchovy',
  'sardine', 'mackerel', 'trout', 'bass', 'snapper', 'mahi', 'swordfish',
  'catfish', 'flounder', 'sole', 'haddock', 'pollock', 'herring',
]

const DAIRY_KEYWORDS = [
  'milk', 'cream', 'butter', 'cheese', 'yogurt', 'sour cream', 'cream cheese',
  'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'brie',
  'feta', 'gouda', 'swiss', 'provolone', 'gruyere', 'goat cheese', 'egg',
  'half and half', 'heavy cream', 'whipping cream', 'buttermilk', 'kefir',
]

const GRAINS_KEYWORDS = [
  'rice', 'pasta', 'bread', 'flour', 'oat', 'quinoa', 'barley', 'farro',
  'couscous', 'bulgur', 'millet', 'cornmeal', 'polenta', 'noodle', 'spaghetti',
  'penne', 'fettuccine', 'linguine', 'rigatoni', 'orzo', 'tortilla', 'wrap',
  'pita', 'bagel', 'roll', 'bun', 'cracker', 'cereal', 'granola', 'panko',
  'breadcrumb', 'semolina', 'whole wheat', 'sourdough',
]

const PANTRY_KEYWORDS = [
  'oil', 'vinegar', 'salt', 'pepper', 'sugar', 'honey', 'maple syrup',
  'soy sauce', 'hot sauce', 'ketchup', 'mustard', 'mayonnaise', 'ranch',
  'sriracha', 'worcestershire', 'fish sauce', 'oyster sauce', 'hoisin',
  'tomato sauce', 'tomato paste', 'crushed tomato', 'diced tomato', 'broth',
  'stock', 'coconut milk', 'coconut cream', 'lentil', 'chickpea', 'black bean',
  'kidney bean', 'white bean', 'navy bean', 'pinto bean', 'canned', 'dried',
  'spice', 'herb', 'cumin', 'paprika', 'turmeric', 'coriander', 'cinnamon',
  'nutmeg', 'cardamom', 'clove', 'allspice', 'cayenne', 'chili powder',
  'curry powder', 'garam masala', 'oregano', 'bay leaf', 'vanilla', 'cocoa',
  'chocolate', 'baking powder', 'baking soda', 'yeast', 'cornstarch', 'arrowroot',
  'nut', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'pine nut',
  'peanut', 'sesame', 'sunflower seed', 'pumpkin seed', 'raisin', 'dried fruit',
]

const FROZEN_KEYWORDS = [
  'frozen', 'ice cream', 'sorbet', 'gelato', 'popsicle', 'frozen pea',
  'frozen corn', 'frozen spinach', 'frozen berry', 'frozen shrimp',
]

const BEVERAGES_KEYWORDS = [
  'water', 'juice', 'wine', 'beer', 'coffee', 'tea', 'soda', 'sparkling',
  'kombucha', 'smoothie', 'lemonade', 'cider', 'broth drink',
]

// ─── Categorize ───────────────────────────────────────────────────────────────

export function categorize(name: string): IngredientCategory {
  const lower = name.toLowerCase()

  if (FROZEN_KEYWORDS.some((k) => lower.includes(k))) return 'frozen'
  if (SEAFOOD_KEYWORDS.some((k) => lower.includes(k))) return 'seafood'
  if (MEAT_KEYWORDS.some((k) => lower.includes(k))) return 'meat'
  if (DAIRY_KEYWORDS.some((k) => lower.includes(k))) return 'dairy'
  if (PRODUCE_KEYWORDS.some((k) => lower.includes(k))) return 'produce'
  if (GRAINS_KEYWORDS.some((k) => lower.includes(k))) return 'grains'
  if (BEVERAGES_KEYWORDS.some((k) => lower.includes(k))) return 'beverages'
  if (PANTRY_KEYWORDS.some((k) => lower.includes(k))) return 'pantry'

  return 'other'
}

// ─── Normalize ingredient key for cache lookup ────────────────────────────────

export function normalizeIngredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim()
}
