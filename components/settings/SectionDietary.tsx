'use client'

import { useState } from 'react'
import { Leaf, Loader2, X } from 'lucide-react'

const DIETARY_OPTIONS = [
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
]

type Props = {
  dietary: string[]
  dislikes: string[]
}

export function SectionDietary({ dietary: initialDietary, dislikes: initialDislikes }: Props) {
  const [dietary, setDietary]   = useState(initialDietary)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [dislikeInput, setDislikeInput] = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  function toggleDietary(id: string) {
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  function addDislike() {
    const trimmed = dislikeInput.trim()
    if (!trimmed || dislikes.includes(trimmed)) return
    setDislikes((prev) => [...prev, trimmed])
    setDislikeInput('')
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietary, dislikes }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white/82 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-950">
        <Leaf className="h-4 w-4 text-[#D97757]" />
        Dietary preferences
      </h2>

      {/* Dietary toggles */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DIETARY_OPTIONS.map((opt) => {
          const active = dietary.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleDietary(opt.id)}
              className={[
                'flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition',
                active
                  ? 'border-[#D97757] bg-[#D97757]/15 text-[#9f4f32]'
                  : 'border-orange-100 bg-white/82 text-slate-600 hover:border-orange-200 hover:bg-orange-50',
              ].join(' ')}
            >
              <span>{opt.emoji}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Dislikes */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-slate-500">Foods to avoid</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {dislikes.map((d) => (
            <span key={d} className="flex items-center gap-1.5 rounded-full border border-[#D97757]/40 bg-[#D97757]/10 px-3 py-1 text-sm text-[#9f4f32]">
              {d}
              <button type="button" onClick={() => setDislikes((prev) => prev.filter((x) => x !== d))}>
                <X className="h-3 w-3 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDislike() } }}
            placeholder="Add a food to avoid…"
            className="flex-1 rounded-2xl border border-orange-100 bg-white/82 px-4 py-2.5 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-[#D97757]/60"
          />
          <button type="button" onClick={addDislike} className="rounded-2xl bg-orange-50 px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-100">
            Add
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-2xl bg-[#D97757] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c4694a] disabled:opacity-60"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saved ? '✓ Saved' : 'Save changes'}
      </button>
    </section>
  )
}
