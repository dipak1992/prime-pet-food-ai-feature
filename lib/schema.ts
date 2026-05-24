import { faqs } from '@/config/faqs'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MealEase',
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/icons/logo-generated.png`,
  description:
    'MealEase learns your household, plans dinner, builds the grocery list, and includes Copilot for meal planning help.',
}

export const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MealEase',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web, iOS, Android',
  url: absoluteUrl('/'),
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'MealEase helps busy families decide what to cook, ask Copilot for meal help, plan the week, generate grocery lists, use leftovers, and cook from what is already at home.',
}

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MealEase',
  brand: {
    '@type': 'Brand',
    name: 'MealEase',
  },
  category: 'Meal Planning Software',
  description:
    'Family-first AI meal prep planner with Copilot, weekly planning, grocery lists, pantry scanning, leftovers workflows, and budget-aware dinner suggestions.',
  image: [absoluteUrl('/landing/optimized/family-dinner.webp')],
  url: absoluteUrl('/'),
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: absoluteUrl('/pricing'),
  },
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
}
