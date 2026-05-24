'use client'

import { usePlannerStore } from '@/lib/store'
import { MealCard } from '@/components/meals/MealCard'
import { DAY_NAMES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PlanDay } from '@/types'

interface WeeklyGridProps {
  days: PlanDay[]
  onRegenerate?: (mealId: string, dayIndex: number) => void
  regeneratingId?: string | null
}

export function WeeklyGrid({ days, onRegenerate, regeneratingId }: WeeklyGridProps) {
  const { selectedDayIndex, setSelectedDayIndex } = usePlannerStore()

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {days.map((day, i) => {
          const date = new Date(day.date)
          const isToday = new Date().toDateString() === date.toDateString()
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDayIndex(i)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors border',
                selectedDayIndex === i
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-border/60 hover:border-primary/40 bg-card'
              )}
            >
              <span className="text-xs opacity-75">{DAY_NAMES[i]}</span>
              <span className={cn('text-base font-bold', isToday && selectedDayIndex !== i && 'text-primary')}>{date.getDate()}</span>
              {isToday && <span className="text-xs opacity-75">Today</span>}
            </button>
          )
        })}
      </div>

      {/* Selected day meals */}
      {days[selectedDayIndex] && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {DAY_NAMES[selectedDayIndex]}&apos;s Meals
          </h3>
          {days[selectedDayIndex].meals?.length > 0 ? (
            days[selectedDayIndex].meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onRegenerate={onRegenerate ? (id) => onRegenerate(id, selectedDayIndex) : undefined}
                isRegenerating={regeneratingId === meal.id}
              />
            ))
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border/60 py-12 text-center text-muted-foreground">No meals planned for this day</div>
          )}
        </div>
      )}
    </div>
  )
}
