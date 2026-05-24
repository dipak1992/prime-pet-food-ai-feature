import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  const privateRoutes = [
    '/admin',
    '/api/',
    '/budget',
    '/dashboard',
    '/decide',
    '/family',
    '/grocery-list',
    '/insights',
    '/leftovers',
    '/login',
    '/meal/',
    '/onboarding',
    '/pantry',
    '/plan',
    '/planner',
    '/r/',
    '/referral',
    '/reset-password',
    '/saved',
    '/settings',
    '/signup',
    '/verify-email',
  ]

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: privateRoutes,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
