'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { Leaf } from 'lucide-react'

// ─── Options ──────────────────────────────────────────────────────────────────

const OPTIONS = [
  { id: 'vegetarian',    label: 'Vegetarian',    emoji: '🥦' },
  { id: 'vegan',         label: 'Vegan',         emoji: '🌱' },
  { id: 'pescatarian',   label: 'Pescatarian',   emoji: '🐟' },
  { id: 'gluten_free',   label: 'Gluten-free',   emoji: '🌾' },
  { id: 'dairy_free',    label: 'Dairy-free',    emoji: '🥛' },
  { id: 'nut_free',      label: 'Nut-free',      emoji: '🥜' },
  { id: 'keto',          label: 'Keto',          emoji: '🥑' },
  { id: 'paleo',         label: 'Paleo',         emoji: '🍖' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'high_protein',  label: 'High-protein',  emoji: '💪' },
  { id: 'low_sodium',    label: 'Low-sodium',    emoji: '🧂' },
  { id: 'low_carb',      label: 'Low-carb',      emoji: '🥗' },
  { id: 'halal',         label: 'Halal',         emoji: '☪️' },
  { id: 'kosher',        label: 'Kosher',        emoji: '✡️' },
] as const

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepDietary() {
  const { data, patch } = useOnboardingStore()
  const selected = data.dietary

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((d) => d !== id)
      : [...selected, id]
    patch({ dietary: next })
  }

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D97757]/20">
          <Leaf className="h-8 w-8 text-[#D97757]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Dietary preferences</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select all that apply — we'll filter every meal accordingly.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const active = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={[
                'flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                active
                  ? 'border-[#D97757] bg-[#D97757]/15 text-[#9f4f32]'
                  : 'border-orange-100 bg-white/82 text-slate-600 hover:border-orange-200 hover:bg-orange-50',
              ].join(' ')}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Skip hint */}
      {selected.length === 0 && (
        <p className="text-center text-xs text-slate-400">
          No restrictions? Leave blank and continue.
        </p>
      )}
    </div>
  )
}
