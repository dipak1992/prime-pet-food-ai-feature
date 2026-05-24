import { Nav } from '@/components/landing/Nav'
import { PricingContent } from '@/components/pricing/PricingContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — MealEase',
  description: 'MealEase pricing framed around recovered food value. Free includes basic Copilot meal assists; Plus helps prevent takeout, reduce food waste, plan groceries, and protect the weekly food budget.',
  alternates: {
    canonical: '/pricing',
  },
}

export default async function PricingPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white dark:bg-neutral-950">
        <PricingContent />
      </main>
    </>
  )
}
