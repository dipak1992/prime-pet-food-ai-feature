import Image from 'next/image'
import { CheckCircle2, RefreshCcw, ShoppingCart, Sparkles } from 'lucide-react'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'
import conversionStoryImage from '@/public/landing/optimized/conversion-story.webp'

const workflow = [
  { icon: Sparkles, label: 'Sees the household', detail: 'Likes, dislikes, pantry, budget' },
  { icon: RefreshCcw, label: 'Adjusts the dinner', detail: 'Swap protein, cuisine, time, effort' },
  { icon: CheckCircle2, label: 'Locks the plan', detail: 'One dinner your family will actually eat' },
  { icon: ShoppingCart, label: 'Builds the handoff', detail: 'Missing items sorted into a grocery list' },
]

export function ConversionStory() {
  return (
    <section className="relative overflow-hidden bg-white py-10 dark:bg-neutral-950 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <FadeIn className="lg:col-span-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Built for the dinner moment
            </p>
            <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
              From blank fridge stare to a plan your household will eat.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              MealEase keeps the household context generic AI forgets: what you like, what you have, what you spent, and what needs to happen next.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 sm:grid-cols-3">
              {['Uses pantry first', 'Respects dislikes', 'Builds groceries'].map((item) => (
                <div key={item} className="rounded-full bg-[#FBFAF3] px-4 py-3 text-center ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800">
                  {item}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950 p-4 text-white shadow-2xl shadow-neutral-950/10 sm:p-5">
              <div className="absolute inset-0">
                <Image
                  src={conversionStoryImage}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  placeholder="blur"
                  className="object-cover opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/55 to-neutral-950/20" />
              </div>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 backdrop-blur sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                      MealEase loop
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold">
                      Dinner context becomes grocery action.
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/20 sm:inline-flex">
                    Live plan
                  </span>
                </div>
                <div className="relative grid gap-3">
                  <div className="absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-[#D97757] via-white/25 to-transparent" aria-hidden />
                {workflow.map((step, index) => {
                  const Icon = step.icon

                  return (
                    <div key={step.label} className="relative grid grid-cols-[2.75rem_1fr] gap-3 rounded-2xl border border-white/10 bg-neutral-950/35 p-3 shadow-sm shadow-black/10">
                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#D97757] text-white shadow-lg shadow-[#D97757]/25">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                          Step {index + 1}
                        </p>
                        <p className="mt-0.5 font-semibold">{step.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/65">{step.detail}</p>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  )
}
