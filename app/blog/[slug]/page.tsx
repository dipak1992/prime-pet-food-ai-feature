import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { BlogHeader } from '@/components/blog/BlogHeader'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogCTA } from '@/components/blog/BlogCTA'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { BlogTrustBlocks } from '@/components/blog/BlogTrustBlocks'
import { blogMDXComponents } from '@/lib/blog/mdx-components'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog/mdx'
import { CATEGORY_LABELS } from '@/lib/blog/types'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'

const CATEGORY_FEATURE_LINKS: Record<string, { href: string; label: string }> = {
  tonight: { href: '/features/tonight-suggestions', label: 'Tonight Suggestions' },
  leftovers: { href: '/features/leftovers-ai', label: 'Leftovers AI' },
  budget: { href: '/features/budget-intelligence', label: 'Budget Intelligence' },
  weekly: { href: '/features/weekly-autopilot', label: 'Weekly Autopilot' },
  pantry: { href: '/features/snap-and-cook', label: 'Snap & Cook' },
  commercial: { href: '/features/weekly-autopilot', label: 'Weekly Autopilot' },
  autopilot: { href: '/features/weekly-autopilot', label: 'Weekly Autopilot' },
  snap: { href: '/features/snap-and-cook', label: 'Snap & Cook' },
  household: { href: '/features/weekly-autopilot', label: 'Weekly Autopilot' },
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not found' }
  const url = absoluteUrl(`/blog/${slug}`)
  const image = post.coverImage ? absoluteUrl(post.coverImage) : absoluteUrl('/opengraph-image')

  return {
    title: `${post.title} | MealEase Blog`,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    authors: [{ name: post.author }],
    category: CATEGORY_LABELS[post.category],
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'MealEase',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: CATEGORY_LABELS[post.category],
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 675, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(slug)
  const siteUrl = getSiteUrl()
  const postUrl = absoluteUrl(`/blog/${slug}`)
  const coverUrl = post.coverImage ? absoluteUrl(post.coverImage) : absoluteUrl('/opengraph-image')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline: post.title,
        description: post.description,
        image: coverUrl,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'MealEase',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icons/logo-generated.png`,
          },
        },
        mainEntityOfPage: postUrl,
        articleSection: CATEGORY_LABELS[post.category],
        keywords: post.tags?.join(', '),
        wordCount: post.wordCount,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Blog',
            item: absoluteUrl('/blog'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: CATEGORY_LABELS[post.category],
            item: absoluteUrl(`/blog/category/${post.category}`),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  }

  // Dynamic import of the MDX file
  let MDXContent: React.ComponentType<{ components?: Record<string, React.ComponentType> }>
  try {
    const mod = await import(`@/content/blog/${slug}.mdx`)
    MDXContent = mod.default
  } catch {
    notFound()
  }

  return (
    <>
      <Nav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogHeader post={post} />

        <article>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <MDXContent components={blogMDXComponents} />

            <nav
              aria-label="Related MealEase resources"
              className="my-10 flex flex-wrap gap-3 border-y border-neutral-200 py-5 text-sm dark:border-neutral-800"
            >
              <Link
                href={`/blog/category/${post.category}`}
                className="font-medium text-[#D97757] underline underline-offset-4 hover:text-[#C86646]"
              >
                More {CATEGORY_LABELS[post.category]} guides
              </Link>
              <Link
                href={CATEGORY_FEATURE_LINKS[post.category].href}
                className="font-medium text-[#D97757] underline underline-offset-4 hover:text-[#C86646]"
              >
                Explore {CATEGORY_FEATURE_LINKS[post.category].label}
              </Link>
              <Link
                href="/blog"
                className="font-medium text-[#D97757] underline underline-offset-4 hover:text-[#C86646]"
              >
                Meal planning blog
              </Link>
            </nav>

            <BlogCTA variant="post" category={post.category} />

            <hr className="my-12 border-0 h-px bg-neutral-200 dark:bg-neutral-800" />

            <BlogTrustBlocks post={post} />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-neutral-500">
                Written by{' '}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {post.author}
                </span>
              </div>
              <ShareButtons title={post.title} slug={slug} />
            </div>

            <NewsletterBlock />
          </div>
        </article>

        {related.length > 0 && (
          <section className="py-16 bg-[#FDF6F1] dark:bg-neutral-900">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-8">
                Keep reading
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
