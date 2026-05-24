import type { Recipe } from '@/lib/dashboard/types'

const FALLBACK_BY_TAG: Array<{ match: string[]; src: string }> = [
  { match: ['pasta', 'spaghetti', 'noodle', 'mac'], src: '/landing/app-cooking.jpg' },
  { match: ['bowl', 'rice', 'grain', 'buddha'], src: '/landing/pantry.jpg' },
  { match: ['chicken', 'fajita', 'teriyaki'], src: '/landing/family-dinner.jpg' },
  { match: ['taco', 'quesadilla', 'burrito', 'mexican'], src: '/landing/family-dinner.jpg' },
  { match: ['salmon', 'shrimp', 'fish', 'seafood'], src: '/landing/date-night.jpg' },
  { match: ['vegetarian', 'chickpea', 'lentil', 'veggie', 'salad'], src: '/landing/pantry.jpg' },
  { match: ['egg', 'breakfast'], src: '/landing/app-cooking.jpg' },
  { match: ['soup', 'stew', 'chili'], src: '/landing/family-dinner.jpg' },
]

function isUsableImage(src: string | null | undefined) {
  return Boolean(src && (src.startsWith('/') || src.startsWith('https://images.unsplash.com/')))
}

export function resolveTonightMealImage(recipe: Pick<Recipe, 'name' | 'image' | 'tags'>): string {
  if (isUsableImage(recipe.image) && recipe.image !== '/cards/tonight.jpg') {
    return recipe.image
  }

  const haystack = [recipe.name, ...(recipe.tags ?? [])].join(' ').toLowerCase()
  const fallback = FALLBACK_BY_TAG.find((item) =>
    item.match.some((keyword) => haystack.includes(keyword)),
  )

  return fallback?.src ?? '/landing/family-dinner.jpg'
}
