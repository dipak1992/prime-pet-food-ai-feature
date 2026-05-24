import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { AboutHero } from '@/components/about/AboutHero'
import { FounderStory } from '@/components/about/FounderStory'
import { WhyBuiltIt } from '@/components/about/WhyBuiltIt'
import { Principles } from '@/components/about/Principles'
import { AboutCTA } from '@/components/about/AboutCTA'

export const metadata = {
  title: "About | MealEase \u2014 Built by a family that got tired of \u2018what\u2019s for dinner?\u2019",
  description:
    'Meet the husband-and-wife team behind MealEase. A software engineer and a CPA with two tiny kids, building the meal planner they wished existed.',
  openGraph: {
    title: 'About MealEase',
    description:
      'Built by a family that got tired of the 5:30 PM fridge stare. Meet Dipak and Suprabha.',
    images: ['/og-about.png'],
  },
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <AboutHero />
        <FounderStory />
        <WhyBuiltIt />
        <Principles />
        <AboutCTA />
      </main>
      <Footer />
    </>
  )
}
