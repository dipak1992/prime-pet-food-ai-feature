import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HELP_CATEGORIES, HELP_ARTICLES } from '@/lib/help/articles'
import { FadeIn } from '@/components/landing/shared/FadeIn'

export function HelpCategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {HELP_CATEGORIES.map((cat, i) => {
        const count = HELP_ARTICLES.filter((a) => a.category === cat.id).length
        return (
          <FadeIn key={cat.id} delay={i * 0.05}>
            <Link
              href={`/help/${cat.id}`}
              className="group flex flex-col gap-3 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-5 hover:ring-[#D97757]/40 hover:-translate-y-0.5 hover:shadow-sm transition-all"
            >
              <div className="text-3xl" aria-hidden>
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#D97757] transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {cat.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                <span>
                  {count} article{count === 1 ? '' : 's'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#D97757]" />
              </div>
            </Link>
          </FadeIn>
        )
      })}
    </div>
  )
}
