import Image from 'next/image'
import { CheckCircle2, Clock, ShoppingCart } from 'lucide-react'
import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'
import { MotionFloat } from './shared/MotionFloat'
import { MealEaseLoop } from './shared/MealEaseLoop'
import { RotatingHeroWord } from './shared/RotatingHeroWord'
import { socialProof } from '@/config/social-proof'
import { LandingTonightPreview } from './LandingTonightPreview'
import { LandingScanDemoButton } from './LandingScanDemoButton'
import { trustCopy } from '@/lib/marketing/stats'

const trustItems = trustCopy

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-32"
      aria-labelledby="hero-heading"
    >
      {/* Base warm gradient — always present */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FDF6F1] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
      />

      {/* Art-directed hero background: one responsive request, no hidden priority image. */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source media="(max-width: 639px)" srcSet="/landing/optimized/hero-section-mobile.avif" type="image/avif" />
          <source media="(max-width: 639px)" srcSet="/landing/optimized/hero-section-mobile.webp" type="image/webp" />
          <source srcSet="/landing/optimized/hero-section.avif" type="image/avif" />
          <source srcSet="/landing/optimized/hero-section.webp" type="image/webp" />
          <img
            src="/landing/optimized/hero-section.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[76%_center] opacity-100 sm:object-center sm:opacity-25"
          />
        </picture>
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white via-white/88 to-white/45 dark:from-neutral-950 dark:via-neutral-950/88 dark:to-neutral-950/56 sm:block" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_38%,rgba(255,255,255,0.44)_68%,rgba(255,255,255,0.06)_100%)] dark:bg-[linear-gradient(to_right,rgba(10,10,10,0.96)_0%,rgba(10,10,10,0.86)_38%,rgba(10,10,10,0.44)_68%,rgba(10,10,10,0.06)_100%)] sm:hidden" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FDF6F1]/82 to-transparent dark:from-neutral-950/82 sm:hidden" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/64 to-transparent dark:from-neutral-950/64 sm:hidden" />
      </div>

      <Container wide>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <FadeIn direction="left">
              <h1
                id="hero-heading"
                className="font-serif text-[38px] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[62px] font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
              >
                Dinner planned for
                <br />
                <RotatingHeroWord />
                <br />
                <span>Grocery list built.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.08} direction="left">
              <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-[1.6] text-neutral-600 dark:text-neutral-300 md:text-xl">
                Tell MealEase what&apos;s in the fridge. It returns tonight&apos;s dinner,
                pantry notes, and the grocery list to finish the week.
              </p>
            </FadeIn>

            <FadeIn delay={0.16} direction="left">
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {/* CTA: slightly narrower on mobile, premium shadow, active press state */}
                <Button
                  href="/start"
                  className="w-[88%] sm:w-auto text-center shadow-md shadow-[#D97757]/20 hover:shadow-lg hover:shadow-[#D97757]/28 active:shadow-sm active:scale-[0.98] transition-all duration-150"
                >
                  Plan dinner free
                </Button>
                <LandingScanDemoButton />
                <a
                  href="#pillars"
                  className="text-neutral-600 dark:text-neutral-300 hover:text-[#D97757] underline-offset-4 hover:underline text-sm font-medium transition-colors"
                >
                  See the dinner loop ↓
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.24} direction="left">
              <div className="mt-5 flex max-w-xl flex-wrap gap-2">
                {trustItems.map((item, i) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/78 px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm shadow-orange-100/30 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/78 dark:text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    {item}
                    {i === 0 && <span className="sr-only">.</span>}
                  </span>
                ))}
              </div>
              <MealEaseLoop />
            </FadeIn>

            {/* Social proof row */}
            <FadeIn delay={0.32} direction="left">
              <div className="mt-6 sm:mt-8 flex max-w-xl flex-row items-center gap-3 sm:gap-4">
                {/* Avatar stack — real photos */}
                <div className="flex -space-x-1.5 shrink-0" aria-hidden>
                  {socialProof.testimonials.slice(0, 5).map((t, i) => (
                    <div
                      key={t.name}
                      className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full ring-2 ring-white dark:ring-neutral-950 shadow-sm"
                      style={{ transform: `translateY(${i % 2 === 0 ? 0 : 1}px)` }}
                    >
                      <Image
                        src={t.photo}
                        alt={t.name}
                        fill
                        sizes="36px"
                        className="object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                    <span className="text-amber-500">★★★★★</span>{' '}
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{socialProof.rating}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-tight mt-0.5">
                    {socialProof.householdCount} homes · built for real dinner weeks
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: product and household proof */}
          <div className="lg:col-span-6 relative flex justify-center -mt-4 sm:mt-0">
            <FadeIn delay={0.14} direction="right">
              <div className="relative mx-auto w-full max-w-[600px] sm:min-h-[560px]">
                <MotionFloat intensity={0.45} className="relative hidden min-h-[430px] overflow-hidden rounded-[2rem] bg-neutral-950 shadow-2xl shadow-neutral-950/15 ring-1 ring-black/10 sm:block">
                  <Image
                    src="/landing/optimized/hero-section.webp"
                    alt="Warm household dinner ingredients ready for a MealEase plan"
                    fill
                    sizes="(min-width: 1024px) 360px, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(23,18,15,0.72)_0%,rgba(23,18,15,0.22)_48%,rgba(255,255,255,0.18)_100%)]" />
                  <MotionFloat intensity={0.75} delay={0.35} className="absolute bottom-5 left-5 w-[260px] rounded-2xl bg-white/94 p-4 shadow-xl backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D97757]">
                      First useful output
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-950">
                      The same household loop, every dinner night.
                    </p>
                    <div className="mt-3 grid gap-2 text-[11px] font-semibold text-neutral-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#D97757]" aria-hidden />
                        25 min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                        Pantry used
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ShoppingCart className="h-3.5 w-3.5 text-[#D97757]" aria-hidden />
                        List ready
                      </span>
                    </div>
                  </MotionFloat>
                </MotionFloat>

                {/* Phone frame */}
                <MotionFloat intensity={1} delay={0.2} className="relative mx-auto aspect-[9/19.5] w-[min(292px,calc(100vw-68px))] rounded-[2.8rem] bg-neutral-950 p-2.5 shadow-2xl shadow-neutral-900/30 ring-1 ring-black/10 sm:absolute sm:right-8 sm:top-0 sm:mx-0 sm:w-[315px]">
                  <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-[#FFFDF8]">
                    <LandingTonightPreview />
                  </div>
                  {/* Notch */}
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-3 h-7 w-32 -translate-x-1/2 rounded-b-3xl bg-neutral-950"
                  />
                </MotionFloat>

                {/* Floating "budget" card */}
                <MotionFloat intensity={1.2} delay={0.55} className="hidden md:flex absolute right-0 bottom-9 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-4 items-center gap-3 ring-1 ring-black/5">
                  <ShoppingCart className="h-6 w-6 text-[#D97757]" aria-hidden />
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Grocery preview</div>
                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">$87 estimated</div>
                  </div>
                </MotionFloat>
              </div>
            </FadeIn>
          </div>
        </div>
      </Container>
    </section>
  )
}
