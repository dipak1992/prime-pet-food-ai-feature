'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ChefHat, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExpiringItem {
  id: string
  name: string
  expiresAt: string
}

/**
 * In-app banner that shows on the pantry page when items are expiring soon.
 * Also triggers a push notification check on mount (if user has push enabled).
 */
export function PantryExpiryBanner() {
  const [items, setItems] = useState<ExpiringItem[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for expiring items and optionally trigger push
    async function checkExpiry() {
      try {
        const res = await fetch('/api/push/pantry-expiry', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.expiringItems?.length > 0) {
            setItems(data.expiringItems)
          }
        }
      } catch {
        // Silently fail — banner is non-critical
      } finally {
        setLoading(false)
      }
    }

    // Only check once per session
    const sessionKey = 'pantry-expiry-checked'
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1')
      checkExpiry()
    } else {
      setLoading(false)
    }
  }, [])

  if (loading || dismissed || items.length === 0) return null

  const expiringToday = items.filter((item) => {
    const expDate = new Date(item.expiresAt)
    return expDate.toDateString() === new Date().toDateString()
  })

  const isUrgent = expiringToday.length > 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={`rounded-xl border p-4 mb-4 ${
          isUrgent
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`shrink-0 mt-0.5 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {isUrgent ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isUrgent ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {isUrgent
                ? `${expiringToday.length} item${expiringToday.length > 1 ? 's' : ''} expiring today!`
                : `${items.length} item${items.length > 1 ? 's' : ''} expiring soon`}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {items.slice(0, 5).map((item) => {
                const isToday = new Date(item.expiresAt).toDateString() === new Date().toDateString()
                return (
                  <span
                    key={item.id}
                    className={`inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 ${
                      isToday
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                    }`}
                  >
                    {item.name}
                    {isToday && <span className="ml-1 text-[10px]">today</span>}
                  </span>
                )
              })}
              {items.length > 5 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  +{items.length - 5} more
                </span>
              )}
            </div>

            <Link
              href="/dashboard/cook"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              <ChefHat className="h-3.5 w-3.5" />
              Get meal ideas using these ingredients →
            </Link>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
