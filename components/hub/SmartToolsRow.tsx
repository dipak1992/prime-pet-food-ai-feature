'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { useHouseholdConfig } from '@/lib/hooks/use-household-config'

interface Props {
  householdConfig: ReturnType<typeof useHouseholdConfig>
}

export function SmartToolsRow({ householdConfig }: Props) {
  const { smartToolLabel, householdType } = householdConfig

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
        Smart Tools
      </h2>

      {/* Standard 2-tool grid — always visible */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Household-aware tool */}
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-2.5 rounded-2xl bg-white border border-border/60 px-3 py-4 hover:border-primary/30 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl">
              {householdType === 'family' ? '👨‍👩‍👧' : householdType === 'couple' ? '💑' : '🍽️'}
            </span>
            <span className="text-[11px] font-semibold text-foreground leading-tight">
              {smartToolLabel}
            </span>
          </Link>
        </motion.div>

        {/* Preferences */}
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-2.5 rounded-2xl bg-white border border-border/60 px-3 py-4 hover:border-primary/30 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-[11px] font-semibold text-foreground leading-tight">
              Preferences
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
