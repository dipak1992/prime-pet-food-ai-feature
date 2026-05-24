import Link from 'next/link'
import type { ReactNode } from 'react'
import { Container } from '@/components/landing/shared/Container'
import { TOC } from './TOC'

type Section = {
  id: string
  title: string
  content: ReactNode
}

type Props = {
  title: string
  intro: string
  updatedAt: string
  sections: Section[]
}

export function LegalShell({ title, intro, updatedAt, sections }: Props) {
  const tocItems = sections.map(({ id, title: t }) => ({ id, title: t }))

  return (
    <>
      {/* Hero */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-14">
        <Container>
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              {title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
              {intro}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Last updated: {formatDate(updatedAt)}
            </p>
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 xl:gap-16 py-12 lg:py-16">
          {/* Sticky TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TOC sections={tocItems} />
            </div>
          </aside>

          {/* Sections */}
          <div className="min-w-0 space-y-10">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28"
              >
                <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                  {section.title}
                </h2>
                <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Footer CTA */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400">
              Questions?{' '}
              <Link href="/contact" className="text-[#D97757] hover:underline">
                Get in touch
              </Link>{' '}
              or email{' '}
              <a
                href="mailto:hello@mealeaseai.com"
                className="text-[#D97757] hover:underline"
              >
                hello@mealeaseai.com
              </a>
              .
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
