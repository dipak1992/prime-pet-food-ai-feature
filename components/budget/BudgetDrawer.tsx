'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, ArrowRight } from 'lucide-react'
import { useBudgetStore } from '@/stores/budgetStore'
import { CostBreakdown } from './CostBreakdown'
import { SpendingHistory } from './SpendingHistory'
import { BudgetAlert } from './BudgetAlert'
import Link from 'next/link'

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetDrawer() {
  const isOpen = useBudgetStore((s) => s.drawerOpen)
  const close = useBudgetStore((s) => s.closeDrawer)
  const settings = useBudgetStore((s) => s.settings)
  const weekSpent = useBudgetStore((s) => s.weekSpent)
  const weekEstimated = useBudgetStore((s) => s.weekEstimated)
  const mealsCooked = useBudgetStore((s) => s.mealsCooked)
  const percentUsed = useBudgetStore((s) => s.percentUsed)
  const alertLevel = useBudgetStore((s) => s.alertLevel)
  const breakdown = useBudgetStore((s) => s.breakdown)
  const history = useBudgetStore((s) => s.history)
  const openSetupModal = useBudgetStore((s) => s.openSetupModal)

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const remaining = settings.weeklyLimit != null ? settings.weeklyLimit - weekSpent : null
  const projected = weekEstimated > 0 ? weekEstimated : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-drawer-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={close}
        aria-hidden
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full md:max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                id="budget-drawer-title"
                className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50"
              >
                Weekly budget
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {mealsCooked} meal{mealsCooked !== 1 ? 's' : ''} cooked this week
              </p>
            </div>
            <button
              onClick={close}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Alert banner */}
          {alertLevel !== 'safe' && (
            <div className="mb-4">
              <BudgetAlert level={alertLevel} spent={weekSpent} limit={settings.weeklyLimit} />
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Spent"
              value={`$${weekSpent.toFixed(0)}`}
              sub={settings.weeklyLimit ? `of $${settings.weeklyLimit}` : undefined}
            />
            <StatCard
              label="Remaining"
              value={remaining != null ? `$${Math.max(0, remaining).toFixed(0)}` : '—'}
              highlight={remaining != null && remaining < 0}
            />
            <StatCard
              label="Projected"
              value={projected != null ? `$${projected.toFixed(0)}` : '—'}
              sub="this week"
            />
          </div>

          {/* Progress bar */}
          {settings.weeklyLimit != null && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>{percentUsed}% used</span>
                <span>${settings.weeklyLimit} limit</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    alertLevel === 'over'
                      ? 'bg-red-500'
                      : alertLevel === 'caution'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {breakdown.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Spending by category
              </h3>
              <CostBreakdown breakdown={breakdown} total={weekSpent} />
            </div>
          )}

          {/* Spending history */}
          {history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Last 8 weeks
              </h3>
              <SpendingHistory history={history} weeklyLimit={settings.weeklyLimit} />
            </div>
          )}

          {/* Swap CTA */}
          {alertLevel !== 'safe' && (
            <Link
              href="/budget?tab=swaps"
              onClick={close}
              className="flex items-center justify-between w-full rounded-2xl bg-[#D97757]/5 hover:bg-[#D97757]/10 ring-1 ring-[#D97757]/20 px-4 py-3 transition-colors mb-4"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  See cheaper meal swaps
                </p>
                <p className="text-xs text-neutral-500">Save up to 30% with smart substitutions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D97757]" />
            </Link>
          )}

          {/* Edit budget */}
          <button
            onClick={() => {
              close()
              openSetupModal()
            }}
            className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors py-2"
          >
            Edit budget settings
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 px-3 py-3 text-center">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}
