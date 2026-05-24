import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { getLeftoversPayload } from './loader'
import { LeftoversClient } from './leftovers-client'

export const metadata = { title: 'Leftovers — MealEase AI' }

export default async function LeftoversPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const paywall = await getPaywallStatus()
  const { leftovers, insights } = await getLeftoversPayload(user.id)

  return (
    <LeftoversClient
      initialLeftovers={leftovers}
      initialInsights={insights}
      isPlusMember={paywall.isPro}
    />
  )
}
