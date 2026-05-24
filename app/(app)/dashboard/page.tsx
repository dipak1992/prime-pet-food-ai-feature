import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewDashboardClient } from './new-dashboard-client'
import { getDashboardPayload } from '@/app/api/dashboard/route'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard – MealEase' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload = await getDashboardPayload(user.id)

  return <NewDashboardClient initial={payload} />
}
