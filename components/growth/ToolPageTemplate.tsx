import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/landing/Nav'
import { GrowthToolClient } from '@/components/growth/GrowthToolClient'
import { StructuredData } from '@/components/growth/StructuredData'
import { growthClusters, growthTools, type GrowthTool } from '@/lib/growth/content'

export function ToolPageTemplate({ tool }: { tool: GrowthTool }) {
  const relatedTools = growthTools.filter((item) => item.slug !== tool.slug).slice(0, 3)

  return (
    <>
      <StructuredData type="tool" tool={tool} />
      <Nav />
      <main id="main" className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <section className="border-b border-neutral-200 bg-[#FDF6F1] py-14 dark:border-neutral-800 dark:bg-neutral-900 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Free MealEase tool
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight md:text-6xl">
              {tool.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              {tool.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {tool.outcomes.map((outcome) => (
                <span key={outcome} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#D97757]" />
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-neutral-200 bg-white py-10 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <article>
              <h2 className="font-serif text-3xl font-bold tracking-tight">What does this MealEase tool do?</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <strong>TL;DR:</strong> {tool.description} The free result is useful on its own, and saving it in MealEase turns the answer into household memory for future dinners, groceries, budget, and leftovers.
              </p>
              <h3 className="mt-6 text-lg font-bold">Who is it for?</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                This workflow is built for families and busy households that want a specific dinner answer without rebuilding context every time they plan.
              </p>
            </article>
            <aside className="rounded-lg bg-[#FFF7F2] p-5 ring-1 ring-[#F0D9C9] dark:bg-neutral-900 dark:ring-neutral-800">
              <h3 className="text-lg font-bold">Proof points</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <li>MealEase connects dinner ideas to pantry, leftovers, grocery lists, and budget.</li>
                <li>Using one $38 avoided takeout night can offset a month of Plus.</li>
                <li>Using aging food before it spoils can reduce about $12/week in waste.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <GrowthToolClient tool={tool} />
          </div>
        </section>

        <section className="bg-neutral-50 py-14 dark:bg-neutral-900/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                {growthClusters[tool.cluster].label}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight">Built for search intent and signup intent</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                This tool gives the visitor a useful result first, then asks them to save, share, or personalize it in MealEase.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedTools.map((item) => (
                <Link
                  key={item.slug}
                  href={`/tools/${item.slug}`}
                  className="group rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-[#D97757] dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <span className="text-sm font-bold">{item.title}</span>
                  <span className="mt-2 block text-xs leading-5 text-neutral-600 dark:text-neutral-400">
                    {item.outcomes[0]}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#D97757]">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
