'use client'

import { Copy, FileDown, Mail, Share2, ShoppingCart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DetectedRegion } from '@/lib/grocery/types'

type Props = {
  region: DetectedRegion
  hasProviders: boolean
  onCopy: () => void
  onDownloadPDF: () => void
  onEmail: () => void
  onShare: () => void
  copySuccess?: boolean
}

export function GroceryExportActions({
  region,
  hasProviders,
  onCopy,
  onDownloadPDF,
  onEmail,
  onShare,
  copySuccess,
}: Props) {
  // Global fallback actions (always shown)
  const globalActions = [
    {
      id: 'copy',
      label: copySuccess ? 'Copied!' : 'Copy list',
      icon: Copy,
      onClick: onCopy,
      primary: !hasProviders,
      color: copySuccess ? 'text-emerald-600' : undefined,
    },
    {
      id: 'pdf',
      label: 'Download PDF',
      icon: FileDown,
      onClick: onDownloadPDF,
      primary: false,
    },
    {
      id: 'email',
      label: 'Email list',
      icon: Mail,
      onClick: onEmail,
      primary: false,
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      onClick: onShare,
      primary: false,
    },
  ]

  return (
    <section className="space-y-3" aria-label="Export options">
      {!hasProviders && (
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="h-4 w-4 text-[#D97757]" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
            Take your list shopping
          </h3>
        </div>
      )}

      {/* Region indicator for non-supported regions */}
      {!hasProviders && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">🌍 Universal export</span>
          <span className="text-amber-700 dark:text-amber-400 ml-1">
            — Use these tools to take your list to any local store
          </span>
        </div>
      )}

      {/* Export action grid */}
      <div className={cn(
        'grid gap-2',
        hasProviders ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4',
      )}>
        {globalActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={cn(
                'group flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center transition-all',
                'ring-1 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.97]',
                action.primary
                  ? 'ring-[#D97757]/30 bg-[#D97757]/5 hover:ring-[#D97757]/50'
                  : 'ring-neutral-200 bg-white dark:bg-neutral-900 dark:ring-neutral-800 hover:ring-neutral-300',
              )}
            >
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                action.primary
                  ? 'bg-[#D97757]/10 text-[#D97757]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
                action.color,
              )}>
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn(
                'text-[11px] font-medium',
                action.color ?? 'text-neutral-700 dark:text-neutral-300',
              )}>
                {action.label}
              </span>
            </button>
          )
        })}
      </div>

      {hasProviders && (
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
          <ExternalLink className="h-2.5 w-2.5" />
          Backup exports stay available even after retailer handoff
        </p>
      )}
    </section>
  )
}
