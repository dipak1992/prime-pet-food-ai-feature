import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import { CircularTestimonials } from './CircularTestimonials'
import { socialProof } from '@/config/social-proof'

const carouselTestimonials = socialProof.testimonials.map((testimonial) => ({
  quote: `“${testimonial.quote}”`,
  name: testimonial.name,
  designation: testimonial.city,
  src: testimonial.photo,
}))

export function SocialProof() {
  return (
    <section
      className="bg-white py-10 dark:bg-neutral-950 md:py-28"
      aria-labelledby="social-proof-heading"
    >
      <Container>
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2
              id="social-proof-heading"
              className="font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl"
            >
              Built for shared households,{' '}
              <span className="italic text-[#D97757]">not solo recipe browsing.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Real dinner routines shaped the product: fewer repeat grocery debates, clearer meal approvals, and visible time and waste savings for the whole household.
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mb-10 grid grid-cols-2 gap-x-4 gap-y-8 text-center md:mb-14 md:grid-cols-4 md:gap-12">
            {[
              { value: socialProof.householdCount, label: 'households shaping shared planning' },
              { value: socialProof.dinnersPlanned, label: 'dinners checked against grocery impact' },
              { value: socialProof.rating, label: 'coordination feedback stage' },
              { value: socialProof.hoursSavedPerWeek, label: 'weekly time-saved study status' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-[2.15rem] font-bold leading-[0.95] text-[#D97757] md:text-5xl md:leading-none">
                  {stat.value}
                </div>
                <div className="mx-auto mt-2 max-w-[9rem] text-xs leading-snug text-neutral-500 dark:text-neutral-400 md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <CircularTestimonials testimonials={carouselTestimonials} />
        </FadeIn>
      </Container>
    </section>
  )
}
