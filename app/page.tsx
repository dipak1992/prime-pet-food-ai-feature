import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { ProductProofStrip } from '@/components/landing/ProductProofStrip'
import { DeferredLandingSections } from '@/components/landing/DeferredLandingSections'
import { DeferredMobileStickyCTA } from '@/components/landing/DeferredMobileStickyCTA'
import { productSchema, softwareAppSchema, faqSchema } from '@/lib/schema'
import { productStory } from '@/lib/marketing/stats'

// Revalidate every 30 minutes so the "Tonight's meal" rotates at 7am CT
// ISR ensures the page is regenerated after the meal day boundary
export const revalidate = 1800

export const metadata = {
  title: 'MealEase — Dinner Planned. Grocery List Built.',
  description: productStory,
  openGraph: {
    title: 'MealEase — Dinner Planned. Grocery List Built.',
    description: productStory,
    type: 'website',
  },
}

export default async function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
        <DeferredMobileStickyCTA />
        <ProductProofStrip />
        <DeferredLandingSections />
      </main>
    </>
  )
}
