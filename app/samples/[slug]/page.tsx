import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, ShoppingCart } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { absoluteUrl } from '@/lib/seo'
import { evidenceSamples, getEvidenceSample } from '@/lib/seo-evidence'
import { buildBreadcrumbSchema } from '@/lib/schema'

export function generateStaticParams() {
  return evidenceSamples.map((sample) => ({ slug: sample.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sample = getEvidenceSample(slug)
  if (!sample) return { title: 'Not found' }

  return {
    title: `${sample.title} | MealEase`,
    description: sample.description,
    alternates: { canonical: `/samples/${slug}` },
    openGraph: {
      title: sample.title,
      description: sample.description,
      url: absoluteUrl(`/samples/${slug}`),
      type: 'article',
    },
  }
}

export default async function SampleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sample = getEvidenceSample(slug)
  if (!sample) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: sample.title,
        description: sample.description,
        url: absoluteUrl(`/samples/${sample.slug}`),
        author: {
          '@type': 'Organization',
          name: 'MealEase',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: sample.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Samples', path: '/samples' },
        { name: sample.title, path: `/samples/${sample.slug}` },
      ]),
    ],
  }

  return (
    <>
      <Nav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="bg-[#FDF6F1] py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              {sample.intent}
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight text-neutral-950 md:text-6xl">
              {sample.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
              {sample.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#D97757] px-6 text-base font-semibold text-white transition-colors hover:bg-[#C86646]"
              >
                Try the first-use flow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/samples"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-base font-semibold text-neutral-900 transition-colors hover:border-[#D97757] hover:text-[#D97757]"
              >
                Browse all examples
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
                Sample plan
              </h2>
              <div className="mt-6 space-y-4">
                {sample.plan.map((item) => (
                  <article key={`${item.label}-${item.meal}`} className="rounded-3xl border border-neutral-200 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#D97757]">
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-neutral-950">{item.meal}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.reason}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-neutral-950 p-6 text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#F3B18E]" />
                <h2 className="font-serif text-3xl font-bold tracking-tight">
                  Grocery list
                </h2>
              </div>
              <div className="mt-6 space-y-5">
                {sample.groceryList.map((group) => (
                  <div key={group.category}>
                    <h3 className="text-sm font-bold text-white">{group.category}</h3>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-white/75">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F3B18E]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-neutral-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
              What this proves
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {sample.proofPoints.map((point) => (
                <div key={point} className="rounded-3xl bg-white p-5 ring-1 ring-neutral-200">
                  <p className="text-sm leading-6 text-neutral-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
              Questions people ask
            </h2>
            <div className="mt-6 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
              {sample.faqs.map((faq) => (
                <div key={faq.question} className="p-5">
                  <h3 className="text-sm font-semibold text-neutral-950">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

