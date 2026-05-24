import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For seeing whether MealEase fits your dinner rhythm.',
    features: [
      'Tonight Suggestions',
      '3 meal swaps per day',
      '3-day Planner preview',
      'Basic Snap & Cook',
      'Basic grocery preview',
    ],
    cta: 'Start free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Plus',
    price: '$9.99',
    period: '/month · or $79/yr (save 34%)',
    description: 'For households that want dinner, groceries, budget, and leftovers connected.',
    features: [
      'Full 7-day Planner / Weekly Autopilot',
      'Pantry-aware grocery list with estimated cost',
      'Budget-aware swaps before checkout',
      'Post-cook leftovers and lunch ideas',
      'Household memory plus weekly Copilot instructions',
      'Unlimited swaps and Snap & Cook usage',
    ],
    cta: 'Start free — upgrade anytime',
    href: '/signup',
    highlight: true,
  },
]

export function PricingTeaser() {
  return (
    <section
      id="pricing"
      className="py-10 md:py-22 bg-white dark:bg-neutral-950"
      aria-labelledby="pricing-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              id="pricing-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Start with tonight.{' '}
              <span className="italic text-[#D97757]">Upgrade for the weekly loop.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Free should prove the first dinner. Plus is for memory, groceries,
              budget, and leftover workflows that compound every week.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={[
                  'relative flex flex-col h-full rounded-2xl p-8',
                  plan.highlight
                    ? 'bg-neutral-900 dark:bg-neutral-800 text-white ring-2 ring-[#D97757]'
                    : 'bg-[#FDF6F1] dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/5',
                ].join(' ')}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#D97757] text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`text-sm font-semibold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-[#D97757]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-neutral-900 dark:text-neutral-50'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlight ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className={plan.highlight ? 'text-neutral-300' : 'text-neutral-700 dark:text-neutral-300'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={plan.href}
                  variant={plan.highlight ? 'primary' : 'ghost'}
                  className={plan.highlight ? '' : 'border border-neutral-300 dark:border-neutral-700 hover:border-[#D97757]'}
                >
                  {plan.cta}
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
            No credit card required to start. Cancel anytime after upgrading.
          </p>
        </FadeIn>
      </Container>
    </section>
  )
}
