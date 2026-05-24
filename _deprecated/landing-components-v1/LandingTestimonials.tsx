'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Mom of 3, Austin TX',
    text: 'I used to spend 40 minutes deciding what to cook. Now I open MealEase, tap once, and dinner is handled. My husband thinks I became a chef.',
    avatar: 'SM',
    color: 'bg-violet-100 text-violet-700',
    stars: 5,
    highlight: 'tap once, and dinner is handled',
  },
  {
    name: 'James K.',
    role: 'Software engineer, remote',
    text: 'Living solo, I defaulted to the same 5 takeout places. Now I actually cook and enjoy it. The budget mode saved me over $200 last month.',
    avatar: 'JK',
    color: 'bg-blue-100 text-blue-700',
    stars: 5,
    highlight: 'saved me over $200 last month',
  },
  {
    name: 'Priya R.',
    role: 'Registered Dietitian',
    text: 'I recommend MealEase to clients who struggle with meal planning. The allergy support and family adaptation is better than anything else I\'ve seen.',
    avatar: 'PR',
    color: 'bg-emerald-100 text-emerald-700',
    stars: 5,
    highlight: 'better than anything else I\'ve seen',
  },
  {
    name: 'Carlos G.',
    role: 'Single dad, Miami FL',
    text: 'My daughter is allergic to dairy and nuts. MealEase factors that in automatically. I don\'t have to triple-check every recipe anymore.',
    avatar: 'CG',
    color: 'bg-teal-100 text-teal-700',
    stars: 5,
    highlight: 'factors that in automatically',
  },
  {
    name: 'Michelle T.',
    role: 'Busy nurse, Chicago IL',
    text: 'I work 12-hour shifts. MealEase plans my week while I sleep. I come home to a plan, a grocery list, and zero stress. Absolute game changer.',
    avatar: 'MT',
    color: 'bg-rose-100 text-rose-700',
    stars: 5,
    highlight: 'plans my week while I sleep',
  },
  {
    name: 'David L.',
    role: 'Dad of 2, Seattle WA',
    text: 'Snap & Cook saves us so much. We photograph the fridge on Sunday and get a whole week of meals from what we already have. Zero waste.',
    avatar: 'DL',
    color: 'bg-amber-100 text-amber-700',
    stars: 5,
    highlight: 'meals from what we already have',
  },
]

const TRUST_STATS = [
  { value: '3,200+', label: 'Active households' },
  { value: '47,000+', label: 'Meals decided' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '$150+', label: 'Saved monthly on takeout' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function LandingTestimonials() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* ── Ambient date-night background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Desktop image */}
        <Image
          src="/landing/date-night.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 0px, 100vw"
          className="object-cover object-center hidden md:block"
          quality={80}
        />
        {/* Mobile-optimized portrait image — date-night for warm ambient mood */}
        <Image
          src="/mobile/date-night-mobile.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover object-[center_35%] md:hidden"
          quality={80}
        />
        {/* Heavy cream overlay for card readability */}
        <div className="absolute inset-0 bg-white/92" />
        {/* Subtle warm tint from the photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-transparent to-emerald-50/20" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(255,255,255,0.6)_100%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Loved by families</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-foreground mb-4 leading-tight">
            Real families, real relief.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of households who stopped stressing about dinner.
          </p>
        </motion.div>

        {/* Trust stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              className="group rounded-2xl border border-border/60 bg-white/85 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-black/[0.04] hover:bg-white transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="h-5 w-5 text-primary/20 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.stars ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                ))}
              </div>

              {/* Quote with highlight */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                &ldquo;{t.text.split(t.highlight).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="font-semibold text-foreground bg-emerald-50 px-0.5 rounded">
                        {t.highlight}
                      </span>
                    )}
                  </span>
                ))}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
