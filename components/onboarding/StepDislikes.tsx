'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { ThumbsDown, X } from 'lucide-react'
import { useState } from 'react'

// ─── Common suggestions ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Cilantro', 'Mushrooms', 'Olives', 'Anchovies', 'Blue cheese',
  'Liver', 'Tofu', 'Brussels sprouts', 'Beets', 'Eggplant',
  'Lamb', 'Oysters', 'Sauerkraut', 'Fennel', 'Okra',
]

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepDislikes() {
  const { data, patch } = useOnboardingStore()
  const dislikes = data.dislikes
  const [input, setInput] = useState('')

  function add(item: string) {
    const trimmed = item.trim()
    if (!trimmed || dislikes.includes(trimmed)) return
    patch({ dislikes: [...dislikes, trimmed] })
    setInput('')
  }

  function remove(item: string) {
    patch({ dislikes: dislikes.filter((d) => d !== item) })
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(input)
    }
  }

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D97757]/20">
          <ThumbsDown className="h-8 w-8 text-[#D97757]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Foods you dislike</h2>
          <p className="mt-1 text-sm text-slate-500">
            We'll avoid these in every meal plan. Type or tap a suggestion.
          </p>
        </div>
      </div>

      {/* Text input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Cilantro, Mushrooms…"
          className="w-full rounded-2xl border border-orange-100 bg-white/82 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-[#D97757]/60 focus:ring-1 focus:ring-[#D97757]/40"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={() => add(input)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-[#D97757] px-3 py-1 text-xs font-semibold text-white"
          >
            Add
          </button>
        )}
      </div>

      {/* Selected chips */}
      {dislikes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dislikes.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-[#D97757]/40 bg-[#D97757]/15 px-3 py-1 text-sm text-[#9f4f32]"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="text-slate-500 hover:text-slate-900"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Common dislikes
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !dislikes.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-orange-100 bg-white/82 px-3 py-1 text-sm text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-slate-900"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {dislikes.length === 0 && (
        <p className="text-center text-xs text-slate-400">
          No dislikes? Leave blank and continue.
        </p>
      )}
    </div>
  )
}
