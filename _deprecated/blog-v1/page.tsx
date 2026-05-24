'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BlogImage } from '@/components/content/BlogImage'
import { getAllBlogPosts, BLOG_CATEGORIES, getCategorySlug } from '@/lib/content/blog'

// Pre-compute posts once (client component — runs in browser)
const ALL_POSTS = getAllBlogPosts()

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts = activeCategory
    ? ALL_POSTS.filter((p) => {
        const slug = getCategorySlug(p.category)
        return slug === activeCategory
      })
    : ALL_POSTS

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="max-w-3xl mb-10">
        <Badge variant="outline" className="mb-4">MealEase Blog</Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Family nutrition advice built for real households
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Browse practical articles on feeding babies, toddlers, kids, and adults from one dinner
          plan without adding more chaos to the week.
        </p>
      </div>

      {/* ── Category filter chips ── */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === null
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          All
          <span className={`text-xs ${activeCategory === null ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
            {ALL_POSTS.length}
          </span>
        </button>

        {BLOG_CATEGORIES.map((cat) => {
          const count = ALL_POSTS.filter((p) => getCategorySlug(p.category) === cat.slug).length
          if (count === 0) return null
          const isActive = activeCategory === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(isActive ? null : cat.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
              <span className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Active category description ── */}
      {activeCategory && (() => {
        const cat = BLOG_CATEGORIES.find((c) => c.slug === activeCategory)
        return cat ? (
          <div className="mb-8 rounded-2xl border border-border/60 bg-muted/40 px-5 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">{cat.emoji} {cat.label}:</span>{' '}
              {cat.description}
            </p>
          </div>
        ) : null
      })()}

      {/* ── Post grid ── */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No articles in this category yet — check back soon.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredPosts.map((post, index) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              {post.heroImage && (
                <Link href={`/blog/${post.slug}`} className="block" tabIndex={-1} aria-hidden>
                  <BlogImage
                    src={post.heroImage}
                    alt={post.heroImageAlt}
                    // First 4 cards are above fold — load eagerly
                    priority={index < 4}
                  />
                </Link>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Category badge — links to category page */}
                  {(() => {
                    const catSlug = getCategorySlug(post.category)
                    const catConfig = BLOG_CATEGORIES.find((c) => c.slug === catSlug)
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
          ))}
        </div>
      )}
    </main>
  )
}
