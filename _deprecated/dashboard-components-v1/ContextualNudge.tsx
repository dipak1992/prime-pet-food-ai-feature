'use client'

import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'

export function ContextualNudge() {
  const nudge = useDashboardStore((s) => s.nudge)
  const dismiss = useDashboardStore((s) => s.dismissNudge)
  if (!nudge) return null

  return (
    <aside
      role="region"
      aria-label="Contextual suggestion"
      className="relative rounded-2xl bg-gradient-to-r from-[#D97757]/10 via-[#D97757]/5 to-transparent dark:from-[#D97757]/15 dark:via-[#D97757]/5 ring-1 ring-[#D97757]/20 p-4 md:p-5"
    >
      {nudge.dismissible && (
        <button
          onClick={() => dismiss(nudge.id)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/60 dark:hover:bg-black/20 text-neutral-500 transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="pr-8">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm md:text-base">
          {nudge.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {nudge.body}
        </p>
        <Link
          href={nudge.ctaHref}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D97757] hover:text-[#C86646] group"
        >
          {nudge.ctaLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  )
}
