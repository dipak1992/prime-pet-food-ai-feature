import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getRelatedGrowthPages, growthTools, type GrowthPage } from '@/lib/growth/content'

export function InternalLinks({ page }: { page: GrowthPage }) {
  const relatedPages = getRelatedGrowthPages(page, 4)
  const relatedTools = growthTools.filter((tool) => tool.cluster === page.cluster).slice(0, 2)

  return (
    <section className="border-t border-neutral-200 bg-white py-14 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
            Keep planning
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Related dinner helpers
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            Every MealEase traffic page points toward a useful next step, not a dead end.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...relatedTools.map((tool) => ({
            href: `/tools/${tool.slug}`,
            label: tool.title,
            description: tool.description,
          })), ...relatedPages.map((related) => ({
            href: `/${related.slug}`,
            label: related.h1,
            description: related.intent,
          }))].slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-[#D97757] hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-900/60"
            >
              <span className="flex items-center justify-between gap-3 text-sm font-bold text-neutral-950 dark:text-white">
                {item.label}
                <ArrowRight className="h-4 w-4 text-[#D97757] transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 block text-xs leading-5 text-neutral-600 dark:text-neutral-400">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
