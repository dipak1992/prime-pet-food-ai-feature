import Link from 'next/link'
import type { ReactNode } from 'react'
import { ProductMockup } from './ProductMockup'
import { Container } from '@/components/landing/shared/Container'
import { cn } from '@/lib/utils'

type MockupVariant = 'tonight' | 'snap' | 'weekly' | 'leftovers' | 'budget' | 'landing'

type FeatureHeroProps = {
  eyebrow: string
  title: ReactNode
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  note?: ReactNode
  mockup: MockupVariant
  align?: 'center' | 'split'
}

export function FeatureHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  note,
  mockup,
  align = 'split',
}: FeatureHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#17110f] py-16 text-white md:py-24">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(217,119,87,0.22),transparent_28%),radial-gradient(circle_at_82%_26%,rgba(16,185,129,0.12),transparent_30%),linear-gradient(135deg,rgba(23,17,15,1),rgba(10,10,10,0.96)_54%,rgba(37,25,20,1))]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <Container className="relative z-10 max-w-full">
        <div
          className={cn(
            'grid items-center gap-10 lg:grid-cols-12 lg:gap-14',
            align === 'center' && 'mx-auto max-w-5xl text-center'
          )}
        >
          <div className={cn('min-w-0 lg:col-span-6', align === 'center' && 'mx-auto')}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#FFD2BD] backdrop-blur">
              {eyebrow}
            </div>
            <h1 className="mt-6 max-w-full font-serif text-4xl font-bold tracking-tight text-white sm:max-w-3xl sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-full text-lg leading-relaxed text-white/82 sm:max-w-2xl md:text-xl">
              {description}
            </p>
            <div className={cn('mt-8 flex max-w-full flex-col gap-3 sm:max-w-none sm:flex-row', align === 'center' && 'justify-center')}>
              <Link
                href={primaryHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#D97757] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#c4664a]"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/16"
              >
                {secondaryLabel}
              </Link>
            </div>
            {note && <p className="mt-4 text-sm text-white/68">{note}</p>}
          </div>

          <div className="min-w-0 lg:col-span-6">
            <div className="relative mx-auto max-w-[380px] rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-6 lg:mr-0">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),transparent_48%),radial-gradient(circle_at_50%_0%,rgba(217,119,87,0.22),transparent_54%)]"
              />
              <ProductMockup variant={mockup} className="relative" />
              <div
                aria-hidden
                className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-[radial-gradient(circle_at_50%_15%,rgba(217,119,87,0.2),transparent_48%)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
