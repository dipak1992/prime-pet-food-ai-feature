import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CommercialPageTemplate } from '@/components/seo/CommercialPageTemplate'
import { getCommercialPage } from '@/lib/seo-pages'
import { absoluteUrl } from '@/lib/seo'
import { buildBreadcrumbSchema, organizationSchema, productSchema, softwareAppSchema } from '@/lib/schema'

const page = getCommercialPage('meal-prep-app')

export const metadata: Metadata = page
  ? {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      alternates: { canonical: '/meal-prep-app' },
      openGraph: {
        title: page.title,
        description: page.description,
        url: absoluteUrl('/meal-prep-app'),
        type: 'website',
      },
    }
  : {}

export default function MealPrepAppPage() {
  if (!page) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      softwareAppSchema,
      productSchema,
      {
        '@type': 'WebPage',
        name: page.h1,
        description: page.description,
        url: absoluteUrl('/meal-prep-app'),
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Meal Prep App', path: '/meal-prep-app' },
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

  return <CommercialPageTemplate page={page} jsonLd={jsonLd} />
}
