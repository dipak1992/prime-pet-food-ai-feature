'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChefHat, Minus, Plus, Check } from 'lucide-react'
import { useLeftoversStore } from '@/stores/leftoversStore'
import { calculateExpirationDate } from '@/lib/leftovers/expiration-calculator'

type Step = 'ask' | 'quantity' | 'saved'

export function LeftoverCookedPrompt() {
  // Granular selectors — avoid object selector which creates new ref on every render (React #185)
  const cookedPromptOpen = useLeftoversStore((s) => s.cookedPromptOpen)
  const cookedPromptData = useLeftoversStore((s) => s.cookedPromptData)
  const closeCookedPrompt = useLeftoversStore((s) => s.closeCookedPrompt)
  const addLeftover = useLeftoversStore((s) => s.addLeftover)

  const [step, setStep] = useState<Step>('ask')
  const [servings, setServings] = useState(1)
  const [saving, setSaving] = useState(false)

  const data = cookedPromptData

  function handleClose() {
    closeCookedPrompt()
    // Reset after animation
    setTimeout(() => {
      setStep('ask')
      setServings(1)
      setSaving(false)
    }, 300)
  }

  async function handleSave() {
    if (!data) return
    setSaving(true)

    try {
      const cookedAt = new Date()
      const expiresAt = calculateExpirationDate(data.mainIngredients, cookedAt)

      const res = await fetch('/api/leftovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceRecipeId: data.recipeId,
          name: data.recipeName,
          image: data.recipeImage,
          mainIngredients: data.mainIngredients,
          servingsRemaining: servings,
          originalCostPerServing: data.costPerServing,
          cookedAt: cookedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Failed to save leftover')
      const saved = await res.json()
      addLeftover(saved)
      setStep('saved')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {cookedPromptOpen && data && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-zinc-900 px-5 pb-10 pt-4 shadow-2xl"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

            <AnimatePresence mode="wait">
              {step === 'ask' && (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-3">
                    {data.recipeImage ? (
                      <img
                        src={data.recipeImage}
                        alt={data.recipeName}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-2xl">
                        🍽️
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-zinc-400">You just cooked</p>
                      <p className="text-base font-bold text-white">{data.recipeName}</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300">
                    Did you have any leftovers? We'll track them and remind you before they expire.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5"
                    >
                      No leftovers
                    </button>
                    <button
                      onClick={() => setStep('quantity')}
                      className="flex-1 rounded-xl bg-[#D97757] py-3 text-sm font-semibold text-white hover:bg-[#c96847]"
                    >
                      Yes, track them
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'quantity' && (
                <motion.div
                  key="quantity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white">How many servings?</h2>
                    <button
                      onClick={handleClose}
                      className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm text-zinc-400">
                    We'll track <span className="font-semibold text-white">{data.recipeName}</span> and
                    remind you before it expires.
                  </p>

                  {/* Stepper */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
                      disabled={servings <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-16 text-center text-3xl font-bold text-white">{servings}</span>
                    <button
                      onClick={() => setServings((s) => Math.min(20, s + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-zinc-500">
                    {servings === 1 ? '1 serving' : `${servings} servings`}
                  </p>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-xl bg-[#D97757] py-3 text-sm font-semibold text-white hover:bg-[#c96847] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save leftovers'}
                  </button>
                </motion.div>
              )}

              {step === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <Check className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-bold text-white">Leftovers saved!</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      We'll remind you before <span className="text-white">{data.recipeName}</span> expires.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white hover:bg-white/20"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
