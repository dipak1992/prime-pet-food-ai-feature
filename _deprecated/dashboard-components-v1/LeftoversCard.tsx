'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, Recycle } from 'lucide-react'
import { CardShell } from './shared/CardShell'
import { cn } from '@/lib/utils'
import type { LeftoversState, Leftover } from '@/lib/dashboard/types'

type Props = {
  state: LeftoversState
}

export function LeftoversCard({ state }: Props) {
  const { active, expiringSoon } = state
  const urgentToday = active.find((l) => l.urgency === 'today')

  // --- EMPTY STATE ---
  if (active.length === 0) {
    return (
      <CardShell
        ariaLabel="Leftovers"
        className="p-6 md:p-7 min-h-[260px] lg:min-h-[420px] flex flex-col bg-gradient-to-br from-[#FDF6F1] to-white dark:from-neutral-900 dark:to-neutral-950"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl" aria-hidden>🍱</span>
          <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Leftovers
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3 opacity-60" aria-hidden>🍱</div>
          <p className="font-serif text-lg text-neutral-900 dark:text-neutral-100 mb-2">
            No leftovers to track
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
            Mark a meal as cooked and we&rsquo;ll help you use the leftovers tomorrow.
          </p>
        </div>
      </CardShell>
    )
  }

  return (
    <CardShell ariaLabel="Leftovers" className="flex flex-col min-h-[260px] lg:min-h-[420px]">
      {/* Urgent banner */}
      {urgentToday && (
        <div
          role="alert"
          className="bg-orange-50 dark:bg-orange-950/40 border-b border-orange-200 dark:border-orange-900 px-5 py-3 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 dark:text-orange-200 leading-snug">
            <span className="font-semibold">
              Your {urgentToday.name.toLowerCase()} expires tonight —{' '}
            </span>
            <Link
              href={`/leftovers/${urgentToday.id}/use`}
              className="underline underline-offset-2 font-medium"
            >
              see 3 quick meals →
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>🍱</span>
          <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {active.length} leftover{active.length === 1 ? '' : 's'}
          </h2>
        </div>
        {expiringSoon.length > 0 && (
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            {expiringSoon.length} expiring soon
          </span>
        )}
      </header>

      {/* Items */}
      <ul className="px-6 space-y-3 flex-1">
        {active.slice(0, 2).map((item) => (
          <LeftoverItem key={item.id} item={item} />
        ))}
      </ul>

      {/* Footer link */}
      <div className="p-6 pt-4 mt-auto">
        {active.length > 2 ? (
          <Link
            href="/leftovers"
            className="inline-flex items-center justify-between w-full text-sm font-medium text-[#D97757] hover:text-[#C86646] group"
          >
            <span>See all {active.length} leftovers</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <Link
            href="/leftovers"
            className="inline-flex items-center justify-center gap-1.5 w-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-[#D97757] transition-colors"
          >
            <Recycle className="w-3.5 h-3.5" />
            Manage leftovers
          </Link>
        )}
      </div>
    </CardShell>
  )
}

function LeftoverItem({ item }: { item: Leftover }) {
  const isUrgent = item.urgency === 'today' || item.urgency === 'soon'

  const expiryText =
    item.urgency === 'today'
      ? 'Expires today'
      : item.urgency === 'expired'
      ? 'Expired'
      : `Expires in ${item.daysUntilExpiry} day${item.daysUntilExpiry === 1 ? '' : 's'}`

  const ctaLabel = item.urgency === 'today' ? 'Use it tonight' : 'Plan leftover meal'

  return (
    <li>
      <Link
        href={`/leftovers/${item.id}/use`}
        className={cn(
          'group flex items-center gap-3 p-2.5 -mx-2.5 rounded-2xl transition-colors',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {item.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">
              {item.servingsRemaining} serving{item.servingsRemaining === 1 ? '' : 's'} ·
            </span>
            <span
              className={cn(
                'font-medium',
                isUrgent
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {isUrgent && '⚠️ '}
              {expiryText}
            </span>
          </div>
          <div className="mt-1.5 text-xs font-medium text-[#D97757] group-hover:underline underline-offset-2">
            {ctaLabel} →
          </div>
        </div>
      </Link>
    </li>
  )
}
