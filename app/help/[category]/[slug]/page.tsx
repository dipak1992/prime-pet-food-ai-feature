import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Clock } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { HelpArticleBody } from '@/components/help/HelpArticleBody'
import { HelpArticleCard } from '@/components/help/HelpArticleCard'
import {
  HELP_CATEGORIES,
  getCategory,
  getArticlesInCategory,
  getArticle,
  getRelatedArticles,
} from '@/lib/help/articles'
import { Container } from '@/components/landing/shared/Container'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = []
  for (const cat of HELP_CATEGORIES) {
    const articles = getArticlesInCategory(cat.id)
    for (const article of articles) {
      params.push({ category: cat.id, slug: article.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const article = getArticle(category, slug)
  if (!article) return {}
  return {
    title: `${article.title} – Help Center – MealEase`,
    description: article.description,
  }
}

export default async function HelpArticlePage({ params }: Props) {
  const { category, slug } = await params
  const article = getArticle(category, slug)
  if (!article) notFound()

  const cat = getCategory(category)
  const related = getRelatedArticles(article)

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-6">
          <Container>
            <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
              <Link href="/help" className="hover:text-[#D97757] transition-colors">
                Help Center
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              {cat && (
                <>
                  <Link href={`/help/${category}`} className="hover:text-[#D97757] transition-colors">
                    {cat.title}
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
              <span className="text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                {article.title}
              </span>
            </nav>
          </Container>
        </div>

        <div className="py-12">
          <Container>
            <div className="max-w-2xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
                  {article.title}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {article.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Updated{' '}
                    {new Date(article.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Body */}
              <HelpArticleBody article={article} />

              {/* Related articles */}
              {related.length > 0 && (
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Related articles
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {related.map((rel) => (
                      <HelpArticleCard key={rel.slug} article={rel} />
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href={`/help/${category}`}
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#D97757] transition-colors"
                >
                  ← Back to {cat?.title ?? 'Help Center'}
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </main>
      <Footer />
    </>
  )
}
