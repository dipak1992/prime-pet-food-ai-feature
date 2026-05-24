import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/landing/Nav'
import { buildMetadata } from '@/lib/seo'
import { growthTools } from '@/lib/growth/content'

export const metadata = buildMetadata({
  title: 'Free Meal Planning Tools',
  description:
    'Use free MealEase tools for dinner ideas, pantry recipes, grocery budgets, leftovers, portion guidance, pregnancy-safe meal planning, and dinner cost estimates.',
  path: '/tools',
  keywords: ['free meal planning tools', 'dinner generator', 'pantry recipe finder', 'grocery budget calculator', 'portion guide meal planner', 'pregnancy safe meal planner'],
})

export default function ToolsIndexPage() {
  return (
    <>
      <Nav />
      <main id="main" className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <section className="border-b border-neutral-200 bg-[#FDF6F1] py-14 dark:border-neutral-800 dark:bg-neutral-900 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Free tools
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight md:text-6xl">
              Solve dinner first. Save the plan next.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              Each tool gives a useful result before signup, including specialized workflows for budget, leftovers, portion guidance, and pregnancy-aware dinner planning.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {/* Scan to Demo — featured card */}
            <Link
              href="/demo/scan"
              className="group rounded-lg border-2 border-[#D97757]/40 bg-gradient-to-br from-orange-50 to-amber-50 p-5 transition-colors hover:border-[#D97757] hover:shadow-md dark:border-[#D97757]/30 dark:from-neutral-900 dark:to-neutral-900 dark:hover:bg-neutral-950"
            >
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                ✨ New — Try instantly
              </span>
              <h2 className="mt-3 font-serif text-2xl font-bold">Scan to Demo</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                Upload a fridge or pantry photo and see AI-powered meal suggestions instantly — no signup required.
              </p>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D97757]" />
                  No account needed
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D97757]" />
                  See real AI meal results
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D97757]" />
                  Try before you sign up
                </li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#D97757]">
                Try the demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            {growthTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-lg border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-[#D97757] hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-950"
              >
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                  {tool.outcomes[0]}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-bold">{tool.title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {tool.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {tool.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D97757]" />
                      {outcome}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#D97757]">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
