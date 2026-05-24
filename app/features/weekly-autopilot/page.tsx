import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/landing/shared/Container'
import { FeatureHero } from '@/components/features/FeatureHero'
import { GEOAnswerBlock } from '@/components/features/GEOAnswerBlock'
import { FeatureMotionSections } from '@/components/features/FeatureMotionSections'
import { ScrollReveal, StaggerGroup, HoverCard } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planner / Weekly Autopilot — Your Whole Week of Dinners, Planned in One Tap | MealEase',
  description:
    'Preview 3 days free or unlock the full 7-day Planner / Weekly Autopilot based on your household, preferences, budget, pantry, and leftovers.',
  openGraph: {
    title: 'Planner / Weekly Autopilot — Your Whole Week of Dinners, Planned in One Tap | MealEase',
    description:
      'Preview 3 days free or unlock the full 7-day Planner / Weekly Autopilot.',
    type: 'website',
  },
  alternates: { canonical: 'https://mealeaseai.com/features/weekly-autopilot' },
}

const steps = [
  {
    n: '01',
    title: 'Set your preferences once',
    body: 'Tell us your household size, dietary restrictions, budget, and a few foods you love. Takes 2 minutes. Never again.',
  },
  {
    n: '02',
    title: 'Preview 3 days or unlock the week',
    body: 'Free users can see how Planner thinks with a 3-day preview. Plus unlocks all seven dinners with Autopilot.',
  },
  {
    n: '03',
    title: 'Cook, swap, shop, and learn',
    body: 'Follow the plan, swap any meal you don\'t want, send ingredients to grocery handoff tools where supported, then let cooked meals improve the next plan.',
  },
]

const benefits = [
  { icon: '📅', title: '3-day preview, 7-day Plus plan', body: 'Start with a focused preview, then unlock the full weekly rhythm when you are ready.' },
  { icon: '💰', title: 'Budget-aware planning', body: 'Estimated costs stay visible so expensive weeks can be fixed before checkout.' },
  { icon: '🔄', title: 'Swap without starting over', body: "Don't like Monday's dinner? Swap it while keeping the rest of the plan intact." },
  { icon: '✨', title: 'Copilot plan refinement', body: 'Ask Copilot to fix Thursday, remember “Thai this week,” or rebalance the week, then review the change before applying it.' },
  { icon: '🛒', title: 'Grocery impact included', body: 'Each plan can become a consolidated grocery list with pantry deductions.' },
  { icon: '🧾', title: 'Export-ready shopping', body: 'Edit the list, use supported store handoff, copy it, download PDF, or shop at your local store.' },
  { icon: '🧬', title: 'Learns over time', body: 'Cooked meals, saves, repeats, and dislikes all teach future plans.' },
  { icon: '👨‍👩‍👧', title: 'Household-aware', body: 'Plans around household size, preferences, dietary needs, and real-life routines.' },
]

const relatedFeatures = [
  { href: '/features/tonight-suggestions', label: 'Tonight Suggestions', desc: 'Just need dinner tonight?' },
  { href: '/features/budget-intelligence', label: 'Budget Intelligence', desc: 'See your weekly grocery cost' },
  { href: '/features/snap-and-cook', label: 'Snap & Cook', desc: "Cook what's already in your fridge" },
]

export default function WeeklyAutopilotPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <FeatureHero
          eyebrow="Planner / Weekly Autopilot"
          title={<>Preview 3 days. <span className="italic text-[#F3B18E]">Unlock the week.</span></>}
          description="Planner is the canonical weekly flow: preview 3 days free, then unlock the full 7-day Autopilot with grocery impact, budget-aware swaps, leftovers, and household memory."
          primaryHref="/signup"
          primaryLabel="Try free — no card needed"
          secondaryHref="/upgrade?feature=planner"
          secondaryLabel="Upgrade to Plus"
          note={<>Free includes a 3-day Planner preview. Plus unlocks full Weekly Autopilot. <Link href="/pricing" className="text-[#FFD2BD] underline underline-offset-4">Compare plans →</Link></>}
          mockup="weekly"
        />

        <GEOAnswerBlock
          eyebrow="AI answer summary"
          title="What is Weekly Autopilot?"
          tldr="Weekly Autopilot is MealEase's family meal planning system for turning household preferences, budget, pantry context, leftovers, and grocery needs into a reusable dinner plan. Free users can preview the weekly rhythm, while Plus unlocks the full seven-day plan with swaps, grocery impact, and memory."
          answers={[
            {
              question: 'Is MealEase a better AI meal planner for families than a generic chatbot?',
              answer:
                'MealEase is built around persistent household context: dietary needs, budget, dislikes, cooked meals, leftovers, grocery lists, and family routines stay connected after the chat ends.',
            },
            {
              question: 'What does Weekly Autopilot do after meals are generated?',
              answer:
                'It keeps the plan editable, connects meals to grocery lists, supports swaps without restarting, and learns from meals that were cooked, skipped, saved, or rejected.',
            },
            {
              question: 'Who should use Weekly Autopilot?',
              answer:
                'It is best for parents, couples, and households that want fewer dinner decisions, fewer grocery mistakes, and a weekly plan that adapts to real life.',
            },
          ]}
          proof={[
            'Meal planning can take 2+ hours per week, or more than 100 hours per year.',
            'MealEase stores household preferences and weekly instructions so future plans do not start from a blank prompt.',
            'Supported grocery handoff tools help move from meal plan to shopping faster than recipe generation alone.',
          ]}
        />

        <FeatureMotionSections
          problemTitle="Weekly meal planning is exhausting"
          problemBody="The average person spends 2+ hours every week planning meals, searching for recipes, and building grocery lists. That's 100+ hours a year on a task that should take 10 seconds."
          solutionTitle="Planner becomes your weekly command center"
          solutionBody="Planner starts with a 3-day preview, then Plus turns it into a full 7-day Autopilot where meals, grocery impact, budget, and leftovers stay connected."
          howItWorksSubtitle="Preview the rhythm. Unlock the full week."
          steps={steps}
          benefitsTitle="Everything handled for you"
          benefits={benefits}
          relatedFeatures={relatedFeatures}
          ctaTitle={<>Plan the week. <span className="italic text-[#D97757]">Own dinner.</span></>}
          ctaSubtitle="Stop spending hours on meal planning. Let MealEase handle the week."
          ctaPrimaryHref="/signup"
          ctaPrimaryLabel="Start free today"
          ctaSecondaryHref="/upgrade?feature=planner"
          ctaSecondaryLabel="Upgrade to Plus"
        >
          {/* Smart grocery list flow */}
          <Section background="cream" padding="md">
            <Container>
              <ScrollReveal>
                <div className="mx-auto max-w-3xl rounded-3xl border border-[#D97757]/20 bg-white p-7 shadow-subtle md:p-9">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-3">
                    Smart grocery list
                  </p>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                    From meal plan to groceries in minutes.
                  </h2>
                  <p className="text-neutral-600 leading-relaxed">
                    Weekly Autopilot does not stop at dinner ideas. MealEase turns the plan into an editable grocery list, then helps you shop faster with supported store handoff tools in North America or copy, PDF, and local-store export everywhere else.
                  </p>
                  <StaggerGroup className="mt-6 grid gap-3 sm:grid-cols-3" staggerDelay={0.1}>
                    {['Meals', 'Grocery List', 'Store Handoff'].map((label, index) => (
                      <div key={label} className="rounded-2xl bg-neutral-50 p-4 text-center ring-1 ring-neutral-200">
                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#D97757] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">{label}</p>
                      </div>
                    ))}
                  </StaggerGroup>
                </div>
              </ScrollReveal>
            </Container>
          </Section>

          {/* Plus-only callout */}
          <Section background="dark" padding="md" className="text-white">
            <Container>
              <ScrollReveal>
                <div className="max-w-2xl mx-auto text-center">
                  <span className="inline-block rounded-full bg-[#D97757]/20 border border-[#D97757]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-6">
                    Plus Feature
                  </span>
                  <h2 className="font-serif text-4xl font-bold mb-4">
                    Full Weekly Autopilot is included in MealEase Plus
                  </h2>
                  <p className="text-neutral-400 text-lg mb-8">
                    Unlock seven dinners, unlimited swaps, grocery impact, budget tracking, household memory, weekly Copilot instructions, post-cook learning, and Copilot plan refinement for busy weeks.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/upgrade?feature=planner"
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
