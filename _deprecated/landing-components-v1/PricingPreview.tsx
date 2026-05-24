'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MONTHLY_PRICE = 9.99
const ANNUAL_PRICE = 79.99
const FULL_ANNUAL_PRICE = (MONTHLY_PRICE * 12).toFixed(2) // $119.88
const ANNUAL_MONTHLY = Math.round((ANNUAL_PRICE / 12) * 100) / 100 // $6.67
const ANNUAL_SAVINGS = Math.round((1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100) // 33%

const FREE_FEATURES = [
  'Instant tonight meal preview',
  '2 extra swipes per day',
  '3-day weekly plan preview',
  'Limited kid recipe variations',
  'No credit card required',
]

const PRO_FEATURES = [
  'Full 7-day weekly plan',
  'Smart auto-built grocery list',
  'Pantry Magic tools',
  'Image-to-meal feature',
  'Adaptive learning for your family',
  'Unlimited Tonight swipes',
  'Plan publishing & sharing',
  'Cancel anytime',
]

export function PricingPreview() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section className="py-20 sm:py-24 bg-muted/25">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">Simple, family-friendly pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free — no credit card required.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
                !isAnnual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
                isAnnual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <Badge className="ml-2 border-0 bg-emerald-100 text-emerald-800 text-[10px]">
                Save {ANNUAL_SAVINGS}%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Free</h3>
                <p className="text-sm text-muted-foreground">See if MealEase fits your family</p>
              </div>
            </div>
            <div className="mb-5">
              <p className="text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">forever</p>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Pro tier */}
          <div className="relative rounded-2xl border border-primary bg-primary/5 shadow-xl ring-1 ring-primary/20 p-6 flex flex-col">
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
              Most Popular
            </span>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-primary p-2.5 text-primary-foreground">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Pro</h3>
                <p className="text-sm text-muted-foreground">Every meal, every family member, every week</p>
              </div>
            </div>

            <div className="mb-5">
              {isAnnual ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">
                      ${ANNUAL_PRICE}
                      <span className="ml-1 text-base font-normal text-muted-foreground">/year</span>
                    </p>
                    <span className="text-sm text-muted-foreground line-through">${FULL_ANNUAL_PRICE}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">{ANNUAL_SAVINGS}% off</Badge>
                    <p className="text-sm text-emerald-700 font-medium">
                      Just ${ANNUAL_MONTHLY.toFixed(2)}/month
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold">
                    ${MONTHLY_PRICE}
                    <span className="ml-1 text-base font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">billed monthly</p>
                </>
              )}
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full gradient-sage border-0 text-white hover:opacity-90">
              <Link href="/signup?plan=pro&trial=1">Start 7-day free trial</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Cancel anytime &middot; No surprise charges
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
