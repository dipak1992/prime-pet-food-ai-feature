import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FadeIn({
  children,
  delay = 0,
  className,
  direction = 'up',
  once = true,
}: {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'fade'
  once?: boolean
}) {
  const directionClass = {
    up: 'me-fade-up-css',
    left: 'me-fade-left-css',
    right: 'me-fade-right-css',
    fade: 'me-fade-css',
  }[direction]

  return (
    <div
      className={cn('me-reveal-css', directionClass, className)}
      style={{ animationDelay: `${delay}s` }}
      data-once={once ? 'true' : undefined}
    >
      {children}
    </div>
  )
}
