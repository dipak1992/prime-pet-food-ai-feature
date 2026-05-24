import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { evidenceSamples } from '@/lib/seo-evidence'

export const metadata: Metadata = {
  title: 'MealEase Sample Meal Plans and Grocery Lists',
  description:
    'Browse crawlable MealEase examples for budget meal planning, picky eaters, leftovers, fridge scans, and family grocery lists.',
  alternates: { canonical: '/samples' },
}

export default function SamplesPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="bg-[#FDF6F1] py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              MealEase examples
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight text-neutral-950 md:text-6xl">
              Sample meal plans, grocery lists, and real workflows
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
              Concrete examples for families comparing AI meal planners, grocery list apps, leftovers tools, and budget planning workflows.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            {evidenceSamples.map((sample) => (
              <Link
                key={sample.slug}
                href={`/samples/${sample.slug}`}
                className="group rounded-3xl border border-neutral-200 bg-white p-6 transition-colors hover:border-[#D97757]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D97757]">
                  {sample.intent}
                </p>
                <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-neutral-950">
                  {sample.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {sample.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#D97757]">
                  View example
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

