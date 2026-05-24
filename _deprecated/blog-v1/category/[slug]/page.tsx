import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { BlogImage } from '@/components/content/BlogImage'
import {
  BLOG_CATEGORIES,
  getPostsByCategory,
  getCategorySlug,
  type BlogCategorySlug,
} from '@/lib/content/blog'
import { absoluteUrl } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
}

// ── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((cat) => ({ slug: cat.slug }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug)

  if (!cat) {
    return {
      title: 'Category not found',
      robots: { index: false, follow: false },
    }
  }

  const title = `${cat.label} — MealEase Blog`
  const description = cat.description

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/category/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: absoluteUrl(`/blog/category/${cat.slug}`),
      siteName: 'MealEase',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug)

  if (!cat) notFound()

  const posts = getPostsByCategory(slug as BlogCategorySlug)

  // ── CollectionPage schema ──────────────────────────────────────────────────
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.label} — MealEase Blog`,
    description: cat.description,
    url: absoluteUrl(`/blog/category/${cat.slug}`),
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.publishedAt,
      image: p.heroImage ? [p.heroImage] : undefined,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
      {
        '@type': 'ListItem',
        position: 3,
        name: cat.label,
        item: absoluteUrl(`/blog/category/${cat.slug}`),
      },
    ],
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Breadcrumb ── */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{cat.label}</span>
      </nav>

      {/* ── Header ── */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl" role="img" aria-label={cat.label}>
            {cat.emoji}
          </span>
          <Badge variant="outline" className="text-sm">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{cat.label}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{cat.description}</p>
      </div>

      {/* ── Other categories ── */}
      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all"
        >
          All articles
        </Link>
        {BLOG_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => {
          const count = getPostsByCategory(c.slug as BlogCategorySlug).length
          if (count === 0) return null
          return (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all"
            >
              <span>{c.emoji}</span>
              {c.label}
              <span className="text-xs text-muted-foreground/60">{count}</span>
            </Link>
          )
        })}
      </div>

      {/* ── Post grid ── */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No articles in this category yet — check back soon.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post, index) => {
            const postCatConfig = BLOG_CATEGORIES.find(
              (c) => c.slug === getCategorySlug(post.category),
            )
            return (
              <article
                key={post.slug}
                className="group rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
              >
                {post.heroImage && (
                  <Link href={`/blog/${post.slug}`} className="block" tabIndex={-1} aria-hidden>
                    <BlogImage
                      src={post.heroImage}
                      alt={post.heroImageAlt}
                      // First 4 cards above fold — load eagerly
                      priority={index < 4}
                    />
                  </Link>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {postCatConfig ? (
                      <Badge variant="secondary">
                        {postCatConfig.emoji} {postCatConfig.label}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{post.category}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">· {post.readingTime}</span>
                  </div>

                  <h2 className="text-xl font-semibold mb-2 leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors group-hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-muted-foreground leading-relaxed mb-4 flex-1 text-sm">
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Read article →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ── CTA footer ── */}
      <div className="mt-16 rounded-2xl border border-border/60 bg-muted/40 px-6 py-8 text-center">
        <p className="text-lg font-semibold mb-2">
          Stop deciding — start eating.
        </p>
        <p className="text-muted-foreground mb-5 text-sm leading-relaxed max-w-md mx-auto">
          MealEase builds a personalised weekly dinner plan for your whole household in under a
          minute — babies, toddlers, picky kids, and adults included.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Build my family plan →
        </Link>
      </div>
    </main>
  )
}
