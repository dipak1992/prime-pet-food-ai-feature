import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { PressHero } from '@/components/press/PressHero'
import { FactSheet } from '@/components/press/FactSheet'
import { FoundersBios } from '@/components/press/FoundersBios'
import { DownloadableAssets } from '@/components/press/DownloadableAssets'
import { PressContact } from '@/components/press/PressContact'

export const metadata = {
  title: 'Press kit | MealEase',
  description:
    'Logos, founder photos, bios, and fact sheet for media. Direct contact with founders.',
  openGraph: {
    title: 'MealEase Press Kit',
    description:
      'Everything journalists and partners need — logos, photos, founder bios, and the story behind MealEase.',
  },
}

export default function PressPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <PressHero />
        <FactSheet />
        <FoundersBios />
        <DownloadableAssets />
        <PressContact />
      </main>
      <Footer />
    </>
  )
}
