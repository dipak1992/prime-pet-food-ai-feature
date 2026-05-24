import { Skeleton } from '@/components/dashboard/shared/Skeleton'

export default function DashboardLoading() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* Budget bar skeleton */}
      <Skeleton className="h-14 rounded-2xl" />

      {/* Tonight + Leftovers */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-[420px] lg:col-span-2 rounded-3xl" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>

      {/* Week plan */}
      <Skeleton className="h-48 rounded-3xl" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </main>
  )
}
