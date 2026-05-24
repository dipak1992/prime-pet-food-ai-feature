'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useCopilotStore } from '@/stores/copilotStore'

export function CopilotTrigger() {
  const { state, open, peek, close } = useCopilotStore()
  const [hasSeenPulse, setHasSeenPulse] = useState(false)

  // Show pulse animation on first visit
  useEffect(() => {
    const seen = localStorage.getItem('copilot-pulse-seen')
    if (!seen) {
      setHasSeenPulse(false)
    } else {
      setHasSeenPulse(true)
    }
  }, [])

  const handleTap = () => {
    // Mark pulse as seen
    if (!hasSeenPulse) {
      localStorage.setItem('copilot-pulse-seen', '1')
      setHasSeenPulse(true)
    }

    if (state === 'collapsed') {
      peek()
    } else if (state === 'peek') {
      open()
    } else {
      close()
    }
  }

  // Don't show trigger when sheet is expanded
  const isVisible = state !== 'expanded'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="copilot-trigger"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={handleTap}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D97757] to-[#E8895A] text-white shadow-lg shadow-orange-900/25 transition-transform active:scale-90 md:bottom-6"
          aria-label="Open MealEase copilot"
        >
          {/* Pulse ring for first-time users */}
          {!hasSeenPulse && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[#D97757]/40" />
          )}
          <Sparkles size={20} className="relative" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
