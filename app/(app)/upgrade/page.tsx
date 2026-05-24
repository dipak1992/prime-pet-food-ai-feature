import { redirect } from 'next/navigation'
import { getPaywallStatus } from '@/lib/paywall/server'
import { UpgradeClient } from './upgrade-client'

export const metadata = {
  title: 'Upgrade to Plus — MealEase',
  description: 'Upgrade to MealEase Plus when it can recover its cost through fewer takeout nights, less food waste, smarter groceries, and budget-aware planning.',
}

const FEATURE_REDIRECTS: Record<string, string> = {
  budget: '/budget',
  grocery: '/grocery-list',
  household: '/dashboard/household',
  leftovers: '/leftovers',
  planner: '/planner',
  weekly_autopilot: '/planner',
  scan: '/dashboard/cook',
  guided_cooking: '/dashboard/tonight',
  insights: '/insights',
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams?: Promise<{ feature?: string }>
}) {
  const status = await getPaywallStatus()
  const resolvedSearchParams = await searchParams
  const feature = resolvedSearchParams?.feature

  if (status.isPro) {
    redirect(FEATURE_REDIRECTS[feature ?? ''] ?? '/dashboard')
  }

  return <UpgradeClient isAuthenticated={status.isAuthenticated} />
}
