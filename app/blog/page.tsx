import Link from 'next/link'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogCTA } from '@/components/blog/BlogCTA'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { getAllPosts } from '@/lib/blog/mdx'
import { CATEGORY_LABELS, type BlogCategory } from '@/lib/blog/types'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Meal Planning Blog | AI Dinner Ideas, Grocery Budgets, and Leftovers',
  description:
    'Feature-led guides for AI meal planning, fridge scanning, grocery lists, budget dinners, leftovers, and household cooking from MealEase.',
  keywords: [
    'AI meal planning blog',
    'family meal planning',
    'grocery list meal planner',
    'leftover recipe ideas',
    'budget dinner ideas',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Meal Planning Blog | MealEase',
    description:
      'Guides for AI meal planning, fridge scanning, grocery lists, budget dinners, leftovers, and household cooking.',
    url: absoluteUrl('/blog'),
    siteName: 'MealEase',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meal Planning Blog | MealEase',
    description:
      'Feature-led guides for AI meal planning, grocery lists, budget dinners, leftovers, and household cooking.',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MealEase Meal Planning Blog',
    description: metadata.description,
    url: absoluteUrl('/blog'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  }

  return (
    <>
      <Nav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="relative pt-16 pb-10 md:pt-24 md:pb-14">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FDF6F1] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
          />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#D97757] uppercase tracking-wider mb-4">
                The MealEase Blog
              </p>
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.05]">
                Real ideas for{' '}
                <span className="italic text-[#D97757]">real kitchens.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
                Honest takes on meal planning, leftovers, grocery budgets, and feeding a household
                — from the team at MealEase.
              </p>
            </div>

            {/* Categories */}
            <nav aria-label="Blog categories" className="mt-10">
              <ul className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABELS) as BlogCategory[]).map((c) => (
                  <li key={c}>
                    <Link
                      href={`/blog/category/${c}`}
                      className="inline-block text-sm bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-[#D97757] hover:text-[#D97757] text-neutral-700 dark:text-neutral-300 rounded-full px-4 py-1.5 transition-colors"
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {posts.length === 0 ? (
          <section className="py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-md mx-auto">
                <p className="text-neutral-500">First post coming soon. Subscribe below to catch it.</p>
                <NewsletterBlock />
              </div>
            </div>
          </section>
        ) : (
          <>
            {featured && (
              <section className="py-10">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                  <BlogCard post={featured} featured />
                </div>
              </section>
            )}

            <section className="py-8">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <BlogCTA variant="index" />
              </div>
            </section>

            {rest.length > 0 && (
              <section className="py-10 md:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-8">
                    More reading
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rest.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="py-12">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                  <NewsletterBlock />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
