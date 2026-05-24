import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function MotionFloat({
  children,
  className,
  intensity = 1,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  intensity?: number
  delay?: number
}) {
  return (
    <div
      className={cn('me-float-css', className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${5.2 + intensity}s`,
        ['--me-float-y' as string]: `${-7 * intensity}px`,
      }}
    >
      {children}
    </div>
  )
}
