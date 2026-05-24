'use client'

import { SectionProfile } from '@/components/settings/SectionProfile'
import { SectionNotifications } from '@/components/settings/SectionNotifications'
import { SectionBilling } from '@/components/settings/SectionBilling'
import { SectionSecurity } from '@/components/settings/SectionSecurity'
import { SectionDangerZone } from '@/components/settings/SectionDangerZone'
import type { PlanId } from '@/lib/stripe/plans'

type NotifPrefs = {
  dinner_reminders: boolean
  weekly_plan_ready: boolean
  grocery_reminders: boolean
  leftover_alerts: boolean
  budget_alerts: boolean
  marketing: boolean
}

type Props = {
  firstName: string
  email: string
  currentPlan: PlanId
  planStatus: string | null
  renewsAt: string | null
  stripeCustomerId: string | null
  hasStripeCustomer: boolean
  notifPrefs: NotifPrefs
}

export function SettingsClient({
  firstName,
  email,
  currentPlan,
  planStatus,
  renewsAt,
  stripeCustomerId,
  hasStripeCustomer,
  notifPrefs,
}: Props) {
  return (
    <div className="space-y-6">
      <SectionProfile firstName={firstName} email={email} />
      <SectionNotifications prefs={notifPrefs} />
      <SectionSecurity />
      <SectionBilling
        currentPlan={currentPlan}
        planStatus={planStatus}
        renewsAt={renewsAt}
        stripeCustomerId={stripeCustomerId}
        hasStripeCustomer={hasStripeCustomer}
      />
      <SectionDangerZone />
    </div>
  )
}
