'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

// ─── Visual Goal Options ────────────────────────────────────────────────────

const GOALS = [
  {
    id: 'save_time',
    label: 'Save time',
    description: 'Quick meals for busy weeknights',
    emoji: '⏱️',
    gradient: 'from-sky-100 to-blue-50',
    borderActive: 'border-sky-500',
    bgActive: 'bg-sky-50',
  },
  {
    id: 'eat_healthier',
    label: 'Eat healthier',
    description: 'Balanced nutrition for the whole family',
    emoji: '🥗',
    gradient: 'from-emerald-100 to-green-50',
    borderActive: 'border-emerald-500',
    bgActive: 'bg-emerald-50',
  },
  {
    id: 'save_money',
    label: 'Save money',
    description: 'Budget-friendly meals without sacrifice',
    emoji: '💰',
    gradient: 'from-amber-100 to-yellow-50',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-50',
  },
  {
    id: 'reduce_waste',
    label: 'Reduce food waste',
    description: 'Use what you have, waste less',
    emoji: '♻️',
    gradient: 'from-teal-100 to-cyan-50',
    borderActive: 'border-teal-500',
    bgActive: 'bg-teal-50',
  },
  {
    id: 'feed_picky',
    label: 'Feed picky eaters',
    description: 'Meals everyone will actually eat',
    emoji: '👶',
    gradient: 'from-violet-100 to-purple-50',
    borderActive: 'border-violet-500',
    bgActive: 'bg-violet-50',
  },
  {
    id: 'try_new',
    label: 'Try new cuisines',
    description: 'Explore flavors from around the world',
    emoji: '🌍',
    gradient: 'from-rose-100 to-pink-50',
    borderActive: 'border-rose-500',
    bgActive: 'bg-rose-50',
  },
] as const

// ─── Step Component ─────────────────────────────────────────────────────────

export default function StepCookingGoal() {
  const { data, patch } = useOnboardingStore()
  const selected = data.cookingGoal

  return (
    <div className="space-y-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D97757]/20">
          <Target className="h-8 w-8 text-[#D97757]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">What&apos;s your biggest dinner challenge?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick one — we&apos;ll prioritize solutions for this in your meal plan.
          </p>
        </div>
      </div>

      {/* Visual cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((goal, i) => {
          const active = selected === goal.id
          return (
            <motion.button
              key={goal.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              onClick={() => patch({ cookingGoal: goal.id })}
              className={[
                'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200',
                active
                  ? `${goal.borderActive} ${goal.bgActive} shadow-md scale-[1.02]`
                  : 'border-orange-100 bg-white/82 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Emoji icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${goal.gradient}`}>
                <span className="text-2xl">{goal.emoji}</span>
              </div>
              {/* Label */}
              <p className={[
                'text-sm font-semibold leading-tight',
                active ? 'text-slate-900' : 'text-slate-700',
              ].join(' ')}>
                {goal.label}
              </p>
              {/* Description */}
              <p className="text-[11px] text-slate-500 leading-snug">
                {goal.description}
              </p>
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="goal-check"
                  className="absolute top-2 right-2 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center"
                >
                  <div className="h-3 w-3 rounded-full bg-[#D97757]" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Personalization hint */}
      {selected && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-slate-500"
        >
          ✨ Great choice! We&apos;ll tailor your experience around this goal.
        </motion.p>
      )}
    </div>
  )
}
