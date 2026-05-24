'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { X } from 'lucide-react'

export function BudgetDrawer() {
  const open = useDashboardStore((s) => s.budgetDrawerOpen)
  const close = useDashboardStore((s) => s.closeBudgetDrawer)
  const budget = useDashboardStore((s) => s.budget)
  const setBudget = useDashboardStore((s) => s.setBudget)

  const [value, setValue] = useState(budget?.weeklyLimit ?? 100)

  useEffect(() => {
    if (open) setValue(budget?.weeklyLimit ?? 100)
  }, [open, budget?.weeklyLimit])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-drawer-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-hidden
      />
      <div className="relative w-full md:max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close budget drawer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="budget-drawer-title"
          className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50"
        >
          Weekly budget
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          We&rsquo;ll plan meals under this and warn you if you&rsquo;re trending over.
        </p>

        <div className="mt-6">
          <label
            htmlFor="budget-input"
            className="text-xs font-medium uppercase tracking-wider text-neutral-500"
          >
            Weekly spend
          </label>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50">
              $
            </span>
            <input
              id="budget-input"
              type="number"
              min={0}
              max={1000}
              step={5}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="font-serif text-5xl font-bold bg-transparent border-b-2 border-[#D97757] focus:outline-none w-40 text-neutral-900 dark:text-neutral-50"
            />
          </div>

          <input
            type="range"
            min={25}
            max={500}
            step={5}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full mt-6 accent-[#D97757]"
            aria-label="Budget slider"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>$25</span>
            <span>$500</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={async () => {
              await setBudget(value)
              close()
            }}
            className="flex-1 bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
          >
            Save budget
          </button>
          {budget?.weeklyLimit != null && (
            <button
              onClick={async () => {
                await setBudget(null)
                close()
              }}
              className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
            >
              Remove budget
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
