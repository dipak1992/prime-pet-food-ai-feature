'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, ChevronRight, Check } from 'lucide-react'
import { useBudgetStore } from '@/stores/budgetStore'
import Link from 'next/link'

type Step = 'intro' | 'amount' | 'options' | 'saved'

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetSetupModal() {
  const isOpen = useBudgetStore((s) => s.setupModalOpen)
  const close = useBudgetStore((s) => s.closeSetupModal)
  const plan = useBudgetStore((s) => s.plan)
  const settings = useBudgetStore((s) => s.settings)
  const updateSettings = useBudgetStore((s) => s.updateSettings)
  const isUpdating = useBudgetStore((s) => s.isUpdating)

  const [step, setStep] = useState<Step>('intro')
  const [amount, setAmount] = useState(settings.weeklyLimit ?? 150)
  const [strictMode, setStrictMode] = useState(settings.strictMode)
  const [zipCode, setZipCode] = useState(settings.zipCode ?? '')

  function handleClose() {
    close()
    // Reset to intro after close animation
    setTimeout(() => setStep('intro'), 300)
  }

  async function handleSave() {
    await updateSettings({
      weeklyLimit: amount,
      strictMode,
      zipCode: zipCode || null,
    })
    setStep('saved')
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-setup-title"
      className="fixed inset-0 z-[90] flex items-end justify-center md:items-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))] dark:bg-neutral-900 md:max-w-md md:rounded-3xl md:pb-0"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>

          <AnimatePresence mode="wait">

            {/* ── Step: Intro (gated) ── */}
            {step === 'intro' && plan === 'free' && (
              <motion.div
                key="intro-gated"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#D97757]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#D97757]" />
                  </div>
                  <div>
                    <h2 id="budget-setup-title" className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">
                      Budget Intelligence
                    </h2>
                    <p className="text-xs text-neutral-500">Plus plan</p>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                  Set a weekly food budget and we&apos;ll track your spending, warn you before you go over,
                  and suggest cheaper meal swaps when needed.
                </p>

                <ul className="space-y-2 mb-8">
                  {[
                    'Real-time cost estimates per recipe',
                    'Weekly spending history & trends',
                    'Smart swap suggestions when over budget',
                    'Category breakdown (produce, meat, etc.)',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-[#D97757] flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/upgrade?feature=budget"
                  onClick={handleClose}
                  className="flex items-center justify-center gap-2 w-full bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
                >
                  Upgrade to Plus
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            {/* ── Step: Intro (paid) ── */}
            {step === 'intro' && plan !== 'free' && (
              <motion.div
                key="intro-paid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#D97757]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#D97757]" />
                  </div>
                  <h2 id="budget-setup-title" className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">
                    Set your weekly budget
                  </h2>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                  We&apos;ll estimate recipe costs using USDA average prices and track your weekly spend.
                </p>

                <button
                  onClick={() => setStep('amount')}
                  className="flex items-center justify-center gap-2 w-full bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
                >
                  Get started
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step: Amount ── */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <h2 id="budget-setup-title" className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 mb-1">
                  Weekly food budget
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  How much do you want to spend on groceries & meals per week?
                </p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50">$</span>
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    step={5}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="font-serif text-5xl font-bold bg-transparent border-b-2 border-[#D97757] focus:outline-none w-40 text-neutral-900 dark:text-neutral-50"
                    aria-label="Weekly budget amount"
                  />
                </div>

                <input
                  type="range"
                  min={25}
                  max={600}
                  step={5}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[#D97757] mb-1"
                  aria-label="Budget slider"
                />
                <div className="flex justify-between text-xs text-neutral-500 mb-8">
                  <span>$25</span>
                  <span>$600+</span>
                </div>

                <button
                  onClick={() => setStep('options')}
                  className="flex items-center justify-center gap-2 w-full bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step: Options ── */}
            {step === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <h2 id="budget-setup-title" className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 mb-1">
                  Preferences
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  Optional — helps us give more accurate estimates.
                </p>

                {/* Strict mode toggle */}
                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 dark:bg-neutral-800 px-4 py-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Strict mode</p>
                    <p className="text-xs text-neutral-500">Block meal plans that exceed your budget</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={strictMode}
                    onClick={() => setStrictMode(!strictMode)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      strictMode ? 'bg-[#D97757]' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        strictMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Zip code */}
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 px-4 py-3 mb-8">
                  <label htmlFor="zip-input" className="text-sm font-medium text-neutral-900 dark:text-neutral-100 block mb-1">
                    ZIP code
                  </label>
                  <p className="text-xs text-neutral-500 mb-2">For regional price adjustments</p>
                  <input
                    id="zip-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="e.g. 90210"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 border-b border-neutral-300 dark:border-neutral-600 focus:border-[#D97757] focus:outline-none py-1"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 w-full bg-[#D97757] hover:bg-[#C86646] disabled:opacity-60 text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
                >
                  {isUpdating ? 'Saving…' : 'Save budget'}
                </button>
              </motion.div>
            )}

            {/* ── Step: Saved ── */}
            {step === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 mb-2">
                  Budget set! 🎉
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  We&apos;ll track your weekly spending and warn you before you go over ${amount}.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
