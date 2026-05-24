'use client'

import { Container } from '@/components/landing/shared/Container'
import { ScrollReveal, StaggerGroup, HoverCard } from '@/components/motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Check, X } from 'lucide-react'

const WELL_ALWAYS = [
  'Speak to you like a human — never "user"',
  'Respect your time. 30-second setup. No endless forms.',
  'Protect your data. It\'s yours. We never sell it.',
  'Let you cancel in two taps. No retention calls.',
  'Build features that save you time and money, not ones that look good in demos.',
]

const WELL_NEVER = [
  'Push you to diet, track calories, or feel bad about a meal',
  'Hide features behind dark patterns or fake "urgency" timers',
  "Spam your inbox with daily emails you didn't ask for",
  "Add AI where it doesn't genuinely help",
  'Sell your grocery data to advertisers. Ever.',
]

export function Principles() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <ScrollReveal>
          <SectionHeader
            badge="How we work"
            title="A few things we've promised each other."
            subtitle="These aren't marketing lines. They're the rules we argue about at the dinner table."
          />
        </ScrollReveal>

        <StaggerGroup className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" staggerDelay={0.12}>
          <HoverCard className="h-full rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-900/40 p-6 md:p-7 shadow-subtle hover:shadow-medium transition-shadow">
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-5">
              We&apos;ll always…
            </h3>
            <ul className="space-y-3">
              {WELL_ALWAYS.map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </HoverCard>

          <HoverCard className="h-full rounded-3xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-6 md:p-7 shadow-subtle hover:shadow-medium transition-shadow">
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-5">
              We&apos;ll never…
            </h3>
            <ul className="space-y-3">
              {WELL_NEVER.map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </HoverCard>
        </StaggerGroup>
      </Container>
    </section>
  )
}
