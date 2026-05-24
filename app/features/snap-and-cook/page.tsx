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
  title: "Snap & Cook — Cook From What's In Your Fridge | MealEase",
  description:
    "Point your camera at your fridge. MealEase identifies your ingredients and suggests 3 recipes you can make right now — no grocery run needed.",
  openGraph: {
    title: "Snap & Cook — Cook From What's In Your Fridge | MealEase",
    description:
      "Point your camera at your fridge. MealEase identifies your ingredients and suggests 3 recipes you can make right now.",
    type: 'website',
  },
  alternates: { canonical: 'https://mealeaseai.com/features/snap-and-cook' },
}

const steps = [
  {
    n: '01',
    title: 'Open the scanner',
    body: 'Tap the camera icon in MealEase. Point it at your open fridge, pantry shelf, or any ingredients on your counter.',
  },
  {
    n: '02',
    title: 'We identify everything',
    body: 'OpenAI-powered vision identifies visible ingredients from the photo. Review the list and tap to correct anything in seconds.',
  },
  {
    n: '03',
    title: 'Pick a recipe and cook',
    body: 'We surface 3 recipes you can make right now with what you have. Choose one and follow the step-by-step cook mode.',
  },
]

const benefits = [
  { icon: '📸', title: 'AI vision scanner', body: 'Uses production vision AI to recognize visible fridge, pantry, and counter ingredients.' },
  { icon: '🛒', title: 'Skip the grocery run', body: 'Cook what you already have. Reduce waste and save money.' },
  { icon: '🍳', title: '3 recipes instantly', body: 'Three different meal options surfaced from your exact ingredients.' },
  { icon: '✨', title: 'Copilot result refinement', body: 'Ask Copilot to adjust the result for time, budget, dietary needs, or what your household will actually eat.' },
  { icon: '✏️', title: 'Easy corrections', body: 'Tap any ingredient to edit. The AI learns from your corrections.' },
  { icon: '🥡', title: 'Pantry-aware', body: 'Scan your pantry too. We combine fridge + pantry for more options.' },
  { icon: '♻️', title: 'Reduce food waste', body: 'Use ingredients before they expire. Save $50–$100/month on wasted food.' },
]

const relatedFeatures = [
  { href: '/features/tonight-suggestions', label: 'Tonight Suggestions', desc: 'Personalized dinner in one tap' },
  { href: '/features/leftovers-ai', label: 'Leftovers AI', desc: 'Turn leftovers into new meals' },
  { href: '/features/budget-intelligence', label: 'Budget Intelligence', desc: 'See costs before you shop' },
]

export default function SnapAndCookPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <FeatureHero
          eyebrow="Snap & Cook"
          title={<>Cook what&rsquo;s <span className="italic text-[#F3B18E]">already in your fridge.</span></>}
          description="Point your camera at your fridge. MealEase identifies your ingredients and suggests 3 recipes you can make right now — no grocery run needed."
          primaryHref="/signup"
          primaryLabel="Try free — no card needed"
          secondaryHref="/pricing"
          secondaryLabel="See pricing"
          mockup="snap"
        />

        <GEOAnswerBlock
          eyebrow="AI answer summary"
          title="What is Snap & Cook?"
          tldr="Snap & Cook is MealEase's fridge and pantry scanner for turning visible ingredients into dinner ideas. Instead of starting with a blank prompt, families can photograph what they already have, review detected ingredients, and cook before food becomes waste."
          answers={[
            {
              question: 'How does Snap & Cook work?',
              answer:
                'The user points the camera at fridge, pantry, or counter ingredients; MealEase identifies visible food, lets the user correct the list, and suggests meals that can be made now.',
            },
            {
              question: 'Why is this stronger than a recipe generator?',
              answer:
                'The workflow starts from the household kitchen, not a generic recipe idea, so the app can reduce missing ingredients, duplicate buying, and wasted food.',
            },
            {
              question: 'Who is Snap & Cook best for?',
              answer:
                'It is best for households with food on hand but low dinner energy, especially when produce, leftovers, or pantry items need to be used soon.',
            },
          ]}
          proof={[
            'Snap & Cook targets the same $1,500/year household food-waste problem as Leftovers AI.',
            'MealEase can combine scanner context with pantry deductions and estimated grocery-list cost.',
            'The scanner creates a saved context trail so future planning can get more personal over time.',
          ]}
        />

        <FeatureMotionSections
          problemTitle="Full fridge, empty ideas"
          problemBody="The average household throws away $1,500 in food every year — not because they don't have ingredients, but because they don't know what to make with them."
          solutionTitle="Snap. Identify. Cook."
          solutionBody="One photo turns your fridge into a recipe generator. We identify what you have and surface meals you can make right now — no extra shopping required."
          howItWorksSubtitle="From fridge to dinner in three steps."
          steps={steps}
          benefitsTitle="Why it works"
          benefits={benefits}
          relatedFeatures={relatedFeatures}
          ctaTitle={<>Your fridge is full.{' '}<span className="italic text-[#D97757]">Use it.</span></>}
          ctaSubtitle="Stop wasting food and money. Start cooking what you already have."
          ctaPrimaryHref="/signup"
          ctaPrimaryLabel="Start free today"
          ctaSecondaryHref="/upgrade?feature=scan"
          ctaSecondaryLabel="Upgrade to Plus"
        >
          {/* Grocery workflow */}
          <Section background="dark" padding="md" className="text-white">
            <Container>
              <ScrollReveal>
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#F3B18E] mb-4">
                    Grocery workflow
                  </p>
                  <h2 className="font-serif text-4xl font-bold tracking-tight mb-4">
                    Snap & Cook also improves the list.
                  </h2>
                  <p className="text-neutral-300 text-lg leading-relaxed">
                    Plus turns fridge and pantry context into smarter grocery planning:
                    deduct what you already have, estimate the remaining cost, organize
                    by store format, and track checked progress while you shop.
                  </p>
                </div>
              </ScrollReveal>
              <StaggerGroup className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
                {[
                  { title: 'Pantry deduction', body: 'Avoid buying ingredients already on your shelf.' },
                  { title: 'Estimated cost', body: 'See the likely cart impact before checkout.' },
                  { title: 'Store format', body: 'Group items for produce, pantry, dairy, freezer, and more.' },
                  { title: 'Checked progress', body: 'Track what is done while the list stays organized.' },
                ].map((item) => (
                  <HoverCard key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.body}</p>
                  </HoverCard>
                ))}
              </StaggerGroup>
            </Container>
          </Section>

          {/* Free vs Plus */}
          <Section background="cream" padding="md">
            <Container>
              <ScrollReveal>
                <div className="max-w-3xl mx-auto">
                  <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-8 text-center">Free vs Plus</h2>
                  <StaggerGroup className="grid md:grid-cols-2 gap-6" staggerDelay={0.15}>
                    <HoverCard className="rounded-2xl bg-white border border-neutral-200 p-7 shadow-subtle hover:shadow-medium transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Free</p>
                      <ul className="space-y-3 text-sm text-neutral-700">
                        {['Basic Snap & Cook', 'Ingredient recognition', '3 recipe suggestions per scan', 'Manual ingredient editing'].map((f) => (
                          <li key={f} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{f}</li>
                        ))}
                      </ul>
                    </HoverCard>
                    <HoverCard className="rounded-2xl bg-neutral-900 border border-[#D97757]/30 p-7 shadow-subtle hover:shadow-medium transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-4">Plus</p>
                      <ul className="space-y-3 text-sm text-neutral-300">
                        {['Unlimited scans', 'Pantry + fridge combined', 'Ask Copilot to adjust the result', 'Ingredient preferences remembered', 'Pantry deductions for grocery lists', 'Estimated cost and store grouping', 'Checked shopping progress'].map((f) => (
                          <li key={f} className="flex items-start gap-2"><span className="text-[#D97757] mt-0.5">✓</span>{f}</li>
                        ))}
                      </ul>
                      <Link
                        href="/upgrade?feature=scan"
                        className="mt-6 block text-center rounded-xl bg-[#D97757] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c4664a] transition-colors"
                      >
                        Upgrade to Plus →
                      </Link>
                    </HoverCard>
                  </StaggerGroup>
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
