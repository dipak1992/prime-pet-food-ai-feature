import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShoppingCart, Sparkles, Users } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { socialProof } from '@/config/social-proof'
import { evidenceSamples } from '@/lib/seo-evidence'
import type { CommercialPage } from '@/lib/seo-pages'

export function CommercialPageTemplate({
  page,
  jsonLd,
}: {
  page: CommercialPage
  jsonLd: Record<string, unknown>
}) {
  return (
    <>
      <Nav />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="relative overflow-hidden bg-[#FDF6F1] py-16 md:py-24">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,87,0.24),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(184,147,90,0.16),transparent_28%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                {page.eyebrow}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-neutral-950 md:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
                {page.hero}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.primaryHref}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#D97757] px-6 text-base font-semibold text-white transition-colors hover:bg-[#C86646]"
                >
                  {page.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={page.secondaryHref}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-base font-semibold text-neutral-900 transition-colors hover:border-[#D97757] hover:text-[#D97757]"
                >
                  {page.secondaryCta}
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-neutral-700">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-neutral-200">
                  <Users className="h-4 w-4 text-[#D97757]" />
                  {page.proofLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-neutral-200">
                  <ShoppingCart className="h-4 w-4 text-[#D97757]" />
                  Grocery-ready planning
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {page.screenshotCards.map((card) => (
                <div
                  key={card.title}
                  className="overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-xl shadow-neutral-950/15"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="object-cover opacity-82"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-lg font-semibold">{card.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/78">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-neutral-200">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
                Who MealEase is best for
              </h2>
              <ul className="mt-6 space-y-4">
                {page.audience.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D97757]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-neutral-950 p-6 text-white">
              <h2 className="font-serif text-3xl font-bold tracking-tight">
                Why families pick MealEase
              </h2>
              <ul className="mt-6 space-y-4">
                {page.differentiators.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-white/80">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#F3B18E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                Evidence library
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950">
                See sample outputs before you sign up
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                MealEase is easier to judge when you can inspect real examples: weekly plans, grocery lists, budget choices, leftovers, and fridge-scan workflows.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {evidenceSamples.slice(1, 4).map((sample) => (
                <Link
                  key={sample.slug}
                  href={`/samples/${sample.slug}`}
                  className="rounded-3xl border border-neutral-200 bg-[#FBFAF3] p-5 transition-colors hover:border-[#D97757]"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#D97757]">
                    {sample.intent}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-950">{sample.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{sample.description}</p>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Founder-reviewed examples. Updated as the product workflow improves.
            </p>
          </div>
        </section>

        <section className="bg-neutral-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
                How the workflow works
              </h2>
              <p className="mt-3 text-neutral-600">
                The product is built to move from dinner ideas to a calm weekly system.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {page.workflow.map((step, index) => (
                <div
                  key={step}
                  className="rounded-3xl bg-white p-5 ring-1 ring-neutral-200"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D97757] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-neutral-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[32px] bg-[#FDF6F1] p-6 ring-1 ring-neutral-200 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                    Product proof
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950">
                    Parents want fewer dinner loops, not more tabs
                  </h2>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
                      <p className="font-serif text-3xl font-bold text-[#D97757]">
                        {socialProof.householdCount}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">household sizes supported</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
                      <p className="font-serif text-3xl font-bold text-[#D97757]">
                        {socialProof.hoursSavedPerWeek}h
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">planning time saved weekly</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {socialProof.testimonials.slice(0, 4).map((testimonial) => (
                    <blockquote
                      key={testimonial.name}
                      className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200"
                    >
                      <p className="text-sm leading-6 text-neutral-700">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <footer className="mt-4 text-xs font-semibold text-neutral-900">
                        {testimonial.name}
                        <span className="ml-1 font-normal text-neutral-500">{testimonial.city}</span>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
              Questions people ask
            </h2>
            <div className="mt-6 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="p-5">
                  <h3 className="text-sm font-semibold text-neutral-950">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={page.primaryHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#D97757] px-6 text-base font-semibold text-white transition-colors hover:bg-[#C86646]"
              >
                {page.primaryCta}
              </Link>
              <Link
                href="/for-ai-assistants"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-300 px-6 text-base font-semibold text-neutral-900 transition-colors hover:border-[#D97757] hover:text-[#D97757]"
              >
                See how MealEase is positioned
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
