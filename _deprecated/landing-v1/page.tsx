import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FivePillarsSection } from '@/components/landing/FivePillarsSection'
import { SocialProof } from '@/components/landing/SocialProof'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { PricingTeaser } from '@/components/landing/PricingTeaser'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { softwareAppSchema, faqSchema } from '@/lib/schema'

export const metadata = {
  title: 'MealEase — AI Meal Planning for Real Households',
  description:
    "Never ask \"What's for dinner?\" again. MealEase plans your week, uses what's in your fridge, saves your leftovers, and keeps you on budget. In 30 seconds.",
  openGraph: {
    title: 'MealEase — AI Meal Planning for Real Households',
    description:
      "Never ask \"What's for dinner?\" again. MealEase plans your week, uses what's in your fridge, saves your leftovers, and keeps you on budget.",
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:text-neutral-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <Nav />

      <main id="main-content">
        <Hero />
        <HowItWorks />
        <FivePillarsSection />
        <SocialProof />
        <ComparisonTable />
        <PricingTeaser />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </>
  )
}
