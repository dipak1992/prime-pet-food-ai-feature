'use client'

import Link from 'next/link'
import { Check, ChevronRight, ShieldCheck, Utensils } from 'lucide-react'

const TRUST_BULLETS = [
  'Automatically adjusts spice, texture & portion per person',
  'One recipe — the whole table is covered',
  'Safety checks run in the background, always',
]

export function FamilyIntelligence() {
  return (
    <section id="family" className="relative py-20 sm:py-24 overflow-hidden">
      {/* Background photo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1528736235302-52922df5c122?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        {/* Warm white veil so left-column text stays crisp */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
        {/* Subtle sage tint from top */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-50/60 via-transparent to-background/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── Left: copy + selector + CTA ─── */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
              One meal, everyone covered
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-4">
              Handles picky eaters.{' '}
              <span className="text-gradient-sage">Without extra effort.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              Tell us who’s eating — ages, allergies, preferences. MealEase adapts every meal automatically. One recipe, every version handled. No side dishes. No separate cooking.
            </p>

            {/* CTA */}
            <Link
              href="/tonight?mode=tired"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-colors"
            >
              See how it adapts your meals
              <ChevronRight className="h-4 w-4" />
            </Link>

            {/* Trust bullets */}
            <ul className="mt-8 space-y-2">
              {TRUST_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Right: visual meal comparison card ─── */}
          <div className="mt-8 lg:mt-0" aria-hidden>
            <div className="relative">
              {/* Soft glow */}
              <div className="absolute -inset-4 bg-primary/8 rounded-3xl blur-2xl" />

              <div className="relative rounded-3xl border border-border/40 bg-white shadow-xl overflow-hidden p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  <Utensils className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                    One dinner, adapted for everyone
                  </span>
                </div>

                {/* Base recipe */}
                <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Base recipe</p>
                  <p className="font-semibold text-lg">Chicken Penne Arrabbiata</p>
                  <p className="text-sm text-muted-foreground mt-1">Spicy tomato, garlic, red pepper flakes, parmesan</p>
                </div>

                {/* Adaptations */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Adult */}
                  <div className="rounded-xl border border-border/50 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">🧑‍🍳</span>
                      <span className="text-xs font-semibold">Adults</span>
                    </div>
                    <p className="text-sm font-medium">Spicy garlic arrabbiata</p>
                    <p className="text-xs text-muted-foreground mt-1">Full heat, red pepper flakes, aged parmesan</p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">🌶️ Spicy</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Bold</span>
                    </div>
                  </div>

                  {/* Kids */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">👶</span>
                      <span className="text-xs font-semibold text-primary">Kids version</span>
                    </div>
                    <p className="text-sm font-medium">Mild creamy tomato penne</p>
                    <p className="text-xs text-muted-foreground mt-1">No spice, cream-stirred sauce, soft veggies</p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">🛡️ Kid-safe</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Mild</span>
                    </div>
                  </div>
                </div>

                {/* Footer trust line */}
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  AI safety check passed — age-appropriate ingredients verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
