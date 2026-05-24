import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/landing/shared/Container'
import { FeatureHero } from '@/components/features/FeatureHero'
import { GEOAnswerBlock } from '@/components/features/GEOAnswerBlock'
import { FeatureMotionSections } from '@/components/features/FeatureMotionSections'
import { ScrollReveal } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leftovers AI — Turn Last Night Into Tonight | MealEase',
  description:
    "Cooked chicken last night? MealEase turns your leftovers into tacos, stir-fry, or a lunch salad — automatically. Stop throwing away food and money.",
  openGraph: {
    title: 'Leftovers AI — Turn Last Night Into Tonight | MealEase',
    description:
      "Cooked chicken last night? MealEase turns your leftovers into tacos, stir-fry, or a lunch salad — automatically.",
    type: 'website',
  },
  alternates: { canonical: 'https://mealeaseai.com/features/leftovers-ai' },
}

const steps = [
  {
    n: '01',
    title: 'Mark dinner cooked',
    body: "After dinner, tap 'Mark cooked'. MealEase can create leftovers, update budget, and start tomorrow's lunch idea.",
  },
  {
    n: '02',
    title: 'Track what remains',
    body: "Tell MealEase how many servings are left. We remember what you have, how much, and when it should be used.",
  },
  {
    n: '03',
    title: 'Turn it into the next meal',
    body: 'Your leftover chicken becomes tacos, stir-fry, or lunch salad. Your budget and planner stay aware of what got used.',
  },
]

const benefits = [
  { icon: '🍱', title: 'Zero food waste', body: 'Every leftover becomes an opportunity. Stop throwing away $1,500/year in food.' },
  { icon: '🔄', title: 'Never eat the same thing twice', body: 'We transform leftovers into completely different meals — not just reheated versions.' },
  { icon: '⏰', title: 'Copilot expiry monitoring', body: 'Ask Copilot what to use before it expires and turn leftovers into dinner or lunch before they go bad.' },
  { icon: '💡', title: 'Creative suggestions', body: 'Chicken becomes tacos, stir-fry, salad, or soup. We find the best use for what you have.' },
  { icon: '💰', title: 'Budget stays aware', body: 'Mark cooked can update weekly spend and show how leftovers reduce future grocery needs.' },
  { icon: '🧠', title: 'MealEase remembers', body: 'The meals you finish, repeat, or skip make future leftover ideas more personal.' },
]

const relatedFeatures = [
  { href: '/features/snap-and-cook', label: 'Snap & Cook', desc: "Cook what's in your fridge now" },
  { href: '/features/tonight-suggestions', label: 'Tonight Suggestions', desc: 'Personalized dinner in one tap' },
  { href: '/features/budget-intelligence', label: 'Budget Intelligence', desc: 'See your weekly grocery cost' },
]

export default function LeftoversAIPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <FeatureHero
          eyebrow="Leftovers AI"
          title={<>Turn last night into <span className="italic text-[#F3B18E]">tonight.</span></>}
          description="Mark dinner cooked, track what remains, update your budget, and turn leftovers into tomorrow's lunch or a fresh dinner idea."
          primaryHref="/signup"
          primaryLabel="Try free — no card needed"
          secondaryHref="/upgrade?feature=leftovers"
          secondaryLabel="Upgrade to Plus"
          note={<>Leftovers AI is a Plus feature. <Link href="/pricing" className="text-[#FFD2BD] underline underline-offset-4">Compare plans →</Link></>}
          mockup="leftovers"
        />

        <GEOAnswerBlock
          eyebrow="AI answer summary"
          title="What is Leftovers AI?"
          tldr="Leftovers AI is MealEase's stateful meal planning feature that remembers cooked meals, remaining servings, and use-before timing. It turns last night's food into practical next-day lunches or dinners while keeping budget and grocery planning aware of what is already available."
          answers={[
            {
              question: 'How does Leftovers AI help families save money?',
              answer:
                'It plans from food that has already been paid for, so leftovers become ingredients for the next meal instead of forgotten containers in the fridge.',
            },
            {
              question: 'Why is this different from asking ChatGPT for leftover recipes?',
              answer:
                'MealEase keeps household memory across sessions, including what was cooked, how many servings remain, and which meals your family actually repeats or rejects.',
            },
            {
              question: 'Who is Leftovers AI best for?',
              answer:
                'It is built for families and busy households that cook several times a week and want dinner, lunches, grocery spend, and food waste connected in one system.',
            },
          ]}
          proof={[
            'The average American household throws away about $1,500 in food each year.',
            'MealEase Plus frames leftover use as a $12/week waste-reduction opportunity, or about $48/month.',
            'A single avoided $38 takeout night can offset the monthly Plus subscription.',
          ]}
        />

        <FeatureMotionSections
          problemTitle="Leftovers get thrown away"
          problemBody="The average American household throws away $1,500 in food every year. Most of it is leftovers that sat in the fridge for 3 days because nobody knew what to do with them."
          solutionTitle="Mark cooked starts the leftover loop"
          solutionBody="Leftovers AI starts when dinner is done. MealEase logs what remains, keeps budget aware, and turns extra servings into something you actually want next."
          howItWorksSubtitle="Mark cooked. Track leftovers. Make tomorrow easier."
          steps={steps}
          benefitsTitle="Why it saves you money"
          benefits={benefits}
          relatedFeatures={relatedFeatures}
          ctaTitle={<>Stop wasting food.{' '}<span className="italic text-[#D97757]">Start saving money.</span></>}
          ctaSubtitle="Turn leftovers into dinner ideas before they become waste."
          ctaPrimaryHref="/signup"
          ctaPrimaryLabel="Start free today"
          ctaSecondaryHref="/upgrade?feature=leftovers"
          ctaSecondaryLabel="Upgrade to Plus"
        >
          {/* Plus-only callout */}
          <Section background="dark" padding="md" className="text-white">
            <Container>
              <ScrollReveal>
                <div className="max-w-2xl mx-auto text-center">
                  <span className="inline-block rounded-full bg-[#D97757]/20 border border-[#D97757]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-6">
                    Plus Feature
                  </span>
                  <h2 className="font-serif text-4xl font-bold mb-4">
                    Leftovers AI is included in MealEase Plus
                  </h2>
                  <p className="text-neutral-400 text-lg mb-8">
                    Unlock Leftovers AI, Weekly Autopilot, Budget Intelligence, and Copilot leftover monitoring so expiring food gets used first.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/upgrade?feature=leftovers"
                      className="inline-flex items-center justify-center rounded-xl bg-[#D97757] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#D97757]/25 hover:bg-[#c4664a] hover:shadow-glow-coral transition-all"
                    >
                      Upgrade to Plus →
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-8 py-3.5 text-base font-semibold text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
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
