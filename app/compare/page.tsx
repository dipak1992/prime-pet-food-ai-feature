import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { comparePages } from '@/lib/seo-pages'
import { absoluteUrl } from '@/lib/seo'
import { buildBreadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'MealEase Comparisons | Best Meal Planning App Pages',
  description:
    'Explore MealEase comparison pages for ChatGPT, Mealime, Eat This Much, Paprika, and best meal planning apps for busy families.',
  alternates: { canonical: '/compare' },
}

export default function CompareHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'MealEase comparison hub',
        description: metadata.description,
        url: absoluteUrl('/compare'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: comparePages.map((page, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/compare/${page.slug}`),
            name: page.h1,
          })),
        },
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Compare', path: '/compare' },
      ]),
    ],
  }

  return (
    <>
      <Nav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="bg-[#FDF6F1] py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Compare MealEase
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight text-neutral-950 md:text-6xl">
              Comparison pages built for families choosing a meal planning system
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
              These pages explain where MealEase fits, who it is best for, and how it differs from generic AI chats, recipe organizers, and other meal planning tools.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {comparePages.map((page) => (
              <Link
                key={page.slug}
                href={`/compare/${page.slug}`}
                className="rounded-3xl bg-white p-6 ring-1 ring-neutral-200 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                  {page.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-neutral-950">
                  {page.h1}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{page.description}</p>
                <p className="mt-5 text-sm font-semibold text-[#D97757]">Read comparison →</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
