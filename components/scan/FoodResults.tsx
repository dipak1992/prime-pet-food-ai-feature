'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { hapticTap, hapticSuccess } from '@/lib/scan/haptics'
import { trackScan } from '@/lib/scan/analytics'
import { useState } from 'react'
import type { FoodResult } from '@/lib/scan/types'

interface FoodResultsProps {
  result: FoodResult
  onClose: () => void
  onRetake: () => void
}

export function FoodResults({ result, onClose, onRetake }: FoodResultsProps) {
  const [logged, setLogged] = useState(false)

  const totalMacros = result.protein + result.carbs + result.fat
  const proteinPct = totalMacros > 0 ? (result.protein / totalMacros) * 100 : 0
  const carbsPct = totalMacros > 0 ? (result.carbs / totalMacros) * 100 : 0
  const fatPct = totalMacros > 0 ? (result.fat / totalMacros) * 100 : 0

  const handleLog = () => {
    if (logged) return
    hapticSuccess()
    setLogged(true)
    trackScan('scan_add_to_log', { type: 'food' })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
              🍽️ Food Scan
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{result.name}</p>
          </div>
          <button
            onClick={() => { hapticTap(); onRetake() }}
            className="text-sm text-[#D97757] font-semibold"
          >
            Retake
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-6">
        {/* Calorie hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-br from-[#D97757]/10 to-[#B8935A]/10 p-5 text-center"
        >
          <div className="text-5xl font-bold text-[#D97757]">{result.calories}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            calories{result.servingSize ? ` · ${result.servingSize}` : ''}
          </div>
        </motion.div>

        {/* Macro bar */}
        <section>
          <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
            Macronutrients
          </h3>
          <div className="h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${proteinPct}%` }}
              title={`Protein ${result.protein}g`}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${carbsPct}%` }}
              title={`Carbs ${result.carbs}g`}
            />
            <div
              className="bg-rose-400 transition-all"
              style={{ width: `${fatPct}%` }}
              title={`Fat ${result.fat}g`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Protein {result.protein}g
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Carbs {result.carbs}g
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              Fat {result.fat}g
            </span>
          </div>
        </section>

        {/* Extra nutrients */}
        {(result.fiber != null || result.sugar != null || result.sodium != null) && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              Other Nutrients
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {result.fiber != null && (
                <NutrientTile label="Fiber" value={`${result.fiber}g`} />
              )}
              {result.sugar != null && (
                <NutrientTile label="Sugar" value={`${result.sugar}g`} />
              )}
              {result.sodium != null && (
                <NutrientTile label="Sodium" value={`${result.sodium}mg`} />
              )}
            </div>
          </section>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
              Watch Out
            </h3>
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Positives */}
        {result.positives.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
              Good News
            </h3>
            <div className="space-y-2">
              {result.positives.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {p}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-5 py-4 flex gap-3">
        <button
          onClick={handleLog}
          disabled={logged}
          className="flex-1 py-3 rounded-2xl bg-[#D97757] text-white font-semibold hover:bg-[#C86646] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {logged ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Logged!
            </>
          ) : (
            'Log this meal'
          )}
        </button>
        <button
          onClick={() => { hapticTap(); onClose() }}
          className="px-5 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function NutrientTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-3 text-center">
      <div className="font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</div>
    </div>
  )
}
