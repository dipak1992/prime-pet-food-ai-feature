import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OneShotSuggestion } from '@/components/tonight/OneShotSuggestion'

export const metadata = { title: 'Tonight – MealEase' }

export default async function DecidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <OneShotSuggestion mode="tonight" />
}
