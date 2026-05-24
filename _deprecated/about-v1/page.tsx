import { PublicSiteFooter } from '@/components/layout/PublicSiteFooter'
import { PublicSiteHeader } from '@/components/layout/PublicSiteHeader'
import { buildMetadata } from '@/lib/seo'
import { AboutPageContent } from '@/components/about/AboutPageContent'

export const metadata = buildMetadata({
  title: 'About',
  description:
    "Meet the family behind MealEase — Dipak and Suprabha, two working parents who built a calmer way to decide what's for dinner, so your evenings belong to your family again.",
  path: '/about',
  keywords: [
    'about MealEase',
    'MealEase founders',
    'family meal planning story',
    'busy parents dinner solution',
    'Dipak Suprabha founders',
  ],
})

export default function AboutPage() {
  return (
    <>
      <PublicSiteHeader />
      <main className="min-h-screen bg-background">
        <AboutPageContent />
      </main>
      <PublicSiteFooter />
    </>
  )
}
