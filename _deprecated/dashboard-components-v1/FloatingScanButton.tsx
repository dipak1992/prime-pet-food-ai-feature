'use client'

import { Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScanStore } from '@/stores/scanStore'
import { hapticTap } from '@/lib/scan/haptics'

export function FloatingScanButton() {
  const open = useScanStore((s) => s.open)

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => { hapticTap(); open('auto') }}
      aria-label="Scan fridge, menu, or food"
      className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-[#D97757] hover:bg-[#C86646] text-white shadow-lg shadow-[#D97757]/30 flex items-center justify-center active:scale-95 transition-colors"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Camera className="w-6 h-6" />
    </motion.button>
  )
}
