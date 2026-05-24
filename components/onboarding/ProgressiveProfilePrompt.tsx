'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { getProgressivePromptForPath } from '@/lib/onboarding/progressive'

const STORAGE_KEY = 'mealease-progressive-profile'

function readSeenPrompts(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as string[] : []
  } catch {
    return []
  }
}

function writeSeenPrompt(id: string) {
  const seen = new Set(readSeenPrompts())
  seen.add(id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seen)))
}

export function ProgressiveProfilePrompt() {
  const pathname = usePathname()
  const prompt = useMemo(() => getProgressivePromptForPath(pathname), [pathname])
  const [visible, setVisible] = useState(false)
  const [savingValue, setSavingValue] = useState<string | number | boolean | null>(null)

  useEffect(() => {
    if (!prompt) {
      setVisible(false)
      return
    }

    const seen = readSeenPrompts()
    if (seen.includes(prompt.id)) {
      setVisible(false)
      return
    }

    const timer = window.setTimeout(() => setVisible(true), 1400)
    return () => window.clearTimeout(timer)
  }, [prompt])

  if (!prompt || !visible) return null

  const dismiss = () => {
    writeSeenPrompt(prompt.id)
    setVisible(false)
  }

  const save = async (value: string | number | boolean) => {
    setSavingValue(value)
    try {
      await fetch('/api/onboarding/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: prompt.field, value }),
      })
    } finally {
      writeSeenPrompt(prompt.id)
      setVisible(false)
      setSavingValue(null)
    }
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl shadow-neutral-950/15 dark:border-neutral-800 dark:bg-neutral-950 sm:left-auto sm:right-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-950 dark:text-neutral-50">{prompt.question}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {prompt.helper}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
          aria-label="Dismiss preference question"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {prompt.options.map((option) => (
          <button
            key={`${prompt.id}-${option.label}`}
            type="button"
            onClick={() => save(option.value)}
            disabled={savingValue !== null}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-[#D97757] hover:bg-[#FDF6F1] disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            {savingValue === option.value ? 'Saving...' : option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Finish later
        </button>
      </div>
    </aside>
  )
}
