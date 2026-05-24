'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function LandingEmotionalStory() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 text-white">
      {/* ── Cinematic family dinner background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Desktop image */}
        <Image
          src="/landing/family-dinner.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 0px, 100vw"
          className="object-cover object-center hidden md:block"
          quality={85}
        />
        {/* Mobile-optimized portrait image — family-mobile.jpg, focal point upper-center for faces */}
        <Image
          src="/mobile/family-mobile.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover object-[center_20%] md:hidden"
          quality={85}
        />
        {/* Multi-layer premium overlay */}
        {/* Base darkening — slightly heavier on mobile for story text legibility */}
        <div className="absolute inset-0 bg-slate-950/75 md:bg-slate-950/75" />
        {/* Vertical gradient — deeper bottom fade on mobile so founder card reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/65 to-slate-950/92 md:from-slate-950/40 md:via-slate-950/70 md:to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
        {/* Warm emotional tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-amber-950/20" />
        {/* Subtle grain */}
        <div className="absolute inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* Decorative light leaks */}
      <div className="absolute z-[1] top-1/4 left-[10%] h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
      <div className="absolute z-[1] bottom-1/4 right-[10%] h-56 w-56 rounded-full bg-amber-500/10 blur-[80px]" />

      <div className="relative z-[2] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Kicker */}
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-8">
            Why we built this
          </p>

          {/* Big emotional headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.15] mb-8 drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
            The hardest part of dinner{' '}
            <br className="hidden sm:block" />
            was never{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">cooking.</span>
          </h2>

          {/* Story */}
          <div className="max-w-2xl mx-auto space-y-6 text-base sm:text-lg text-white/70 leading-relaxed">
            <p>
              It was standing in the kitchen at 5:47 PM, staring at the fridge, knowing everyone was hungry
              and nothing sounded right. It was the 30-minute scroll through recipes that ended with
              ordering pizza — again. It was the guilt of wasted groceries and the exhaustion of making
              the same five meals on repeat.
            </p>

            <p>
              We built MealEase because we lived this. Every single night. Two working parents, a toddler
              with allergies, a picky five-year-old, and zero mental energy left for &ldquo;what&apos;s for dinner.&rdquo;
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/90 font-medium"
            >
              The problem was never cooking. It was{' '}
              <span className="text-white font-bold underline decoration-emerald-400/50 underline-offset-4">deciding.</span>
            </motion.p>

            <p>
              So we built an app that decides for you — instantly, intelligently, and personally.
              One that knows your household, learns your taste, and gets better every week.
            </p>
          </div>

          {/* Founder signature with real photo */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-6 py-4 shadow-lg"
          >
            <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-slate-950 flex-shrink-0">
              <Image
                src="/images/founders-family.jpg"
                alt="The MealEase founding family"
                fill
                sizes="56px"
                className="object-cover"
                quality={80}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">The MealEase Team</p>
              <p className="text-xs text-white/50">Parents, engineers, and dinner-decision survivors</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
