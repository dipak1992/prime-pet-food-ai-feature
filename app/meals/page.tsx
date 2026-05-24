import Link from 'next/link'
import { Clock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPublicMeals } from '@/lib/content/public'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata = buildMetadata({
  title: 'Public Meal Ideas for Families',
  description:
    'Browse public MealEase meal pages with family-friendly recipes, prep times, and serving ideas for babies, toddlers, kids, and adults.',
  path: '/meals',
  keywords: ['family recipes', 'meal ideas', 'healthy family dinners', 'public meal pages'],
})

export default async function PublicMealsPage() {
  const meals = await getPublicMeals(48)

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-10">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Public meals
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Family meal ideas you can discover, save, and cook</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These public MealEase meals are built for families juggling age, texture, allergy, and health-condition differences around one dinner table.
        </p>
      </div>

      {meals.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">
          No public meals are published yet. Once shared meals are marked public, they will appear here automatically.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <Link
              key={meal.id}
              href={`/meals/${meal.slug}`}
              className="glass-card rounded-2xl border border-border/60 p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {meal.cuisine_type && (
                  <Badge variant="secondary" className="capitalize">
                    {meal.cuisine_type}
                  </Badge>
                )}
                <Badge variant="outline">Public recipe</Badge>
              </div>
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">{meal.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {meal.description ?? 'Family-friendly meal idea generated and published with MealEase.'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(meal.published_at ?? meal.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-medium text-primary">View meal →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
