'use client'

import Link from 'next/link'
import { ArrowRight, Camera, CircleDollarSign, ShoppingCart } from 'lucide-react'

const SETUP_STEPS = [
  {
    href: '/dashboard/cook',
    label: 'Scan fridge',
    body: 'Give MealEase pantry context.',
    icon: Camera,
  },
  {
    href: '/budget',
    label: 'Set budget',
    body: 'Show the weekly target.',
    icon: CircleDollarSign,
  },
  {
    href: '/grocery-list',
    label: 'Check groceries',
    body: 'Prepare the shopping flow.',
    icon: ShoppingCart,
  },
]

export function FoodOsSetupCard() {
  return (
    <section
      aria-label="Food OS setup"
      className="rounded-2xl border border-orange-100 bg-white px-4 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B9603D]">
            Household Food OS
          </p>
          <h2 className="mt-1 text-base font-bold text-neutral-950 dark:text-neutral-50">
            Add one signal and MealEase can start coordinating dinner, groceries, leftovers, and budget.
          </h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[34rem]">
          {SETUP_STEPS.map(({ href, label, body, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl bg-orange-50/70 px-3 py-3 ring-1 ring-orange-100 transition hover:bg-orange-50 hover:ring-[#D97757]/30 dark:bg-neutral-900 dark:ring-neutral-800 dark:hover:bg-neutral-900/80"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#D97757] ring-1 ring-orange-100 dark:bg-neutral-950 dark:ring-neutral-800">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold text-neutral-950 dark:text-neutral-50">
                    {label}
                    <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-neutral-500 dark:text-neutral-400">{body}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
