import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './settings-client'
import type { PlanId } from '@/lib/stripe/plans'
import { normalizeTier } from '@/lib/paywall/config'

export const metadata = {
  title: 'Settings — NutriNest AI',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, full_name, email, subscription_tier, plan, plan_status, plan_renews_at, stripe_customer_id, notification_prefs')
    .eq('id', user.id)
    .single()

  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? ''
  const email = profile?.email ?? user.email ?? ''
  const currentPlan: PlanId =
    normalizeTier(profile?.subscription_tier) === 'pro' || profile?.plan === 'plus'
      ? 'plus'
      : 'free'
  const planStatus = profile?.plan_status ?? null
  const renewsAt = profile?.plan_renews_at ?? null
  const stripeCustomerId = profile?.stripe_customer_id ?? null

  const notifPrefs = {
    dinner_reminders: true,
    weekly_plan_ready: true,
    grocery_reminders: true,
    leftover_alerts: true,
    budget_alerts: true,
    marketing: false,
    ...(profile?.notification_prefs as Record<string, boolean> ?? {}),
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.14),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#fefce8_28%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-slate-950">Settings</h1>
        <SettingsClient
          firstName={firstName}
          email={email}
          currentPlan={currentPlan}
          planStatus={planStatus}
          renewsAt={renewsAt}
          stripeCustomerId={stripeCustomerId}
          hasStripeCustomer={!!stripeCustomerId}
          notifPrefs={notifPrefs}
        />
      </div>
    </main>
  )
}
