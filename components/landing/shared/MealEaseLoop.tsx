'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Camera, ChefHat, ShoppingCart, Sparkles } from 'lucide-react'

const steps = [
  { label: 'Scan', Icon: Camera },
  { label: 'Plan', Icon: Sparkles },
  { label: 'Cook', Icon: ChefHat },
  { label: 'Shop', Icon: ShoppingCart },
] as const

export function MealEaseLoop() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative mt-5 w-full max-w-lg overflow-hidden rounded-2xl border border-orange-100 bg-white/78 p-2.5 shadow-sm shadow-orange-100/40 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/78">
      <div className="absolute left-8 right-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#D97757]/35 to-transparent" />
      {!prefersReducedMotion && (
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#D97757] shadow-[0_0_18px_rgba(217,119,87,0.55)]"
          initial={{ left: '12%' }}
          animate={{ left: ['12%', '36%', '62%', '86%', '12%'] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className="relative grid grid-cols-4 gap-1">
        {steps.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/70 px-2 py-2 ring-1 ring-black/[0.03] dark:bg-neutral-950/55 dark:ring-white/5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBFAF3] text-[#D97757] ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
