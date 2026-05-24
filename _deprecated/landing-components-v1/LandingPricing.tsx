'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

const FEATURES = [
  'AI-powered daily meal picks',
  'Full weekly meal planning',
  'Snap & Cook — use what you have',
  'Zero-Cook Mode — takeout matching',
  'Family Mode — allergy & diet support',
  'Weekend Mode — entertaining & brunch',
  'Cuisine explorer — 50+ cuisines',
  'Smart grocery lists',
  'Nutritional insights & tracking',
  'Unlimited household members',
]

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-[#FAFBFA]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            One plan. Fully unlocked.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No tiers, no upsells, no feature gates. Just MealEase, fully unlocked.
          </p>
        </motion.div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-lg"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl blur-2xl" />

          <div className="relative rounded-3xl border-2 border-primary/30 bg-white p-8 sm:p-10 shadow-xl shadow-primary/5">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">MealEase Pro</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground">$9.99</span>
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              7-day free trial &middot; Cancel anytime
            </p>

            {/* CTA */}
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-base h-13 rounded-xl shadow-lg shadow-primary/25 mb-8"
              >
                Start Free 7-Day Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-px bg-border mb-8" />

            {/* Feature list */}
            <p className="text-sm font-semibold text-foreground mb-4">Everything you get:</p>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
