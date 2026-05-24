'use client'

import Image from 'next/image'
import { Check, Lock, LockOpen, Plus, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/planStore'
import type { PlanDay } from '@/lib/plan/types'

type Props = {
  day: PlanDay
  onClick?: (day: PlanDay) => void
  onSwap?: (day: PlanDay) => void
  isDragging?: boolean
}

export function DayCell({ day, onClick, onSwap, isDragging }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleLock = usePlanStore((s) => s.toggleLock)
  const markCooked = usePlanStore((s) => s.markCooked)
  const clearDay = usePlanStore((s) => s.clearDay)

  const isEmpty = !day.recipe
  const isCooked = day.status === 'cooked'

  // ── Empty state ────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSwap?.(day)
        }}
        className={cn(
          'group flex flex-col items-center justify-center min-h-[200px] w-full',
          'rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800',
          'bg-neutral-50/50 dark:bg-neutral-900/50',
          'hover:border-[#D97757]/50 hover:bg-[#D97757]/5 transition-colors',
          'text-neutral-400 dark:text-neutral-500 hover:text-[#D97757]',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">
          {day.dayAbbrev}
        </p>
        <p className="text-[10px] mb-3">{day.dateLabel}</p>
        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
          <Plus className="w-4 h-4" />
        </div>
        <p className="text-xs">Add meal</p>
      </button>
    )
  }

  // ── Filled state ───────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden bg-white dark:bg-neutral-900',
        'ring-1 ring-neutral-200 dark:ring-neutral-800',
        'hover:ring-[#D97757]/40 transition-all',
        isDragging && 'shadow-2xl ring-[#D97757]/60',
        isCooked && 'opacity-75',
      )}
    >
      {/* Image */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(day)
        }}
        className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden block"
      >
        {day.recipe?.image ? (
          <Image
            src={day.recipe.image}
            alt={day.recipe.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 14vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">
            🍽️
          </div>
        )}

        {/* Cooked overlay */}
        {isCooked && (
          <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Day label */}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {day.dayAbbrev} · {day.dateLabel}
        </div>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLock(day.id)
          }}
          aria-label={day.locked ? 'Unlock this meal' : 'Lock this meal'}
          title={day.locked ? 'Unlock this meal' : 'Lock — Autopilot won\'t replace it'}
          className={cn(
            'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur transition-colors',
            day.locked
              ? 'bg-[#D97757] text-white'
              : 'bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100',
          )}
        >
          {day.locked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
        </button>

        {/* Cost badge */}
        {day.recipe && (
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            ${day.recipe.costTotal.toFixed(0)}
          </div>
        )}
      </button>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate leading-snug">
          {day.recipe!.name}
        </p>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          {day.recipe!.cookTimeMin} min · {day.recipe!.servings} servings
        </p>

        <div className="flex items-center justify-between mt-2">
          {!isCooked && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSwap?.(day)
              }}
              className="text-xs font-medium text-[#D97757] hover:text-[#C86646] transition-colors"
            >
              Swap →
            </button>
          )}
          {isCooked && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Cooked ✓
            </span>
          )}

          {/* Overflow menu */}
          <div className="relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((o) => !o)
              }}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              aria-label="Day actions"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10"
                  aria-label="Close menu"
                  tabIndex={-1}
                />
                <div className="absolute right-0 bottom-full mb-1 z-20 bg-white dark:bg-neutral-900 rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800 py-1 min-w-[140px] text-sm">
                  {!isCooked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markCooked(day.id)
                        setMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark cooked
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearDay(day.id)
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear day
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
