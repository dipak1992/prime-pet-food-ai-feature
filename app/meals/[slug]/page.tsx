import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ShareButton } from '@/components/content/ShareButton'
import { getPublicMealBySlug } from '@/lib/content/public'
import { absoluteUrl } from '@/lib/seo'
import { Clock, DollarSign, Users, Sparkles } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meal = await getPublicMealBySlug(slug)

  if (!meal) {
    return {
      title: 'Meal not found',
      robots: { index: false, follow: false },
    }
  }

  const data = meal.meal_data

  return {
    title: `${data.title} Recipe`,
    description:
      meal.description ??
      data.tagline ??
      `Family-friendly ${data.cuisineType} meal ready in ${data.totalTime} minutes.`,
    alternates: {
      canonical: `/meals/${slug}`,
    },
    keywords: [
      data.title,
      'family meal ideas',
      'healthy family dinners',
      ...(data.tags ?? []),
    ],
    openGraph: {
      title: data.title,
      description: meal.description ?? data.tagline,
      type: 'article',
      url: absoluteUrl(`/meals/${slug}`),
      siteName: 'MealEase',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: meal.description ?? data.tagline,
    },
  }
}

export default async function PublicMealDetailPage({ params }: Props) {
  const { slug } = await params
  const meal = await getPublicMealBySlug(slug)

  if (!meal) {
    notFound()
  }

  const data = meal.meal_data
  const recipeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: data.title,
    description: meal.description ?? data.description ?? data.tagline,
    datePublished: meal.published_at ?? meal.created_at,
    author: {
      '@type': 'Organization',
      name: 'MealEase',
    },
    recipeCuisine: data.cuisineType,
    prepTime: `PT${data.prepTime}M`,
    cookTime: `PT${data.cookTime}M`,
    totalTime: `PT${data.totalTime}M`,
    recipeYield: `${data.servings} servings`,
    recipeIngredient: data.ingredients.map((ingredient) => {
      const quantity = [ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')
      return `${quantity} ${ingredient.name}`.trim()
    }),
    recipeInstructions: data.steps.map((step) => ({
      '@type': 'HowToStep',
      text: step,
    })),
    keywords: data.tags.join(', '),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Meals', item: absoluteUrl('/meals') },
      { '@type': 'ListItem', position: 3, name: data.title, item: absoluteUrl(`/meals/${slug}`) },
    ],
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mb-8">
        <Link href="/meals" className="text-sm font-medium text-primary hover:underline">
          ← Back to public meals
        </Link>
      </div>

      <article className="space-y-8">
        <header>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.cuisineType && (
              <Badge variant="secondary" className="capitalize">
                {data.cuisineType}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {data.difficulty}
            </Badge>
            {data.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">{data.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {meal.description ?? data.tagline}
          </p>
          <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {data.totalTime} minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {data.servings} servings
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> ${data.estimatedCost.toFixed(2)} estimated
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">Why this meal works for families</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MealEase generates one base dinner and then adapts serving guidance for different ages, textures, and household constraints.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2 rounded-2xl border border-border/60 bg-card p-5">
            {data.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`} className="flex gap-3 text-sm">
                <span className="w-24 flex-shrink-0 text-right text-muted-foreground">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span>{ingredient.name}</span>
                {ingredient.note && (
                  <span className="text-muted-foreground italic">{ingredient.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
            {data.steps.map((step, index) => (
              <li key={`${index}-${step.slice(0, 16)}`} className="flex gap-4 text-sm">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="leading-relaxed pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {data.variations.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Family-safe variation ideas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {data.variations.map((variation) => (
                <div key={variation.stage} className="rounded-2xl border border-border/60 bg-card p-5">
                  <p className="text-sm font-semibold mb-1 capitalize">
                    {variation.emoji} {variation.label}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {variation.description}
                  </p>
                  {variation.modifications.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {variation.modifications.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.leftoverTip && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <strong>Leftover tip:</strong> {data.leftoverTip}
          </section>
        )}

        <footer className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ShareButton slug={slug} type="meal" basePath="meals" />
          <p className="text-sm text-muted-foreground">
            Want personalized versions for your household?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Try MealEase
            </Link>
          </p>
        </footer>
      </article>
    </main>
  )
}
