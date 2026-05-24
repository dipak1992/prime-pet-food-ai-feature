import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { quickActionsConfig } from '@/config/quick-actions'
import { getGreeting } from '@/lib/dashboard/greeting'
import { calcBudget } from '@/lib/dashboard/budget'
import { getTonightSuggestion } from '@/lib/dashboard/tonight-intelligence'
import { buildNudgeCandidates, pickNudge } from '@/lib/dashboard/nudges'
import { loadBudgetPayload } from '@/app/(app)/budget/loader'
import { getDaysUntilExpiry, getUrgency } from '@/lib/leftovers/expiration-calculator'
import type {
  DashboardPayload,
  AutonomousAction,
  Leftover,
  Plan,
  PredictiveInsight,
} from '@/lib/dashboard/types'
import { getHouseholdForUser } from '@/lib/family/service'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getDashboardPayload(user.id)
  return NextResponse.json(payload)
}

/**
 * Shared loader used by both the API route and the server page.
 * TODO: Replace mock blocks with real Supabase queries as schema lands.
 */
export async function getDashboardPayload(
  userId: string
): Promise<DashboardPayload> {
  const supabase = await createClient()

  // --- Real profile fetch ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_tier, plan, onboarding_complete, created_at')
    .eq('id', userId)
    .maybeSingle()

  const emailRes = await supabase.auth.getUser()
  const authUser = emailRes.data.user
  const email = authUser?.email ?? ''
  const emailPrefix = email.split('@')[0]

  const rawName =
    profile?.full_name ??
    emailPrefix ??
    'there'

  // Extract first name only
  const firstName = rawName.trim().split(/[\s._-]/)[0] ?? 'there'

  // Map subscription_tier to Plan
  const tierMap: Record<string, Plan> = {
    pro: 'plus',
    plus: 'plus',
    free: 'free',
  }
  const plan: Plan =
    tierMap[profile?.subscription_tier ?? 'free'] ??
    tierMap[profile?.plan ?? 'free'] ??
    'free'

  // Onboarding complete — default true if column doesn't exist yet
  const onboardingComplete: boolean = profile?.onboarding_complete ?? true

  // User creation date — prefer auth metadata, fall back to profile, then now
  const createdAt: string =
    authUser?.created_at ??
    profile?.created_at ??
    new Date().toISOString()

  const greetingInfo = getGreeting()

  const tonight = await getTonightSuggestion(supabase, userId, plan)

  const leftovers = await loadDashboardLeftovers(userId)

  let budget = calcBudget(null, 0)
  try {
    const budgetPayload = await loadBudgetPayload(userId, plan === 'free' ? 'free' : 'plus')
    budget = calcBudget(
      budgetPayload.settings.weeklyLimit,
      budgetPayload.currentWeek.spent,
    )
  } catch {
    // Honest fallback: no budget data connected yet.
  }

  const household = await loadHouseholdSummary(userId)
  const scansLimit = plan === 'free' ? 5 : 999
  const scansUsed = await loadScanCount(userId)
  const limits = {
    scansUsed,
    scansLimit,
    scansRemaining: Math.max(0, scansLimit - scansUsed),
  }

  const quickActions = quickActionsConfig.map((a) => {
    let status: string | undefined
    if (a.id === 'leftovers')
      status = leftovers.length > 0 ? `${leftovers.length} item${leftovers.length === 1 ? '' : 's'}` : undefined
    if (a.id === 'scan' && plan === 'free')
      status = `${limits.scansRemaining} scans left`
    return { ...a, status }
  })

  const _now = new Date()
  const _hour = _now.getHours()
  const weekStart = getWeekStartDate(_now)
  const [plannedDays, leftoverMealsReusedThisWeek, behaviorSignalsLearned] = await Promise.all([
    loadPlannedDays(userId, weekStart),
    loadLeftoversReusedThisWeek(userId, weekStart),
    loadBehaviorSignalsLearned(userId),
  ])
  const weeklyBudgetRemaining =
    budget.weeklyLimit != null
      ? Math.max(0, budget.weeklyLimit - budget.weekSpent)
      : null

  const estimatedSavedThisWeek = Math.round(
    (weeklyBudgetRemaining ?? 0) + leftoverMealsReusedThisWeek * 6,
  )
  const projectedMonthlySavings = Math.round(estimatedSavedThisWeek * 4.33)
  const monthlyPlusPrice = 9.99
  const subscriptionOffsetRatio =
    estimatedSavedThisWeek > 0
      ? Math.min(9.99, Math.round((projectedMonthlySavings / monthlyPlusPrice) * 100) / 100)
      : null

  const predictiveInsights = await loadPredictiveInsights({
    userId,
    weekStart,
    plannedDays,
    budget,
    leftovers,
    behaviorSignalsLearned,
    now: _now,
  })
  const autonomousActions = await loadAutonomousActions({
    userId,
    weekStart,
    plannedDays,
    budget,
    leftovers,
    predictiveInsights,
    householdMemberCount: household.memberCount,
    estimatedSavedThisWeek,
    now: _now,
  })

  const base: DashboardPayload = {
    user: {
      id: userId,
      firstName,
      plan,
      hasSeenTour: true,
      onboardingComplete,
      createdAt,
    },
    greeting: greetingInfo,
    tonight,
    leftovers: {
      active: leftovers,
      expiringSoon: leftovers.filter((l) => l.daysUntilExpiry <= 2),
      suggestedRecipes: [],
    },
    budget,
    retention: {
      expiringSoon: leftovers.filter((l) => l.daysUntilExpiry <= 2).length,
      isSunday: _now.getDay() === 0,
      isDinnerWindow: _hour >= 16 && _hour < 20,
      plannedDays,
      weeklyBudgetRemaining,
      leftoverMealsReusedThisWeek,
      estimatedSavedThisWeek,
      projectedMonthlySavings,
      subscriptionOffsetRatio,
      behaviorSignalsLearned,
    },
    quickActions,
    nudge: null,
    household,
    limits,
    predictiveInsights,
    autonomousActions,
  }

  const nudges = buildNudgeCandidates(base)
  base.nudge = pickNudge(nudges)

  return base
}

async function loadAutonomousActions({
  userId,
  weekStart,
  plannedDays,
  budget,
  leftovers,
  predictiveInsights,
  householdMemberCount,
  estimatedSavedThisWeek,
  now,
}: {
  userId: string
  weekStart: string
  plannedDays: number
  budget: DashboardPayload['budget']
  leftovers: Leftover[]
  predictiveInsights: PredictiveInsight[]
  householdMemberCount: number
  estimatedSavedThisWeek: number
  now: Date
}): Promise<AutonomousAction[]> {
  const persisted = await loadPersistedAutonomousActions(userId, weekStart)
  if (persisted.length > 0) return persisted

  const actions: AutonomousAction[] = []
  const createdAt = now.toISOString()
  const budgetRemaining =
    budget.weeklyLimit != null ? budget.weeklyLimit - budget.weekSpent : null

  if (budgetRemaining != null && budgetRemaining < 0) {
    actions.push({
      id: `budget-rebalance-${weekStart}`,
      actionType: 'budget_rebalance',
      title: `You are $${Math.abs(Math.round(budgetRemaining))} over budget this week`,
      body: 'MealEase can rebalance the remaining dinners toward cheaper pantry-heavy meals before the next grocery run.',
      ctaLabel: 'Review budget swaps',
      ctaHref: '/budget?tab=swaps&source=autonomous',
      status: 'proposed',
      impactUsd: Math.abs(Math.round(budgetRemaining)),
      confidence: 'high',
      createdAt,
    })
  }

  const urgentLeftover = leftovers.find((leftover) => leftover.daysUntilExpiry <= 1)
  if (urgentLeftover) {
    actions.push({
      id: `leftover-rescue-${urgentLeftover.id}`,
      actionType: 'leftover_rescue',
      title: `Rescue ${urgentLeftover.name.toLowerCase()} before it expires`,
      body: 'MealEase can bias tonight and tomorrow lunch around this leftover instead of letting it become waste.',
      ctaLabel: 'Use leftovers',
      ctaHref: '/leftovers?source=autonomous',
      status: 'proposed',
      impactUsd: Math.max(6, urgentLeftover.servingsRemaining * 4),
      confidence: 'high',
      createdAt,
    })
  }

  const quickDinnerPrediction = predictiveInsights.find((insight) => insight.type === 'quick_dinner_night')
  if (quickDinnerPrediction) {
    actions.push({
      id: `timing-adjustment-${weekStart}`,
      actionType: 'timing_adjustment',
      title: 'I can make the late-week dinner lighter',
      body: 'Thursday or Friday should be a quick dinner slot based on your current plan gaps. Review the adjustment before it changes the week.',
      ctaLabel: 'Adjust planner',
      ctaHref: '/planner?mode=quick&source=autonomous',
      status: 'proposed',
      impactUsd: null,
      confidence: 'medium',
      createdAt,
    })
  }

  if (plannedDays >= 3 && predictiveInsights.some((insight) => insight.type === 'grocery_budget')) {
    actions.push({
      id: `grocery-prepare-${weekStart}`,
      actionType: 'grocery_prepare',
      title: 'Your grocery handoff is ready to prepare',
      body: 'MealEase can move this week from plan to store-ready list with pantry deductions, provider comparison, and household visibility.',
      ctaLabel: 'Prepare groceries',
      ctaHref: '/grocery-list?source=autonomous',
      status: 'proposed',
      impactUsd: estimatedSavedThisWeek > 0 ? estimatedSavedThisWeek : null,
      confidence: 'medium',
      createdAt,
    })
  }

  if (householdMemberCount > 1) {
    actions.push({
      id: `collaboration-${weekStart}`,
      actionType: 'collaboration_prompt',
      title: 'Ask the household to approve the week',
      body: `${householdMemberCount} profiles can coordinate meal approvals, grocery changes, and handoffs from the same workspace.`,
      ctaLabel: 'Open household',
      ctaHref: '/dashboard/household?source=autonomous',
      status: 'proposed',
      impactUsd: null,
      confidence: 'medium',
      createdAt,
    })
  }

  return actions
    .sort((a, b) => (b.impactUsd ?? 0) - (a.impactUsd ?? 0))
    .slice(0, 3)
}

async function loadPersistedAutonomousActions(
  userId: string,
  weekStart: string,
): Promise<AutonomousAction[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('household_autonomous_actions')
      .select('id, action_type, title, body, cta_label, cta_href, status, impact_usd, confidence, created_at')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .eq('status', 'proposed')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) return []

    return (data ?? []).map((row: any) => ({
      id: String(row.id),
      actionType: row.action_type as AutonomousAction['actionType'],
      title: String(row.title ?? 'Review autonomous action'),
      body: String(row.body ?? ''),
      ctaLabel: String(row.cta_label ?? 'Review'),
      ctaHref: String(row.cta_href ?? '/dashboard'),
      status: row.status as AutonomousAction['status'],
      impactUsd: row.impact_usd == null ? null : Number(row.impact_usd),
      confidence: row.confidence as AutonomousAction['confidence'],
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }))
  } catch {
    return []
  }
}

async function loadHouseholdSummary(userId: string): Promise<DashboardPayload['household']> {
  const supabase = await createClient()

  try {
    const household = await getHouseholdForUser(supabase as any, userId)
    if (!household?.id) return { memberCount: 1, maxMembers: 6 }

    const { count, error } = await supabase
      .from('household_members')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', household.id)

    if (error) return { memberCount: 1, maxMembers: Number(household.max_members ?? 6) || 6 }
    return {
      memberCount: Math.max(1, count ?? 1),
      maxMembers: Number(household.max_members ?? 6) || 6,
    }
  } catch {
    return { memberCount: 1, maxMembers: 6 }
  }
}

async function loadPredictiveInsights({
  userId,
  weekStart,
  plannedDays,
  budget,
  leftovers,
  behaviorSignalsLearned,
  now,
}: {
  userId: string
  weekStart: string
  plannedDays: number
  budget: DashboardPayload['budget']
  leftovers: Leftover[]
  behaviorSignalsLearned: number
  now: Date
}): Promise<PredictiveInsight[]> {
  const [pantryItems, grocerySummary, memoryCount] = await Promise.all([
    loadPantrySignals(userId),
    loadGrocerySummary(userId, weekStart),
    loadMemoryCount(userId),
  ])

  const insights: PredictiveInsight[] = []
  const lowStaple = pantryItems.find((item) => {
    const name = item.name.toLowerCase()
    return item.quantity <= 1 && /milk|egg|bread|rice|yogurt|cheese|oat|banana/.test(name)
  })
  if (lowStaple) {
    insights.push({
      id: `low-${lowStaple.id}`,
      type: 'low_pantry',
      title: `You may be low on ${lowStaple.name}`,
      body: `Only ${formatQuantity(lowStaple.quantity, lowStaple.unit)} is logged. Add it before the next grocery handoff or pick a dinner that avoids it.`,
      ctaLabel: 'Open grocery list',
      ctaHref: '/grocery-list',
      confidence: 'medium',
      priority: 92,
    })
  }

  const expiringPantry = pantryItems.find((item) => item.daysUntilExpiry != null && item.daysUntilExpiry <= 2)
  if (expiringPantry) {
    insights.push({
      id: `expiry-${expiringPantry.id}`,
      type: 'pantry_expiry',
      title: `Use ${expiringPantry.name} soon`,
      body: expiringPantry.daysUntilExpiry === 0
        ? `${expiringPantry.name} expires today. Prioritize it in Tonight or Leftovers before buying more.`
        : `${expiringPantry.name} expires in ${expiringPantry.daysUntilExpiry} days. MealEase can bias the next plan around it.`,
      ctaLabel: 'Cook from pantry',
      ctaHref: '/dashboard/cook',
      confidence: 'high',
      priority: 90,
    })
  }

  const thursdayIsAhead = now.getDay() <= 4
  if (thursdayIsAhead && plannedDays < 4) {
    insights.push({
      id: 'quick-thursday',
      type: 'quick_dinner_night',
      title: 'Thursday should be a quick dinner night',
      body: 'Your week is not fully planned yet. Reserve one 20-minute meal before the late-week dinner scramble starts.',
      ctaLabel: 'Plan quick dinner',
      ctaHref: '/planner?mode=quick',
      confidence: 'medium',
      priority: 82,
    })
  }

  if (grocerySummary && grocerySummary.totalEstimatedCost > 0) {
    const budgetLimit = budget.weeklyLimit
    const pressure =
      budgetLimit != null && grocerySummary.totalEstimatedCost + budget.weekSpent > budgetLimit
    insights.push({
      id: 'grocery-cost',
      type: 'grocery_budget',
      title: pressure ? 'Grocery list may push the week over budget' : 'Your grocery cost is ready to compare',
      body: pressure
        ? `This list is estimated at $${grocerySummary.totalEstimatedCost.toFixed(0)} before checkout. Compare retailers or swap expensive dinners first.`
        : `$${grocerySummary.totalEstimatedCost.toFixed(0)} estimated across ${grocerySummary.itemCount} item${grocerySummary.itemCount === 1 ? '' : 's'}, with pantry items deducted where marked.`,
      ctaLabel: 'Compare stores',
      ctaHref: '/grocery-list',
      confidence: 'high',
      priority: pressure ? 88 : 72,
    })
  }

  if (memoryCount > 0 || behaviorSignalsLearned > 0) {
    const totalSignals = memoryCount + behaviorSignalsLearned
    insights.push({
      id: 'memory-active',
      type: 'memory',
      title: 'Household memory is active',
      body: `${totalSignals} durable signal${totalSignals === 1 ? '' : 's'} can guide dinners, grocery choices, timing, repeats, and avoid lists automatically.`,
      ctaLabel: 'Review household',
      ctaHref: '/dashboard/household',
      confidence: 'high',
      priority: leftovers.length > 0 ? 62 : 70,
    })
  }

  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}

type PantrySignal = {
  id: string
  name: string
  quantity: number
  unit: string
  daysUntilExpiry: number | null
}

async function loadPantrySignals(userId: string): Promise<PantrySignal[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('id, name, quantity, unit, expires_at')
      .eq('user_id', userId)
      .order('expires_at', { ascending: true, nullsFirst: false })
      .limit(30)

    if (error) return []
    return (data ?? []).map((item: any) => ({
      id: String(item.id),
      name: String(item.name ?? 'pantry item'),
      quantity: Number(item.quantity ?? 1) || 0,
      unit: String(item.unit ?? 'unit'),
      daysUntilExpiry: item.expires_at ? getDaysUntilExpiry(String(item.expires_at)) : null,
    }))
  } catch {
    return []
  }
}

async function loadGrocerySummary(
  userId: string,
  weekStart: string,
): Promise<{ totalEstimatedCost: number; itemCount: number } | null> {
  const supabase = await createClient()

  try {
    const { data: list, error: listError } = await supabase
      .from('grocery_lists')
      .select('id, total_estimated_cost')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (listError || !list?.id) return null

    const { count } = await supabase
      .from('grocery_items')
      .select('id', { count: 'exact', head: true })
      .eq('grocery_list_id', list.id)
      .eq('user_removed', false)

    return {
      totalEstimatedCost: Number(list.total_estimated_cost ?? 0) || 0,
      itemCount: count ?? 0,
    }
  } catch {
    return null
  }
}

async function loadMemoryCount(userId: string): Promise<number> {
  const supabase = await createClient()

  try {
    const { count, error } = await supabase
      .from('household_memory_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

async function loadBehaviorSignalsLearned(userId: string): Promise<number> {
  const supabase = await createClient()

  try {
    const { count, error } = await supabase
      .from('meal_signals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

function formatQuantity(quantity: number, unit: string): string {
  const rounded = Number.isInteger(quantity) ? quantity.toFixed(0) : quantity.toFixed(1)
  return `${rounded} ${unit}`.trim()
}

function getWeekStartDate(now = new Date()): string {
  const date = new Date(now)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

async function loadPlannedDays(userId: string, weekStart: string): Promise<number> {
  const supabase = await createClient()

  try {
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (!plan?.id) return 0

    const { count, error } = await supabase
      .from('meal_plan_days')
      .select('id', { count: 'exact', head: true })
      .eq('meal_plan_id', plan.id)
      .not('meal_id', 'is', null)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

async function loadLeftoversReusedThisWeek(userId: string, weekStart: string): Promise<number> {
  const supabase = await createClient()

  try {
    const { count, error } = await supabase
      .from('leftovers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'used')
      .gte('used_at', weekStart)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

async function loadDashboardLeftovers(userId: string): Promise<Leftover[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leftovers')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('expires_at', { ascending: true })
    .limit(10)

  if (error) {
    try {
      const { data: household } = await supabase
        .from('households')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle()

      if (!household?.id) return []

      const { data: householdRows, error: householdError } = await supabase
        .from('leftovers')
        .select('*')
        .eq('household_id', household.id)
        .eq('status', 'active')
        .order('expires_at', { ascending: true })
        .limit(10)

      if (householdError) return []
      return (householdRows ?? []).map(toDashboardLeftover)
    } catch {
      return []
    }
  }

  return (data ?? []).map(toDashboardLeftover)
}

function toDashboardLeftover(row: Record<string, unknown>): Leftover {
  const expiresAt =
    (row.expires_at as string | null) ??
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  const name =
    (row.name as string | null) ??
    (row.display_name as string | null) ??
    (row.source_recipe_name as string | null) ??
    'Cooked meal'

  return {
    id: String(row.id),
    name,
    image: (row.image as string | null) ?? '/landing/family-dinner.jpg',
    servingsRemaining:
      Number(row.servings_remaining ?? row.estimated_servings_remaining ?? 1) || 1,
    sourceRecipeId: String(row.source_recipe_id ?? row.source_meal_id ?? ''),
    createdAt:
      (row.created_at as string | null) ??
      (row.cooked_at as string | null) ??
      new Date().toISOString(),
    expiresAt,
    daysUntilExpiry: getDaysUntilExpiry(expiresAt),
    urgency: getUrgency(expiresAt),
  }
}

async function loadScanCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())

  if (error) return 0
  return count ?? 0
}
