import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { pillars } from '@/config/pillars'
import { cn } from '@/lib/utils'

export function FivePillarsSection() {
  return (
    <section
      id="pillars"
      className="py-20 md:py-28 bg-white dark:bg-neutral-950"
      aria-labelledby="pillars-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <h2
              id="pillars-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Five questions. One app.{' '}
              <span className="italic text-[#D97757]">Zero stress.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Every food question your household asks — answered.
            </p>
          </div>
        </FadeIn>

        {/* 3 + 2 grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 md:gap-6">
          {pillars.map((p, i) => (
            <FadeIn
              key={p.id}
              delay={i * 0.08}
              className={cn(
                'md:col-span-2',
                i === 3 && 'md:col-start-2',
                i === 4 && 'md:col-start-4'
              )}
            >
              <PillarCard pillar={p} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}

function PillarCard({ pillar }: { pillar: (typeof pillars)[number] }) {
  return (
    <article className="group relative h-full rounded-3xl bg-neutral-50 dark:bg-neutral-900 p-7 md:p-8 ring-1 ring-neutral-200/70 dark:ring-neutral-800 hover:ring-[#D97757]/40 transition-all hover:-translate-y-1 hover:shadow-lg">
      {pillar.badge && (
        <span className="absolute top-5 right-5 text-[10px] font-semibold tracking-wider uppercase bg-[#D97757] text-white px-2 py-1 rounded-full">
          {pillar.badge}
        </span>
      )}

      <div className="text-4xl mb-5" aria-hidden>
        {pillar.icon}
      </div>

      <p className="text-sm font-medium text-[#D97757] mb-2">
        &ldquo;{pillar.question}&rdquo;
      </p>

      <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
        {pillar.title}
      </h3>

      <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {pillar.answer}
      </p>
    </article>
  )
}
