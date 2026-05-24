import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SavedMeal, SavedMealSummary } from '@/lib/content/types'

export const getPublicMeals = cache(async (limit = 24): Promise<SavedMealSummary[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_meals')
    .select('id, slug, title, description, cuisine_type, is_public, created_at, published_at')
    .eq('is_public', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return data satisfies SavedMealSummary[]
})

export const getPublicMealBySlug = cache(async (slug: string): Promise<SavedMeal | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_meals')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error) {
    return null
  }

  return data satisfies SavedMeal
})
