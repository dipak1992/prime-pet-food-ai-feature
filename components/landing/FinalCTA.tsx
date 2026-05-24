import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'
import { productStory, trustCopy } from '@/lib/marketing/stats'

export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden py-12 pb-28 md:py-32"
      aria-labelledby="final-cta-heading"
    >
      <div className="absolute inset-0 -z-10">
        <picture>
          <source media="(max-width: 639px)" srcSet="/landing/optimized/join-us-mobile.avif" type="image/avif" />
          <source media="(max-width: 639px)" srcSet="/landing/optimized/join-us-mobile.webp" type="image/webp" />
          <source srcSet="/landing/optimized/join-us.avif" type="image/avif" />
          <source srcSet="/landing/optimized/join-us.webp" type="image/webp" />
          <img
            src="/landing/optimized/join-us.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_bottom,rgba(10,8,6,0.82)_0%,rgba(10,8,6,0.72)_45%,rgba(10,8,6,0.38)_100%)] sm:block" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,8,6,0.88)_0%,rgba(10,8,6,0.76)_50%,rgba(10,8,6,0.32)_100%)] sm:hidden" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_110%,rgba(217,119,87,0.28),transparent)] sm:bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(217,119,87,0.22),transparent)]"
        />
      </div>

      <Container className="relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            {/* Headline: text-shadow for premium depth */}
            <h2
              id="final-cta-heading"
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]"
            >
              Dinner + groceries are{' '}
              <span className="italic text-[#D97757]">handled this week.</span>
            </h2>

            {/* Paragraph: brighter white for readability */}
            <p className="mt-5 text-lg md:text-xl text-white/85 leading-relaxed max-w-xl mx-auto font-medium">
              {productStory}
            </p>

            {/* Tighter gap between paragraph and CTA */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/signup" className="text-lg px-8 min-h-[56px] shadow-lg shadow-[#D97757]/30">
                Plan tonight&rsquo;s dinner — free
              </Button>
              <a
                href="#how-it-works"
                className="text-white/70 hover:text-white underline-offset-4 hover:underline text-sm font-medium transition-colors"
              >
                See how it works ↑
              </a>
            </div>

            <p className="mt-5 text-sm text-white/50">
              {trustCopy.join(' · ')}
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
