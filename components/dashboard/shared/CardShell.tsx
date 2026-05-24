import { cn } from '@/lib/utils'

export function CardShell({
  children,
  className,
  as: As = 'section',
  ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  ariaLabel?: string
}) {
  return (
    <As
      aria-label={ariaLabel}
      className={cn(
        'relative rounded-3xl bg-white dark:bg-neutral-900',
        'ring-1 ring-neutral-200/70 dark:ring-neutral-800',
        'overflow-hidden',
        className
      )}
    >
      {children}
    </As>
  )
}
