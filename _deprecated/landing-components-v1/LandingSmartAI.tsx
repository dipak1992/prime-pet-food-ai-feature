'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, Brain, Target } from 'lucide-react'

const TIMELINE = [
  {
    day: 'Day 1',
    icon: Zap,
    title: 'Instant match',
    description: 'MealEase uses your setup answers to deliver smart picks from the very first day. No training period.',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    accent: 'border-violet-300',
    dotColor: 'bg-violet-500',
  },
  {
    day: 'Day 3',
    icon: TrendingUp,
    title: 'Learning patterns',
    description: 'It notices you prefer quick meals on weekdays and adventurous recipes on weekends. Suggestions shift.',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    accent: 'border-blue-300',
    dotColor: 'bg-blue-500',
  },
  {
    day: 'Week 1',
    icon: Brain,
    title: 'Knows your household',
    description: 'Family favorites rise to the top. Rejected ingredients disappear. Portion sizes adapt. It just clicks.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    accent: 'border-primary/30',
    dotColor: 'bg-primary',
  },
  {
    day: 'Week 2',
    icon: Target,
    title: 'Feels like a personal chef',
    description: 'Meal suggestions feel eerily accurate. Seasonal picks, budget awareness, mood matching — all automatic.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    accent: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
]

export function LandingSmartAI() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(860px_460px_at_18%_8%,rgba(139,92,246,0.20),transparent_58%),radial-gradient(820px_460px_at_88%_88%,rgba(16,185,129,0.18),transparent_56%),linear-gradient(180deg,#020617_0%,#0b1320_55%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>
      <div className="relative z-[1] mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3">Smart AI</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Gets smarter{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">every week.</span>
          </h2>
          <p className="text-lg text-white/65 max-w-2xl mx-auto">
            MealEase doesn&apos;t just follow rules — it learns. Every interaction makes your experience more personal.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-primary to-amber-500 opacity-30" />

          <div className="space-y-8">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon
              const isLeft = i % 2 === 0
              return (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative flex items-start gap-6 lg:gap-0 ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 top-1">
                    <div className={`h-3 w-3 rounded-full ${step.dotColor} ring-4 ring-slate-950`} />
                  </div>

                  {/* Spacer for mobile */}
                  <div className="w-12 lg:hidden flex-shrink-0" />

                  {/* Content card */}
                  <div className={`flex-1 lg:w-[calc(50%-2rem)] ${isLeft ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className={`inline-block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left max-w-md ${isLeft ? 'lg:ml-auto' : ''}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-xl ${step.bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${step.color}`} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40">{step.day}</span>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Empty half for desktop */}
                  <div className="hidden lg:block flex-1 lg:w-[calc(50%-2rem)]" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
