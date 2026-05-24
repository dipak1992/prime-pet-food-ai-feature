'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Check, Copy, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/planStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type GroceryItem = {
  id: string
  name: string
  quantity: string
  unit: string
  category: string
  checked: boolean
  recipeNames: string[]
}

type GrocerySection = {
  category: string
  items: GroceryItem[]
}

type Props = {
  open: boolean
  onOpenChange: (next: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GroceryListSheet({ open, onOpenChange }: Props) {
  const plan = usePlanStore((s) => s.plan)
  const [sections, setSections] = useState<GrocerySection[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  // Load grocery list when sheet opens
  useEffect(() => {
    if (!open || !plan) return
    loadGroceryList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan?.id])

  async function loadGroceryList() {
    if (!plan) return
    setLoading(true)
    setError(null)
    try {
      const recipeIds = plan.days
        .filter((d) => d.recipe)
        .map((d) => d.recipe!.id)

      if (recipeIds.length === 0) {
        setSections([])
        return
      }

      const res = await fetch('/api/plan/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds, weekStart: plan.weekStart }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSections(data.sections ?? [])
      setChecked(new Set())
    } catch {
      setError("Couldn't load your grocery list. Try again.")
    } finally {
      setLoading(false)
    }
  }

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const checkedCount = checked.size

  async function handleCopy() {
    const lines: string[] = []
    for (const section of sections) {
      lines.push(`\n${section.category.toUpperCase()}`)
      for (const item of section.items) {
        const qty = [item.quantity, item.unit].filter(Boolean).join(' ')
        lines.push(`${checked.has(item.id) ? '✓' : '○'} ${qty ? `${qty} ` : ''}${item.name}`)
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n').trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="grocery-sheet-title"
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
              'relative w-full md:max-w-[520px] bg-white dark:bg-neutral-900',
              'rounded-t-3xl md:rounded-3xl shadow-2xl',
              'max-h-[90vh] flex flex-col overflow-hidden',
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D97757]/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[#D97757]" />
                </div>
                <div>
                  <h2
                    id="grocery-sheet-title"
                    className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50"
                  >
                    Grocery List
                  </h2>
                  {totalItems > 0 && (
                    <p className="text-xs text-neutral-500">
                      {checkedCount}/{totalItems} items
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Copy button */}
                {sections.length > 0 && (
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                      copied
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                )}

                {/* Close */}
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-6 h-6 text-[#D97757] animate-spin" />
                  <p className="text-sm text-neutral-500">Building your list…</p>
                </div>
              )}

              {error && !loading && (
                <div className="p-5 text-center">
                  <p className="text-sm text-neutral-700 dark:text-neutral-200">{error}</p>
                  <button
                    onClick={loadGroceryList}
                    className="mt-3 text-sm font-medium text-[#D97757] hover:text-[#C86646] transition-colors"
                  >
                    Try again →
                  </button>
                </div>
              )}

              {!loading && !error && sections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-5 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl">
                    🛒
                  </div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    No meals planned yet
                  </p>
                  <p className="text-xs text-neutral-500 max-w-[240px]">
                    Add some meals to your week and your grocery list will appear here.
                  </p>
                </div>
              )}

              {!loading && sections.length > 0 && (
                <div className="p-5 space-y-6">
                  {sections.map((section) => (
                    <div key={section.category}>
                      {/* Category header */}
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
                        {section.category}
                      </h3>

                      {/* Items */}
                      <ul className="space-y-1">
                        {section.items.map((item) => {
                          const isChecked = checked.has(item.id)
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => toggleItem(item.id)}
                                className={cn(
                                  'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors text-left',
                                  isChecked
                                    ? 'bg-neutral-50 dark:bg-neutral-800/40'
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40',
                                )}
                              >
                                {/* Checkbox */}
                                <div
                                  className={cn(
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                    isChecked
                                      ? 'bg-[#D97757] border-[#D97757]'
                                      : 'border-neutral-300 dark:border-neutral-600',
                                  )}
                                >
                                  {isChecked && <Check className="w-3 h-3 text-white" />}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={cn(
                                      'text-sm font-medium transition-colors',
                                      isChecked
                                        ? 'line-through text-neutral-400 dark:text-neutral-600'
                                        : 'text-neutral-900 dark:text-neutral-100',
                                    )}
                                  >
                                    {item.quantity && item.unit
                                      ? `${item.quantity} ${item.unit} `
                                      : item.quantity
                                      ? `${item.quantity} `
                                      : ''}
                                    {item.name}
                                  </span>
                                  {item.recipeNames.length > 0 && (
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                                      {item.recipeNames.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}

                  {/* Footer spacer */}
                  <div className="h-4" />
                </div>
              )}
            </div>

            {/* Footer: progress bar when items exist */}
            {totalItems > 0 && !loading && (
              <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 py-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                  <span>{checkedCount} of {totalItems} checked</span>
                  {checkedCount === totalItems && totalItems > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      All done! 🎉
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D97757] transition-all duration-300"
                    style={{ width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
