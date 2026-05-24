import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { PublishedPlan } from '@/lib/content/types'
import { ShareButton } from '@/components/content/ShareButton'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

const DAY_FULL: Record<number, string> = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
}

const CUISINE_EMOJI: Record<string, string> = {
  italian: '🍝',
  mexican: '🌮',
  asian: '🥢',
  american: '🍔',
  indian: '🍛',
  mediterranean: '🥗',
  comfort: '🫕',
  global: '🌏',
  nepali: '🏔️',
}

const getPlan = cache(async (slug: string): Promise<PublishedPlan | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('published_plans')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const plan = await getPlan(slug)
  if (!plan) return { title: 'Plan not found — MealEase' }
  const mealCount = plan.plan_data.days.filter((d) => d.meal).length
  return {
    title: `${plan.title} — MealEase`,
    description:
      plan.description ??
      `A weekly meal plan with ${mealCount} meals. Powered by MealEase.`,
    openGraph: {
      title: plan.title,
      description: plan.description ?? undefined,
      type: 'article',
      siteName: 'MealEase',
    },
  }
}

export default async function SharePlanPage({ params }: Props) {
  const { slug } = await params
  const plan = await getPlan(slug)
  if (!plan) notFound()

  const days = plan.plan_data.days.filter((d) => d.meal !== null)
  const weekDate = new Date(plan.plan_data.weekStart + 'T00:00:00').toLocaleDateString(
    'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' },
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Minimal brand header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <Link href="/" className="font-bold text-primary text-lg">
          🥗 MealEase
        </Link>
      </div>

      <div className="space-y-8">
        {/* Plan header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
          {plan.description && (
            <p className="text-muted-foreground text-lg mb-2">{plan.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {days.length} meal{days.length !== 1 ? 's' : ''} · Week of {weekDate}
          </p>
        </div>

        {/* Meal tiles */}
        <div className="space-y-3">
          {plan.plan_data.days.map((day) => {
            if (!day.meal) return null
            const m = day.meal
            const emoji =
              CUISINE_EMOJI[(m.cuisineType ?? '').toLowerCase().split(' ')[0]] ?? '🍽️'
            return (
              <div
                key={day.dayIndex}
                className="flex gap-4 rounded-xl border border-border/60 bg-card p-4 items-start"
              >
                <span className="text-3xl flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {DAY_FULL[day.dayIndex]}
                    </Badge>
                    {m.cuisineType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {m.cuisineType}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {m.tagline}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {m.totalTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {m.servings} servings
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ShareButton slug={slug} type="plan" />
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
