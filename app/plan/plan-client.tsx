'use client'

import { useEffect, useState } from 'react'
import { usePlanStore } from '@/stores/planStore'
import type { WeekPlan, PlanDay } from '@/lib/plan/types'
import { PlanHeader } from '@/components/plan/PlanHeader'
import { WeekGrid } from '@/components/plan/WeekGrid'
import { AutopilotRunner } from '@/components/plan/AutopilotRunner'
import { SwapMealModal } from '@/components/plan/SwapMealModal'
import { GroceryListSheet } from '@/components/plan/GroceryListSheet'

type Props = {
  initialPlan: WeekPlan
}

export function PlanClient({ initialPlan }: Props) {
  const hydrate = usePlanStore((s) => s.hydrate)
  const hydrated = usePlanStore((s) => s.hydrated)

  const [swapDay, setSwapDay] = useState<PlanDay | null>(null)
  const [groceryOpen, setGroceryOpen] = useState(false)

  // Hydrate store once on mount
  useEffect(() => {
    hydrate(initialPlan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#D97757] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Header: week nav + stats + grocery button */}
        <PlanHeader onOpenGrocery={() => setGroceryOpen(true)} />

        {/* 7-day drag-and-drop grid */}
        <WeekGrid onSwapClick={(day: PlanDay) => setSwapDay(day)} />

        {/* Autopilot CTA / running / summary */}
        <AutopilotRunner />
      </div>

      {/* Swap meal bottom-sheet */}
      <SwapMealModal
        day={swapDay}
        onOpenChange={(open) => {
          if (!open) setSwapDay(null)
        }}
      />

      {/* Grocery list bottom-sheet */}
      <GroceryListSheet
        open={groceryOpen}
        onOpenChange={setGroceryOpen}
      />
    </main>
  )
}
