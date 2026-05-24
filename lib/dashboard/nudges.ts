import type { Nudge, NudgeVariant, DashboardPayload } from './types'

export const NUDGE_PRIORITY: Record<Nudge['type'], number> = {
  onboarding_incomplete: 100,
  leftover_expiring_today: 95,
  budget_alert: 90,
  free_scan_limit: 85,
  household_invite: 80,
  upgrade_prompt: 75,
  autopilot_education: 60,
  sunday_plan_ritual: 58,
  weekday_dinner_reminder: 57,
  pantry_scan_reminder: 55,
  weekly_savings_recap: 54,
  predictive_household_intelligence: 53,
  referral: 50,
}

const NUDGE_VARIANT: Record<Nudge['type'], NudgeVariant> = {
  onboarding_incomplete: 'info',
  leftover_expiring_today: 'warning',
  budget_alert: 'danger',
  free_scan_limit: 'promo',
  household_invite: 'info',
  upgrade_prompt: 'promo',
  autopilot_education: 'info',
  sunday_plan_ritual: 'info',
  weekday_dinner_reminder: 'info',
  pantry_scan_reminder: 'info',
  weekly_savings_recap: 'success',
  predictive_household_intelligence: 'info',
  referral: 'success',
}

/** Legacy alias — kept for backward compatibility */
export function pickNudge(
  candidates: Nudge[],
  dismissed: string[] = []
): Nudge | null {
  const available = candidates.filter((n) => !dismissed.includes(n.id))
  if (available.length === 0) return null
  return available.sort((a, b) => b.priority - a.priority)[0]
}

/**
 * Full nudge priority engine.
 * Evaluates all 9 nudge types and returns the highest-priority non-dismissed nudge.
 */
export function selectNudge(
  ctx: Pick<
    DashboardPayload,
    'user' | 'leftovers' | 'budget' | 'limits' | 'household' | 'retention'
    | 'predictiveInsights'
  >,
  dismissed: string[] = []
): Nudge | null {
  const candidates = buildNudgeCandidates(ctx)
  return pickNudge(candidates, dismissed)
}

export function buildNudgeCandidates(
  ctx: Pick<
    DashboardPayload,
    'user' | 'leftovers' | 'budget' | 'limits' | 'household' | 'retention'
    | 'predictiveInsights'
  >
): Nudge[] {
  const candidates: Nudge[] = []

  // 1. Onboarding incomplete — highest priority
  if (!ctx.user.onboardingComplete) {
    candidates.push({
      id: 'nudge-onboarding',
      type: 'onboarding_incomplete',
      priority: NUDGE_PRIORITY.onboarding_incomplete,
      title: 'Finish setting up',
      body: 'Two minutes and your suggestions get dramatically better.',
      ctaLabel: 'Finish setup',
      ctaHref: '/onboarding',
      dismissible: false,
      variant: NUDGE_VARIANT.onboarding_incomplete,
    })
  }

  // 2. Leftover expiring today
  const urgent = ctx.leftovers.active.find((l) => l.urgency === 'today')
  if (urgent) {
    candidates.push({
      id: `nudge-leftover-${urgent.id}`,
      type: 'leftover_expiring_today',
      priority: NUDGE_PRIORITY.leftover_expiring_today,
      title: 'Use it tonight',
      body: `Your ${urgent.name.toLowerCase()} expires today. Want three quick meals that use it?`,
      ctaLabel: 'Show meals',
      ctaHref: '/leftovers',
      dismissible: true,
      variant: NUDGE_VARIANT.leftover_expiring_today,
    })
  }

  // 3. Budget alert
  if (ctx.budget.alertLevel === 'over' || ctx.budget.percentUsed >= 90) {
    candidates.push({
      id: 'nudge-budget',
      type: 'budget_alert',
      priority: NUDGE_PRIORITY.budget_alert,
      title:
        ctx.budget.alertLevel === 'over'
          ? "You're over budget"
          : "90% of this week's budget used",
      body: 'Want us to swap the rest of the week to lower-cost meals?',
      ctaLabel: 'Adjust plan',
      ctaHref: '/planner?mode=budget',
      dismissible: true,
      variant: NUDGE_VARIANT.budget_alert,
    })
  }

  // 4. Free scan limit reached
  if (
    ctx.user.plan === 'free' &&
    ctx.limits.scansUsed >= ctx.limits.scansLimit
  ) {
    candidates.push({
      id: 'nudge-scan-limit',
      type: 'free_scan_limit',
      priority: NUDGE_PRIORITY.free_scan_limit,
      title: "You're out of free scans this month",
      body: 'Unlimited fridge scans on Plus — plus leftovers and budget tracking.',
      ctaLabel: 'See Plus',
      ctaHref: '/upgrade?feature=scan',
      dismissible: true,
      variant: NUDGE_VARIANT.free_scan_limit,
    })
  }

  // 5. Household invite (free users with single member)
  if (ctx.user.plan === 'free' && ctx.household.memberCount === 1) {
    candidates.push({
      id: 'nudge-household-invite',
      type: 'household_invite',
      priority: NUDGE_PRIORITY.household_invite,
      title: 'Cook together',
      body: 'Invite your partner or family to share meal plans and grocery lists.',
      ctaLabel: 'Invite a co-chef',
      ctaHref: '/dashboard/household',
      dismissible: true,
      variant: NUDGE_VARIANT.household_invite,
    })
  }

  // 6. Upgrade prompt (free users who have been around a while)
  if (ctx.user.plan === 'free') {
    const createdAt = new Date(ctx.user.createdAt)
    const daysSinceJoin = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceJoin >= 7) {
      candidates.push({
        id: 'nudge-upgrade',
        type: 'upgrade_prompt',
        priority: NUDGE_PRIORITY.upgrade_prompt,
        title: 'Unlock the full kitchen',
        body: 'Budget tracking, unlimited scans, autopilot meal planning — all on Plus.',
        ctaLabel: 'Upgrade to Plus',
        ctaHref: '/upgrade',
        dismissible: true,
        variant: NUDGE_VARIANT.upgrade_prompt,
      })
    }
  }

  // 7. Sunday planning ritual
  if (ctx.retention.isSunday && ctx.retention.plannedDays < 3) {
    candidates.push({
      id: 'nudge-sunday-plan',
      type: 'sunday_plan_ritual',
      priority: NUDGE_PRIORITY.sunday_plan_ritual,
      title: 'Set up the week',
      body: 'Sunday is a good moment to plan dinners before the week starts moving.',
      ctaLabel: 'Plan this week',
      ctaHref: '/planner',
      dismissible: true,
      variant: NUDGE_VARIANT.sunday_plan_ritual,
    })
  }

  // 8. Weekday dinner reminder
  if (!ctx.retention.isSunday && ctx.retention.isDinnerWindow && ctx.retention.plannedDays < 7) {
    candidates.push({
      id: 'nudge-dinner-reminder',
      type: 'weekday_dinner_reminder',
      priority: NUDGE_PRIORITY.weekday_dinner_reminder,
      title: "Dinner window is here",
      body: 'Pick tonight now, then let leftovers and groceries update around it.',
      ctaLabel: 'Open Tonight',
      ctaHref: '/dashboard',
      dismissible: true,
      variant: NUDGE_VARIANT.weekday_dinner_reminder,
    })
  }

  // 9. Pantry scan reminder (no scans used yet)
  if (ctx.limits.scansUsed === 0) {
    candidates.push({
      id: 'nudge-pantry-scan',
      type: 'pantry_scan_reminder',
      priority: NUDGE_PRIORITY.pantry_scan_reminder,
      title: 'Snap your fridge',
      body: 'Point your camera at your fridge and we\'ll suggest meals from what you have.',
      ctaLabel: 'Try it now',
      ctaHref: '/dashboard/cook',
      dismissible: true,
      variant: NUDGE_VARIANT.pantry_scan_reminder,
    })
  }

  // 10. Weekly savings recap
  if (
    ctx.retention.estimatedSavedThisWeek > 0 &&
    ctx.user.plan !== 'free'
  ) {
    candidates.push({
      id: 'nudge-savings-recap',
      type: 'weekly_savings_recap',
      priority: NUDGE_PRIORITY.weekly_savings_recap,
      title: 'You are under budget',
      body: `MealEase helped protect about $${ctx.retention.estimatedSavedThisWeek.toFixed(0)} this week${ctx.retention.leftoverMealsReusedThisWeek > 0 ? ` and reused ${ctx.retention.leftoverMealsReusedThisWeek} leftover meal${ctx.retention.leftoverMealsReusedThisWeek === 1 ? '' : 's'}` : ''}.`,
      ctaLabel: 'See savings',
      ctaHref: '/budget?tab=swaps',
      dismissible: true,
      variant: NUDGE_VARIANT.weekly_savings_recap,
    })
  }

  // 11. Predictive household intelligence
  const topPrediction = ctx.predictiveInsights[0]
  if (topPrediction && ctx.user.plan !== 'free') {
    candidates.push({
      id: `nudge-predictive-${topPrediction.id}`,
      type: 'predictive_household_intelligence',
      priority: NUDGE_PRIORITY.predictive_household_intelligence,
      title: topPrediction.title,
      body: topPrediction.body,
      ctaLabel: topPrediction.ctaLabel,
      ctaHref: topPrediction.ctaHref,
      dismissible: true,
      variant: NUDGE_VARIANT.predictive_household_intelligence,
    })
  }

  // 12. Referral (plus users who have been active for 14+ days)
  if (ctx.user.plan === 'plus') {
    const createdAt = new Date(ctx.user.createdAt)
    const daysSinceJoin = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceJoin >= 14) {
      candidates.push({
        id: 'nudge-referral',
        type: 'referral',
        priority: NUDGE_PRIORITY.referral,
        title: 'Share MealEase with a friend',
        body: 'Know someone who struggles with "what\'s for dinner?" — send them a link.',
        ctaLabel: 'Share',
        ctaHref: '/referral',
        dismissible: true,
        variant: NUDGE_VARIANT.referral,
      })
    }
  }

  return candidates
}
