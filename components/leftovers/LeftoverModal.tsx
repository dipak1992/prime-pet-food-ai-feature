'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, CheckCircle } from 'lucide-react'
import { useLeftoversStore } from '@/stores/leftoversStore'
import { LeftoverRecipeSuggestions } from './LeftoverRecipeSuggestions'
import type { Urgency } from '@/lib/leftovers/types'

const URGENCY_COLOR: Record<Urgency, string> = {
  fresh: 'text-emerald-700',
  soon: 'text-amber-700',
  today: 'text-red-700',
  expired: 'text-slate-500',
}

const URGENCY_LABEL: Record<Urgency, string> = {
  fresh: 'Fresh',
  soon: 'Use soon',
  today: 'Use today!',
  expired: 'Expired',
}

type Props = {
  isPlusMember: boolean
}

export function LeftoverModal({ isPlusMember }: Props) {
  const isModalOpen = useLeftoversStore((s) => s.isModalOpen)
  const selectedId = useLeftoversStore((s) => s.selectedId)
  const closeModal = useLeftoversStore((s) => s.closeModal)
  const getById = useLeftoversStore((s) => s.getById)
  const markUsed = useLeftoversStore((s) => s.markUsed)
  const markDiscarded = useLeftoversStore((s) => s.markDiscarded)

  const leftover = selectedId ? getById(selectedId) : null
  const urgency = leftover?.urgency ?? 'fresh'

  return (
    <AnimatePresence>
      {isModalOpen && leftover && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Sheet */}
          <motion.div
            key="modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white shadow-2xl"
            style={{ maxHeight: '90dvh', overflowY: 'auto' }}
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 bg-white px-5 pt-4 pb-2">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-orange-200" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-950 truncate pr-4">{leftover.name}</h2>
                <button
                  onClick={closeModal}
                  className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-orange-50 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-10 space-y-5">
              {/* Image */}
              {leftover.image && (
                <div className="overflow-hidden rounded-2xl h-40 w-full">
                  <img
                    src={leftover.image}
                    alt={leftover.name}
                    className="h-full w-full object-cover"
                    style={{
                      filter:
                        urgency === 'expired'
                          ? 'grayscale(100%) brightness(60%)'
                          : urgency === 'today'
                          ? 'saturate(60%)'
                          : 'none',
                    }}
                  />
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Servings</p>
                  <p className="text-lg font-bold text-slate-950">{leftover.servingsRemaining}</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-bold ${URGENCY_COLOR[urgency]}`}>
                    {URGENCY_LABEL[urgency]}
                  </p>
                </div>
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Days left</p>
                  <p className="text-lg font-bold text-slate-950">
                    {leftover.daysUntilExpiry != null && leftover.daysUntilExpiry < 0
                      ? '—'
                      : leftover.daysUntilExpiry ?? '—'}
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              {leftover.mainIngredients.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Main Ingredients
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {leftover.mainIngredients.map((ing) => {
                      const name = typeof ing === 'string' ? ing : ing.name
                      return (
                      <span
                        key={name}
                        className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-slate-600"
                      >
                        {name}
                      </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {leftover.notes && (
                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs text-slate-500">{leftover.notes}</p>
                </div>
              )}

              {/* AI Suggestions */}
              {leftover.status === 'active' && (
                <LeftoverRecipeSuggestions
                  leftoverId={leftover.id}
                  leftoverName={leftover.name}
                />
              )}

              {/* Actions */}
              {leftover.status === 'active' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => markDiscarded(leftover.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-orange-100 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Discard
                  </button>
                  <button
                    onClick={() => markUsed(leftover.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark used
                  </button>
                </div>
              )}

              {leftover.status !== 'active' && (
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-sm text-slate-500">
                    {leftover.status === 'used' ? '✅ Marked as used' : '🗑 Discarded'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
