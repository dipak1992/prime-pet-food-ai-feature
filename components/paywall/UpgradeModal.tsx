'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Zap, Shield, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRICING_TIERS, PRO_ANNUAL_SAVINGS } from '@/lib/paywall/config'
import { getUpgradeFeatureCopy } from '@/lib/paywall/feature-copy'
import posthog from 'posthog-js'

/* ─────────────────────── TYPES ─────────────────────── */

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Feature that triggered the modal — shown in copy */
  feature?: string
  /** Custom title override */
  title?: string
  /** Custom description override */
  description?: string
  /** Whether user is authenticated */
  isAuthenticated: boolean
}

/* ─────────────────────── BENEFITS ─────────────────────── */

const QUICK_BENEFITS = [
  'Plan the full week in one tap',
  'Turn meals into a grocery list',
  'Connect leftovers, budget, and preferences',
]

/* ─────────────────────── COMPONENT ─────────────────────── */

export function UpgradeModal({
  open,
  onOpenChange,
  feature,
  title,
  description,
  isAuthenticated,
}: UpgradeModalProps) {
  const router = useRouter()
  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly')
  const [loading, setLoading] = useState(false)

  const proMonthly = PRICING_TIERS.pro.monthlyPrice
  const proAnnual = PRICING_TIERS.pro.yearlyPrice
  const proAnnualMonthly = (proAnnual / 12).toFixed(2)

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/signup?redirect=/upgrade&plan=${billing === 'yearly' ? 'pro_yearly' : 'pro_monthly'}`)
      onOpenChange(false)
      return
    }

    setLoading(true)
    posthog.capture('upgrade_modal_checkout_initiated', {
      billing,
      feature_trigger: feature,
    })

    try {
      const plan = billing === 'yearly' ? 'pro_yearly' : 'pro_monthly'
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()

      if (data.error === 'billing_not_configured') {
        // Stripe not configured — fall back to trial
        const trialRes = await fetch('/api/paywall/start-trial', { method: 'POST' })
        const trialData = await trialRes.json()
        if (!trialRes.ok) {
          toast.error(trialData.error || 'Could not start trial')
          return
        }
        posthog.capture('upgrade_modal_trial_started', { billing, feature_trigger: feature })
        toast.success('Your 7-day Plus trial is active!', {
          description: 'Enjoy full access to every feature.',
        })
        onOpenChange(false)
        router.refresh()
        return
      }

      if (!res.ok) {
        toast.error(data.error || 'Could not start checkout. Please try again.')
        return
      }

      if (data.url) {
        posthog.capture('upgrade_modal_redirected_to_stripe', { billing })
        window.location.href = data.url
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [billing, feature, isAuthenticated, onOpenChange, router])

  if (!open) return null

  const featureCopy = getUpgradeFeatureCopy(feature)
  const displayTitle = title || featureCopy.title
  const displayDesc = description || featureCopy.description
  const benefits = (feature ? featureCopy.bullets : QUICK_BENEFITS).slice(0, 3)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
        <div
          className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e06] via-[#1e1208] to-neutral-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,_rgba(217,119,87,0.2),_transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #D97757 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D97757]/15 text-[#D97757] text-xs font-bold px-3 py-1 mb-3 uppercase tracking-wider">
                <Zap className="h-3 w-3" />
                {featureCopy.eyebrow}
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                {displayTitle}
              </h2>
              <p className="mt-2 text-sm text-neutral-400 max-w-xs mx-auto">
                {displayDesc}
              </p>
            </div>

            {/* Benefits */}
            <ul className="mb-5 grid grid-cols-1 gap-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-xs text-neutral-300 sm:text-sm">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-800/80 p-0.5">
                <button
                  onClick={() => setBilling('monthly')}
                  className={cn(
                    'text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all',
                    billing === 'monthly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200',
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={cn(
                    'text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1',
                    billing === 'yearly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200',
                  )}
                >
                  Annual
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    -{PRO_ANNUAL_SAVINGS}%
                  </span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-serif text-4xl font-bold text-white">
                  ${billing === 'yearly' ? proAnnualMonthly : proMonthly}
                </span>
                <span className="text-sm text-neutral-400">/mo</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  ${proAnnual}/yr · <span className="line-through">${proMonthly}/mo</span>
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] disabled:opacity-60 disabled:cursor-not-allowed py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processing…</span>
              ) : (
                isAuthenticated ? 'Try Plus free →' : 'Create account →'
              )}
            </button>

            {/* Trust */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                7-day free trial
              </span>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
            <p className="mx-auto mt-2 max-w-[18rem] text-center text-[10px] leading-relaxed text-neutral-500">
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
