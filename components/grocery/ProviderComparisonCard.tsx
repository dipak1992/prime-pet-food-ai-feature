'use client'

import { ArrowRight, Clock, MapPin, ShieldCheck, Truck, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProviderEstimate } from '@/lib/grocery/types'

type Props = {
  estimates: ProviderEstimate[]
  onSelectProvider: (providerId: string) => void
}

export function ProviderComparisonCard({ estimates, onSelectProvider }: Props) {
  if (estimates.length === 0) return null

  return (
    <section className="space-y-3" aria-label="Store comparison">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4.5 w-4.5 text-[#D97757]" />
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
          Shop your list
        </h3>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          · Compare price, pickup, and handoff quality
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {estimates.map((estimate, i) => (
          <button
            key={estimate.providerId}
            type="button"
            onClick={() => onSelectProvider(estimate.providerId)}
            className={cn(
              'group relative overflow-hidden rounded-2xl p-4 text-left transition-all',
              'ring-1 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
              i === 0
                ? 'ring-[#D97757]/30 bg-gradient-to-br from-orange-50 to-white dark:from-neutral-900 dark:to-neutral-950 hover:ring-[#D97757]/60'
                : 'ring-neutral-200 bg-white dark:bg-neutral-900 dark:ring-neutral-800 hover:ring-neutral-300',
            )}
          >
            {/* Best value badge */}
            {i === 0 && (
              <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#D97757]/10 px-2 py-0.5 text-[10px] font-bold text-[#D97757]">
                Best value
              </span>
            )}

            {/* Provider header */}
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${estimate.provider.color}15` }}
              >
                {estimate.provider.icon}
              </span>
              <div>
                <span className="block text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  {estimate.provider.displayName}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                    {estimate.provider.description.slice(0, 45)}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {estimate.readinessLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimate details */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Estimated total</span>
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  ${estimate.estimatedTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                {estimate.fulfillmentType === 'pickup' ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Pickup · {estimate.estimatedTime}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Delivery · {estimate.estimatedTime}
                  </span>
                )}
                {estimate.estimatedDeliveryFee > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    +${estimate.estimatedDeliveryFee.toFixed(2)} fee
                  </span>
                )}
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <CapabilityPill
                label="Price"
                value={confidenceCopy(estimate.pricingConfidence)}
              />
              <CapabilityPill
                label="Stock"
                value={confidenceCopy(estimate.availabilityConfidence)}
              />
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#D97757] group-hover:underline underline-offset-2">
                {providerCtaLabel(estimate)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[#D97757] group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Confidence indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5">
              <div
                className={cn(
                  'h-full rounded-full',
                  estimate.confidence === 'high' && 'bg-emerald-400 w-full',
                  estimate.confidence === 'medium' && 'bg-amber-400 w-2/3',
                  estimate.confidence === 'low' && 'bg-neutral-300 w-1/3',
                )}
              />
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center">
        MealEase prepares a retailer-ready payload, opens the best supported handoff, and keeps a copy-list fallback when live carts or local stock are retailer-limited.
      </p>
    </section>
  )
}

function CapabilityPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
      <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <span className="text-neutral-400 dark:text-neutral-500">{label}</span>
      {value}
    </span>
  )
}

function confidenceCopy(value: ProviderEstimate['pricingConfidence']): string {
  if (value === 'live') return 'live'
  if (value === 'estimated') return 'est.'
  return 'store'
}

function providerCtaLabel(estimate: ProviderEstimate): string {
  if (estimate.provider.cartBuilderSupported) {
    return `Shop at ${estimate.provider.displayName}`
  }
  if (estimate.providerId === 'instacart') {
    return 'Open in Instacart'
  }
  if (estimate.providerId === 'amazon_fresh') {
    return 'Open Amazon Fresh'
  }
  if (estimate.providerId === 'kroger') {
    return 'Search at Kroger'
  }
  if (estimate.providerId === 'walmart_us' || estimate.providerId === 'walmart_ca') {
    return estimate.provider.displayName === 'Walmart Canada'
      ? 'Shop at Walmart Canada'
      : 'Shop at Walmart'
  }
  if (estimate.providerId === 'costco_us' || estimate.providerId === 'costco_ca') {
    return estimate.provider.displayName === 'Costco Canada'
      ? 'Search Costco Canada'
      : 'Search Costco'
  }
  if (estimate.providerId === 'regional_market') {
    return 'Find local grocers'
  }
  return `Open ${estimate.provider.displayName}`
}
