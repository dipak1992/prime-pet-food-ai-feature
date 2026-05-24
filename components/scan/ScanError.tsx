'use client'

import { motion } from 'framer-motion'
import { Camera, Wifi, ImageOff, AlertCircle, Lock, Server } from 'lucide-react'
import { hapticTap } from '@/lib/scan/haptics'
import type { ScanErrorKind } from '@/lib/scan/types'

interface ScanErrorProps {
  kind: ScanErrorKind | null
  message?: string | null
  onRetake: () => void
  onClose: () => void
}

interface ErrorConfig {
  title: string
  description: string
  primaryLabel: string
  primaryAction: 'retake' | 'close' | 'settings' | 'upgrade'
  secondaryLabel?: string
  Icon: React.ComponentType<{ className?: string }>
  tips?: string[]
}

const ERROR_CONFIGS: Record<ScanErrorKind, ErrorConfig> = {
  camera_permission: {
    title: 'Camera access denied',
    description:
      'MealEase needs camera access to scan your fridge and food. Please allow camera access in your browser or device settings.',
    primaryLabel: 'Open Settings',
    primaryAction: 'settings',
    secondaryLabel: 'Cancel',
    Icon: Camera,
  },
  network: {
    title: 'Connection issue',
    description:
      "We couldn't reach our servers. Check your internet connection and try again.",
    primaryLabel: 'Try again',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: Wifi,
  },
  low_quality: {
    title: 'Image too blurry',
    description:
      "The photo wasn't clear enough to analyze. Try holding your phone steady and ensuring good lighting.",
    primaryLabel: 'Retake photo',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: ImageOff,
    tips: ['Turn on the fridge light', 'Fill the frame with ingredients', 'Wipe the lens and hold steady'],
  },
  no_ingredients: {
    title: 'No ingredients found',
    description:
      "We couldn't identify any ingredients in this photo. Try a clearer shot of your fridge or pantry.",
    primaryLabel: 'Retake photo',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: ImageOff,
    tips: ['Open containers or move items forward', 'Avoid dark shelves and heavy glare', 'Try a counter photo of the main ingredients'],
  },
  no_menu: {
    title: 'No menu detected',
    description:
      "We couldn't read a menu in this photo. Make sure the menu text is clearly visible and well-lit.",
    primaryLabel: 'Retake photo',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: ImageOff,
  },
  no_food: {
    title: 'No food detected',
    description:
      "We couldn't identify any food in this photo. Try a closer shot of your meal.",
    primaryLabel: 'Retake photo',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: ImageOff,
  },
  rate_limited: {
    title: 'Scan limit reached',
    description:
      "You've used all your free scans for this period. Upgrade to MealEase Plus for unlimited scans.",
    primaryLabel: 'Upgrade to Plus',
    primaryAction: 'upgrade',
    secondaryLabel: 'Maybe later',
    Icon: Lock,
  },
  server: {
    title: 'Server error',
    description: 'Something went wrong on our end. Please try again in a moment.',
    primaryLabel: 'Try again',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: Server,
  },
  unknown: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    primaryLabel: 'Try again',
    primaryAction: 'retake',
    secondaryLabel: 'Cancel',
    Icon: AlertCircle,
  },
}

export function ScanError({ kind, message, onRetake, onClose }: ScanErrorProps) {
  const config = ERROR_CONFIGS[kind ?? 'unknown']

  const handlePrimary = () => {
    hapticTap()
    switch (config.primaryAction) {
      case 'retake':
        onRetake()
        break
      case 'close':
        onClose()
        break
      case 'settings':
        // Best-effort: open OS settings on mobile
        if (typeof window !== 'undefined') {
          window.open('app-settings:', '_self')
        }
        onClose()
        break
      case 'upgrade':
        if (typeof window !== 'undefined') {
          window.location.href = '/upgrade?feature=scan'
        }
        onClose()
        break
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-5 max-w-xs"
      >
        {/* Icon circle */}
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <config.Icon className="h-9 w-9 text-red-600 dark:text-red-300" aria-hidden />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
            {config.title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {message ?? config.description}
          </p>
        </div>

        {config.tips && (
          <div className="w-full rounded-2xl bg-neutral-50 p-3 text-left ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
              Quick fix
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
              {config.tips.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={handlePrimary}
            className="w-full py-3 rounded-2xl bg-[#D97757] text-white font-semibold hover:bg-[#C86646] transition-colors"
          >
            {config.primaryLabel}
          </button>
          {config.secondaryLabel && (
            <button
              onClick={() => { hapticTap(); onClose() }}
              className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {config.secondaryLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
