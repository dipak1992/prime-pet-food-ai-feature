'use client'

import { Container } from '@/components/landing/shared/Container'
import { ScrollReveal, StaggerGroup, HoverCard } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

const PROBLEMS = [
  {
    pain: "Every night: 'What's for dinner?'",
    solution: 'Tonight Suggestions',
    body: 'Open the app. One meal, picked for tonight, ready to cook in under 30 minutes. No infinite scroll.',
  },
  {
    pain: 'A fridge full of food, and nothing to eat',
    solution: 'Snap & Cook',
    body: 'Point your camera at the fridge. We see what you have and tell you what to make — with what\'s already in there.',
  },
  {
    pain: 'Sunday meal planning took two hours',
    solution: 'Weekly Autopilot',
    body: 'One tap, seven dinners. Personalized to your household, your budget, and the weather.',
  },
  {
    pain: "Tuesday's chicken became Friday's trash",
    solution: 'Leftovers AI',
    body: "Cook once, eat twice. We turn yesterday's dinner into today's tacos, stir-fry, or lunch salad — automatically.",
  },
  {
    pain: 'Groceries quietly hit $1,200/month',
    solution: 'Budget Intelligence',
    body: "See your week's estimated grocery total before you shop. Stay under your number by swapping before checkout.",
  },
  {
    pain: 'The plan still had to become a grocery trip',
    solution: 'Smart Grocery List',
    body: 'MealEase now turns weekly plans into editable grocery lists with supported store handoff, copy, PDF, and local-store export.',
  },
]

export function WhyBuiltIt() {
  return (
    <Section background="cream" padding="lg">
      <Container>
        <ScrollReveal>
          <SectionHeader
            badge="Six real problems"
            title="Every feature exists because we lived the problem."
            subtitle="We didn't start with features. We started with the questions we kept asking ourselves — and built the thing that answered them."
          />
        </ScrollReveal>

        <StaggerGroup className="max-w-3xl mx-auto space-y-5" staggerDelay={0.08}>
          {PROBLEMS.map((p, i) => (
            <HoverCard key={i} className="rounded-3xl bg-white dark:bg-neutral-950 ring-1 ring-neutral-200 dark:ring-neutral-800 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center shadow-subtle hover:shadow-medium transition-shadow">
              <div className="md:w-[40%]">
                <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                  The problem
                </div>
                <p className="font-serif text-xl md:text-2xl text-neutral-900 dark:text-neutral-50 leading-snug">
                  {p.pain}
                </p>
              </div>
              <div className="md:w-[60%] md:border-l md:border-neutral-200 md:dark:border-neutral-800 md:pl-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97757] uppercase tracking-wider mb-2">
                  What we built
                  <span aria-hidden>→</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                  {p.solution}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {p.body}
                </p>
              </div>
            </HoverCard>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}
