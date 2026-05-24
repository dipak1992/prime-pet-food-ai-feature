'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'Analyzing your image…',
  'Identifying ingredients…',
  'Checking nutritional data…',
  'Almost there…',
  'Generating results…',
]

interface ScanProcessingProps {
  label?: string
}

export function ScanProcessing({ label }: ScanProcessingProps) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 py-12">
      {/* Spinner */}
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[#D97757]/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#D97757]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          📸
        </div>
      </div>

      {/* Cycling message */}
      <div className="h-8 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium text-neutral-700 dark:text-neutral-300 text-center"
          >
            {label ?? MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#D97757]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    </div>
  )
}
