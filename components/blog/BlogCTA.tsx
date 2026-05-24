import Link from 'next/link'
import { ArrowRight, CalendarDays, ShoppingCart, Sparkles } from 'lucide-react'
import type { BlogCategory } from '@/lib/blog/types'

const categoryCopy: Partial<Record<BlogCategory, string>> = {
  tonight: 'Get a dinner pick that fits your household tonight.',
  leftovers: 'Turn what you already cooked into the next meal.',
  budget: 'Plan dinners with the grocery total in view.',
  autopilot: 'Build the week once and let dinner run on rails.',
  snap: 'Scan the fridge and cook from what is already there.',
  household: 'Remember preferences once, then plan for everyone.',
}

export function BlogCTA({
  variant = 'index',
  category,
}: {
  variant?: 'index' | 'post' | 'category'
  category?: BlogCategory
}) {
  const body =
    category && categoryCopy[category]
      ? categoryCopy[category]
      : 'MealEase turns ideas into tonight picks, weekly plans, and grocery-ready dinners.'

  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-6 text-white shadow-xl shadow-neutral-950/10 ring-1 ring-neutral-900/10 md:p-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(217,119,87,0.38),transparent_34%),radial-gradient(circle_at_100%_40%,rgba(184,147,90,0.2),transparent_34%)]"
      />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F3B18E]">
            {variant === 'index' ? 'Meal planning, made practical' : 'Dinner without the nightly reset'}
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight md:text-3xl">
            Turn tonight&rsquo;s idea into a plan.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
            {body}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-white/70">
            {[
              { icon: Sparkles, label: 'Personalized pick' },
              { icon: ShoppingCart, label: 'Grocery ready' },
              { icon: CalendarDays, label: 'Weekly plan' },
            ].map((item) => {
              const Icon = item.icon

              return (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-[#F3B18E]" aria-hidden />
                  {item.label}
                </span>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Link
            href="/start"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#D97757] px-5 text-sm font-bold text-white transition-colors hover:bg-[#c4664a]"
          >
            Try the first-use flow
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/samples/family-grocery-list"
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/88 transition-colors hover:bg-white/10"
          >
            See a sample grocery list
          </Link>
        </div>
      </div>
    </div>
  )
}
