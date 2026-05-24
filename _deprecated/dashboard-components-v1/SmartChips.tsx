'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SMART_CHIPS, type SmartChipId } from '@/types'

interface Props {
  onChipTap: (chipId: SmartChipId) => void
  activeChip?: SmartChipId | null
  disabled?: boolean
  /** When true, shows family-only chips (less spicy, easier texture, etc.) */
  hasKids?: boolean
}

export function SmartChips({ onChipTap, activeChip, disabled, hasKids }: Props) {
  const chips = useMemo(
    () => SMART_CHIPS.filter(c => !c.familyOnly || hasKids),
    [hasKids],
  )

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
      {chips.map((chip) => {
        const isActive = activeChip === chip.id
        return (
          <motion.button
            key={chip.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChipTap(chip.id)}
            disabled={disabled}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
              isActive
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-white border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <span>{chip.emoji}</span>
            <span>{chip.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
