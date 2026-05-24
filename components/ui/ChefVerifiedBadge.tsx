import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChefVerifiedBadgeProps {
  /** Compact mode shows only icon + short text */
  compact?: boolean
  className?: string
}

/**
 * Visual trust badge indicating a recipe has been verified by a professional chef.
 * Shown on curated meals from the Tonight catalog and editorially reviewed recipes.
 */
export function ChefVerifiedBadge({ compact = false, className }: ChefVerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        compact
          ? 'text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
          : 'text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
        className
      )}
      title="This recipe has been reviewed and verified by a professional chef"
    >
      <ShieldCheck className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {compact ? 'Verified' : 'Chef-Verified'}
    </span>
  )
}
