import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ComparePageTemplate } from '@/components/seo/ComparePageTemplate'
import { comparePages, getComparePage } from '@/lib/seo-pages'
import { absoluteUrl } from '@/lib/seo'
import { buildBreadcrumbSchema } from '@/lib/schema'

export function generateStaticParams() {
  return comparePages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getComparePage(slug)
  if (!page) return { title: 'Not found' }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(`/compare/${slug}`),
      type: 'article',
    },
  }
}

export default async function CompareDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getComparePage(slug)
  if (!page) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: page.h1,
        description: page.description,
        url: absoluteUrl(`/compare/${slug}`),
        author: {
          '@type': 'Organization',
          name: 'MealEase Editorial',
        },
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Compare', path: '/compare' },
        { name: page.h1, path: `/compare/${slug}` },
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  }

  return <ComparePageTemplate page={page} jsonLd={jsonLd} />
}
