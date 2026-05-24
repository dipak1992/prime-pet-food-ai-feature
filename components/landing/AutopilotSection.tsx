import Image from 'next/image'
import {
  Recycle,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock,
  DollarSign,
  Leaf,
  Lock,
  Refrigerator,
  ShoppingCart,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { MobileCarouselRail } from './shared/MobileCarouselRail'
import { WarmAuroraGlow } from './shared/WarmAuroraGlow'
import smartAutopilotImage from '@/public/landing/optimized/smartautopilot.webp'
import familyDinnerImage from '@/public/landing/optimized/family-dinner.webp'

const autopilotFeatures = [
  {
    icon: Brain,
    title: 'Learns your household',
    body: 'Dietary needs, dislikes, skill level, and past meal ratings shape every suggestion.',
  },
  {
    icon: Recycle,
    title: 'Uses your leftovers first',
    body: 'Expiring food gets priority. AI repurposes leftovers into creative dinners automatically.',
  },
  {
    icon: DollarSign,
    title: 'AI budget swaps',
    body: 'Over budget? AI suggests cheaper alternatives that taste just as good — one tap to swap.',
  },
  {
    icon: Leaf,
    title: 'Seasonal intelligence',
    body: 'Hearty stews in winter, fresh grilling in summer — meals match the season.',
  },
  {
    icon: Clock,
    title: 'Weekday-smart prep times',
    body: 'Quick meals Mon–Thu, more involved recipes on weekends when you have time.',
  },
  {
    icon: Utensils,
    title: 'Cross-feature awareness',
    body: 'Tonight, weekly plan, budget, and leftovers all share context — nothing works in isolation.',
  },
]

const smartSignals = [
  '5 unique proteins across the week',
  '3 pantry items already owned',
  '1 leftover repurposed',
  '$62 estimated, $18 under budget',
]

const systemSteps = [
  {
    icon: ChefHat,
    label: 'Tonight',
    title: 'Pick dinner',
    body: 'AI checks your week, avoids repeats, and chooses a dinner that fits tonight.',
  },
  {
    icon: CalendarDays,
    label: 'Planner',
    title: 'Shape the week',
    body: 'Weekly Autopilot reads pantry, budget, leftovers, and family signals together.',
  },
  {
    icon: ShoppingCart,
    label: 'Grocery',
    title: 'Build the list',
    body: 'Ingredients consolidate into a store-ready list with pantry deductions.',
  },
  {
    icon: DollarSign,
    label: 'Budget',
    title: 'Suggest swaps',
    body: 'If the plan runs high, MealEase finds cheaper changes before checkout.',
  },
  {
    icon: Refrigerator,
    label: 'Leftovers',
    title: 'Use what remains',
    body: 'Cooking feeds leftover tracking, so food gets reused before it expires.',
  },
]

export function AutopilotSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#FDF6F1] py-10 dark:bg-neutral-950 md:py-22"
      aria-labelledby="autopilot-heading"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(253,246,241,1)_0%,rgba(255,255,255,0.76)_56%,rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,1)_0%,rgba(23,23,23,0.88)_56%,rgba(10,10,10,1)_100%)]"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <FadeIn>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#D97757] shadow-sm ring-1 ring-[#D97757]/20 dark:bg-neutral-900">
                <Sparkles className="h-4 w-4" aria-hidden />
                AI Autopilot
              </div>

              <h2
                id="autopilot-heading"
                className="mt-5 font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl"
              >
                Your dinner week, planned around the way your home actually eats.
              </h2>

              <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                MealEase reads pantry, leftovers, budget, dietary needs, and the season,
                then builds a week that feels planned by someone who actually lives with you.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { value: '7', label: 'dinners connected' },
                  { value: '$18', label: 'demo budget room' },
                  { value: '30m', label: 'weekday average' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900/80 dark:ring-neutral-800"
                  >
                    <p className="font-serif text-3xl font-bold text-[#D97757]">{stat.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
                Preview the plan first. Upgrade when you want the full week, memory, and grocery workflow.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-2xl shadow-neutral-900/15 ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-white/10 sm:rounded-[2rem] sm:p-3">
                <div className="relative overflow-hidden rounded-[1.25rem] bg-[#FBFAF3] sm:rounded-[1.5rem]">
                  <Image
                    src={smartAutopilotImage}
                    alt="MealEase Autopilot weekly planning interface"
                    sizes="(min-width: 1024px) 620px, calc(100vw - 40px)"
                    className="h-auto w-full object-contain"
                    placeholder="blur"
                  />
                </div>

                <div className="grid gap-2 border-t border-neutral-100 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2 sm:px-4 lg:grid-cols-4">
                  {smartSignals.map((signal) => (
                    <span key={signal} className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute -left-3 top-6 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800 lg:block">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757]/10 text-[#D97757]">
                    <Lock className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Family favorite</p>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Locked for Monday</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 bottom-14 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800 lg:block">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Recycle className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Leftover save</p>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Roast chicken used</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <MobileCarouselRail className="mt-10 md:hidden" itemClassName="min-w-[82%]" ariaLabel="Swipe through Autopilot features">
          {autopilotFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title}>
                <article className="group h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#D97757]/30 dark:bg-neutral-900 dark:ring-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757]/10 text-[#D97757] transition-colors group-hover:bg-[#D97757] group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {feature.body}
                  </p>
                </article>
              </div>
            )
          })}
        </MobileCarouselRail>

        <div className="mt-12 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {autopilotFeatures.map((feature, i) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={0.04 * i}>
                <article className="group h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#D97757]/30 dark:bg-neutral-900 dark:ring-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757]/10 text-[#D97757] transition-colors group-hover:bg-[#D97757] group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {feature.body}
                  </p>
                </article>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn delay={0.14}>
          <div className="relative mt-12 overflow-hidden rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-2xl shadow-neutral-900/15 ring-1 ring-neutral-900/10 dark:ring-white/10 md:p-7">
            <WarmAuroraGlow />
            <div className="relative z-10 mb-6 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F3B18E]">
                Household intelligence system
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold md:text-3xl">
                Tonight, planner, groceries, budget, and leftovers share the same memory.
              </h3>
            </div>

            <MobileCarouselRail className="relative z-10 lg:hidden" itemClassName="min-w-[82%]" dotTone="light" ariaLabel="Swipe through connected MealEase features">
              {systemSteps.map((step) => {
                const Icon = step.icon
                return (
                  <article key={step.label} className="h-full rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F3B18E]">
                        {step.label}
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757] text-white">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                    <h4 className="mt-5 text-lg font-semibold text-white">{step.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.body}</p>
                  </article>
                )
              })}
            </MobileCarouselRail>

            <div className="relative z-10 hidden gap-4 lg:grid lg:grid-cols-5">
              {systemSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <FadeIn key={step.label} delay={index * 0.04}>
                    <article className="h-full rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F3B18E]">
                          {step.label}
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757] text-white">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                      </div>
                      <h4 className="mt-5 text-lg font-semibold text-white">{step.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.body}</p>
                    </article>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mx-auto mt-8 rounded-2xl bg-[#17120f] p-5 text-white shadow-xl shadow-neutral-900/15 ring-1 ring-neutral-900/10 md:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F3B18E]">
              How Autopilot works
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold">
              Plans like a system. Leaves you in control.
            </h3>
            <div className="mt-4 grid gap-2 text-sm text-neutral-300">
              {['Reads pantry, leftovers, budget, and time', 'Balances variety and prep effort', 'Lets you lock, swap, rerun, or shop'].map((item) => (
                <div key={item} className="rounded-xl bg-white/[0.07] px-3 py-2 ring-1 ring-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-12 hidden max-w-4xl overflow-hidden rounded-[1.75rem] bg-[#17120f] shadow-2xl shadow-neutral-900/20 ring-1 ring-neutral-900/10 dark:ring-white/10 md:block">
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[280px]">
                <Image
                  src={familyDinnerImage}
                  alt="Family enjoying a meal planned by MealEase Autopilot"
                  fill
                  sizes="(min-width: 768px) 360px, 100vw"
                  className="object-cover"
                  placeholder="blur"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-950/30 md:bg-gradient-to-l" />
              </div>

              <div className="p-7 text-white md:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F3B18E]">
                  How Autopilot works
                </p>
                <h3 className="mt-3 font-serif text-2xl font-bold md:text-3xl">
                  It plans like a system, then leaves you in control.
                </h3>

                <div className="mt-6 grid gap-3">
                  {[
                    { step: '01', title: 'Reads the week', desc: 'Pantry, leftovers, budget, dietary needs, season, and time.' },
                    { step: '02', title: 'Balances the plan', desc: 'Cuisine variety, protein rotation, prep time, and grocery impact.' },
                    { step: '03', title: 'Lets you steer', desc: 'Lock favorites, swap any day, rerun, or move straight to groceries.' },
                  ].map((item) => (
                    <div key={item.step} className="grid grid-cols-[44px_1fr] gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                      <p className="text-xs font-bold text-[#F3B18E]">{item.step}</p>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-300">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
