'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Minus, Plus, Users } from 'lucide-react'

// ─── Counter ──────────────────────────────────────────────────────────────────

function Counter({
  label,
  emoji,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string
  emoji: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white/82 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-slate-700 transition hover:bg-orange-100 disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-lg font-semibold text-slate-950 tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-slate-700 transition hover:bg-orange-100 disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepHouseholdSize() {
  const { data, patch } = useOnboardingStore()

  // householdSize is the total; we break it into adults + kids for display
  // We store a single number for simplicity — the store field is `householdSize`
  const total = data.householdSize

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D97757]/20">
          <Users className="h-8 w-8 text-[#D97757]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Who's eating?</h2>
          <p className="mt-1 text-sm text-slate-500">
            We'll personalise portions and meal ideas for your household.
          </p>
        </div>
      </div>

      {/* Counter */}
      <div className="mx-auto max-w-sm space-y-3">
        <Counter
          label="Adults"
          emoji="🧑"
          value={Math.max(1, total)}
          onChange={(v) => patch({ householdSize: v })}
          min={1}
          max={10}
        />
      </div>

      {/* Summary pill */}
      <p className="text-center text-sm text-slate-500">
        {total === 1 ? 'Just you — solo mode activated 🎯' : `${total} people in your household`}
      </p>
    </div>
  )
}
