import Link from 'next/link'
import { Activity, ArrowRight, BarChart3, MousePointerClick, Share2, Users } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/landing/Nav'
import { buildMetadata } from '@/lib/seo'
import { analyticsKpis, growthClusters, growthPages, growthTools } from '@/lib/growth/content'

export const metadata = buildMetadata({
  title: 'Growth Analytics Dashboard',
  description:
    'MealEase growth dashboard for SEO clusters, free tool activation, share cards, referrals, and signup conversion tracking.',
  path: '/growth-dashboard',
})

const metricCards = [
  {
    label: 'SEO pages live',
    value: growthPages.length,
    icon: BarChart3,
    detail: 'Cluster and programmatic pages in the sitemap',
  },
  {
    label: 'Free tools live',
    value: growthTools.length,
    icon: MousePointerClick,
    detail: 'Product-led acquisition tools',
  },
  {
    label: 'Share loops',
    value: 4,
    icon: Share2,
    detail: 'Meal cards, plan cards, savings cards, pins',
  },
  {
    label: 'Referral unlocks',
    value: 2,
    icon: Users,
    detail: 'Plus trial days and Smart Menu Scan milestone',
  },
]

export default function GrowthDashboardPage() {
  const programmaticCount = growthPages.filter((page) => page.kind === 'programmatic').length

  return (
    <>
      <Nav />
      <main id="main" className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <section className="border-b border-neutral-200 bg-[#FDF6F1] py-14 dark:border-neutral-800 dark:bg-neutral-900 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Organic acquisition command center
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight md:text-6xl">
              MealEase free traffic engine
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              A compact dashboard for the SEO clusters, tools, referral loops, and conversion events that make the engine measurable.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map(({ label, value, icon: Icon, detail }) => (
                <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <Icon className="h-5 w-5 text-[#D97757]" />
                  <p className="mt-4 text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-sm font-semibold">{label}</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-600 dark:text-neutral-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 py-14 dark:bg-neutral-900/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#D97757]" />
                <h2 className="font-serif text-2xl font-bold">KPIs to instrument</h2>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {analyticsKpis.map((kpi) => (
                  <code key={kpi} className="rounded-md bg-neutral-100 px-2.5 py-2 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                    {kpi}
                  </code>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <h2 className="font-serif text-2xl font-bold">Cluster coverage</h2>
              <div className="mt-5 space-y-3">
                {Object.values(growthClusters).map((cluster) => {
                  const count = growthPages.filter((page) => page.cluster === Object.keys(growthClusters).find((key) => growthClusters[key as keyof typeof growthClusters].slug === cluster.slug)).length
                  return (
                    <Link
                      key={cluster.slug}
                      href={`/${cluster.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-3 hover:border-[#D97757] dark:border-neutral-800"
                    >
                      <span>
                        <span className="block text-sm font-bold">{cluster.label}</span>
                        <span className="block text-xs text-neutral-500">{count || 'Hub'} pages</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#D97757] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )
                })}
              </div>
              <p className="mt-5 text-sm text-neutral-600 dark:text-neutral-300">
                Programmatic pages live: <span className="font-bold">{programmaticCount}</span>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
