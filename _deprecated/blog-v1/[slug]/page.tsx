import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { BlogImage } from '@/components/content/BlogImage'
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
  getCategoryConfig,
} from '@/lib/content/blog'
import { absoluteUrl } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    keywords: post.tags,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.description,
      type: 'article',
      url: absoluteUrl(`/blog/${post.slug}`),
      siteName: 'MealEase',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      images: post.heroImage ? [{ url: post.heroImage, alt: post.heroImageAlt }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle ?? post.title,
      description: post.description,
      images: post.heroImage ? [post.heroImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const related = getRelatedPosts(post.slug, 3)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.heroImage ? [post.heroImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MealEase',
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    keywords: post.tags.join(', '),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(`/blog/${post.slug}`) },
    ],
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mb-8">
        <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
          ← Back to blog
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Category badge — links to category page */}
            {(() => {
              const catConfig = getCategoryConfig(post.category)
              return catConfig ? (
                <Link href={`/blog/category/${catConfig.slug}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {catConfig.emoji} {catConfig.label}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="secondary">{post.category}</Badge>
              )
            })()}
            <span className="text-sm text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-sm text-muted-foreground">· {post.readingTime}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-5">{post.excerpt}</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          {post.heroImage && (
            <figure className="mt-8 overflow-hidden rounded-2xl border border-border/60">
              <BlogImage
                src={post.heroImage}
                alt={post.heroImageAlt}
                priority
              />
            </figure>
          )}
        </header>

        <div className="space-y-10">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
              <div className="space-y-4 text-base leading-8 text-foreground/90">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 space-y-2 text-base leading-8 text-foreground/90">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {post.faq && post.faq.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
              <div className="space-y-4">
                {post.faq.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-border/60 bg-card p-5">
                    <h3 className="font-semibold mb-2">{item.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {post.internalLinks && post.internalLinks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-3">Keep reading</h2>
            <ul className="space-y-2">
              {post.internalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-primary hover:underline">
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Related articles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => {
                const relCatConfig = getCategoryConfig(r.category)
                return (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/60 transition-colors"
                  >
                    {r.heroImage && (
                      <BlogImage
                        src={r.heroImage}
                        alt={r.heroImageAlt}
                        priority={false}
                      />
                    )}
                    <div className="p-4">
                      {relCatConfig ? (
                        <Badge variant="secondary" className="mb-2">
                          {relCatConfig.emoji} {relCatConfig.label}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mb-2">
                          {r.category}
                        </Badge>
                      )}
                      <h3 className="font-semibold leading-snug group-hover:text-primary">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <footer className="mt-12 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          {post.ctaText ?? 'Want personalized weekly meals instead of generic advice?'}{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Build your plan with MealEase
          </Link>
          .
        </footer>
      </article>
    </main>
  )
}
