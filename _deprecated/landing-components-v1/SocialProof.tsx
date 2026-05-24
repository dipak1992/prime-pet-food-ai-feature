import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { socialProof } from '@/config/social-proof'

export function SocialProof() {
  return (
    <section
      className="py-20 md:py-28 bg-white dark:bg-neutral-950"
      aria-labelledby="social-proof-heading"
    >
      <Container>
        {/* Stats row */}
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center mb-20 md:mb-28">
            {[
              { value: socialProof.householdCount, label: 'households cooking smarter' },
              { value: socialProof.dinnersPlanned, label: 'dinners planned' },
              { value: `★ ${socialProof.rating}`, label: 'average rating' },
              { value: `${socialProof.hoursSavedPerWeek}h`, label: 'saved per week, per household' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-4xl md:text-5xl font-bold text-[#D97757]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Section heading */}
        <FadeIn>
          <h2
            id="social-proof-heading"
            className="sr-only"
          >
            What households are saying
          </h2>
        </FadeIn>

        {/* Testimonials grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialProof.testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.08}>
              <figure className="flex flex-col h-full bg-[#FDF6F1] dark:bg-neutral-900 rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/5">
                {/* Stars */}
                <div className="text-[#D97757] text-sm mb-4" aria-label="5 stars">
                  ★★★★★
                </div>
                <blockquote className="flex-1">
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D97757] to-[#B8935A] flex-shrink-0"
                    aria-hidden
                  />
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {t.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t.city}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}
