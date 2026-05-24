'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

/**
 * Short "About Us" trust snippet — designed for placement on pricing,
 * landing, or footer sections where a brief founder story builds credibility.
 *
 * Warm, intelligent, premium. Not a wall of text — a handshake.
 */
export function AboutSnippet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 to-background px-6 py-7 sm:px-8 sm:py-9"
    >
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">MealEase was built for real households tired of nightly dinner stress.</strong>{' '}
        We&apos;re Dipak and Suprabha — a husband-and-wife team raising two young kids in the U.S.
        We didn&apos;t come from the food industry. We came from the 6:30 PM panic of staring into a full fridge
        with no idea what to make. So we built the tool we wished existed: a calm, intelligent system that
        decides dinner for you — and gets better at it every week.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-background">
            D
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 ring-2 ring-background">
            S
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Dipak &amp; Suprabha</span>
          {' · '}Co-Founders
        </div>
        <Link
          href="/about"
          className="ml-auto text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Our story →
        </Link>
      </div>
    </motion.div>
  )
}
