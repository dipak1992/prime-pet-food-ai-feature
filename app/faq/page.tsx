'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/landing/shared/Container'
import { ScrollReveal, StaggerGroup, HoverCard } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

const faqCategories = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is MealEase?',
        a: "MealEase learns your household, plans dinner, builds the grocery list, and includes Copilot for conversational meal help. It answers the food questions every family asks every week: What's for dinner tonight? What can I make from my fridge? What's the plan for this week? What do I do with leftovers? What will it cost me?",
      },
      {
        q: 'Is MealEase free to use?',
        a: 'Yes. MealEase has a useful free tier that includes Tonight Suggestions, 3 meal swaps per day, 3 basic Copilot meal assists per day, a 3-day Planner preview, basic Snap & Cook, basic grocery preview, cook mode, and basic dietary filters. Plus unlocks the full connected system.',
      },
      {
        q: 'Do I need to create an account?',
        a: "Yes — a free account lets us personalize suggestions to your household, remember your preferences, and sync across devices. Sign up takes under 60 seconds with Google or email.",
      },
    ],
  },
  {
    category: 'Free vs Plus',
    items: [
      {
        q: 'What does the free plan include?',
        a: "The free plan includes: Tonight Suggestions, 3 meal swaps per day, 3 basic Copilot meal assists per day, a 3-day Planner preview, basic Snap & Cook, basic grocery preview, step-by-step cook mode, and basic dietary filters. It's genuinely useful, not a crippled demo.",
      },
      {
        q: 'What does MealEase Plus unlock?',
        a: "Plus unlocks the full food operating system: unlimited/fair-use Copilot with voice, weekly instructions, memory, proactive nudges, plan refinements, budget swaps, grocery actions, and schedule learning, plus 7-day Planner / Weekly Autopilot, unlimited swaps and Snap & Cook usage, pantry-aware grocery lists with estimated cost, supported grocery handoff tools, Budget Intelligence, Leftovers AI, household memory, saved meal resurfacing, and post-cook follow-ups like leftovers and tomorrow's lunch.",
      },
      {
        q: 'What is MealEase Copilot?',
        a: 'Copilot is not a generic chatbot. It is the action layer over your household food system. Free users get basic reactive meal assists. Plus users unlock weekly briefings, voice, weekly instructions like “Thai this week,” memory, proactive nudges, plan refinements, budget-aware swaps, leftover monitoring, grocery actions, schedule learning, and household preference learning.',
      },
      {
        q: 'Is MealEase Copilot like ChatGPT?',
        a: 'No. ChatGPT can brainstorm meal ideas, but MealEase Copilot is connected to MealEase. It can route actions across your plan, groceries, leftovers, budget, schedule patterns, and household memory so you are not rebuilding context from a blank prompt.',
      },
      {
        q: 'How much does Plus cost?',
        a: "MealEase Plus is available monthly or annually. Annual billing saves you significantly. Visit our pricing page for current rates. We also offer a 7-day free trial so you can try everything before committing.",
      },
      {
        q: 'How many swaps do I get on the free plan?',
        a: "Free users get 3 recipe swaps per day. Plus users get unlimited swaps — swap as many times as you want until you find something you love.",
      },
    ],
  },
  {
    category: 'Features',
    items: [
      {
        q: 'How does Snap & Cook work?',
        a: "Open the MealEase scanner, point your camera at your open fridge or pantry, and take a photo. OpenAI-powered vision identifies visible ingredients, you can tap to correct anything, then we surface 3 recipes you can make right now with what you have — no grocery run needed.",
      },
      {
        q: 'What is Weekly Autopilot?',
        a: "Weekly Autopilot is the full Planner experience. Free users can preview 3 days; Plus unlocks the full 7-day plan with budget-aware swaps, grocery impact, household memory, and a consolidated shopping workflow.",
      },
      {
        q: 'How does Leftovers AI work?',
        a: "After you cook a meal, tap 'Mark cooked'. MealEase can create tracked leftovers, update your budget, and suggest a next use like tomorrow's lunch. Leftovers AI then turns those extras into practical meals before they expire.",
      },
      {
        q: 'What is Budget Intelligence?',
        a: 'Budget Intelligence is a Plus feature that shows estimated costs from your plan and grocery list before you shop. When you cook, MealEase can update your weekly spend so budget stays connected to real meals, not just estimates.',
      },
      {
        q: 'Does MealEase work with grocery delivery?',
        a: 'Plus includes a premium grocery workflow: pantry deductions, estimated cost, store-friendly grouping, checked progress, and export-ready organization. Store handoff availability varies by region and provider.',
      },
      {
        q: 'How does the smart grocery list work?',
        a: 'MealEase turns your weekly plan into an organized grocery list. You can edit items first, then use supported store handoff tools where available, or export the list for any local store.',
      },
      {
        q: 'Can I shop at Walmart, Instacart, Kroger, or Costco?',
        a: 'Where supported, MealEase can help hand off your grocery list to providers such as Walmart, Instacart, Kroger, Costco, Amazon Fresh, and regional grocery search. Availability depends on region, provider coverage, and item matching.',
      },
      {
        q: 'What if my country does not support those stores?',
        a: 'You can still use the grocery workflow globally. Copy your grocery list, download a PDF, or bring the organized list to your local store.',
      },
      {
        q: 'Can I edit grocery lists first?',
        a: 'Yes. You can review and edit grocery items before using a store handoff, copying the list, downloading PDF, or shopping locally.',
      },
      {
        q: 'Is MealEase processing payments for groceries?',
        a: 'No. MealEase does not process grocery payments. Checkout, fulfillment, substitutions, delivery, and pickup are handled by the supported store or provider you choose.',
      },
    ],
  },
  {
    category: 'Dietary & Preferences',
    items: [
      {
        q: 'Does it work for my diet?',
        a: "Yes. MealEase supports vegetarian, vegan, gluten-free, dairy-free, keto, paleo, halal, kosher, low-FODMAP, nut-free, and more. Set your restrictions once during onboarding — we remember them forever and never suggest meals that violate them.",
      },
      {
        q: 'Can I set preferences for multiple people in my household?',
        a: "Yes. During onboarding, tell us your household size and any dietary restrictions for the household. We plan meals that work for everyone — no separate profiles needed.",
      },
      {
        q: 'What if I don\'t like a suggestion?',
        a: "Tap 'Show another' for a fresh suggestion instantly. Free users get 3 swaps per day. Plus users get unlimited swaps. The more you rate and swap, the better MealEase learns your taste over time.",
      },
    ],
  },
  {
    category: 'Privacy & Account',
    items: [
      {
        q: 'Is my data private?',
        a: "Yes. Your meal history, fridge photos, and household details are yours. We never sell your data to third parties. You can delete your account and all associated data with one click from your account settings.",
      },
      {
        q: 'Can I cancel anytime?',
        a: "Absolutely. Cancel in two taps from your account page — no retention calls, no guilt trips, no hidden fees. If you cancel, you keep Plus access until the end of your current billing period.",
      },
      {
        q: 'Who operates MealEase billing?',
        a: 'MealEase is a product of DDS Supply LLC. MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.',
      },
      {
        q: 'What happens to my data if I cancel?',
        a: "Your account and data remain intact if you cancel Plus — you just revert to the free tier. If you want to fully delete your account and all data, you can do that from account settings at any time.",
      },
    ],
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const id = `faq-item-${index}`

  return (
    <div className="border-b border-neutral-200/80 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-neutral-900 group-hover:text-[#D97757] transition-colors">
          {q}
        </span>
        <span
          aria-hidden
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <div
        id={id}
        role="region"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-neutral-600 leading-relaxed text-sm">
          {a}
        </p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* Hero */}
        <Section background="gradient" padding="lg">
          <Container>
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <SectionHeader
                  badge="FAQ"
                  title="Questions? Answered."
                  subtitle="Everything you need to know about MealEase — from getting started to what Plus unlocks."
                />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ sections */}
        <Section background="white" padding="md">
          <Container>
            <div className="max-w-3xl mx-auto space-y-14">
              {faqCategories.map((cat, ci) => (
                <ScrollReveal key={cat.category} delay={ci * 0.05}>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-6">
                      {cat.category}
                    </h2>
                    <HoverCard className="rounded-2xl border border-neutral-200 bg-neutral-50/80 px-6 shadow-subtle hover:shadow-medium transition-shadow">
                      {cat.items.map((item, i) => (
                        <FAQItem
                          key={item.q}
                          q={item.q}
                          a={item.a}
                          index={ci * 100 + i}
                        />
                      ))}
                    </HoverCard>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Still have questions */}
        <Section background="cream" padding="md">
          <Container>
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-4">
                  Still have questions?
                </h2>
                <p className="text-neutral-600 mb-8">
                  Our support team typically responds within a few hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-7 py-3.5 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:shadow-medium transition-all"
                  >
                    Contact support
                  </Link>
                  <Link
                    href="/help"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-7 py-3.5 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:shadow-medium transition-all"
                  >
                    Browse help center
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="dark" padding="lg">
          <Container>
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  Ready to stop asking{' '}
                  <span className="italic text-[#D97757]">&ldquo;what&rsquo;s for dinner?&rdquo;</span>
                </h2>
                <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
                  Build a dinner routine that feels easier to repeat.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-[#D97757] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#D97757]/25 hover:bg-[#c4664a] hover:shadow-glow-coral transition-all"
                  >
                    Start free today
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-8 py-3.5 text-base font-semibold text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  )
}
