import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProPaywallCard } from '@/components/paywall/ProPaywallCard'
import { getPaywallStatus } from '@/lib/paywall/server'
import { TrendingUp, Utensils, Users, Clock, Leaf, ShieldCheck, CalendarDays } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import type { PlanDay } from '@/lib/planner/adapt'
import type { SmartMealResult } from '@/lib/engine/types'

export const metadata = { title: 'Insights' }

function getWeekOf(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-xl border border-border/60 p-5 flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default async function InsightsPage() {
  const status = await getPaywallStatus()

  if (!status.isPro) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProPaywallCard
          title="Insights unlock when you upgrade to Plus"
          description="Track cuisine trends, cook-time patterns, and household personalization once you move beyond the free preview."
          isAuthenticated={status.isAuthenticated}
          redirectPath="/insights"
          feature="insights"
        />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const weekOf = getWeekOf()

  const [{ data: planRow }, { data: prefs }] = await Promise.all([
    supabase
      .from('weekly_plans')
      .select('plan')
      .eq('user_id', user!.id)
      .eq('week_of', weekOf)
      .maybeSingle(),
    supabase
      .from('onboarding_preferences')
      .select('household_type, has_kids, cooking_time_minutes, cuisines')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])

  // ── Empty state ──────────────────────────────────────────
  if (!planRow) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Insights
          </h1>
          <p className="text-muted-foreground mt-1">Weekly overview of your family&apos;s meal plan</p>
        </div>
        <div className="glass-card rounded-xl border border-border/60 p-10 text-center flex flex-col items-center gap-4">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">No plan yet this week</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Generate a weekly meal plan to start seeing cuisine trends, cook-time stats, and personalization insights here.
          </p>
          <Link href="/planner" className={buttonVariants({ size: "lg", className: "mt-2" })}>
            Build this week&apos;s plan
          </Link>
        </div>
      </div>
    )
  }

  // ── Compute stats ────────────────────────────────────────
  const plan = planRow.plan as PlanDay[]
  const allMeals = plan.filter((d) => d.meal).map((d) => d.meal as SmartMealResult)
  const totalMeals = allMeals.length
  const avgCookTime = Math.round(allMeals.reduce((sum, m) => sum + (m.cookTime ?? 0), 0) / (totalMeals || 1))
  const mealsWithVariations = allMeals.filter((m) => m.variations && m.variations.length > 0).length

  const cuisineCounts = allMeals.reduce<Record<string, number>>((acc, m) => {
    if (m.cuisineType) acc[m.cuisineType] = (acc[m.cuisineType] ?? 0) + 1
    return acc
  }, {})
  const topCuisines = Object.entries(cuisineCounts).sort(([, a], [, b]) => b - a).slice(0, 5)

  const difficultyCounts = allMeals.reduce<Record<string, number>>((acc, m) => {
    if (m.difficulty) acc[m.difficulty] = (acc[m.difficulty] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-primary" />
          Insights
        </h1>
        <p className="text-muted-foreground mt-1">Weekly overview of your family&apos;s meal plan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Utensils className="h-5 w-5" />} label="Total Meals" value={String(totalMeals)} sub="this week" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Household" value={prefs?.household_type ?? '—'} sub={prefs?.has_kids ? 'with kids' : undefined} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Avg Cook Time" value={`${avgCookTime}m`} sub="per meal" />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Personalized" value={`${mealsWithVariations}/${totalMeals}`} sub="meals with variations" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" />Top Cuisines</h2>
          {topCuisines.length > 0 ? (
            <div className="space-y-2">
              {topCuisines.map(([cuisine, count]) => (
                <div key={cuisine} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate capitalize">{cuisine}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / totalMeals) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Generate a plan to see cuisine stats.</p>
          )}
        </div>

        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" />Meals by Difficulty</h2>
          {Object.keys(difficultyCounts).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(difficultyCounts).map(([level, count]) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24">{level}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(count / totalMeals) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No difficulty data available.</p>
          )}
        </div>
      </div>

      {prefs && (
        <div className="glass-card rounded-xl border border-border/60 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />Household Preferences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {prefs.household_type && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">Household type</p>
                <p className="font-medium capitalize">{prefs.household_type}</p>
              </div>
            )}
            {prefs.cooking_time_minutes != null && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">Target cook time</p>
                <p className="font-medium">{prefs.cooking_time_minutes} min</p>
              </div>
            )}
            {prefs.cuisines && prefs.cuisines.length > 0 && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">Preferred cuisines</p>
                <p className="font-medium capitalize">{prefs.cuisines.slice(0, 3).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
