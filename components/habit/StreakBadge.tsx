'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function StreakBadge() {
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    fetch('/api/habit/streak')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.current_streak) setStreak(data.current_streak)
      })
      .catch(() => {})
  }, [])

  if (streak < 2) return null

  const label = streak >= 7
    ? `🔥 ${streak} day streak`
    : `⚡ ${streak} days strong`

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50 px-3 py-1"
    >
      {label}
    </motion.span>
  )
}
