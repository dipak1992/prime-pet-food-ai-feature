'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { STEPS } from '@/lib/onboarding/steps'
import { cn } from '@/lib/utils'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'

type Props = {
  children: React.ReactNode
  canProceed: boolean
  ctaLabel?: string
  skippable?: boolean
  onNext?: () => void | Promise<void>
}

export function OnboardingShell({
  children,
  canProceed,
  ctaLabel = 'Continue',
  skippable = false,
  onNext,
}: Props) {
  const router = useRouter()
  // Read step only — actions via getState() to avoid re-render subscriptions
  const step = useOnboardingStore((s) => s.step)
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting)

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  // Use ref for isFirst to avoid re-registering the ESC listener on every step change
  const isFirstRef = useRef(isFirst)

  useEffect(() => {
    isFirstRef.current = isFirst
  }, [isFirst])

  // ESC to go back — stable listener using ref
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isFirstRef.current) {
        useOnboardingStore.getState().back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // empty deps — stable via ref

  async function handleNext() {
    if (onNext) await onNext()
    if (isLast) {
      // Last step — submit and redirect to dashboard
      try {
        await useOnboardingStore.getState().submit()
      } catch {
        // Even if submit fails, redirect so user isn't stuck
      }
      router.push('/dashboard')
    } else {
      useOnboardingStore.getState().next()
    }
  }

  function handleBack() {
    if (isFirst) {
      router.push('/')
    } else {
      useOnboardingStore.getState().back()
    }
  }

  function handleSkip() {
    useOnboardingStore.getState().next()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.16),transparent_32%),linear-gradient(180deg,#fff7ed_0%,#fefce8_34%,#f8fafc_100%)] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-orange-100/80 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label={isFirst ? 'Go home' : 'Previous step'}
            className="w-9 h-9 rounded-full text-slate-700 hover:bg-orange-50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <MealEaseLogo size="sm" />

          {skippable ? (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
            >
              Skip
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-orange-100">
          <div
            className="h-full bg-[#D97757] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Step indicator (desktop) */}
      <div className="hidden sm:flex justify-center pt-6 pb-2">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                    i < stepIndex
                      ? 'bg-[#D97757] text-white'
                      : i === stepIndex
                      ? 'bg-[#D97757]/20 text-[#D97757] ring-2 ring-[#D97757]'
                      : 'bg-white/80 text-slate-400 ring-1 ring-orange-100',
                  )}
                >
                  {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    i === stepIndex ? 'text-[#D97757]' : 'text-slate-400',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-px mb-4',
                    i < stepIndex ? 'bg-[#D97757]' : 'bg-orange-100',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 py-6">{children}</div>
      </main>

      {/* Footer CTA */}
      <footer
        className="sticky bottom-0 border-t border-orange-100/80 bg-white/88 px-4 py-4 backdrop-blur-xl"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-lg flex items-center gap-3">
          {!isFirst && (
            <button
              type="button"
              onClick={() => useOnboardingStore.getState().back()}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#D97757] hover:bg-[#C86646] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
          >
            {isSubmitting ? 'Saving…' : isLast ? 'Finish' : ctaLabel}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  )
}
