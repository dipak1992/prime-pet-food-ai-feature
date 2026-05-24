'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, CreditCard, Clock } from 'lucide-react'

export function LandingFinalCTA() {
  return (
    <section className="relative py-28 sm:py-36 text-white overflow-hidden">
      {/* ── Cinematic background image ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Desktop image */}
        <Image
          src="/landing/family-dinner.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 0px, 100vw"
          className="object-cover object-bottom hidden md:block"
          quality={80}
        />
        {/* Mobile-optimized portrait image — family warmth for emotional close */}
        <Image
          src="/mobile/family-mobile.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover object-[center_28%] md:hidden"
          quality={80}
        />
        {/* Deep cinematic overlay */}
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/70 to-slate-950/95" />
        {/* Emerald + amber accent glow */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_450px_at_12%_12%,rgba(16,185,129,0.20),transparent_58%),radial-gradient(860px_450px_at_86%_86%,rgba(245,158,11,0.18),transparent_55%)]" />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* Background light orbs */}
      <div className="absolute z-[1] top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/12 blur-[140px]" />
      <div className="absolute z-[1] bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet-500/12 blur-[120px]" />

      <div className="relative z-[2] mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-5">
            Give your evenings back
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.12] mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
            What are you eating{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">tonight?</span>
          </h2>

          <p className="text-lg sm:text-xl text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
            Stop deciding. Start enjoying. Let MealEase handle the hardest question of the day — so you can focus on what matters.
          </p>

          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-base h-14 px-10 rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Free 7-day trial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
