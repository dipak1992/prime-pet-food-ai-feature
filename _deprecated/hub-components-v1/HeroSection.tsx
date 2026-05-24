'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { useHouseholdConfig } from '@/lib/hooks/use-household-config'

function getGreeting(): { greeting: string; subtext: string } {
  const h = new Date().getHours()
  if (h < 12) return { greeting: 'Good morning', subtext: "What's for lunch today?" }
  if (h < 17) return { greeting: 'Good afternoon', subtext: "Let's sort dinner." }
  return { greeting: 'Good evening', subtext: 'What do you need right now?' }
}

interface Props {
  firstName: string
  onQuickDecide: () => void
  onSnapCook: () => void
  householdConfig: ReturnType<typeof useHouseholdConfig>
  familyHeadline?: string | null
  familyBullets?: string[]
}

export function HeroSection({
  firstName,
  onQuickDecide,
  onSnapCook,
  householdConfig,
  familyHeadline,
  familyBullets,
}: Props) {
  const { greeting, subtext } = useMemo(() => getGreeting(), [])
  const dynamicGreeting = householdConfig.greeting(firstName)

  return (
    <section className="mb-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{familyHeadline ?? dynamicGreeting}</p>
        {familyBullets && familyBullets.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {familyBullets.slice(0, 5).map((item) => (
              <span key={item} className="rounded-full border border-border/60 bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* 3 Primary Action Cards */}
      <div className="flex flex-col gap-3">
        {/* ⚡ Quick Decide — label adapts to household type */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onQuickDecide}
          className="w-full px-5 py-5 rounded-2xl text-left transition-all bg-gradient-to-r from-primary/[0.06] to-primary/[0.02] border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-foreground">
                {householdConfig.cardLabels.quickDecide.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {householdConfig.cardLabels.quickDecide.sub}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary/50 flex-shrink-0" />
          </div>
        </motion.button>

        {/* � Snap & Cook — scan fridge, get a recipe */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSnapCook}
          className="w-full px-5 py-4 rounded-2xl text-left transition-all bg-white border border-border/60 hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📸</span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">
                Snap &amp; Cook
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scan your fridge — get a recipe instantly
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
          </div>
        </motion.button>

        {/* 📅 Plan Week — label adapts to household type */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Link
            href="/planner"
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl bg-white border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <span className="text-3xl">📅</span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">
                {householdConfig.cardLabels.planWeek.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {householdConfig.cardLabels.planWeek.sub}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
