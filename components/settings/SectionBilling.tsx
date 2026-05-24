'use client'

import { useState } from 'react'
import { CreditCard, Loader2, ExternalLink } from 'lucide-react'
import type { PlanId } from '@/lib/stripe/plans'
import { PLANS } from '@/lib/stripe/plans'

type Props = {
  currentPlan: PlanId
  planStatus: string | null
  renewsAt: string | null
  stripeCustomerId: string | null
  hasStripeCustomer: boolean
}

export function SectionBilling({
  currentPlan,
  planStatus,
  renewsAt,
  hasStripeCustomer,
}: Props) {
  const [loading, setLoading] = useState(false)
  const plan = PLANS[currentPlan]

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  const statusLabel = planStatus === 'past_due'
    ? '⚠️ Past due'
    : planStatus === 'canceled'
    ? 'Canceled'
    : planStatus === 'paused'
    ? 'Paused'
    : null

  return (
    <section className="rounded-3xl border border-orange-100 bg-white/82 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-950">
        <CreditCard className="h-4 w-4 text-[#B8935A]" />
        Billing
      </h2>

      {/* Current plan */}
      <div className="mb-5 rounded-2xl border border-orange-100 bg-white/82 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">Current plan</p>
            <p className="mt-0.5 text-lg font-bold text-slate-950">{plan.name}</p>
            <p className="text-sm text-slate-500">{plan.tagline}</p>
            {statusLabel && (
              <p className="mt-1 text-xs text-amber-400">{statusLabel}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-950">
              {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}`}
            </p>
            {plan.priceMonthly > 0 && (
              <p className="text-xs text-slate-400">/month</p>
            )}
          </div>
        </div>

        {renewsAt && (
          <p className="mt-3 text-xs text-slate-400">
            Renews {new Date(renewsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {currentPlan === 'free' ? (
          <a
            href="/upgrade"
            className="flex items-center gap-2 rounded-2xl bg-[#D97757] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c4694a]"
          >
            Upgrade plan
          </a>
        ) : hasStripeCustomer ? (
          <button
            type="button"
            onClick={openPortal}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/82 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Manage billing
          </button>
        ) : null}
      </div>
    </section>
  )
}
