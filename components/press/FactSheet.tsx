'use client'

const FACTS = [
  { label: 'Founded', value: '2024' },
  { label: 'Founders', value: 'Dipak & Suprabha' },
  { label: 'Headquarters', value: 'United States (remote)' },
  { label: 'Category', value: 'Consumer · Food & household' },
  { label: 'Platform', value: 'Web, iOS, Android' },
  { label: 'Business model', value: 'Freemium — Free forever, Plus $9.99/mo or $79/yr' },
]

const ONELINERS = [
  'MealEase is a household meal planner that tells you what\'s for dinner tonight, uses what\'s in your fridge, saves leftovers, and keeps you under budget.',
  'Built for the 5:47 PM moment when you\'re standing in front of an open fridge with no plan.',
  'The first meal planning app that actually knows what\'s in your kitchen.',
]

export function FactSheet() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Facts */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
              Fast facts
            </h2>
            <dl className="space-y-3">
              {FACTS.map((f) => (
                <div key={f.label} className="flex gap-4 text-sm">
                  <dt className="w-36 flex-shrink-0 font-medium text-neutral-500">{f.label}</dt>
                  <dd className="text-neutral-900 dark:text-neutral-100">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* One-liners */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              One-line descriptions
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Cut-and-paste any of these for headlines or intros.
            </p>
            <div className="space-y-4">
              {ONELINERS.map((line, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-4 pr-12"
                >
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                    &ldquo;{line}&rdquo;
                  </p>
                  <CopyButton text={line} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CopyButton({ text }: { text: string }) {
  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    await navigator.clipboard.writeText(text)
    const btn = e.currentTarget
    btn.textContent = '✓'
    setTimeout(() => (btn.textContent = '⎘'), 1600)
  }

  return (
    <button
      onClick={copy}
      aria-label="Copy to clipboard"
      className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-[#D97757] hover:text-white text-neutral-600 dark:text-neutral-300 text-xs flex items-center justify-center transition-colors"
    >
      ⎘
    </button>
  )
}
