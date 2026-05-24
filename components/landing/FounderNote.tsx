import Image from 'next/image'
import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'

export function FounderNote() {
  return (
    <section className="bg-[#FBFAF3] py-10 dark:bg-neutral-900 md:py-18">
      <Container>
        <FadeIn>
          <div className="grid overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/35 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none md:grid-cols-[0.72fr_1.28fr]">
            <div className="relative min-h-72 bg-neutral-100 md:min-h-full">
              <Image
                src="/images/founders-family.jpg"
                alt="MealEase founders Dipak and Suprabha"
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover object-center"
              />
            </div>
            <div className="p-6 md:p-8 lg:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97757]">
                Founder note
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 md:text-4xl">
                We are building MealEase for the real dinner problem.
              </h2>
              <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
                The hard part is not finding another recipe. It is remembering what the household
                will eat, using what is already at home, planning the week, and getting the grocery
                list ready before the day gets away from you.
              </p>
              <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
                That is why the product starts with a practical loop: scan or choose ingredients,
                answer three preferences, get dinner, then turn it into a grocery list you can save.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  'Dinner first',
                  'Household memory',
                  'Groceries connected',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-[#FBFAF3] p-4 text-sm font-semibold text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Dipak and Suprabha, MealEase founders
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Built around real dinner decisions, not recipe browsing.
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
