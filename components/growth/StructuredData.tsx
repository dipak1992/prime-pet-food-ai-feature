import { getSiteUrl } from '@/lib/seo'
import type { GrowthPage, GrowthTool } from '@/lib/growth/content'

type JsonLdProps =
  | {
      type: 'page'
      page: GrowthPage
    }
  | {
      type: 'tool'
      tool: GrowthTool
    }

export function StructuredData(props: JsonLdProps) {
  const siteUrl = getSiteUrl()
  const json =
    props.type === 'page'
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: props.page.h1,
              description: props.page.description,
              url: `${siteUrl}/${props.page.slug}`,
              primaryImageOfPage: `${siteUrl}/api/pinterest-pin?title=${encodeURIComponent(props.page.h1)}`,
            },
            {
              '@type': 'FAQPage',
              mainEntity: props.page.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: siteUrl,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: props.page.eyebrow,
                  item: `${siteUrl}/${props.page.slug}`,
                },
              ],
            },
          ],
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: props.tool.title,
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web',
          description: props.tool.description,
          url: `${siteUrl}/tools/${props.tool.slug}`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(json),
      }}
    />
  )
}
