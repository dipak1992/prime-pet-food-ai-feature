import type { Metadata } from 'next'

const LOCAL_SITE_URL = 'http://localhost:3000'

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '')
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    const normalizedHost = vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${normalizedHost}`
  }

  return LOCAL_SITE_URL
}

export function absoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString()
}

type MetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  type?: 'website' | 'article'
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
}: MetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: 'MealEase',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
