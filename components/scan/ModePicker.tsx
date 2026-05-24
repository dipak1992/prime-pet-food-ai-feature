'use client'

import { motion } from 'framer-motion'
import { hapticTap } from '@/lib/scan/haptics'
import type { ScanType, ClassifyResponse } from '@/lib/scan/types'

interface ModePickerProps {
  imageDataUrl: string | null
  classifyResult: ClassifyResponse | null
  onPick: (type: ScanType) => void
}

const MODES: { type: ScanType; emoji: string; label: string; description: string }[] = [
  {
    type: 'fridge',
    emoji: '🧊',
    label: 'Fridge / Pantry',
    description: 'Identify ingredients & get recipe ideas',
  },
  {
    type: 'menu',
    emoji: '📋',
    label: 'Restaurant Menu',
    description: 'Find the healthiest picks on the menu',
  },
  {
    type: 'food',
    emoji: '🍽️',
    label: 'Food / Dish',
    description: 'Get nutrition info for what you\'re eating',
  },
]

export function ModePicker({ imageDataUrl, classifyResult, onPick }: ModePickerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Preview */}
      {imageDataUrl && (
        <div className="relative h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Captured image"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 dark:to-neutral-950/80" />
        </div>
      )}

      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
            What did you scan?
          </h2>
          {classifyResult && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              We detected a <strong>{classifyResult.type}</strong> with{' '}
              {Math.round(classifyResult.confidence * 100)}% confidence — confirm below.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {MODES.map((m) => (
            <motion.button
              key={m.type}
              whileTap={{ scale: 0.97 }}
              onClick={() => { hapticTap(); onPick(m.type) }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-[#D97757]/50 hover:shadow-sm transition-all text-left"
            >
              <span className="text-3xl">{m.emoji}</span>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {m.label}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {m.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
