export function PressHero() {
  return (
    <section className="relative pt-16 pb-12 md:pt-24 md:pb-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FDF6F1] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#D97757] uppercase tracking-wider mb-4">
            Press &amp; media
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.05]">
            Writing about{' '}
            <span className="italic text-[#D97757]">MealEase?</span>
            <br />
            Here&apos;s everything you need.
          </h1>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
            Logos, product screenshots, founder photos, bios, and the facts. Questions? Email{' '}
            <a
              href="mailto:press@mealeaseai.com"
              className="text-[#D97757] hover:text-[#C86646] underline"
            >
              press@mealeaseai.com
            </a>{' '}
            and we&apos;ll respond within 24 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
