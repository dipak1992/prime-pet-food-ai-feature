import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GrowthPageTemplate } from '@/components/growth/GrowthPageTemplate'
import { getGrowthPage, growthPages } from '@/lib/growth/content'
import { buildMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return growthPages.map((page) => ({
    slug: page.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getGrowthPage(slug)

  if (!page) {
    return {
      title: 'Not found',
    }
  }

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: page.keywords,
  })
}

export default async function GrowthDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getGrowthPage(slug)
  if (!page) notFound()

  return <GrowthPageTemplate page={page} />
}
