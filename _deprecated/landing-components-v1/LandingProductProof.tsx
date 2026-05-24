'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Calendar, Camera, DollarSign, Sparkles, ChevronRight, Clock, Users, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODES = [
  {
    id: 'tonight',
    label: 'Tonight',
    emoji: '🌙',
    icon: Moon,
    color: 'text-orange-600',
    activeBg: 'bg-orange-600',
    tagline: 'Dinner decided in 18 seconds',
    description: 'Tap once and get a personalized meal idea based on your household, preferences, and what you have. Fast, Budget, Date Night, Kids, and Guest modes built in.',
    features: [
      { icon: Clock, text: 'Under 30-minute meals' },
      { icon: Users, text: 'Adapted for every family member' },
      { icon: ShieldCheck, text: 'Allergy & age-safe always' },
    ],
    preview: {
      title: 'Creamy Pesto Salmon Bowls',
      time: '22 min',
      servings: '4',
      tags: ['Dairy-free option', 'Kid-friendly', 'High protein'],
    },
    image: '/landing/app-cooking.jpg',
  },
  {
    id: 'autopilot',
    label: 'Weekly Autopilot',
    emoji: '📅',
    icon: Calendar,
    color: 'text-blue-600',
    activeBg: 'bg-blue-600',
    tagline: 'Your entire week, planned in one tap',
    description: '7 unique dinners, zero repeats, auto-generated grocery list with budget tracking. Regenerate any night. Share with your partner.',
    features: [
      { icon: Calendar, text: '7-day plan with variety' },
      { icon: DollarSign, text: 'Budget-aware grocery list' },
      { icon: Sparkles, text: 'One-tap regeneration' },
    ],
    preview: {
      title: 'Week of Apr 21 — Family Plan',
      time: '~25 min avg',
      servings: '4',
      tags: ['$68 grocery total', '7 unique meals', 'Auto-balanced'],
    },
    image: '/landing/grocery.jpg',
  },
  {
    id: 'snap',
    label: 'Snap & Cook',
    emoji: '📸',
    icon: Camera,
    color: 'text-emerald-600',
    activeBg: 'bg-emerald-600',
    tagline: 'Photo your fridge. Get meals instantly.',
    description: 'Take a photo of your fridge or pantry shelf. AI identifies every ingredient and builds meals from what you already own. Less waste, less spending.',
    features: [
      { icon: Camera, text: 'AI ingredient detection' },
      { icon: DollarSign, text: 'Use what you have first' },
      { icon: ShieldCheck, text: 'Pantry-matched recipes' },
    ],
    preview: {
      title: 'Garlic Butter Chicken Stir-Fry',
      time: '18 min',
      servings: '3',
      tags: ['85% pantry match', 'Only 2 items to buy', 'Quick prep'],
    },
    image: '/landing/pantry.jpg',
  },
  {
    id: 'budget',
    label: 'Budget Mode',
    emoji: '💰',
    icon: DollarSign,
    color: 'text-amber-600',
    activeBg: 'bg-amber-600',
    tagline: 'Great meals under your target budget',
    description: 'Set a weekly budget and MealEase finds meals that taste amazing without breaking the bank. Track spending, reduce waste, and save $150+/month on takeout.',
    features: [
      { icon: DollarSign, text: 'Per-meal cost tracking' },
      { icon: Sparkles, text: 'Smart substitutions' },
      { icon: ShieldCheck, text: 'No quality compromise' },
    ],
    preview: {
      title: 'One-Pot Lemon Herb Pasta',
      time: '20 min',
      servings: '4',
      tags: ['$3.20/serving', 'Pantry staples', 'Family favorite'],
    },
    image: '/landing/grocery.jpg',
  },
]

export function LandingProductProof() {
  const [activeMode, setActiveMode] = useState(0)
  const mode = MODES[activeMode]

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-[#f7faf8]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_12%_8%,rgba(139,92,246,0.08),transparent_58%),radial-gradient(900px_520px_at_88%_92%,rgba(16,185,129,0.10),transparent_56%),linear-gradient(180deg,#f7faf8_0%,#f3f8f5_55%,#ffffff_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] [background-size:48px_48px]" />
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
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">See it in action</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-foreground mb-4 leading-tight">
            Every way you eat,{' '}
            <span className="text-gradient-sage">covered.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need tonight&apos;s dinner, a full week, or meals from your fridge — MealEase has a mode for that.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(i)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all border',
                activeMode === i
                  ? `${m.activeBg} text-white border-transparent shadow-lg`
                  : 'bg-white text-foreground border-border/60 hover:border-primary/40 hover:shadow-sm',
              )}
            >
              <span className="text-base">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Active mode content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Description */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', `${mode.activeBg}/10`)}>
                    <mode.icon className={cn('h-6 w-6', mode.color)} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{mode.emoji} {mode.label}</h3>
                    <p className={cn('text-sm font-medium', mode.color)}>{mode.tagline}</p>
                  </div>
                </div>

                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                  {mode.description}
                </p>

                <div className="space-y-3">
                  {mode.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <f.icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Lifestyle image + UI preview overlay */}
              <div className="relative">
                {/* Lifestyle photography background */}
                <div className="relative overflow-hidden rounded-[28px] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)]">
                  <div className="relative h-[420px] sm:h-[480px] w-full">
                    <Image
                      src={mode.image}
                      alt={`${mode.label} lifestyle`}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      quality={85}
                    />
                    {/* Cinematic overlay for UI card readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  </div>

                  {/* Floating UI preview card over the image */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6">
                    <div className="rounded-[20px] border border-white/15 bg-white/[0.1] backdrop-blur-xl p-5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)]">
                      {/* Mode badge */}
                      <div className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white mb-3', mode.activeBg)}>
                        {mode.emoji} {mode.label} Mode
                      </div>

                      {/* Meal preview */}
                      <h4 className="text-lg font-bold text-white mb-2">{mode.preview.title}</h4>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs text-white/70">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          {mode.preview.time}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-white/70">
                          <Users className="h-3.5 w-3.5 text-emerald-400" />
                          Serves {mode.preview.servings}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {mode.preview.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs font-medium text-white/90">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action bar */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <div className="flex-1 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-300">
                          Cook This Tonight
                        </div>
                        <div className="h-9 w-9 rounded-xl border border-white/15 flex items-center justify-center text-white/60">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating intelligence badge */}
                <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 shadow-md text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AI-personalized for your household
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
