'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'

const TIERS = [
  {
    emoji: '🙋',
    label: 'Free',
    headline: 'Personal use',
    sub: 'Just you',
    description: '1 member profile. Basic meal tools. Get unstuck tonight.',
    features: ['1 personal profile', 'Tonight suggestions', '3 meal ideas/day', 'Basic grocery list'],
    cta: 'Start free',
    href: '/signup',
    gradient: 'from-slate-50 to-gray-50',
    border: 'border-border/60',
    ctaClass: 'bg-foreground text-white hover:bg-foreground/90',
    badge: null,
  },
  {
    emoji: '👫',
    label: 'Pro',
    headline: 'For you + partner',
    sub: 'Individuals & couples',
    description: 'Personal premium tools, optional second profile, and smarter weekends.',
    features: ['2 member profiles', 'Household Memory', 'Weekly Autopilot Lite', 'Smart Menu Scan', 'Food Check', 'Weekend Mode'],
    cta: 'Try Pro free',
    href: '/pricing',
    gradient: 'from-emerald-50 to-teal-50/80',
    border: 'border-primary/30',
    ctaClass: 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20',
    badge: 'Best value',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    label: 'Family Plus',
    headline: 'Real household planning power',
    sub: 'Families & households',
    description: 'Supports up to 6 household member profiles with full preferences, kids tools, and better weekends for everyone.',
    features: ['Up to 6 household profiles', 'Full Household Memory', 'Full Weekly Autopilot', 'Kids tools & picky eater mode', 'Shared grocery lists', 'Weekend Mode family experiences'],
    cta: 'Start Family Plus',
    href: '/pricing?intent=family',
    gradient: 'from-amber-50 to-orange-50/60',
    border: 'border-amber-300/50',
    ctaClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 shadow-md shadow-amber-500/20',
    badge: 'Most popular',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export function LandingHouseholdTiers() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(700px_350px_at_50%_0%,rgba(16,185,129,0.06),transparent_60%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Built for every household</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for one person, couples,{' '}
            <span className="text-primary">or full households.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everyone&apos;s preferences, one smarter dinner plan. MealEase grows with your household — from solo nights to family tables.
          </p>
        </motion.div>

        {/* Tier cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-3 gap-5"
        >
          {TIERS.map((tier) => (
            <motion.div
              key={tier.label}
              variants={item}
              className={`relative flex flex-col rounded-2xl border ${tier.border} bg-gradient-to-br ${tier.gradient} p-6 hover:shadow-lg transition-shadow duration-300`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold text-white tracking-wide ${tier.label === 'Pro' ? 'bg-primary' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <span className="text-3xl">{tier.emoji}</span>
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-foreground">{tier.label}</h3>
                  <p className="text-xs text-muted-foreground">{tier.sub}</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground/80 italic">&ldquo;{tier.headline}&rdquo;</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tier.ctaClass}`}
              >
                {tier.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile tooltip note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Profiles store preferences, allergies, age groups, and food goals — not separate logins.
          Weekend Mode appears automatically every Friday through Sunday.
        </motion.p>
      </div>
    </section>
  )
}
