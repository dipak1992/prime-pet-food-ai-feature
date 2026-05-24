'use client'

import { WeeklyPlannerV2 } from '@/components/planner/WeeklyPlannerV2'

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.10),transparent_32%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_36%,#f8fafc_100%)] px-4 py-6 pb-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
      <WeeklyPlannerV2 />
      </div>
    </main>
  )
}
