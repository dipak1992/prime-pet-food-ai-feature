import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'
import { socialProof } from '@/config/social-proof'

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32"
      aria-labelledby="hero-heading"
    >
      {/* Soft background wash */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FDF6F1] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
      />

      <Container wide>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <FadeIn>
              <h1
                id="hero-heading"
                className="font-serif text-[42px] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
              >
                Never ask{' '}
                <span className="italic text-[#D97757]">
                  &ldquo;What&rsquo;s for dinner?&rdquo;
                </span>{' '}
                again.
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="mt-6 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
                MealEase plans your week, uses what&rsquo;s in your fridge,
                saves your leftovers, and keeps you on budget. In 30 seconds.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button href="/signup">
                  Plan tonight&rsquo;s dinner — free
                </Button>
                <a
                  href="#how-it-works"
                  className="text-neutral-700 dark:text-neutral-300 hover:text-[#D97757] underline-offset-4 hover:underline text-sm font-medium"
                >
                  See how it works ↓
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                Free forever. No card required.
              </p>
            </FadeIn>

            {/* Social proof row */}
            <FadeIn delay={0.4}>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2" aria-hidden>
                  {socialProof.avatars.map((a, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-neutral-950 overflow-hidden"
                      aria-label={a.alt}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-[#D97757] to-[#B8935A]" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    ★★★★★ {socialProof.rating}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Trusted by {socialProof.householdCount} households
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: phone mockup with video */}
          <div className="lg:col-span-6 relative flex justify-center">
            <FadeIn delay={0.2}>
              <div className="relative mx-auto max-w-[300px] md:max-w-[340px]">
                {/* Phone frame */}
                <div className="relative aspect-[9/19.5] rounded-[3rem] bg-neutral-900 p-3 shadow-2xl ring-1 ring-black/5">
                  <div className="relative w-full h-full rounded-[2.3rem] overflow-hidden bg-gradient-to-br from-emerald-50 to-amber-50">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster="/demo/hero-poster.jpg"
                      aria-label="MealEase app demo: tonight's dinner, weekly plan, fridge scan, leftovers suggestion"
                    >
                      <source src="/demo/hero-demo.mp4" type="video/mp4" />
                    </video>
                    {/* Fallback content shown when no video */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                      <div className="text-5xl">🍽️</div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-neutral-800">Tonight</p>
                        <p className="text-base font-bold text-neutral-900 mt-1">Honey garlic chicken</p>
                        <p className="text-xs text-neutral-500 mt-1">Ready in 25 min · $12 for 4</p>
                      </div>
                    </div>
                  </div>
                  {/* Notch */}
                  <div
                    aria-hidden
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-neutral-900 rounded-b-2xl"
                  />
                </div>

                {/* Floating "tonight" card */}
                <div className="hidden md:flex absolute -left-14 top-1/4 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-4 items-center gap-3 ring-1 ring-black/5">
                  <div className="text-2xl" aria-hidden>🍽️</div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Tonight</div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Honey garlic chicken</div>
                  </div>
                </div>

                {/* Floating "budget" card */}
                <div className="hidden md:flex absolute -right-10 bottom-1/4 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-4 items-center gap-3 ring-1 ring-black/5">
                  <div className="text-2xl" aria-hidden>💰</div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">This week</div>
                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">$87 — under budget</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </Container>
    </section>
  )
}
