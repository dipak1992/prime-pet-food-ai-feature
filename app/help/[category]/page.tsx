import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { HelpArticleCard } from '@/components/help/HelpArticleCard'
import {
  HELP_CATEGORIES,
  getCategory,
  getArticlesInCategory,
} from '@/lib/help/articles'
import { Container } from '@/components/landing/shared/Container'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return HELP_CATEGORIES.map((c) => ({ category: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) return {}
  return {
    title: `${cat.title} – Help Center – MealEase`,
    description: cat.description,
  }
}

export default async function HelpCategoryPage({ params }: Props) {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) notFound()

  const articles = getArticlesInCategory(category)

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-10">
          <Container>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-6" aria-label="Breadcrumb">
              <Link href="/help" className="hover:text-[#D97757] transition-colors">
                Help Center
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-neutral-900 dark:text-neutral-100">{cat.title}</span>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-4xl" aria-hidden>{cat.icon}</span>
              <div>
                <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {cat.title}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {cat.description}
                </p>
              </div>
            </div>
          </Container>
        </div>

        <section className="py-12">
          <Container>
            {articles.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400">
                No articles in this category yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <HelpArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <Link
                href="/help"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#D97757] transition-colors"
              >
                ← Back to Help Center
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
