import {
  CalendarDays,
  Camera,
  ChefHat,
  DollarSign,
  RefreshCcw,
  ShoppingCart,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'tonight' | 'snap' | 'weekly' | 'leftovers' | 'budget' | 'landing'

const mockups: Record<
  Variant,
  {
    eyebrow: string
    title: string
    meta: string
    stat: string
    action: string
    rows: Array<{ icon: typeof ChefHat; label: string; value: string }>
  }
> = {
  landing: {
    eyebrow: 'Tonight',
    title: 'Honey garlic chicken',
    meta: 'Ready in 25 min',
    stat: '$12 for 4',
    action: 'Dinner plan saved',
    rows: [
      { icon: CalendarDays, label: 'Weekly plan', value: 'Thu' },
      { icon: ShoppingCart, label: 'Grocery list', value: '8 items' },
      { icon: DollarSign, label: 'Budget', value: 'Under' },
    ],
  },
  tonight: {
    eyebrow: 'Tonight pick',
    title: 'Lemon basil pasta',
    meta: 'Fits everyone at home',
    stat: '28 min',
    action: 'Swap or start cooking',
    rows: [
      { icon: ChefHat, label: 'Match score', value: '96' },
      { icon: RefreshCcw, label: 'Swaps left', value: 'Unlimited' },
      { icon: ShoppingCart, label: 'On hand', value: '7/9' },
    ],
  },
  snap: {
    eyebrow: 'Fridge scan',
    title: 'Detected: eggs, spinach, feta',
    meta: '3 meal matches found',
    stat: '92%',
    action: 'Cook from what you have',
    rows: [
      { icon: Camera, label: 'Scan quality', value: 'Clear' },
      { icon: Utensils, label: 'Best match', value: 'Frittata' },
      { icon: ShoppingCart, label: 'Need', value: '2 items' },
    ],
  },
  weekly: {
    eyebrow: 'Autopilot',
    title: '7 dinners planned',
    meta: 'Balanced for your household',
    stat: '$87',
    action: 'Generate grocery list',
    rows: [
      { icon: CalendarDays, label: 'Weeknights', value: '7/7' },
      { icon: RefreshCcw, label: 'Swapped', value: 'Tue' },
      { icon: ShoppingCart, label: 'List ready', value: '34 items' },
    ],
  },
  leftovers: {
    eyebrow: 'Leftovers AI',
    title: 'Roast chicken tacos',
    meta: 'Uses last night first',
    stat: '2 servings',
    action: 'Transform leftovers',
    rows: [
      { icon: Utensils, label: 'Leftover', value: 'Chicken' },
      { icon: Sparkles, label: 'New meal', value: 'Tacos' },
      { icon: CalendarDays, label: 'Use by', value: 'Tomorrow' },
    ],
  },
  budget: {
    eyebrow: 'Budget view',
    title: '$87 planned this week',
    meta: 'Under your $110 limit',
    stat: 'Save $23',
    action: 'Keep the plan',
    rows: [
      { icon: DollarSign, label: 'Budget', value: '$110' },
      { icon: ShoppingCart, label: 'Groceries', value: '$87' },
      { icon: RefreshCcw, label: 'Cheaper swaps', value: '4' },
    ],
  },
}

export function ProductMockup({
  variant = 'landing',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const data = mockups[variant]

  return (
    <div className={cn('relative mx-auto w-full max-w-[320px] sm:max-w-sm', className)}>
      <div className="rounded-[2rem] bg-neutral-950/95 p-3 shadow-2xl shadow-neutral-950/30 ring-1 ring-white/20">
        <div className="overflow-hidden rounded-[1.4rem] bg-[#FBFAF3]">
          <div className="bg-gradient-to-br from-[#FDF6F1] via-white to-emerald-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                  {data.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-neutral-950">
                  {data.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{data.meta}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#D97757] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#D97757]/25">
                {data.stat}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4 shadow-xl shadow-neutral-900/10 ring-1 ring-neutral-900/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Sparkles className="h-4 w-4 text-[#D97757]" aria-hidden />
                {data.action}
              </div>
              <div className="mt-4 space-y-2">
                {data.rows.map((row) => {
                  const Icon = row.icon

                  return (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 text-sm"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2 text-neutral-600">
                        <Icon className="h-4 w-4 text-[#D97757]" aria-hidden />
                        <span className="truncate">{row.label}</span>
                      </span>
                      <span className="shrink-0 font-bold text-neutral-950">{row.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
