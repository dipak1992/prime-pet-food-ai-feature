'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

// ─── Highlights ───────────────────────────────────────────────────────────────

const HIGHLIGHTS = [
  { emoji: '🍽️', text: 'Personalised weekly meal plans' },
  { emoji: '🛒', text: 'Smart grocery lists with cost estimates' },
  { emoji: '🥦', text: 'Dietary & allergy-aware recipes' },
  { emoji: '⏱️', text: 'Recipes matched to your skill level' },
]

// ─── Step ─────────────────────────────────────────────────────────────────────

export default function StepDone() {
  const { submit, isSubmitting, error } = useOnboardingStore()
  const router = useRouter()

  // Auto-submit when this step mounts
  useEffect(() => {
    submit().then((ok) => {
      if (ok) {
        // Small delay so user sees the success state
        setTimeout(() => router.push('/dashboard'), 1200)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8 text-center">
      {/* Icon */}
      <div className="flex flex-col items-center gap-4">
        {isSubmitting ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D97757]/20">
            <Loader2 className="h-10 w-10 animate-spin text-[#D97757]" />
          </div>
        ) : error ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <span className="text-4xl">⚠️</span>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            {isSubmitting
              ? 'Setting up your kitchen…'
              : error
              ? 'Something went wrong'
              : "You're all set! 🎉"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSubmitting
              ? 'Saving your preferences…'
              : error
              ? error
              : 'Redirecting to your dashboard…'}
          </p>
        </div>
      </div>

      {/* Feature highlights (shown while loading) */}
      {(isSubmitting || !error) && (
        <ul className="mx-auto max-w-xs space-y-3 text-left">
          {HIGHLIGHTS.map((h) => (
            <li key={h.text} className="flex items-center gap-3">
              <span className="text-xl">{h.emoji}</span>
              <span className="text-sm text-slate-600">{h.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Retry button on error */}
      {error && (
        <button
          type="button"
          onClick={() => submit()}
          className="rounded-2xl bg-[#D97757] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c4694a]"
        >
          Try again
        </button>
      )}
    </div>
  )
}
