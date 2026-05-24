'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Zap, Calendar, Users } from 'lucide-react'

const OUTCOMES = [
  {
    icon: Zap,
    emoji: '🌙',
    title: 'Tonight solved in seconds',
    description: 'Open the app, tap once, and get a personalized dinner idea for your exact household — allergies, preferences, and all. No scrolling. No debating.',
    stat: '18 sec',
    statLabel: 'average decision time',
    gradient: 'from-orange-50 to-amber-50/80',
    border: 'border-orange-200/60',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    statColor: 'text-orange-700',
    image: null,
  },
  {
    icon: Calendar,
    emoji: '📅',
    title: 'Your week runs itself',
    description: 'A complete 7-day dinner plan with zero repeats, auto-generated grocery list, and smart budget tracking. One tap on Sunday, done for the week.',
    stat: '4.5 hrs',
    statLabel: 'saved per week',
    gradient: 'from-blue-50 to-indigo-50/80',
    border: 'border-blue-200/60',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    statColor: 'text-blue-700',
    image: null,
  },
  {
    icon: Users,
    emoji: '🏠',
    title: 'Built for real households',
    description: 'Picky toddler? Partner on keto? Baby with allergies? One meal, every version handled. Cook once — each person gets their own adapted plate.',
    stat: '6 members',
    statLabel: 'per household',
    gradient: 'from-violet-50 to-purple-50/80',
    border: 'border-violet-200/60',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
    statColor: 'text-violet-700',
    image: '/landing/grocery.jpg',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function LandingOutcomes() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">What changes</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-foreground mb-4 leading-tight">
            Three things that change{' '}
            <span className="text-gradient-sage">immediately.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From the first day you use MealEase, dinner gets easier. Here&apos;s how.
          </p>
        </motion.div>

        {/* Outcome cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {OUTCOMES.map((o) => {
            const Icon = o.icon
            return (
              <motion.div
                key={o.title}
                variants={item}
                className={`group relative rounded-2xl border ${o.border} bg-gradient-to-br ${o.gradient} overflow-hidden hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-300`}
              >
                {/* Optional lifestyle image accent */}
                {o.image && (
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={o.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      quality={80}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-50 via-violet-50/80 to-transparent" />
                  </div>
                )}

                <div className="p-7">
                  {/* Emoji + Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{o.emoji}</span>
                    <div className={`h-10 w-10 rounded-xl ${o.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${o.iconColor}`} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-snug">
                    {o.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {o.description}
                  </p>

                  {/* Stat */}
                  <div className="pt-4 border-t border-black/[0.06]">
                    <p className={`text-2xl font-bold ${o.statColor}`}>{o.stat}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.statLabel}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
