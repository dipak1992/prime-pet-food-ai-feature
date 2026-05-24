import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For households just getting started.',
    features: [
      'Tonight Suggestions (3/week)',
      'Snap & Cook (5 scans/month)',
      'Basic grocery list',
    ],
    cta: 'Start free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Everything you need to stop the dinner spiral.',
    features: [
      'Unlimited Tonight Suggestions',
      'Unlimited Snap & Cook',
      'Weekly Autopilot',
      'Leftovers AI',
      'Budget Intelligence',
      'Grocery export (Instacart, Amazon, Walmart)',
      'Household profiles & dietary memory',
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
      className="py-20 md:py-28 bg-white dark:bg-neutral-950"
      aria-labelledby="pricing-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              id="pricing-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Simple pricing.{' '}
              <span className="italic text-[#D97757]">No surprises.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Start free. Upgrade when you&rsquo;re ready.
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
            No credit card required. Cancel anytime.
          </p>
        </FadeIn>
      </Container>
    </section>
  )
}
