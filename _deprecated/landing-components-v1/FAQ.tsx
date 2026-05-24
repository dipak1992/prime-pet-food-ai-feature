'use client'

import { useState } from 'react'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { faqs } from '@/config/faqs'

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const id = `faq-${index}`

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-[#D97757] transition-colors">
          {q}
        </span>
        <span
          aria-hidden
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <div
        id={id}
        role="region"
        hidden={!open}
        className="pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm"
      >
        {a}
      </div>
    </div>
  )
}

export function FAQ() {
  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-white dark:bg-neutral-950"
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
          <div className="max-w-2xl mx-auto">
            {faqs.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
