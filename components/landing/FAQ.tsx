import Link from 'next/link'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { faqs } from '@/config/faqs'

export function FAQ() {
  return (
    <section
      id="faq"
      className="py-10 md:py-28 bg-white dark:bg-neutral-950"
      aria-labelledby="faq-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              id="faq-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Questions?{' '}
              <span className="italic text-[#D97757]">Answered.</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="max-w-2xl mx-auto divide-y divide-neutral-200 dark:divide-neutral-800">
            {faqs.map((item, i) => (
              <details
                key={item.q}
                className={`group border-neutral-200 py-5 dark:border-neutral-800 ${i >= 4 ? 'hidden md:block' : ''}`}
                name="landing-faq"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-neutral-900 transition-colors group-hover:text-[#D97757] dark:text-neutral-100">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-transform duration-200 group-open:rotate-45 dark:border-neutral-700 dark:text-neutral-400"
                  >
                    +
                  </span>
                </summary>
                <p className="pt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/faq"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 transition-colors hover:border-[#D97757] hover:text-[#D97757] dark:border-neutral-800 dark:text-neutral-100"
            >
              View all FAQs
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
