'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useBudgetStore } from '@/stores/budgetStore'
import { BudgetBar } from '@/components/budget/BudgetBar'
import { BudgetDrawer } from '@/components/budget/BudgetDrawer'
import { BudgetSetupModal } from '@/components/budget/BudgetSetupModal'
import { BudgetAlert } from '@/components/budget/BudgetAlert'
import { CostBreakdown } from '@/components/budget/CostBreakdown'
import { SpendingHistory } from '@/components/budget/SpendingHistory'
import { Wallet, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'
import type { BudgetPayload } from '@/lib/budget/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SmartMealResult } from '@/lib/engine/types'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { persistMealForRecipe } from '@/lib/recipes/canonical'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'history' | 'swaps'

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetClient({ initial }: { initial: BudgetPayload }) {
  const router = useRouter()
  const hydrate = useBudgetStore((s) => s.hydrate)
  const hydrated = useBudgetStore((s) => s.hydrated)
  const settings = useBudgetStore((s) => s.settings)
  const weekSpent = useBudgetStore((s) => s.weekSpent)
  const weekEstimated = useBudgetStore((s) => s.weekEstimated)
  const mealsCooked = useBudgetStore((s) => s.mealsCooked)
  const alertLevel = useBudgetStore((s) => s.alertLevel)
  const breakdown = useBudgetStore((s) => s.breakdown)
  const history = useBudgetStore((s) => s.history)
  const plan = useBudgetStore((s) => s.plan)
  const openSetupModal = useBudgetStore((s) => s.openSetupModal)

  const [tab, setTab] = useState<Tab>('overview')
  const [swaps, setSwaps] = useState<SwapSuggestion[]>([])
  const [loadingSwaps, setLoadingSwaps] = useState(false)

  useEffect(() => {
    hydrate(initial)
  }, [initial, hydrate])

  async function fetchSwaps() {
    setLoadingSwaps(true)
    try {
      const res = await fetch('/api/budget/swap', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSwaps(data.swaps ?? [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSwaps(false)
    }
  }

  useEffect(() => {
    if (tab === 'swaps' && swaps.length === 0) {
      fetchSwaps()
    }
  }, [tab])

  if (!hydrated) return null

  const isGated = plan === 'free'

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_44%,#ffffff_100%)] px-4 py-6 pb-28">
        <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#D97757]" />
              Budget
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {mealsCooked} meal{mealsCooked !== 1 ? 's' : ''} cooked this week
            </p>
          </div>
          <button
            onClick={openSetupModal}
            className="text-sm text-[#D97757] hover:text-[#C86646] font-medium transition-colors"
          >
            {settings.weeklyLimit ? 'Edit budget' : 'Set budget'}
          </button>
        </div>

        {/* Gated banner */}
        {isGated && (
          <div className="rounded-2xl bg-[#D97757]/5 ring-1 ring-[#D97757]/20 px-5 py-4">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Budget Intelligence is a Plus feature
            </p>
            <p className="text-xs text-neutral-500 mb-3">
              Track spending, get cost estimates, and find cheaper meal swaps.
            </p>
            <Link
              href="/upgrade?feature=budget"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D97757] hover:text-[#C86646] transition-colors"
            >
              Upgrade to Plus <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Budget bar */}
        <BudgetBar />

        {/* Alert */}
        {alertLevel !== 'safe' && !isGated && (
          <BudgetAlert level={alertLevel} spent={weekSpent} limit={settings.weeklyLimit} />
        )}

        {/* Stats row */}
        {!isGated && settings.weeklyLimit != null && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Spent" value={`$${weekSpent.toFixed(0)}`} />
            <StatCard
              label="Remaining"
              value={`$${Math.max(0, settings.weeklyLimit - weekSpent).toFixed(0)}`}
              highlight={weekSpent > settings.weeklyLimit}
            />
            <StatCard
              label="Projected"
              value={weekEstimated > 0 ? `$${weekEstimated.toFixed(0)}` : '—'}
            />
          </div>
        )}

        {/* Tabs */}
        {!isGated && (
          <>
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1">
              {(['overview', 'history', 'swaps'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-sm font-medium py-2 rounded-xl transition-colors capitalize ${
                    tab === t
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'overview' && (
                <div className="space-y-6">
                  {breakdown.length > 0 ? (
                    <div>
                      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        This week by category
                      </h2>
                      <CostBreakdown breakdown={breakdown} total={weekSpent} />
                    </div>
                  ) : (
                    <EmptyState
                      emoji="🍽️"
                      title="No spending tracked yet"
                      body="Cook a meal to start tracking your weekly food budget."
                    />
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div>
                  {history.length > 0 ? (
                    <>
                      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        Last 8 weeks
                      </h2>
                      <SpendingHistory history={history} weeklyLimit={settings.weeklyLimit} />
                    </>
                  ) : (
                    <EmptyState
                      emoji="📊"
                      title="No history yet"
                      body="Your weekly spending trends will appear here after your first tracked week."
                    />
                  )}
                </div>
              )}

              {tab === 'swaps' && (
                <div>
                  {loadingSwaps ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                      ))}
                    </div>
                  ) : swaps.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-500 mb-2">
                        Cheaper alternatives to save money this week:
                      </p>
                      {swaps.map((swap, i) => (
                        <SwapCard key={i} swap={swap} onCook={(meal) => {
                          persistMealForRecipe(meal, '/budget', 'budget')
                          sessionStorage.setItem('recipe-open-cook', 'true')
                          router.push('/tonight/recipe')
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <EmptyState
                        emoji="✅"
                        title="You're on track!"
                        body="No swap suggestions needed — your meals are within budget."
                      />
                      <button
                        onClick={fetchSwaps}
                        className="mt-4 flex items-center gap-2 mx-auto text-sm text-[#D97757] hover:text-[#C86646] transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh suggestions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
        </div>
      </main>

      {/* Modals */}
      <BudgetSetupModal />
      <BudgetDrawer />
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 px-3 py-3 text-center">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'}`}>
        {value}
      </p>
    </div>
  )
}

function EmptyState({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="text-center py-8">
      <span className="text-4xl mb-3 block">{emoji}</span>
      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{title}</p>
      <p className="text-xs text-neutral-500 max-w-xs mx-auto">{body}</p>
    </div>
  )
}

type SwapSuggestion = {
  originalMeal: string
  swapMeal: string
  originalCost: number
  swapCost: number
  savings: number
  reason: string
}

function SwapCard({ swap, onCook }: { swap: SwapSuggestion; onCook: (meal: SmartMealResult) => void }) {
  const addCustomItem = useWeeklyPlanStore((s) => s.addCustomItem)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { status } = usePaywallStatus()
  const meal: SmartMealResult = {
    id: `budget-${swap.swapMeal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: swap.swapMeal,
    tagline: `Budget swap saves about $${swap.savings.toFixed(2)}`,
    description: swap.reason,
    cuisineType: 'budget',
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    estimatedCost: swap.swapCost,
    servings: 4,
    difficulty: 'easy',
    tags: ['Budget Intelligence', 'lower-cost'],
    ingredients: [
      { name: swap.swapMeal, quantity: '1', unit: 'meal kit', fromPantry: false, category: 'other' },
    ],
    steps: [
      `Prepare ${swap.swapMeal} using your preferred recipe method.`,
      'Use pantry staples first, then add only the missing lower-cost ingredients.',
      'Taste, adjust seasoning, and serve.',
    ],
    variations: [],
    leftoverTip: null,
    shoppingList: [
      { name: swap.swapMeal, quantity: '1', unit: 'meal kit', category: 'pantry', estimatedCost: swap.swapCost, substituteOptions: [] },
    ],
    meta: {
      score: 1,
      matchedPantryItems: [],
      pantryUtilization: 0,
      simplifiedForEnergy: false,
      pickyEaterAdjusted: false,
      localityApplied: false,
      selectionReason: swap.reason,
    },
  }

  function addGroceries() {
    for (const item of meal.shoppingList) {
      addCustomItem({
        name: item.name,
        quantity: Number.parseFloat(String(item.quantity)) || 1,
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Budget meal added to grocery list.')
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-500 mb-0.5">Instead of</p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 line-through">
            {swap.originalMeal} (${swap.originalCost.toFixed(2)})
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 mb-0.5">Try</p>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {swap.swapMeal} (${swap.swapCost.toFixed(2)})
          </p>
          <p className="text-xs text-neutral-500 mt-1">{swap.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (!status.isPro) {
                  setPaywallOpen(true)
                  return
                }
                onCook(meal)
              }}
              className="rounded-lg bg-[#D97757] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Cook
            </button>
            <SaveMealButton meal={meal} source="budget" className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-700" />
            <button
              onClick={addGroceries}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
            >
              Add groceries
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full">
            Save ${swap.savings.toFixed(2)}
          </span>
        </div>
      </div>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="budget"
        title="Unlock cheaper weeks with Plus"
        description="Cook lower-cost swaps, see estimated savings, and keep the weekly grocery total under control."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/budget"
      />
    </div>
  )
}
