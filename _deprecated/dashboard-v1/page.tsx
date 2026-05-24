import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHub } from '@/components/hub/DashboardHub'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { NewDashboardClient } from './new-dashboard-client'
import { getDashboardPayload } from '@/app/api/dashboard/route'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard – MealEase' }

function toDisplayName(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value
    .trim()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
  return cleaned.length > 0 ? cleaned : null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload = await getDashboardPayload(user.id)

  return (
    <>
      <DashboardNav />
      <NewDashboardClient initial={payload} />
    </>
  )
}
