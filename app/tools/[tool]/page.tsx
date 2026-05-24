import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ToolPageTemplate } from '@/components/growth/ToolPageTemplate'
import { getGrowthTool, growthTools } from '@/lib/growth/content'
import { buildMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return growthTools.map((tool) => ({
    tool: tool.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>
}): Promise<Metadata> {
  const { tool: slug } = await params
  const tool = getGrowthTool(slug)

  if (!tool) {
    return {
      title: 'Not found',
    }
  }

  return buildMetadata({
    title: tool.title,
    description: tool.description,
    path: `/tools/${tool.slug}`,
    keywords: [tool.title.toLowerCase(), ...tool.sampleInputs],
  })
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>
}) {
  const { tool: slug } = await params
  const tool = getGrowthTool(slug)
  if (!tool) notFound()

  return <ToolPageTemplate tool={tool} />
}
