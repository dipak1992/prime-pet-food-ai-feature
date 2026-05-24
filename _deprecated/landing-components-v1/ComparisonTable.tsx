import { Container } from './shared/Container'
import { FadeIn } from './shared/FadeIn'

const rows = [
  { feature: 'Tonight dinner suggestion', mealease: true, pinterest: false, notes: 'Personalised to your household' },
  { feature: 'Fridge scan → recipe', mealease: true, pinterest: false, notes: 'Point camera, get 3 recipes' },
  { feature: 'Full week autopilot', mealease: true, pinterest: false, notes: '7 dinners in one tap' },
  { feature: 'Leftovers repurposing', mealease: true, pinterest: false, notes: 'Zero food waste' },
  { feature: 'Budget tracking', mealease: true, pinterest: false, notes: 'See total before you shop' },
  { feature: 'Dietary memory', mealease: true, pinterest: false, notes: 'Set once, remembered forever' },
  { feature: 'Grocery list export', mealease: true, pinterest: false, notes: 'Instacart, Amazon Fresh, Walmart' },
  { feature: 'Household profiles', mealease: true, pinterest: false, notes: 'Per-person preferences' },
]

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-bold" aria-label="Yes">
      ✓
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-sm" aria-label="No">
      —
    </span>
  )
}

export function ComparisonTable() {
  return (
    <section
      className="py-20 md:py-28 bg-[#FDF6F1] dark:bg-neutral-900"
      aria-labelledby="comparison-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              id="comparison-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              Built for dinner,{' '}
              <span className="italic text-[#D97757]">not discovery.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Recipe apps show you ideas. MealEase solves your week.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-neutral-900 dark:bg-neutral-800 text-white">
                  <th className="text-left px-6 py-4 font-medium text-neutral-300 w-1/2">Feature</th>
                  <th className="px-6 py-4 font-semibold text-[#D97757] text-center">MealEase</th>
                  <th className="px-6 py-4 font-medium text-neutral-400 text-center">Recipe apps</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-950 divide-y divide-neutral-100 dark:divide-neutral-800">
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? '' : 'bg-neutral-50 dark:bg-neutral-900/50'}
                  >
                    <td className="px-6 py-4 text-neutral-800 dark:text-neutral-200">
                      <span className="font-medium">{row.feature}</span>
                      {row.notes && (
                        <span className="block text-xs text-neutral-400 mt-0.5">{row.notes}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check yes={row.mealease} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check yes={row.pinterest} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
