'use client'

import { ConversionStory } from './ConversionStory'
import { FivePillarsSection } from './FivePillarsSection'
import { AutopilotSection } from './AutopilotSection'
import { GroceryCommerceSection } from './GroceryCommerceSection'
import { ComparisonTable } from './ComparisonTable'
import { SocialProof } from './SocialProof'
import { FounderNote } from './FounderNote'
import { PricingTeaser } from './PricingTeaser'
import { FAQ } from './FAQ'
import { FinalCTA } from './FinalCTA'
import { Footer } from './Footer'

export function LandingSectionsClient() {
  return (
    <>
      <ConversionStory />
      <FivePillarsSection />
      <AutopilotSection />
      <GroceryCommerceSection />
      <ComparisonTable />
      <SocialProof />
      <FounderNote />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  )
}
