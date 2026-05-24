import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/landing/shared/Container'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-[60vh] flex items-center">
        <Container>
          <div className="max-w-lg mx-auto text-center py-24">
            <p className="text-7xl font-serif font-bold text-[#D97757] mb-6">404</p>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
              Page not found
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-[#D97757] text-white px-6 py-3 text-sm font-medium hover:bg-[#C86646] transition-colors"
              >
                Go home
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-6 py-3 text-sm font-medium hover:border-[#D97757] hover:text-[#D97757] transition-colors"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
