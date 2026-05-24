import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogCTA } from '@/components/blog/BlogCTA'
import { getPostsByCategory } from '@/lib/blog/mdx'
import { CATEGORY_LABELS, type BlogCategory } from '@/lib/blog/types'
import { absoluteUrl } from '@/lib/seo'

export function generateStaticParams() {
  return (Object.keys(CATEGORY_LABELS) as BlogCategory[]).map((category) => ({
    category,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const label = CATEGORY_LABELS[category as BlogCategory]
  const path = `/blog/category/${category}`
  return {
    title: label ? `${label} Meal Planning Guides | MealEase Blog` : 'Not found',
    description: `MealEase guides on ${label ?? 'this topic'}: practical meal planning workflows, grocery lists, household cooking, and dinner decisions.`,
    alternates: {
      canonical: label ? path : '/blog',
    },
    openGraph: {
      title: label ? `${label} Meal Planning Guides | MealEase` : 'MealEase Blog',
      description: `Practical MealEase articles for ${label ?? 'meal planning'} workflows.`,
      url: absoluteUrl(label ? path : '/blog'),
      siteName: 'MealEase',
      type: 'website',
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const label = CATEGORY_LABELS[category as BlogCategory]
  if (!label) notFound()

  const posts = getPostsByCategory(category)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} Meal Planning Guides`,
    description: `MealEase guides on ${label}: practical meal planning workflows, grocery lists, household cooking, and dinner decisions.`,
    url: absoluteUrl(`/blog/category/${category}`),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
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
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#D97757] mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              All posts
            </Link>
            <p className="text-sm font-medium text-[#D97757] uppercase tracking-wider mb-4">
              Category
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {label}
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              {posts.length} post{posts.length === 1 ? '' : 's'}
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <p className="text-neutral-500 text-center py-16">
                Nothing here yet — more posts coming soon.
              </p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
                <div className="mt-12">
                  <BlogCTA variant="category" category={category as BlogCategory} />
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
