'use client'

import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePlanStore } from '@/stores/planStore'
import { DayCell } from './DayCell'
import type { PlanDay } from '@/lib/plan/types'

type Props = {
  onDayClick?: (day: PlanDay) => void
  onSwapClick?: (day: PlanDay) => void
}

export function WeekGrid({ onDayClick, onSwapClick }: Props) {
  const days = usePlanStore((s) => s.plan?.days ?? [])
  const reorder = usePlanStore((s) => s.reorderDays)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const ids = useMemo(() => days.map((d) => d.id), [days])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = days.findIndex((d) => d.id === active.id)
    const newIndex = days.findIndex((d) => d.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Refuse reorders that move a cooked/locked day
    const moving = days[oldIndex]
    if (moving.status === 'cooked' || moving.locked) return

    const reordered = arrayMove(days, oldIndex, newIndex)
    reorder(reordered.map((d: PlanDay) => d.id))
  }

  if (days.length === 0) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
          {days.map((day) => (
            <SortableDay
              key={day.id}
              day={day}
              onClick={onDayClick}
              onSwap={onSwapClick}
            />
          ))}
        </div>
      </SortableContext>

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Drag to reorder days · Locked days stay put
      </p>
    </DndContext>
  )
}

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

function SortableDay({
  day,
  onClick,
  onSwap,
}: {
  day: PlanDay
  onClick?: (day: PlanDay) => void
  onSwap?: (day: PlanDay) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: day.id,
    disabled: day.status === 'cooked' || day.locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <DayCell day={day} onClick={onClick} onSwap={onSwap} isDragging={isDragging} />
    </div>
  )
}
