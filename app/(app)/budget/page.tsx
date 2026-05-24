import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { loadBudgetPayload } from './loader'
import { BudgetClient } from './budget-client'

export const metadata = {
  title: 'Budget Intelligence | MealEase',
  description: 'Track your weekly food spending and get smart meal swap suggestions.',
}

export default async function BudgetPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const paywall = await getPaywallStatus()
  const plan = paywall.isPro ? 'plus' : 'free'

  const payload = await loadBudgetPayload(user.id, plan)

  return <BudgetClient initial={payload} />
}
