import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'

export function FinalCTA() {
  return (
    <section
      className="py-24 md:py-32 bg-neutral-900 dark:bg-neutral-800 relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(217,119,87,0.18),transparent)]"
      />

      <Container className="relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2
              id="final-cta-heading"
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]"
            >
              Tonight&rsquo;s dinner is{' '}
              <span className="italic text-[#D97757]">one tap away.</span>
            </h2>

            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto">
              Join {'{'}2,400+{'}'} households who stopped stressing about dinner.
              Free forever. No card required.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/signup" className="text-lg px-8 min-h-[56px]">
                Plan tonight&rsquo;s dinner — free
              </Button>
              <a
                href="#how-it-works"
                className="text-neutral-400 hover:text-white underline-offset-4 hover:underline text-sm font-medium transition-colors"
              >
                See how it works ↑
              </a>
            </div>

            <p className="mt-6 text-sm text-neutral-500">
              Free forever · No credit card · Cancel anytime
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
