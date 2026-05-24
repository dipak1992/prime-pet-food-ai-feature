'use client'

import Link from 'next/link'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useScanStore } from '@/stores/scanStore'
import { LockBadge } from './shared/LockBadge'
import { isActionGated } from '@/config/quick-actions'
import { hapticTap } from '@/lib/scan/haptics'
import { cn } from '@/lib/utils'

// IDs that should open the scan modal instead of navigating
const SCAN_ACTION_IDS = ['scan']

export function QuickActions() {
  const actions = useDashboardStore((s) => s.quickActions)
  const user = useDashboardStore((s) => s.user)
  const openScan = useScanStore((s) => s.open)

  if (!user || actions.length === 0) return null

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-3"
      >
        🎯 Quick actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => {
          const gated = isActionGated(a.requiredPlan, user.plan)
          const isScanAction = SCAN_ACTION_IDS.includes(a.id)

          if (isScanAction && !gated) {
            // Render as button that opens scan modal
            return (
              <button
                key={a.id}
                onClick={() => { hapticTap(); openScan('auto') }}
                className={cn(
                  'relative group block rounded-2xl p-4 min-h-[96px] text-left',
                  'bg-white dark:bg-neutral-900 ring-1 ring-neutral-200/70 dark:ring-neutral-800',
                  'hover:ring-[#D97757]/40 hover:-translate-y-0.5 hover:shadow-sm',
                  'transition-all'
                )}
                aria-label={a.label}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl" aria-hidden>{a.icon}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {a.label}
                </div>
                {a.status && (
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {a.status}
                  </div>
                )}
              </button>
            )
          }

          return (
            <Link
              key={a.id}
              href={gated ? '/pricing' : a.href}
              className={cn(
                'relative group block rounded-2xl p-4 min-h-[96px]',
                'bg-white dark:bg-neutral-900 ring-1 ring-neutral-200/70 dark:ring-neutral-800',
                'hover:ring-[#D97757]/40 hover:-translate-y-0.5 hover:shadow-sm',
                'transition-all'
              )}
              aria-label={gated ? `${a.label} — requires Plus` : a.label}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl" aria-hidden>{a.icon}</span>
                {gated && <LockBadge />}
              </div>
              <div className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {a.label}
              </div>
              {a.status && (
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {a.status}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
