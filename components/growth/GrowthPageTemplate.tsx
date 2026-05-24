import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, DollarSign, ListChecks, ShoppingCart } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/landing/Nav'
import { ShareMealCard } from '@/components/growth/ShareMealCard'
import { InternalLinks } from '@/components/growth/InternalLinks'
import { StructuredData } from '@/components/growth/StructuredData'
import type { GrowthPage } from '@/lib/growth/content'

export function GrowthPageTemplate({ page }: { page: GrowthPage }) {
  return (
    <>
      <StructuredData type="page" page={page} />
      <Nav />
      <main id="main" className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <section className="border-b border-neutral-200 bg-[#FDF6F1] py-14 dark:border-neutral-800 dark:bg-neutral-900 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                {page.eyebrow}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight md:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
                {page.intent}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.primaryHref}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#D97757] px-5 text-sm font-bold text-white transition-colors hover:bg-[#c4664a]"
                >
                  {page.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {page.secondaryCta && page.secondaryHref && (
                  <Link
                    href={page.secondaryHref}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 transition-colors hover:border-[#D97757] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  >
                    {page.secondaryCta}
                  </Link>
                )}
              </div>
              <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {page.time && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                    <Clock className="h-3.5 w-3.5 text-[#D97757]" />
                    {page.time}
                  </span>
                )}
                {page.budget && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                    <DollarSign className="h-3.5 w-3.5 text-[#D97757]" />
                    {page.budget}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                  <ShoppingCart className="h-3.5 w-3.5 text-[#D97757]" />
                  Grocery-ready
                </span>
              </div>
            </div>
            <ShareMealCard title={page.h1} meals={page.meals} source={page.slug} />
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-3xl font-bold tracking-tight">Meal ideas that fit the intent</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {page.meals.map((meal) => (
                  <div key={meal} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <CheckCircle2 className="h-5 w-5 text-[#D97757]" />
                    <p className="mt-3 text-sm font-bold">{meal}</p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#D97757]" />
                <h2 className="font-serif text-2xl font-bold">Grocery list</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                {page.groceryList.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#D97757]" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="bg-neutral-50 py-14 dark:bg-neutral-900/60 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[#D97757]" />
                <h2 className="font-serif text-3xl font-bold tracking-tight">How to use this plan</h2>
              </div>
              <ol className="mt-6 space-y-4">
                {page.steps.map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-lg bg-white p-4 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D97757] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight">Practical notes</h2>
              <div className="mt-6 space-y-3">
                {page.tips.map((tip) => (
                  <p key={tip} className="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Questions people ask</h2>
            <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="p-5">
                  <h3 className="text-sm font-bold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InternalLinks page={page} />
      </main>
      <Footer />
    </>
  )
}
