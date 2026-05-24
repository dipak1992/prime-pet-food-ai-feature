'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { DollarSign } from 'lucide-react'

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '$50 / week',  value: 50,  hint: 'Budget-friendly, smart swaps' },
  { label: '$100 / week', value: 100, hint: 'Balanced variety and quality' },
  { label: '$150 / week', value: 150, hint: 'More premium ingredients' },
  { label: '$200+ / week', value: 200, hint: 'No restrictions on quality' },
]

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepBudget() {
  const { data, patch } = useOnboardingStore()
  const selected = data.weeklyBudget

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B8935A]/20">
          <DollarSign className="h-8 w-8 text-[#B8935A]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Weekly grocery budget</h2>
          <p className="mt-1 text-sm text-slate-500">
            We'll optimise ingredient overlap to keep costs down.
          </p>
        </div>
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((preset) => {
          const active = selected === preset.value
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => patch({ weeklyBudget: preset.value })}
              className={[
                'flex flex-col items-start rounded-2xl border px-4 py-4 text-left transition',
                active
                  ? 'border-[#B8935A] bg-[#B8935A]/15'
                  : 'border-orange-100 bg-white/82 hover:border-orange-200 hover:bg-orange-50',
              ].join(' ')}
            >
              <span
                className={[
                  'text-base font-bold',
                  active ? 'text-[#B8935A]' : 'text-slate-950',
                ].join(' ')}
              >
                {preset.label}
              </span>
              <span className="mt-1 text-xs text-slate-500">{preset.hint}</span>
            </button>
          )
        })}
      </div>

      {/* Custom amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Or enter a custom amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min={10}
            max={2000}
            step={10}
            value={selected ?? ''}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              patch({ weeklyBudget: isNaN(v) ? null : v })
            }}
            placeholder="e.g. 120"
            className="w-full rounded-2xl border border-orange-100 bg-white/82 py-3 pl-8 pr-4 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-[#B8935A]/60 focus:ring-1 focus:ring-[#B8935A]/40"
          />
        </div>
      </div>

      {selected === null && (
        <p className="text-center text-xs text-slate-400">
          Skip if you'd rather not set a budget.
        </p>
      )}
    </div>
  )
}
