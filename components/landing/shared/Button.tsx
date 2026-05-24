import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  ariaLabel?: string
  prefetch?: boolean | null
}

export function Button({
  href,
  children,
  variant = 'primary',
  className,
  ariaLabel,
  prefetch = false,
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 min-h-[48px] px-6 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D97757]'

  const styles = {
    primary:
      'bg-[#D97757] text-white hover:bg-[#C86646] shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary:
      'bg-white text-neutral-900 ring-1 ring-neutral-200 hover:ring-[#D97757]/40 hover:text-[#B85F43] shadow-sm hover:shadow-md active:scale-[0.98] dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-800',
    ghost:
      'text-neutral-800 dark:text-neutral-100 hover:text-[#D97757] underline-offset-4 hover:underline',
  }

  const linkProps = {
    href,
    'aria-label': ariaLabel,
    prefetch,
    className: cn(base, styles[variant], className),
  }

  return <Link {...linkProps}>{children}</Link>
}
