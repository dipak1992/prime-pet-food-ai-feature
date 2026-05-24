'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Instruction {
  id: string
  instruction: string
  category: string
  expires_at: string
}

export function InstructionBadge() {
  const [instructions, setInstructions] = useState<Instruction[]>([])

  useEffect(() => {
    fetchInstructions()
  }, [])

  async function fetchInstructions() {
    try {
      const res = await fetch('/api/copilot/instructions')
      const data = await res.json()
      setInstructions(data.instructions || [])
    } catch {
      // Silently fail — badge is non-critical
    }
  }

  async function clearInstruction(category: string) {
    try {
      await fetch('/api/copilot/instructions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      setInstructions(prev => prev.filter(i => i.category !== category))
    } catch {
      // Silently fail
    }
  }

  if (instructions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-neutral-100">
      <Sparkles className="w-3.5 h-3.5 text-[#D97757] mt-0.5 shrink-0" />
      <AnimatePresence>
        {instructions.map(inst => {
          const daysLeft = Math.ceil(
            (new Date(inst.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          return (
            <motion.span
              key={inst.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D97757]/8 text-[#D97757] border border-[#D97757]/20"
            >
              <span className="truncate max-w-[140px]">{inst.instruction}</span>
              <span className="text-[#D97757]/50">{daysLeft}d</span>
              <button
                onClick={() => clearInstruction(inst.category)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-[#D97757]/15 transition-colors"
                aria-label={`Remove: ${inst.instruction}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.span>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
