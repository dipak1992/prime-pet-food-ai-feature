import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { SavedMeal } from '@/lib/content/types'
import { ShareButton } from '@/components/content/ShareButton'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

const getMeal = cache(async (slug: string): Promise<SavedMeal | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('saved_meals')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meal = await getMeal(slug)
  if (!meal) return { title: 'Meal not found — MealEase', robots: { index: false, follow: false } }
  const m = meal.meal_data
  return {
    title: `${m.title} — MealEase`,
    description:
      m.tagline ?? `A ${m.cuisineType} recipe ready in ${m.totalTime} minutes.`,
    alternates: {
      canonical: `/meals/${slug}`,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: m.title,
      description: m.tagline ?? undefined,
      type: 'article',
      siteName: 'MealEase',
      url: absoluteUrl(`/meals/${slug}`),
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: m.title }],
    },
  }
}

export default async function ShareMealPage({ params }: Props) {
  const { slug } = await params
  const meal = await getMeal(slug)
  if (!meal) notFound()

  const m = meal.meal_data

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Minimal brand header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <Link href="/" className="font-bold text-primary text-lg">
          🥗 MealEase
        </Link>
      </div>

      <div className="space-y-8">
        {/* Badges + title */}
        <div>
          {/* Illustration header */}
          <div className="relative rounded-2xl overflow-hidden mb-4 h-36 gradient-sage flex items-center justify-center">
            <span className="text-6xl select-none" aria-hidden="true">
              {m.cuisineType === 'italian' ? '🍝'
                : m.cuisineType === 'mexican' ? '🌮'
                : m.cuisineType === 'asian' ? '🍜'
                : m.cuisineType === 'american' ? '🍔'
                : m.cuisineType === 'mediterranean' ? '🥗'
                : m.cuisineType === 'indian' ? '🍛'
                : m.cuisineType === 'nepali' ? '🏔️'
                : '🍽️'}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {m.cuisineType && (
              <Badge variant="secondary" className="capitalize">
                {m.cuisineType}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {m.difficulty}
            </Badge>
            {m.tags?.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold mb-2">{m.title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{m.tagline}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-y border-border/60 py-4">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {m.totalTime} min total
          </span>
          <span className="flex items-center gap-1.5">⏱ {m.prepTime} min prep</span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {m.servings} servings
          </span>
          {m.estimatedCost > 0 && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />${m.estimatedCost.toFixed(2)}
            </span>
          )}
        </div>

        {/* Ingredients */}
        <section>
          <h2 className="font-semibold text-lg mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {m.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-muted-foreground w-24 flex-shrink-0 text-right">
                  {ing.quantity} {ing.unit}
                </span>
                <span>{ing.name}</span>
                {ing.note && (
                  <span className="text-muted-foreground italic">{ing.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section>
          <h2 className="font-semibold text-lg mb-3">Instructions</h2>
          <ol className="space-y-4">
            {m.steps.map((step, i) => (
              <li key={i} className="flex gap-4 text-sm">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Leftover tip */}
        {m.leftoverTip && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Leftover tip:</strong> {m.leftoverTip}
          </div>
        )}

        {/* Footer CTA */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ShareButton slug={slug} type="meal" />
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold text-foreground">MealEase</span> —{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Build your own meal plan →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
