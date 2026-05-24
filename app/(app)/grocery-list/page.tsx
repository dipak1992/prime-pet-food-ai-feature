'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingCart, Lock, Globe, ChevronDown, Calendar, Utensils, AlertTriangle, RefreshCw, Users, CheckCircle2 } from 'lucide-react'
import { GroceryListPanel } from '@/components/grocery/GroceryListPanel'
import { ProviderComparisonCard } from '@/components/grocery/ProviderComparisonCard'
import { GroceryExportActions } from '@/components/grocery/GroceryExportActions'
import { ProPaywallCard } from '@/components/paywall/ProPaywallCard'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { useGroceryCommerce } from '@/lib/grocery/use-grocery-commerce'
import type { DetectedRegion, ProviderId } from '@/lib/grocery/types'
import type { GroceryList, WeeklyPlan } from '@/lib/planner/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const REGION_OPTIONS: { value: DetectedRegion; label: string; flag: string }[] = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'OTHER', label: 'Other region', flag: '🌍' },
]

type WorkspaceSummary = {
  household: { name?: string; currentUserRole?: string } | null
  members: Array<{ id: string; first_name?: string | null; member_name?: string | null; role?: string | null }>
  coordination: {
    approvalCount: number
    changeRequestCount: number
    lastActivityAt: string | null
  }
  handoffs: Array<{ id: string; provider: string; item_count: number; created_at: string }>
}

export default function GroceryListPage() {
  const { status, loading } = usePaywallStatus()
  const groceryList = useWeeklyPlanStore((s) => s.groceryList)
  const plan = useWeeklyPlanStore((s) => s.plan)
  const setPlan = useWeeklyPlanStore((s) => s.setPlan)
  const setGroceryList = useWeeklyPlanStore((s) => s.setGroceryList)
  const [preferredStore, setPreferredStore] = useState<string | null>(null)
  const {
    region,
    hasProviders,
    estimates,
    isLoading: regionLoading,
    setRegion,
    openProvider,
    copyList,
    downloadPDF,
    emailList,
    shareList,
  } = useGroceryCommerce(groceryList, preferredStore)

  const [copySuccess, setCopySuccess] = useState(false)
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null)
  const loadedServerState = useRef(false)
  const lastSavedPayload = useRef<string | null>(null)

  const handleCopy = useCallback(async () => {
    const success = await copyList()
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }, [copyList])

  const handleProviderSelect = useCallback((providerId: string) => {
    openProvider(providerId as ProviderId)
  }, [openProvider])

  useEffect(() => {
    void fetch('/api/budget', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const nextPreferredStore =
          typeof data?.settings?.preferredStore === 'string'
            ? data.settings.preferredStore
            : null
        setPreferredStore(nextPreferredStore)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!status.isAuthenticated || loading) return

    let cancelled = false
    async function loadSavedList() {
      try {
        setLoadError(null)
        const res = await fetch(`/api/grocery-list?weekStart=${encodeURIComponent(plan.weekStart)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setLoadError('Unable to load your grocery list. Please try again.')
          return
        }
        const data = (await res.json()) as {
          plan: WeeklyPlan | null
          groceryList: GroceryList | null
        }
        if (cancelled) return
        if (data.plan) setPlan(data.plan)
        if (data.groceryList) {
          setGroceryList(data.groceryList)
          lastSavedPayload.current = JSON.stringify(data.groceryList)
        }
        loadedServerState.current = true
      } catch {
        if (!cancelled) setLoadError('Network error — check your connection and try again.')
        loadedServerState.current = true
      }
    }

    void loadSavedList()
    return () => {
      cancelled = true
    }
  }, [loading, plan.weekStart, setGroceryList, setPlan, status.isAuthenticated])

  useEffect(() => {
    if (!status.isAuthenticated || loading) return
    let cancelled = false

    void fetch(`/api/family/workspace?weekStart=${encodeURIComponent(plan.weekStart)}`, {
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setWorkspace(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [loading, plan.weekStart, status.isAuthenticated])

  useEffect(() => {
    if (!status.isAuthenticated || loading || !loadedServerState.current || !groceryList) return
    const payload = JSON.stringify(groceryList)
    if (payload === lastSavedPayload.current) return

    const timeout = window.setTimeout(() => {
      void fetch('/api/grocery-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: groceryList.weekStart, groceryList }),
      }).then((res) => {
        if (res.ok) lastSavedPayload.current = payload
      }).catch(() => {})
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [groceryList, loading, status.isAuthenticated])

  // Error state — network failure or server error
  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6 text-[#D97757]" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Grocery List</h1>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50/50 to-white dark:from-neutral-900 dark:to-neutral-950 py-16 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="h-7 w-7 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Something went wrong
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {loadError}
          </p>
          <Button
            className="mt-6 bg-[#D97757] hover:bg-[#c4684b] text-white"
            onClick={() => {
              setLoadError(null)
              window.location.reload()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Free plan gate — show limited view
  if (!loading && !status.isPro && !groceryList) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6 text-[#D97757]" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Grocery List</h1>
        </div>

        {/* Unlock prompt */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-orange-50/50 to-white dark:from-neutral-900 dark:to-neutral-950 py-16 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-4">
            <Lock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Your personalized grocery list lives here
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            Generate your weekly meal plan to unlock a smart grocery list with store comparison, retailer handoff, and export tools.
          </p>

          {/* Feature preview */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
            <div className="rounded-xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-3 py-2.5 text-center">
              <span className="text-lg">🛒</span>
              <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1">Store comparison</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-3 py-2.5 text-center">
              <span className="text-lg">📋</span>
              <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1">Smart exports</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 px-3 py-2.5 text-center">
              <span className="text-lg">💰</span>
              <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1">Price estimates</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProPaywallCard
            title="Turn your meal plan into a shopping list"
            description="Upgrade to Plus to unlock auto-built smart grocery lists with store comparison, Walmart, Instacart, and Kroger handoff, PDF export, and smart pantry deduction."
            isAuthenticated={status.isAuthenticated}
            redirectPath="/grocery-list"
            feature="grocery"
          />
        </div>
      </div>
    )
  }

  // Pro user with no grocery list — actionable empty state
  if (!loading && status.isPro && !groceryList) {
    const hasMeals = plan.days.some((day) => day.meal)
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6 text-[#D97757]" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Grocery List</h1>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-orange-50/30 to-white dark:from-neutral-900 dark:to-neutral-950 py-16 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30 mb-4">
            <ShoppingCart className="h-7 w-7 text-[#D97757]" />
          </div>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Your grocery list is empty
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {hasMeals
              ? 'You have meals in your plan! Generate your grocery list to see everything you need to buy this week.'
              : 'Create a weekly meal plan first — your grocery list builds automatically from the meals you choose.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/planner">
              <Button className="bg-[#D97757] hover:bg-[#c4684b] text-white w-full sm:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                {hasMeals ? 'Open Weekly Plan' : 'Generate Weekly Plan'}
              </Button>
            </Link>
            <Link href="/dashboard/tonight">
              <Button variant="outline" className="w-full sm:w-auto">
                <Utensils className="h-4 w-4 mr-2" />
                Plan Tonight&rsquo;s Dinner
              </Button>
            </Link>
          </div>

          {/* How it works */}
          <div className="mt-8 w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-3">
              How it works
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-1.5">
                  <span className="text-sm font-bold text-[#D97757]">1</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">Plan your meals</p>
              </div>
              <div className="text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-1.5">
                  <span className="text-sm font-bold text-[#D97757]">2</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">List auto-generates</p>
              </div>
              <div className="text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-1.5">
                  <span className="text-sm font-bold text-[#D97757]">3</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">Shop & check off</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
            <ShoppingCart className="h-6 w-6 text-[#D97757]" />
            Your Weekly List Ready
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Generated from your Week Plan. Edits, pantry marks, and checked items are saved for this week.
          </p>
        </div>

        {/* Region picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRegionPicker(!showRegionPicker)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-neutral-300 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {REGION_OPTIONS.find((r) => r.value === region)?.flag ?? '🌍'}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showRegionPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRegionPicker(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800 p-1.5">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                  Shopping region
                </div>
                {REGION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRegion(opt.value)
                      setShowRegionPicker(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                      region === opt.value
                        ? 'bg-[#D97757]/10 text-[#D97757] font-medium'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Provider comparison — only for supported regions with a grocery list */}
      {!regionLoading && hasProviders && groceryList && groceryList.items.length > 0 && (
        <div className="space-y-2">
          {preferredStore && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Preferred store: <span className="font-medium text-neutral-700 dark:text-neutral-300">{preferredStore}</span>
            </p>
          )}
          <ProviderComparisonCard
            estimates={estimates}
            onSelectProvider={handleProviderSelect}
          />
        </div>
      )}

      {!regionLoading && (!groceryList || groceryList.items.length === 0) && (
        <section
          aria-label="Grocery commerce preview"
          className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-emerald-50/70 px-4 py-4 shadow-sm dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-950 dark:to-emerald-950/20"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#D97757] ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B9603D]">
                  Grocery commerce ready
                </p>
                <h2 className="mt-1 text-sm font-bold text-neutral-950 dark:text-neutral-50">
                  Build a list and MealEase will compare supported grocery handoffs.
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Once your plan has ingredients, this page shows provider options, estimated totals, handoff quality, copy-list fallback, and household sync in one place.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Plan meals
              </Link>
              <Link
                href="/dashboard/cook"
                className="inline-flex items-center justify-center rounded-full bg-white px-3.5 py-2 text-xs font-bold text-neutral-800 ring-1 ring-orange-100 transition hover:ring-orange-200 dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-800"
              >
                Scan fridge
              </Link>
            </div>
          </div>
        </section>
      )}

      {workspace && groceryList && (
        <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white px-4 py-3 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-neutral-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Shared with {workspace.household?.name ?? 'your household'}
                </p>
                <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {workspace.members.length || 1} profile{(workspace.members.length || 1) === 1 ? '' : 's'} can coordinate the same list, votes, and grocery handoffs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-72">
              <div className="rounded-xl bg-white/75 px-2 py-2 ring-1 ring-emerald-100 dark:bg-neutral-900/70 dark:ring-emerald-900/40">
                <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">{workspace.coordination.approvalCount}</p>
                <p className="text-[10px] font-medium text-neutral-500">approvals</p>
              </div>
              <div className="rounded-xl bg-white/75 px-2 py-2 ring-1 ring-emerald-100 dark:bg-neutral-900/70 dark:ring-emerald-900/40">
                <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">{workspace.coordination.changeRequestCount}</p>
                <p className="text-[10px] font-medium text-neutral-500">requests</p>
              </div>
              <div className="rounded-xl bg-white/75 px-2 py-2 ring-1 ring-emerald-100 dark:bg-neutral-900/70 dark:ring-emerald-900/40">
                <p className="flex items-center justify-center text-base font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </p>
                <p className="text-[10px] font-medium text-neutral-500">synced</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Export actions — always available when there's a list */}
      {groceryList && groceryList.items.length > 0 && (
        <GroceryExportActions
          region={region}
          hasProviders={hasProviders}
          onCopy={handleCopy}
          onDownloadPDF={downloadPDF}
          onEmail={emailList}
          onShare={shareList}
          copySuccess={copySuccess}
        />
      )}

      {/* Divider */}
      {groceryList && groceryList.items.length > 0 && (
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      )}

      {/* Existing grocery list panel */}
      <GroceryListPanel />

      {/* Legal disclaimer */}
      {hasProviders && groceryList && groceryList.items.length > 0 && (
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 px-4 py-3 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-1">
          <p className="font-medium text-neutral-500 dark:text-neutral-400">ℹ️ About store links</p>
          <p>
            MealEase is not affiliated with Walmart, Instacart, Amazon Fresh, or Kroger. Clicking &ldquo;Shop&rdquo; opens the
            retailer&rsquo;s website where you can search for and purchase items directly. MealEase also copies
            your full grocery list when you open a retailer so you have a reliable fallback. Estimated prices
            are approximations and may differ from actual store prices. MealEase does not process payments or
            handle orders.
          </p>
        </div>
      )}
    </div>
  )
}
