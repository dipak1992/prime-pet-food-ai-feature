'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ProductDemoModal } from '@/components/landing/ProductDemoModal'
import { Analytics, trackEvent } from '@/lib/analytics'
import {
  getTodaysMeal,
  getPickLabel,
  getDayContext,
  type DailyMeal,
} from '@/lib/content/dailyMeal'
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Clock,
} from 'lucide-react'

// ── Static fallback shown during SSR / before client mount ───────────────────
// Matches the old hardcoded meal so there is zero layout shift on hydration.
const SSR_FALLBACK: DailyMeal = {
  name: 'Creamy Pesto Salmon Bowls',
  time: '22 min',
  tags: ['High Protein', 'Family Favorite'],
  swapNote: 'Dairy-free sauce for mom, soft veggie sides for the kids.',
  pantryNote: 'Uses rice, frozen peas, and garlic you already have.',
  groceryItems: ['Salmon fillets', 'Basil pesto', 'Cucumber + avocado'],
  category: 'family',
  isWeekend: false,
}

// ── Meal card sub-component ───────────────────────────────────────────────────
function MealCard({ meal, mounted }: { meal: DailyMeal; mounted: boolean }) {
  const label = mounted ? getPickLabel(meal.category) : "Tonight's Smart Pick"
  const context = mounted ? getDayContext(meal.category) : ''
  const isWeekend = meal.isWeekend

  return (
    <div className="relative rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      {/* Tonight's plan header */}
      <div
        className={`mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.12] ${
          isWeekend
            ? 'border-amber-400/25 bg-white/[0.08]'
            : 'border-emerald-400/20 bg-white/[0.08]'
        }`}
        onClick={() => {
          if (mounted) {
            trackEvent(Analytics.HERO_MEAL_SUGGESTION_CLICKED, {
              meal_name: meal.name,
              category: meal.category,
              is_weekend: meal.isWeekend,
            })
          }
        }}
      >
        <div className="flex-1 min-w-0 pr-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${
            isWeekend ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {label}
          </p>

          {/* Animate the meal name change */}
          <AnimatePresence mode="wait">
            <motion.p
              key={meal.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 text-lg font-semibold text-white leading-snug"
            >
              {meal.name}
            </motion.p>
          </AnimatePresence>

          {/* Day context — only shown after mount */}
          <AnimatePresence>
            {mounted && context && (
              <motion.p
                key={context}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-1 text-xs text-white/45 leading-snug"
              >
                {context}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          isWeekend ? 'bg-amber-400/15 text-amber-400' : 'bg-emerald-400/15 text-emerald-400'
        }`}>
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      {/* Dashboard preview grid */}
      <div className="grid gap-3 sm:grid-cols-[1.4fr_0.9fr]">
        <div className={`rounded-2xl p-4 ${
          isWeekend
            ? 'bg-gradient-to-br from-amber-400/10 via-white/[0.04] to-rose-400/10'
            : 'bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-amber-400/10'
        }`}>
          {/* Tags */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            {meal.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                  isWeekend
                    ? 'bg-white/10 text-amber-300'
                    : 'bg-white/10 text-emerald-300'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  isWeekend ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`swap-${meal.name}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="rounded-2xl bg-white/[0.07] backdrop-blur-sm p-3"
              >
                <p className="text-sm font-semibold text-white">Swap suggestions</p>
                <p className="mt-1 text-sm text-white/60">{meal.swapNote}</p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`pantry-${meal.name}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl bg-white/[0.07] backdrop-blur-sm p-3"
              >
                <p className="text-sm font-semibold text-white">Pantry matched</p>
                <p className="mt-1 text-sm text-white/60">{meal.pantryNote}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`time-${meal.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Prep time
              </p>
              <p className="mt-2 text-3xl font-bold text-white">{meal.time}</p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`grocery-${meal.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Smart grocery list</p>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {meal.groceryItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isWeekend ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Main hero component ───────────────────────────────────────────────────────
export function LandingHero() {
  const [demoOpen, setDemoOpen] = useState(false)
  const [meal, setMeal] = useState<DailyMeal>(SSR_FALLBACK)
  const [mounted, setMounted] = useState(false)

  // Client-only mount — avoids hydration mismatch entirely.
  // SSR renders the fallback; after mount we swap to today's real meal.
  useEffect(() => {
    const todaysMeal = getTodaysMeal()
    setMeal(todaysMeal)
    setMounted(true)

    // Track the viewed meal
    trackEvent(Analytics.HERO_MEAL_SUGGESTION_VIEWED, {
      meal_name: todaysMeal.name,
      category: todaysMeal.category,
      is_weekend: todaysMeal.isWeekend,
    })
  }, [])

  const isWeekend = meal.isWeekend

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* ── Cinematic photo background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Desktop hero image */}
        <Image
          src="/landing/hero.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 0px, 100vw"
          className="object-cover object-center hidden md:block"
          quality={85}
        />

        {/* Mobile-optimized portrait image */}
        <Image
          src="/mobile/hero-mobile.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover object-[center_25%] md:hidden"
          quality={85}
        />

        {/* Premium multi-layer overlay system */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-slate-950/20 md:from-slate-950/60 md:via-transparent md:to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-amber-950/15" />
        {/* Fine grain texture */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Trust pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8 shadow-lg"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">3,200+ households use MealEase</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold tracking-tight leading-[1.08] text-white mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              Stop asking{' '}
              <span className="relative">
                <span className="text-emerald-400">&ldquo;What&rsquo;s for dinner?&rdquo;</span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-emerald-400/40" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 5 Q150 10 200 3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-8 max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
              MealEase helps busy households decide dinner fast, plan the week, use what they have, and stress less.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 w-full sm:w-auto">
              <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setDemoOpen(true)}
                className="h-14 px-8 text-base font-medium rounded-2xl border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/30 gap-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </span>
                Watch How It Works
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-white/50">
              No credit card required · Free plan available · Cancel anytime
            </p>

            {/* Micro stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-sm">
              {[
                { icon: Users, label: 'Families', value: '3.2k+', color: 'text-emerald-400' },
                { icon: Zap, label: 'Decision', value: '18 sec', color: 'text-amber-400' },
                { icon: ShieldCheck, label: 'Allergy-safe', value: 'Always', color: 'text-cyan-400' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.07] backdrop-blur-md px-3 py-2.5 shadow-lg">
                  <div className={`flex items-center gap-1.5 ${stat.color} text-xs font-semibold mb-1`}>
                    <stat.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{stat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Premium product preview (glass card over photo) ── */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.08] p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-xl">
              {/* Glow — shifts color on weekend */}
              <div className={`absolute inset-x-8 top-0 h-24 blur-2xl ${
                isWeekend
                  ? 'bg-gradient-to-b from-amber-400/20 to-transparent'
                  : 'bg-gradient-to-b from-emerald-400/20 to-transparent'
              }`} />

              {/* suppressHydrationWarning on the meal card wrapper prevents React
                  from warning about the SSR→client content swap */}
              <div suppressHydrationWarning>
                <MealCard meal={meal} mounted={mounted} />
              </div>
            </div>

            {/* Floating badge */}
            <div className="mt-4 flex justify-end">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 backdrop-blur-md shadow-lg text-xs font-medium text-white/60">
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  isWeekend ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                {mounted && isWeekend ? 'Weekend Mode is active 🎬' : 'Watch the full walkthrough below'}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <div id="hero-sentinel" />

      {/* Product demo modal */}
      <ProductDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  )
}
