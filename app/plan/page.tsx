import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Planner | MealEase',
  description: 'Plan your week of dinners with MealEase Autopilot.',
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ weekStart?: string }>
}) {
  const { weekStart } = await searchParams
  const target = weekStart
    ? `/planner?weekStart=${encodeURIComponent(weekStart)}`
    : '/planner'

  redirect(target)
}
