'use client'

import { useEffect, useRef } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { BudgetBar } from '@/components/budget/BudgetBar'
import { BudgetDrawer } from '@/components/budget/BudgetDrawer'
import { BudgetSetupModal } from '@/components/budget/BudgetSetupModal'
import { TonightCard } from '@/components/dashboard/TonightCard'
import { LeftoversCard } from '@/components/dashboard/LeftoversCard'
import { WeekPlanStrip } from '@/components/dashboard/WeekPlanStrip'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { NextBestActionCard } from '@/components/dashboard/NextBestActionCard'
import { WeeklyImpactCard } from '@/components/dashboard/WeeklyImpactCard'
import { PredictiveIntelligenceCard } from '@/components/dashboard/PredictiveIntelligenceCard'
import { AutonomousActionsCard } from '@/components/dashboard/AutonomousActionsCard'
import { DashboardSupportLine } from '@/components/dashboard/DashboardSupportLine'
import { FoodOsSetupCard } from '@/components/dashboard/FoodOsSetupCard'
import { WeeklyReminderNudge } from '@/components/shared/SaveReminderCard'
import { StaggerGroup } from '@/components/motion'
import type { DashboardPayload } from '@/lib/dashboard/types'

const REFRESH_INTERVAL_MS = 300_000 // 5 minutes

export function NewDashboardClient({ initial }: { initial: DashboardPayload }) {
  const hydrate = useDashboardStore((s) => s.hydrate)
  const refresh = useDashboardStore((s) => s.refresh)
  const hydrateBudget = useBudgetStore((s) => s.hydrate)
  const user = useDashboardStore((s) => s.user)
  const tonight = useDashboardStore((s) => s.tonight)
  const leftovers = useDashboardStore((s) => s.leftovers)
  const budget = useDashboardStore((s) => s.budget)
  const retention = useDashboardStore((s) => s.retention)
  const predictiveInsights = useDashboardStore((s) => s.predictiveInsights)
  const autonomousActions = useDashboardStore((s) => s.autonomousActions)
  const nudge = useDashboardStore((s) => s.nudge)
  const error = useDashboardStore((s) => s.error)

  // Only hydrate once on mount — avoid re-render loop from changing `initial` reference
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    hydrate(initial)
    hydrateBudget({
      settings: {
        weeklyLimit: initial.budget.weeklyLimit,
        strictMode: false,
        zipCode: null,
        preferredStore: null,
      },
      currentWeek: {
        weekStart: new Date().toISOString().split('T')[0],
        spent: initial.budget.weekSpent,
        estimated: 0,
        mealsCooked: 0,
        breakdown: [],
      },
      history: [],
      plan: initial.user.plan,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh on focus and on a slower interval. Most dashboard changes are mutation-driven.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    const timer = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS)
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use initial data directly while store hydrates — avoids blank screen
  const displayUser = user ?? initial.user
  const displayTonight = tonight ?? initial.tonight
  const displayLeftovers = leftovers ?? initial.leftovers
  const displayRetention = retention ?? initial.retention
  const displayPredictiveInsights = predictiveInsights.length > 0
    ? predictiveInsights
    : initial.predictiveInsights
  const displayAutonomousActions = autonomousActions.length > 0
    ? autonomousActions
    : initial.autonomousActions
  const displayNudge = nudge ?? initial.nudge
  const hasWeeklyImpact =
    displayRetention.estimatedSavedThisWeek > 0 ||
    displayRetention.leftoverMealsReusedThisWeek > 0 ||
    displayRetention.plannedDays > 0 ||
    displayRetention.behaviorSignalsLearned > 0
  const showFoodOsSetup =
    !hasWeeklyImpact &&
    displayPredictiveInsights.length === 0 &&
    displayAutonomousActions.length === 0

  return (
    <>
      <div
        id="main"
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-16 space-y-6 md:space-y-8"
        style={{ background: 'linear-gradient(180deg, #FDF6F1 0%, #ffffff 15%, #ffffff 100%)' }}
      >
        {/* Non-blocking error banner — shown when background refresh fails */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400"
          >
            <span className="shrink-0 text-base">⚠️</span>
            <span>
              Could not refresh dashboard data.{' '}
              <button
                onClick={() => refresh()}
                className="font-medium underline underline-offset-2 hover:no-underline"
              >
                Try again
              </button>
            </span>
          </div>
        )}

        <GreetingHeader firstName={displayUser.firstName} budget={budget} />

        <DashboardSupportLine />

        <StaggerGroup className="grid xl:grid-cols-[minmax(0,1fr)_22rem] gap-4 md:gap-6 items-start" staggerDelay={0.1}>
          <div>
            <TonightCard state={displayTonight} />
          </div>
          <div className="hidden xl:block">
            <LeftoversCard state={displayLeftovers} />
          </div>
        </StaggerGroup>

        <NextBestActionCard user={displayUser} retention={displayRetention} nudge={displayNudge} />

        {showFoodOsSetup && <FoodOsSetupCard />}

        <WeeklyImpactCard retention={displayRetention} />

        <PredictiveIntelligenceCard insights={displayPredictiveInsights} />

        <AutonomousActionsCard actions={displayAutonomousActions} />

        <div className="xl:hidden">
          <LeftoversCard state={displayLeftovers} />
        </div>

        <WeekPlanStrip />

        <WeeklyReminderNudge />

        <BudgetBar />

        <QuickActions />
      </div>

      <BudgetSetupModal />
      <BudgetDrawer />
    </>
  )
}
