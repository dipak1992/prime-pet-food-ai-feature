'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CalendarClock, Check, CircleDollarSign, ShoppingCart, UsersRound, Utensils } from 'lucide-react'
import type { AutonomousAction, DashboardPayload } from '@/lib/dashboard/types'

type Props = {
  actions: DashboardPayload['autonomousActions']
}

const ICONS: Record<AutonomousAction['actionType'], LucideIcon> = {
  budget_rebalance: CircleDollarSign,
  leftover_rescue: Utensils,
  grocery_prepare: ShoppingCart,
  timing_adjustment: CalendarClock,
  collaboration_prompt: UsersRound,
}

export function AutonomousActionsCard({ actions }: Props) {
  const router = useRouter()
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [pendingId, setPendingId] = useState<string | null>(null)
  const visibleActions = actions.filter((action) => !hiddenIds.has(action.id))

  if (visibleActions.length === 0) return null

  const primary = visibleActions[0]
  const Icon = ICONS[primary.actionType]

  async function decide(action: AutonomousAction, decision: 'applied' | 'dismissed') {
    setPendingId(action.id)
    try {
      const res = await fetch('/api/household/autonomous-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          decision,
          actionType: action.actionType,
          title: action.title,
          ctaHref: action.ctaHref,
        }),
      })
      const data = await res.json().catch(() => null)
      setHiddenIds((current) => new Set([...current, action.id]))
      if (decision === 'applied') {
        router.push(data?.redirectTo ?? action.ctaHref)
      }
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section
      aria-label="Autonomous Food OS actions"
      className="rounded-2xl border border-neutral-200 bg-neutral-950 p-4 text-white shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-orange-200 ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-200">
              Autonomous Food OS
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
              {primary.confidence} confidence
            </span>
            {primary.impactUsd != null && (
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                ~${primary.impactUsd.toFixed(0)} impact
              </span>
            )}
          </div>
          <h2 className="mt-1 text-sm font-bold">{primary.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-300">{primary.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendingId === primary.id}
              onClick={() => decide(primary, 'applied')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-60"
            >
              {pendingId === primary.id ? 'Applying...' : primary.ctaLabel}
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={pendingId === primary.id}
              onClick={() => decide(primary, 'dismissed')}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-neutral-200 transition hover:bg-white/10 disabled:opacity-60"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      {visibleActions.length > 1 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {visibleActions.slice(1).map((action) => {
            const SmallIcon = ICONS[action.actionType]
            return (
              <Link
                key={action.id}
                href={action.ctaHref}
                className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="flex items-start gap-2">
                  <SmallIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" />
                  <div>
                    <p className="flex items-center gap-1 text-xs font-bold">
                      <Check className="h-3 w-3 text-emerald-200" />
                      {action.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-neutral-400">
                      {action.body}
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
