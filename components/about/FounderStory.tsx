'use client'

import Image from 'next/image'
import { Baby, Brain, CheckCircle2, HeartHandshake, ReceiptText, ShoppingCart } from 'lucide-react'
import { Container } from '@/components/landing/shared/Container'
import { ScrollReveal } from '@/components/motion'

const storySignals = [
  {
    icon: HeartHandshake,
    title: 'Built from real dinner stress',
    body: 'MealEase started in our own kitchen after too many nights of fridge staring, duplicate groceries, and last-minute takeout.',
  },
  {
    icon: Baby,
    title: 'Made by parents',
    body: 'We are building for households where time, energy, picky eaters, and budget all matter at the same time.',
  },
  {
    icon: Brain,
    title: 'Household memory first',
    body: 'The product remembers preferences, dislikes, leftovers, pantry context, and this week’s instructions so dinner does not restart from zero.',
  },
  {
    icon: ShoppingCart,
    title: 'Dinner to groceries',
    body: 'The goal is not another recipe idea. It is a calm path from what you have to what you cook to what you need to buy.',
  },
  {
    icon: ReceiptText,
    title: 'Budget-aware by default',
    body: 'Suprabha is a CPA, so the weekly grocery total is not an afterthought. MealEase keeps cost visible before checkout.',
  },
  {
    icon: CheckCircle2,
    title: 'Trust over tricks',
    body: 'No guilt-based food tracking, no fake urgency, no selling grocery data. We want MealEase to feel useful and humane.',
  },
]

const facts = [
  { value: '2', label: 'founders building from home' },
  { value: '2', label: 'young kids shaping the product' },
  { value: '500+', label: 'curated dinner ideas under review' },
  { value: '1', label: 'connected dinner-to-grocery loop' },
]

export function FounderStory() {
  return (
    <section className="overflow-hidden bg-white py-16 dark:bg-neutral-950 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D97757]">
              Founder-led product
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
              A dinner tool built by the people who needed it first.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              We are Dipak and Suprabha: one software engineer, one CPA, two little kids,
              and a real household that needed dinner planning to become calmer,
              cheaper, and less repetitive.
            </p>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-xl leading-relaxed text-neutral-900 dark:text-neutral-100">
              We had a fridge full of food and still ordered takeout three nights a week.
              That is when we knew something was broken, and it was not us.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid items-center gap-6 lg:grid-cols-[1fr_0.9fr_1fr] lg:gap-8">
          <div className="grid gap-4">
            {storySignals.slice(0, 3).map((item, index) => (
              <FounderSignal key={item.title} {...item} delay={0.05 * index} direction="left" />
            ))}
          </div>

          <ScrollReveal delay={0.08}>
            <figure className="mx-auto max-w-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#FDF6F1] shadow-2xl shadow-neutral-900/12 ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800">
                <Image
                  src="/images/founders-family.jpg"
                  alt="Dipak and Suprabha, co-founders of MealEase, with their two young children"
                  fill
                  sizes="(max-width: 1024px) 86vw, 360px"
                  priority
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="mt-4 text-center text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Dipak and Suprabha
                </span>
                , co-founders of MealEase.
              </figcaption>
            </figure>
          </ScrollReveal>

          <div className="grid gap-4">
            {storySignals.slice(3).map((item, index) => (
              <FounderSignal key={item.title} {...item} delay={0.05 * index} direction="right" />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <ScrollReveal key={fact.label} delay={0.04 * index}>
              <div className="h-full rounded-2xl bg-[#FBFAF3] p-5 text-center ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800">
                <p className="font-serif text-3xl font-bold text-[#D97757]">{fact.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                  {fact.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.12}>
          <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] bg-neutral-950 p-6 text-white shadow-2xl shadow-neutral-900/15 md:p-8">
            <p className="font-serif text-2xl font-bold leading-snug md:text-3xl">
              MealEase is not about becoming a perfect cook. It is about taking one
              daily decision off your plate and turning the food you already have
              into a plan your household will actually eat.
            </p>
            <p className="mt-5 text-[#F3B18E]">— Dipak and Suprabha</p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  )
}

function FounderSignal({
  icon: Icon,
  title,
  body,
  delay,
  direction,
}: {
  icon: typeof HeartHandshake
  title: string
  body: string
  delay: number
  direction: 'left' | 'right'
}) {
  return (
    <ScrollReveal delay={delay} direction={direction}>
      <article className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D97757]/10 text-[#D97757]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {title}
          </h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {body}
        </p>
      </article>
    </ScrollReveal>
  )
}
