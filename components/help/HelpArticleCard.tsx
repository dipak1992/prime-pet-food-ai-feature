import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HelpArticle } from '@/lib/help/types'

export function HelpArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link
      href={`/help/${article.category}/${article.slug}`}
      className="group block rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-5 hover:ring-[#D97757]/40 hover:-translate-y-0.5 hover:shadow-sm transition-all"
    >
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#D97757] transition-colors">
        {article.title}
      </h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
        {article.description}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#D97757]">
        Read
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
