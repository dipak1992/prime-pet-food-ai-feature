import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from './onboarding-client'

export const metadata = {
  title: 'Get started — NutriNest AI',
  description: 'Set up your household preferences in under 2 minutes.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If already onboarded, skip to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single()

  if (profile?.has_completed_onboarding) redirect('/dashboard')

  return <OnboardingClient />
}
