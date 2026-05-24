import Image from 'next/image'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { MobileCarouselRail } from './shared/MobileCarouselRail'
import { pillars } from '@/config/pillars'

export function FivePillarsSection() {
  return (
    <section
      id="pillars"
      className="py-10 md:py-22 bg-white dark:bg-neutral-950"
      aria-labelledby="pillars-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2
              id="pillars-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Six questions. One app.{' '}
              <span className="italic text-[#D97757]">Zero stress.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Every food question your household asks — answered.
            </p>
          </div>
        </FadeIn>

        <MobileCarouselRail className="sm:hidden" itemClassName="min-w-full" ariaLabel="Swipe through MealEase food questions">
          {pillars.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </MobileCarouselRail>

        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {pillars.map((p, i) => (
            <FadeIn
              key={p.id}
              delay={i * 0.08}
            >
              <PillarCard pillar={p} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}

function PillarCard({
  pillar,
}: {
  pillar: (typeof pillars)[number]
}) {
  return (
    <article className="group relative flex min-h-[156px] overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-[#D97757]/40 dark:bg-neutral-900 dark:ring-neutral-800 sm:block sm:min-h-0 sm:rounded-[1.75rem]">
      <div className="relative w-[112px] shrink-0 self-stretch overflow-hidden sm:aspect-[16/10] sm:w-full sm:self-auto">
        <Image
          src={pillar.image}
          alt={pillar.title}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent sm:inset-x-0 sm:inset-y-auto sm:bottom-0 sm:h-12 sm:w-auto sm:bg-gradient-to-t" />
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-4 py-4 sm:block sm:px-6 sm:pb-7 sm:pt-4 md:px-7 md:pb-8">
        {pillar.badge && (
          <span className="hidden rounded-full bg-[#D97757] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white sm:absolute sm:right-5 sm:top-4 sm:block">
            {pillar.badge}
          </span>
        )}

        <div className="mb-2 flex items-center gap-2 sm:mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-orange-100 dark:bg-neutral-950 dark:ring-neutral-800 sm:h-8 sm:w-8 sm:text-base" aria-hidden>
            {pillar.icon}
          </span>
          <p className="max-w-[calc(100%-2.5rem)] text-[12px] font-semibold leading-tight text-[#D97757] sm:text-sm sm:font-medium">
            &ldquo;{pillar.question}&rdquo;
          </p>
        </div>

        <h3 className="mb-1.5 font-serif text-[1.15rem] font-bold leading-tight text-neutral-900 [overflow-wrap:normal] dark:text-neutral-50 sm:mb-3 sm:text-[1.45rem]">
          {pillar.title}
        </h3>

        <p className="text-[13px] leading-snug text-neutral-600 dark:text-neutral-400 sm:text-[15px] sm:leading-relaxed">
          {pillar.answer}
        </p>
      </div>
    </article>
  )
}
