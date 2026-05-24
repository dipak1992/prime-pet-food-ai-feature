'use client'

import { motion } from 'framer-motion'
import { Heart, DollarSign, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { hapticTap, hapticSuccess } from '@/lib/scan/haptics'
import { trackScan } from '@/lib/scan/analytics'
import type { MenuResult, MenuPick } from '@/lib/scan/types'

interface MenuResultsProps {
  result: MenuResult
  onClose: () => void
  onRetake: () => void
}

export function MenuResults({ result, onRetake, onClose }: MenuResultsProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
              📋 Menu Scan
            </h2>
            {result.restaurantName && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {result.restaurantName}
              </p>
            )}
          </div>
          <button
            onClick={() => { hapticTap(); onRetake() }}
            className="text-sm text-[#D97757] font-semibold"
          >
            Retake
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Top {result.picks.length} healthiest picks, ranked by health score.
        </p>

        {result.picks.map((pick, idx) => (
          <MenuPickCard key={pick.id} pick={pick} rank={idx + 1} />
        ))}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <button
          onClick={() => { hapticTap(); onClose() }}
          className="w-full py-3 rounded-2xl bg-[#D97757] text-white font-semibold hover:bg-[#C86646] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function MenuPickCard({ pick, rank }: { pick: MenuPick; rank: number }) {
  const [logged, setLogged] = useState(false)

  const handleLog = () => {
    if (logged) return
    hapticSuccess()
    setLogged(true)
    trackScan('scan_add_to_log', { type: 'menu' })
  }

  const scoreColor =
    pick.healthScore >= 75
      ? 'text-green-600 dark:text-green-400'
      : pick.healthScore >= 50
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div className="w-7 h-7 rounded-full bg-[#D97757]/10 text-[#D97757] flex items-center justify-center text-sm font-bold shrink-0">
            {rank}
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{pick.name}</h4>
            {pick.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                {pick.description}
              </p>
            )}
          </div>
        </div>

        {/* Health score */}
        <div className={cn('text-right shrink-0', scoreColor)}>
          <div className="flex items-center gap-1 justify-end">
            <Heart className="w-3.5 h-3.5" />
            <span className="font-bold text-sm">{pick.healthScore}</span>
          </div>
          <div className="text-[10px] text-neutral-400">health</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          {pick.price != null && (
            <span className="flex items-center gap-0.5">
              <DollarSign className="w-3.5 h-3.5" />
              {pick.price.toFixed(2)}
            </span>
          )}
          {pick.calories != null && (
            <span>{pick.calories} cal</span>
          )}
        </div>

        <button
          onClick={handleLog}
          disabled={logged}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
            logged
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-[#D97757]/10 text-[#D97757] hover:bg-[#D97757]/20'
          )}
        >
          {logged ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              Logged
            </>
          ) : (
            'Add to log'
          )}
        </button>
      </div>

      {/* Tags */}
      {pick.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {pick.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
