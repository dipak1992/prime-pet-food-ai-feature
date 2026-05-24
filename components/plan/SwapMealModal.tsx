'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Sparkles, Recycle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanDay, SwapCandidate } from '@/lib/plan/types'
import { usePlanStore } from '@/stores/planStore'

type Props = {
  day: PlanDay | null
  onOpenChange: (next: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SwapMealModal({ day, onOpenChange }: Props) {
  const swap = usePlanStore((s) => s.swapDay)
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<SwapCandidate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [committing, setCommitting] = useState<string | null>(null)

  const isOpen = !!day

  useEffect(() => {
    if (!day) {
      setCandidates([])
      setError(null)
      return
    }
    loadCandidates(day.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.id])

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onOpenChange])

  async function loadCandidates(dayId: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/plan/${dayId}/swap`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCandidates(data.candidates ?? [])
    } catch {
      setError("We couldn't load alternatives right now. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePick(candidate: SwapCandidate) {
    if (!day) return
    setCommitting(candidate.recipe.id)
    const ok = await swap(day.id, candidate.recipe.id)
    setCommitting(null)
    if (ok) onOpenChange(false)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="swap-modal-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={cn(
          'relative w-full md:max-w-[560px] bg-white dark:bg-neutral-900',
          'rounded-t-3xl md:rounded-3xl shadow-2xl',
          'max-h-[90vh] flex flex-col overflow-hidden',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2
              id="swap-modal-title"
              className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50"
            >
              Swap {day?.dayLabel ?? 'meal'}
            </h2>
            {day?.recipe && (
              <p className="text-xs text-neutral-500 mt-0.5">
                Currently: {day.recipe.name}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <SkeletonList />}

          {error && (
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-5 text-center">
              <p className="text-sm text-neutral-700 dark:text-neutral-200">{error}</p>
              <button
                onClick={() => day && loadCandidates(day.id)}
                className="mt-3 text-sm font-medium text-[#D97757] hover:text-[#C86646] transition-colors"
              >
                Try again →
              </button>
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-8">
              No alternatives right now. Try a fridge scan for fresh ideas.
            </p>
          )}

          {!loading && candidates.length > 0 && (
            <ul className="space-y-3">
              {candidates.map((c) => (
                <li key={c.recipe.id}>
                  <button
                    onClick={() => handlePick(c)}
                    disabled={committing !== null}
                    className={cn(
                      'w-full text-left group flex items-start gap-3 p-3 rounded-2xl transition-colors',
                      'bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'ring-1 ring-neutral-200 dark:ring-neutral-800',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      committing === c.recipe.id && 'ring-[#D97757]',
                    )}
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                      {c.recipe.image ? (
                        <Image
                          src={c.recipe.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl opacity-50">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                          {c.recipe.name}
                        </h3>
                        <span className="text-sm font-semibold shrink-0 tabular-nums text-neutral-700 dark:text-neutral-200">
                          ${c.recipe.costTotal.toFixed(0)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.recipe.cookTimeMin} min
                        </span>
                        <span>·</span>
                        <span>{c.recipe.servings} servings</span>
                        <span className="capitalize">· {c.recipe.difficulty}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.usesLeftover && (
                          <Badge icon={<Recycle className="w-3 h-3" />} color="emerald">
                            Uses leftovers
                          </Badge>
                        )}
                        {c.withinBudget && (
                          <Badge icon={<DollarSign className="w-3 h-3" />} color="neutral">
                            Within budget
                          </Badge>
                        )}
                        {c.matchScore > 0.8 && (
                          <Badge icon={<Sparkles className="w-3 h-3" />} color="terracotta">
                            Top pick
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-snug">
                        {c.reason}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({
  icon,
  children,
  color,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  color: 'emerald' | 'neutral' | 'terracotta'
}) {
  const classes = {
    emerald: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    terracotta: 'bg-[#D97757]/10 text-[#D97757]',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
        classes[color],
      )}
    >
      {icon}
      {children}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      ))}
    </ul>
  )
}
