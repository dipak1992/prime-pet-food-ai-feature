import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'

const steps = [
  {
    n: '01',
    title: 'Tell us about your household',
    body: '30 seconds of quick questions — solo, couple, or family? Any dietary needs? What\'s your weekly budget?',
  },
  {
    n: '02',
    title: "We plan tonight's dinner",
    body: 'Based on your household, your pantry, the weather, and the day of the week. Ready in one tap.',
  },
  {
    n: '03',
    title: 'You cook, we remember',
    body: 'Every meal you cook teaches us. Over time, we know exactly what your household loves.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-[#FDF6F1] dark:bg-neutral-900"
      aria-labelledby="how-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <h2
              id="how-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Get your first dinner in{' '}
              <span className="italic text-[#D97757]">60 seconds.</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Dotted connector (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px border-t-2 border-dashed border-[#D97757]/30"
          />

          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.12}>
              <div className="relative text-center md:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-neutral-800 ring-1 ring-[#D97757]/20 font-serif text-2xl font-bold text-[#D97757] mb-6 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
                  {s.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}
