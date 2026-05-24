'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Brain, PauseCircle, PlayCircle, Utensils } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Tell us what you like',
    description: 'Take 2 minutes to share your household\'s tastes, allergies, and dietary needs. That\'s it — you\'re set.',
    detail: 'Supports all diets, allergies, ages, and medical conditions.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    glow: 'from-violet-200/40',
  },
  {
    number: '02',
    icon: Brain,
    title: 'MealEase learns your habits',
    description: 'Every swipe, save, and skip teaches the AI what your household actually eats. It gets smarter daily.',
    detail: 'Adapts to mood, season, and budget automatically.',
    color: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    glow: 'from-emerald-200/40',
  },
  {
    number: '03',
    icon: Utensils,
    title: 'Get your best meal, daily',
    description: 'Wake up to a personalized dinner pick — or tap for a full weekly plan. Grocery list included.',
    detail: 'One meal, adapted for every person at the table.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    glow: 'from-amber-200/40',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 sm:py-32 bg-[#f7faf8]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_12%_8%,rgba(139,92,246,0.12),transparent_58%),radial-gradient(900px_520px_at_88%_92%,rgba(16,185,129,0.14),transparent_56%),linear-gradient(180deg,#f7faf8_0%,#f3f8f5_55%,#ffffff_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Three steps to never stress
            <br className="hidden sm:block" />
            about dinner again.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Set your household once. MealEase handles the daily decisions with premium-level personalization.
          </p>
        </motion.div>

        <motion.div
          id="how-it-works-media"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="mb-16 sm:mb-20"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-[0_28px_90px_-18px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-5">
            <div className="absolute inset-x-10 top-0 h-28 bg-gradient-to-b from-violet-200/45 via-emerald-200/25 to-transparent blur-3xl" />

            <div className="relative rounded-[22px] overflow-hidden border border-black/[0.06] bg-[#fbfcfb]">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-black/[0.06]">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c840]" />
                <div className="ml-3 flex-1 h-[22px] rounded-md bg-black/[0.05] flex items-center justify-center px-3">
                  <span className="truncate text-[11px] text-muted-foreground/60 font-medium tracking-tight select-none">MealEase walkthrough</span>
                </div>
              </div>

              <div className="aspect-video bg-gradient-to-br from-emerald-100/75 via-white to-amber-100/60">
                <video
                  className="h-full w-full object-cover"
                  src="/hero.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">See the full MealEase flow in under a minute</p>
                <p className="mt-1 text-sm sm:text-base text-muted-foreground">Start in the hero, watch the walkthrough here, then move straight into features without any cramped transitions.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-3 py-1.5 shadow-sm">
                  <PauseCircle className="h-4 w-4 text-violet-600" />
                  Pause anytime
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-3 py-1.5 shadow-sm">
                  <PlayCircle className="h-4 w-4 text-emerald-600" />
                  Continue when ready
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-violet-200 via-primary/30 to-amber-200" />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative text-center"
                >
                  {/* Glow */}
                  <div className={`absolute -inset-4 bg-gradient-to-b ${step.glow} to-transparent rounded-3xl blur-2xl opacity-60`} />

                  <div className="relative rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-6 shadow-sm">
                    {/* Number + Icon */}
                    <div className="mx-auto mb-6 relative">
                      <div className={`mx-auto h-16 w-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shadow-sm`}>
                        <Icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                      <span className={`absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border-2 ${step.border} flex items-center justify-center text-xs font-bold ${step.color}`}>
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                    <p className={`text-sm font-medium ${step.color}`}>{step.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
