import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { HelpSearch } from '@/components/help/HelpSearch'
import { HelpCategoryGrid } from '@/components/help/HelpCategoryGrid'
import { HelpArticleCard } from '@/components/help/HelpArticleCard'
import { HELP_ARTICLES } from '@/lib/help/articles'
import { Container } from '@/components/landing/shared/Container'

export const metadata: Metadata = {
  title: 'Help Center – MealEase',
  description:
    'Find answers about meal planning, scanning, budgets, billing, and your account.',
}

const POPULAR_SLUGS = [
  'what-is-mealease',
  'how-tonight-works',
  'how-to-scan-fridge',
  'how-autopilot-works',
  'upgrade-plan',
  'cancel-plan',
]

export default function HelpPage() {
  const popular = POPULAR_SLUGS.map((slug) =>
    HELP_ARTICLES.find((a) => a.slug === slug)
  ).filter(Boolean) as typeof HELP_ARTICLES

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                How can we help?
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Search our help articles or browse by category below.
              </p>
              <HelpSearch />
            </div>
          </Container>
        </section>

        {/* Categories */}
        <section className="py-16">
          <Container>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-8">
              Browse by category
            </h2>
            <HelpCategoryGrid />
          </Container>
        </section>

        {/* Popular articles */}
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Container>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-8">
              Popular articles
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((article) => (
                <HelpArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <Container>
            <div className="max-w-xl mx-auto text-center">
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <a
                href="mailto:hello@mealeaseai.com"
                className="text-[#D97757] font-medium hover:underline"
              >
                Email us at hello@mealeaseai.com →
              </a>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
