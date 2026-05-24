'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { XIcon } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const SNOOZE_KEY = 'mealease_onboarding_snooze'
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

// ── Chip definitions ──────────────────────────────────────────────────────────

type Chip = { id: string; label: string; emoji: string }

const CUISINE_CHIPS: Chip[] = [
  { id: 'nepali',        label: 'Nepali',        emoji: '🏔️' },
  { id: 'indian',        label: 'Indian',        emoji: '🍛' },
  { id: 'italian',       label: 'Italian',       emoji: '🍕' },
  { id: 'mexican',       label: 'Mexican',       emoji: '🌮' },
  { id: 'asian',         label: 'Asian',         emoji: '🍜' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
]

const STYLE_CHIPS: Chip[] = [
  { id: 'quick',          label: 'Quick Meals',     emoji: '⚡' },
  { id: 'budget',         label: 'Budget Friendly', emoji: '💰' },
  { id: 'low_energy',     label: 'Low Energy',      emoji: '😌' },
  { id: 'high_protein',   label: 'High Protein',    emoji: '💪' },
]

const HOUSEHOLD_CHIPS: Chip[] = [
  { id: 'solo',          label: 'Solo Cook',    emoji: '🧑‍🍳' },
  { id: 'has_kids',      label: 'Kid Friendly', emoji: '👧' },
  { id: 'family',        label: 'Family Meals', emoji: '👨‍👩‍👧' },
]

const DIET_CHIPS: Chip[] = [
  { id: 'vegetarian',  label: 'Vegetarian',  emoji: '🥦' },
  { id: 'gluten_free', label: 'Gluten Free', emoji: '🌾' },
  { id: 'dairy_free',  label: 'Dairy Free',  emoji: '🥛' },
  { id: 'halal',       label: 'Halal',       emoji: '☪️' },
]

const ALL_CHIPS = [
  { category: '🍽 Cuisines',     chips: CUISINE_CHIPS },
  { category: '⏱ Style',        chips: STYLE_CHIPS },
  { category: '👨‍👩‍👧 Household',  chips: HOUSEHOLD_CHIPS },
  { category: '🌱 Diet',         chips: DIET_CHIPS },
]

const CUISINE_IDS = new Set(CUISINE_CHIPS.map(c => c.id))
const DIET_IDS    = new Set(DIET_CHIPS.map(c => c.id))

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSnoozed(): boolean {
  try {
    const v = localStorage.getItem(SNOOZE_KEY)
    if (!v) return false
    return Date.now() < Number(v)
  } catch {
    return false
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DURATION_MS))
  } catch { /* storage unavailable */ }
}

function chipsToPayload(selected: Set<string>) {
  const cuisines = [...selected].filter(id => CUISINE_IDS.has(id))
  const dietTags = [...selected].filter(id => DIET_IDS.has(id))

  return {
    cuisines,
    cooking_time_minutes: selected.has('quick') ? 20 : 30,
    low_energy:           selected.has('low_energy'),
    has_kids:             selected.has('has_kids') ? true : null,
    household_type:       selected.has('solo')   ? 'solo'
                        : selected.has('family') ? 'family'
                        : null,
    store_preference:     selected.has('budget') ? 'budget' : null,
    disliked_foods:       dietTags,   // repurposed as dietary lifestyle tags
    picky_eater:          false,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OnboardingPromptPopup() {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const hasFetched = useRef(false)

  // Fetch status on mount
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    // Check localStorage snooze first (instant, no network)
    if (isSnoozed()) return

    fetch('/api/onboarding/status')
      .then(r => r.json())
      .then(({ shouldShowPrompt }: { shouldShowPrompt: boolean }) => {
        if (shouldShowPrompt) setVisible(true)
      })
      .catch(() => { /* non-fatal */ })
  }, [])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (selected.size < 3 || saving) return
    setSaving(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chipsToPayload(selected)),
      })
      setVisible(false)
      toast.success('Perfect ✨ Your next meal plan just got smarter.')
    } catch {
      toast.error('Could not save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleRemindLater() {
    snooze()
    setVisible(false)
  }

  const readyToSave = selected.size >= 3

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRemindLater}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-3xl bg-white shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-black/10" />
            </div>

            {/* Close button */}
            <button
              onClick={handleRemindLater}
              className="absolute top-4 right-4 rounded-full p-1.5 text-black/30 transition hover:bg-black/5 hover:text-black/60"
              aria-label="Dismiss"
            >
              <XIcon className="h-4 w-4" />
            </button>

            <div className="px-6 pt-2 pb-6">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                  Let&apos;s make MealEase feel like magic ✨
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Pick 3 things you love — we&apos;ll build meals around them.
                </p>
              </div>

              {/* Progress counter */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    {readyToSave
                      ? `${selected.size}/3 ready ✨`
                      : `${selected.size}/3 selected — pick ${3 - selected.size} more`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-green-400"
                    animate={{ width: `${Math.min((selected.size / 3) * 100, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  />
                </div>
              </div>

              {/* Chip grid */}
              <div className="space-y-3 max-h-[42vh] overflow-y-auto pb-1 pr-1">
                {ALL_CHIPS.map(({ category, chips }) => (
                  <div key={category}>
                    <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chips.map(chip => {
                        const active = selected.has(chip.id)
                        return (
                          <button
                            key={chip.id}
                            onClick={() => toggle(chip.id)}
                            className={[
                              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all select-none',
                              active
                                ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                            ].join(' ')}
                          >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={handleSave}
                  disabled={!readyToSave || saving}
                  className={[
                    'w-full rounded-2xl py-3.5 text-sm font-semibold transition-all',
                    readyToSave && !saving
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md shadow-orange-200 hover:opacity-90 active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  {saving ? 'Saving…' : 'Build My Smart Plan'}
                </button>
                <button
                  onClick={handleRemindLater}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
