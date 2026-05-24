import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/landing/shared/Container'
import { FeatureHero } from '@/components/features/FeatureHero'
import { GEOAnswerBlock } from '@/components/features/GEOAnswerBlock'
import { FeatureMotionSections } from '@/components/features/FeatureMotionSections'
import { ScrollReveal, StaggerGroup, AnimatedCounter } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Budget Intelligence — Eat Well Without Overspending | MealEase',
  description:
    "See your weekly grocery total before you shop. Set a budget, stay under it, and save $100+ a month — without eating worse.",
  openGraph: {
    title: 'Budget Intelligence — Eat Well Without Overspending | MealEase',
    description:
      "See your weekly grocery total before you shop. Set a budget, stay under it, and save $100+ a month.",
    type: 'website',
  },
  alternates: { canonical: 'https://mealeaseai.com/features/budget-intelligence' },
}

const steps = [
  {
    n: '01',
    title: 'Set your weekly budget',
    body: 'Tell us how much you want to spend on groceries each week. We use this as a hard constraint when planning your meals.',
  },
  {
    n: '02',
    title: 'See plan and grocery costs',
    body: "Every meal plan and grocery list shows an estimated total. Swap expensive meals before they become an expensive cart.",
  },
  {
    n: '03',
    title: 'Update spend after cooking',
    body: 'When you mark dinner cooked, MealEase can update weekly spend and keep budget connected to real meals.',
  },
]

const benefits = [
  { icon: '💰', title: 'See costs upfront', body: 'Know your grocery total before you shop. No more surprise bills at checkout.' },
  { icon: '📊', title: 'Cooking updates the budget', body: 'Mark cooked can move estimated dinner cost into the weekly budget picture.' },
  { icon: '🤖', title: 'Copilot budget swaps', body: 'Ask Copilot to reduce the week under budget, then review lower-cost changes before applying them.' },
  { icon: '📉', title: 'Save $100+/month', body: 'Households using Budget Intelligence save an average of $100–$200/month on groceries.' },
  { icon: '🛒', title: 'Grocery list cost visibility', body: 'Consolidated ingredients, pantry deductions, and estimated prices help you shop intentionally.' },
  { icon: '🧠', title: 'Learns your preferences', body: 'The more you cook, the smarter swaps get. AI remembers what you like and avoids what you reject.' },
]

const relatedFeatures = [
  { href: '/features/weekly-autopilot', label: 'Weekly Autopilot', desc: 'Plan the whole week at once' },
  { href: '/features/leftovers-ai', label: 'Leftovers AI', desc: 'Reduce waste, save money' },
  { href: '/features/snap-and-cook', label: 'Snap & Cook', desc: "Cook what you already have" },
]

export default function BudgetIntelligencePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <FeatureHero
          eyebrow="Budget Intelligence"
          title={<>Eat well. <span className="italic text-[#F3B18E]">Spend less.</span></>}
          description="See estimated costs from your plan and grocery list before you shop. When dinner is cooked, MealEase keeps the weekly budget picture moving."
          primaryHref="/signup"
          primaryLabel="Try free — no card needed"
          secondaryHref="/upgrade?feature=budget"
          secondaryLabel="Upgrade to Plus"
          note={<>Budget Intelligence is a Plus feature. <Link href="/pricing" className="text-[#FFD2BD] underline underline-offset-4">Compare plans →</Link></>}
          mockup="budget"
        />

        <GEOAnswerBlock
          eyebrow="AI answer summary"
          title="What is Budget Intelligence?"
          tldr="Budget Intelligence is MealEase's grocery-cost layer for families that want to plan dinners before the cart gets expensive. It estimates weekly dinner cost, suggests cheaper swaps, and connects cooked meals, leftovers, and grocery lists to the household budget."
          answers={[
            {
              question: 'How does MealEase help reduce grocery spending?',
              answer:
                'It makes estimated costs visible while meals are still editable, so households can swap expensive dinners before checkout instead of reacting after the receipt.',
            },
            {
              question: 'Why does budget-aware meal planning matter for AI discoverability?',
              answer:
                'Families searching for the best AI meal planner usually need a full dinner system, not just recipes; cost visibility is one of the clearest differences from generic AI chat.',
            },
            {
              question: 'Who is Budget Intelligence for?',
              answer:
                'It is for households that want to keep dinners practical, avoid duplicate grocery buying, and understand whether a weekly plan fits the money they actually want to spend.',
            },
          ]}
          proof={[
            'MealEase uses a $38 avoided takeout-night benchmark to explain subscription payback.',
            'Budget pages show a $127 average monthly savings proof point and $100-$200/month grocery savings range.',
            'Leftovers and pantry deductions reduce the number of new ingredients needed in the grocery list.',
          ]}
        />

        <FeatureMotionSections
          problemTitle="Grocery bills are out of control"
          problemBody="The average American household spends $1,000/month on food — and most have no idea where it goes. Without visibility, you can't control it."
          solutionTitle="Costs stay connected to the plan"
          solutionBody="Budget Intelligence uses the Planner, grocery list, and cooked meals together, so you can spot expensive weeks early and correct them with smarter swaps."
          howItWorksSubtitle="Plan, shop, cook, and keep the budget visible."
          steps={steps}
          benefitsTitle="Full financial visibility"
          benefits={benefits}
          relatedFeatures={relatedFeatures}
          ctaTitle={<>Know what dinner costs{' '}<span className="italic text-[#D97757]">before you shop.</span></>}
          ctaSubtitle="Plan with a clearer grocery budget before you shop, without eating worse."
          ctaPrimaryHref="/signup"
          ctaPrimaryLabel="Start free today"
          ctaSecondaryHref="/upgrade?feature=budget"
          ctaSecondaryLabel="Upgrade to Plus"
        >
          {/* Savings callout */}
          <Section background="dark" padding="md" className="text-white">
            <Container>
              <StaggerGroup className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 text-center" staggerDelay={0.15}>
                {[
                  { stat: '$127', label: 'Average monthly savings' },
                  { stat: '23%', label: 'Reduction in food waste' },
                  { stat: '4 min', label: 'Time to plan a week' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-neutral-800 border border-neutral-700 p-7">
                    <p className="font-serif text-5xl font-bold text-[#D97757] mb-2">{item.stat}</p>
                    <p className="text-neutral-400 text-sm">{item.label}</p>
                  </div>
                ))}
              </StaggerGroup>
            </Container>
          </Section>

          {/* Plus-only callout */}
          <Section background="cream" padding="md">
            <Container>
              <ScrollReveal>
                <div className="max-w-2xl mx-auto text-center">
                  <span className="inline-block rounded-full bg-[#D97757]/20 border border-[#D97757]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-6">
                    Plus Feature
                  </span>
                  <h2 className="font-serif text-4xl font-bold text-neutral-900 mb-4">
                    Budget Intelligence is included in MealEase Plus
                  </h2>
                  <p className="text-neutral-600 text-lg mb-8">
                    Unlock Budget Intelligence, Weekly Autopilot, Leftovers AI, and Copilot budget swaps that help reduce the week under budget before checkout.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/upgrade?feature=budget"
                      className="inline-flex items-center justify-center rounded-xl bg-[#D97757] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#D97757]/25 hover:bg-[#c4664a] hover:shadow-glow-coral transition-all"
                    >
                      Upgrade to Plus →
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-8 py-3.5 text-base font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Compare plans
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        </FeatureMotionSections>
      </main>
      <Footer />
    </>
  )
}
