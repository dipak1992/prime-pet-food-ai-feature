import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CommercialPageTemplate } from '@/components/seo/CommercialPageTemplate'
import { getCommercialPage } from '@/lib/seo-pages'
import { absoluteUrl } from '@/lib/seo'
import { buildBreadcrumbSchema, organizationSchema, productSchema, softwareAppSchema } from '@/lib/schema'

const page = getCommercialPage('weekly-meal-prep-with-grocery-list')

export const metadata: Metadata = page
  ? {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      alternates: { canonical: '/weekly-meal-prep-with-grocery-list' },
      openGraph: {
        title: page.title,
        description: page.description,
        url: absoluteUrl('/weekly-meal-prep-with-grocery-list'),
        type: 'website',
      },
    }
  : {}

export default function WeeklyMealPrepWithGroceryListPage() {
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
        url: absoluteUrl('/weekly-meal-prep-with-grocery-list'),
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Weekly Meal Prep With Grocery List', path: '/weekly-meal-prep-with-grocery-list' },
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
