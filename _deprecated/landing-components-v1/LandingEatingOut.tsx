'use client'

import { motion } from 'framer-motion'
import { UtensilsCrossed, Camera, Flame, Sparkles, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CARDS = [
  {
    emoji: '🌙',
    icon: UtensilsCrossed,
    title: 'Tonight Dinner',
    tagline: 'Dinner decided in 18 seconds',
    description:
      'Tap once and get a personalized meal idea based on your household, preferences, and what you have on hand.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200/60',
    badge: null,
  },
  {
    emoji: '🍽️',
    icon: UtensilsCrossed,
    title: 'Smart Menu Scan',
    tagline: 'Scan any restaurant menu',
    description:
      'Photograph a restaurant menu and choose a goal — lose weight, high protein, budget-friendly. AI highlights exactly what to order.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200/60',
    badge: 'NEW',
  },
  {
    emoji: '📸',
    icon: Camera,
    title: 'Food Check',
    tagline: 'Snap any food, know instantly',
    description:
      'Take a photo of any plate or snack. Get calorie estimates, protein levels, a goal-fit verdict, and smarter swap suggestions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/60',
    badge: 'NEW',
  },
]

export function LandingEatingOut() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_20%,rgba(139,92,246,0.06),transparent_58%),radial-gradient(700px_400px_at_80%_80%,rgba(16,185,129,0.07),transparent_56%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#f7faf8]" />
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
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/8 border border-violet-500/10 px-4 py-2 text-sm font-medium text-violet-600 mb-5">
            <Flame className="h-4 w-4" />
            At home or eating out
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-foreground mb-4 leading-tight">
            Your kitchen. Any restaurant.{' '}
            <span className="text-gradient-sage">MealEase helps both.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re cooking at home or ordering out, MealEase gives you personalized guidance
            that fits your goals, your diet, and your life.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className={cn(
                'relative rounded-[24px] border bg-white p-7 hover:shadow-xl transition-all duration-300 group',
                card.border,
              )}
            >
              {/* NEW badge */}
              {card.badge && (
                <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1 text-[10px] font-bold text-white tracking-wider shadow-lg shadow-violet-500/20">
                  <Sparkles className="h-3 w-3" />
                  {card.badge}
                </span>
              )}

              {/* Icon */}
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center mb-5', card.bg)}>
                <card.icon className={cn('h-6 w-6', card.color)} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <span>{card.emoji}</span> {card.title}
              </h3>
              <p className={cn('text-sm font-medium mb-3', card.color)}>{card.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>

              {/* Pro indicator for new features */}
              {card.badge && (
                <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  <span>Available on Pro &amp; Family Plus</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            See what&apos;s included in every plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
