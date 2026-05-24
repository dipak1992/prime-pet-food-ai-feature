'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Brain, CalendarClock, CircleDollarSign, Refrigerator, ShoppingCart } from 'lucide-react'
import type { DashboardPayload, PredictiveInsight } from '@/lib/dashboard/types'

type Props = {
  insights: DashboardPayload['predictiveInsights']
}

const ICONS: Record<PredictiveInsight['type'], LucideIcon> = {
  low_pantry: Refrigerator,
  quick_dinner_night: CalendarClock,
  grocery_budget: ShoppingCart,
  pantry_expiry: Refrigerator,
  memory: Brain,
}

export function PredictiveIntelligenceCard({ insights }: Props) {
  if (insights.length === 0) return null

  const primary = insights[0]
  const PrimaryIcon = ICONS[primary.type] ?? Brain

  return (
    <section
      aria-label="Predictive household intelligence"
      className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#D97757] ring-1 ring-orange-100">
          <PrimaryIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B9603D]">
              Predictive household intelligence
            </p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
              {primary.confidence} confidence
            </span>
          </div>
          <h2 className="mt-1 text-sm font-bold text-neutral-950">{primary.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">{primary.body}</p>
          <Link
            href={primary.ctaHref}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800"
          >
            {primary.ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {insights.length > 1 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {insights.slice(1).map((insight) => {
            const Icon = ICONS[insight.type] ?? CircleDollarSign
            return (
              <Link
                key={insight.id}
                href={insight.ctaHref}
                className="group rounded-xl bg-white/80 p-3 ring-1 ring-orange-100 transition hover:bg-white hover:ring-orange-200"
              >
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D97757]" />
                  <div>
                    <p className="text-xs font-bold text-neutral-950">{insight.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-neutral-500">
                      {insight.body}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
