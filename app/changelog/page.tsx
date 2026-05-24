import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { ChangelogEntryCard } from '@/components/changelog/ChangelogEntry'
import { CHANGELOG } from '@/lib/changelog/entries'
import { Container } from '@/components/landing/shared/Container'

export const metadata: Metadata = {
  title: 'Changelog \u2013 MealEase',
  description:
    'New features, improvements, and fixes \u2014 see what we\u2019ve shipped recently.',
}

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-16">
          <Container>
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
                Changelog
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                What we&apos;ve shipped, fixed, and improved &mdash; most recent first.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="max-w-2xl space-y-12">
              {CHANGELOG.map((entry) => (
                <ChangelogEntryCard key={entry.version} entry={entry} />
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
