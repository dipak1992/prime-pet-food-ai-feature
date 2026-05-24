'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function WarmAuroraGlow({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <motion.div
        initial={false}
        animate={shouldReduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 46%', '0% 50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute -inset-[18%] opacity-25 blur-2xl will-change-transform [background-image:repeating-linear-gradient(105deg,rgba(217,119,87,0.78)_0%,rgba(243,177,142,0.58)_12%,rgba(132,160,123,0.42)_23%,rgba(255,245,232,0.2)_34%,transparent_44%)] [background-size:240%_180%] [mask-image:radial-gradient(ellipse_at_85%_5%,black_6%,transparent_68%)] dark:opacity-20"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_0%,rgba(217,119,87,0.22),transparent_42%),radial-gradient(ellipse_at_12%_100%,rgba(243,177,142,0.12),transparent_44%)]" />
    </div>
  )
}
