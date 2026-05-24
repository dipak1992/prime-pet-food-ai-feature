'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SmartMealResult } from '@/lib/engine/types'
import { useLearningStore } from '@/lib/learning/store'

type Rating = 'loved' | 'okay' | 'didnt_work'

interface Props {
  meal: SmartMealResult
  onComplete: (rating: Rating) => void
}

const BUTTONS: { rating: Rating; emoji: string; label: string }[] = [
  { rating: 'loved', emoji: '👍', label: 'Loved it' },
  { rating: 'okay', emoji: '😐', label: "It's okay" },
  { rating: 'didnt_work', emoji: '👎', label: 'Not for me' },
]

export function MicroFeedback({ meal, onComplete }: Props) {
  const [selected, setSelected] = useState<Rating | null>(null)
  const { recordLike, recordReject, recordSave } = useLearningStore()

  async function handleRating(rating: Rating) {
    if (selected) return
    setSelected(rating)

    // Update local adaptive learning store
    if (rating === 'loved') recordLike(meal)
    else if (rating === 'didnt_work') recordReject(meal)
    else recordSave(meal)

    // Fire-and-forget DB save — failure is silent
    fetch('/api/habit/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_id: meal.id,
        meal_title: meal.title,
        meal_cuisine: meal.cuisineType,
        rating,
      }),
    }).catch(() => {})

    setTimeout(() => onComplete(rating), 400)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <p className="text-white/80 text-xs font-medium text-center">Did this work for you?</p>
      <div className="flex gap-2">
        {BUTTONS.map(({ rating, emoji, label }) => (
          <motion.button
            key={rating}
            whileTap={{ scale: 0.9 }}
            disabled={selected !== null}
            onClick={() => handleRating(rating)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
              selected === rating
                ? 'bg-white text-gray-900 scale-105'
                : selected !== null
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span>{label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
