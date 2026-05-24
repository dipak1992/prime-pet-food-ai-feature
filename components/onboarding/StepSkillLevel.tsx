'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { ChefHat } from 'lucide-react'

// ─── Options ──────────────────────────────────────────────────────────────────

const LEVELS = [
  {
    id: 'beginner' as const,
    label: 'Beginner',
    emoji: '🍳',
    description: 'Simple recipes, minimal techniques, under 30 min',
  },
  {
    id: 'intermediate' as const,
    label: 'Intermediate',
    emoji: '👨‍🍳',
    description: 'Comfortable with most techniques, happy to try new things',
  },
  {
    id: 'advanced' as const,
    label: 'Advanced',
    emoji: '⭐',
    description: 'Confident cook — bring on complex flavours and methods',
  },
]

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepSkillLevel() {
  const { data, patch } = useOnboardingStore()
  const selected = data.skillLevel

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D97757]/20">
          <ChefHat className="h-8 w-8 text-[#D97757]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Cooking skill level</h2>
          <p className="mt-1 text-sm text-slate-500">
            We'll match recipe complexity to your comfort zone.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {LEVELS.map((level) => {
          const active = selected === level.id
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => patch({ skillLevel: level.id })}
              className={[
                'flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition',
                active
                  ? 'border-[#D97757] bg-[#D97757]/15'
                  : 'border-orange-100 bg-white/82 hover:border-orange-200 hover:bg-orange-50',
              ].join(' ')}
            >
              <span className="mt-0.5 text-3xl">{level.emoji}</span>
              <div>
                <p className={['font-semibold', active ? 'text-[#9f4f32]' : 'text-slate-700'].join(' ')}>
                  {level.label}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{level.description}</p>
              </div>
              {/* Radio indicator */}
              <div
                className={[
                  'ml-auto mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition',
                  active
                    ? 'border-[#D97757] bg-[#D97757]'
                    : 'border-orange-200 bg-transparent',
                ].join(' ')}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
