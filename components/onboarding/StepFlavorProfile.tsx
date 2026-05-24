'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { SlidersHorizontal } from 'lucide-react'

const CUISINES = [
  { id: 'american', label: 'Comfort' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'italian', label: 'Italian' },
  { id: 'indian', label: 'Indian' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'asian', label: 'Asian' },
]

export default function StepFlavorProfile() {
  const { data, patch } = useOnboardingStore()

  function toggleCuisine(id: string) {
    const selected = data.cuisinePreferences
    patch({
      cuisinePreferences: selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <SlidersHorizontal className="h-8 w-8 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Flavor profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Help MealEase make the first plan feel like your household.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cuisines you like</h3>
        <div className="grid grid-cols-2 gap-2">
          {CUISINES.map((cuisine) => {
            const active = data.cuisinePreferences.includes(cuisine.id)
            return (
              <button
                key={cuisine.id}
                type="button"
                onClick={() => toggleCuisine(cuisine.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                  active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-orange-100 bg-white/82 text-slate-600 hover:bg-orange-50',
                ].join(' ')}
              >
                {cuisine.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
          Spice level
          <span className="text-xs text-slate-500">{data.spiceTolerance}</span>
        </label>
        <input
          type="range"
          min={0}
          max={3}
          value={['none', 'mild', 'medium', 'hot'].indexOf(data.spiceTolerance)}
          onChange={(event) => {
            const next = ['none', 'mild', 'medium', 'hot'][Number(event.target.value)] as typeof data.spiceTolerance
            patch({ spiceTolerance: next })
          }}
          className="w-full accent-emerald-600"
        />
      </section>

      <section className="space-y-3">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
          Budget vs. gourmet
          <span className="text-xs text-slate-500">{data.budgetStyle}/5</span>
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={data.budgetStyle}
          onChange={(event) => patch({ budgetStyle: Number(event.target.value) })}
          className="w-full accent-[#B8935A]"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Budget-smart</span>
          <span>Gourmet</span>
        </div>
      </section>

      <label className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-white/82 px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-slate-800">Picky-eater friendly</span>
          <span className="block text-xs text-slate-500">Prefer deconstructed meals and familiar sides.</span>
        </span>
        <input
          type="checkbox"
          checked={data.pickyEaterMode}
          onChange={(event) => patch({ pickyEaterMode: event.target.checked })}
          className="h-5 w-5 accent-[#D97757]"
        />
      </label>
    </div>
  )
}
