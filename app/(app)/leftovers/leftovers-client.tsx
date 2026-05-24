'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, UtensilsCrossed } from 'lucide-react'
import { useLeftoversStore } from '@/stores/leftoversStore'
import { LeftoverCard } from '@/components/leftovers/LeftoverCard'
import { LeftoverModal } from '@/components/leftovers/LeftoverModal'
import { LeftoverInsights } from '@/components/leftovers/LeftoverInsights'
import type { Leftover, LeftoverInsights as LeftoverInsightsType } from '@/lib/leftovers/types'

type Filter = 'all' | 'active' | 'expiring' | 'used'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  expiring: 'Expiring',
  used: 'History',
}

type Props = {
  initialLeftovers: Leftover[]
  initialInsights: LeftoverInsightsType
  isPlusMember: boolean
}

export function LeftoversClient({ initialLeftovers, initialInsights, isPlusMember }: Props) {
  const hydrate = useLeftoversStore((s) => s.hydrate)
  const hydrated = useLeftoversStore((s) => s.hydrated)
  const filter = useLeftoversStore((s) => s.filter)
  const setFilter = useLeftoversStore((s) => s.setFilter)
  const getFiltered = useLeftoversStore((s) => s.getFiltered)
  const insights = useLeftoversStore((s) => s.insights)

  // Hydrate store on mount
  useEffect(() => {
    if (!hydrated) {
      hydrate(initialLeftovers, initialInsights)
    }
  }, [hydrated, hydrate, initialLeftovers, initialInsights])

  const filtered = getFiltered()
  const urgentItems = filtered.filter(
    (l) => l.status === 'active' && (l.urgency === 'today' || l.urgency === 'expired'),
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.14),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#fefce8_28%,#f8fafc_100%)] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-950">Leftovers</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track, use, and reduce food waste</p>
        </div>

        {/* Insights */}
        {insights && <LeftoverInsights insights={insights} />}

        {/* Urgent banner */}
        <AnimatePresence>
          {urgentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {urgentItems.length === 1
                    ? '1 item needs attention'
                    : `${urgentItems.length} items need attention`}
                </p>
                <p className="text-xs text-red-700/80 mt-0.5">
                  {urgentItems.map((l) => l.name).join(', ')} —{' '}
                  {urgentItems.some((l) => l.urgency === 'expired') ? 'expired or expiring today' : 'use today'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-[#D97757] text-white shadow-sm'
                  : 'bg-white text-slate-500 ring-1 ring-orange-100 hover:bg-orange-50 hover:text-slate-950'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* List */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <UtensilsCrossed className="h-10 w-10 text-orange-200" />
              <p className="text-sm font-medium text-slate-500">
                {filter === 'all'
                  ? 'No leftovers yet'
                  : filter === 'expiring'
                  ? 'Nothing expiring soon 🎉'
                  : filter === 'used'
                  ? 'No history yet'
                  : 'No active leftovers'}
              </p>
              {filter === 'all' && (
              <p className="text-xs text-slate-400 max-w-[220px]">
                  Cook a meal to create leftovers, then MealEase will help you use them before they expire.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-2">
              {filtered.map((leftover) => (
                <LeftoverCard key={leftover.id} leftover={leftover} variant="compact" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      <LeftoverModal isPlusMember={isPlusMember} />
    </div>
  )
}
