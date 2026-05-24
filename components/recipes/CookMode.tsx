'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronLeft, ChevronRight, X, Timer, Play, Pause, RotateCcw, CheckCircle2, Check,
  ShieldCheck,
} from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'
import { CookCompleteDialog } from './CookCompleteDialog'
import { recipeSignature } from '@/lib/recipes/canonical'
import { extractTimerSeconds } from '@/lib/recipes/timer-extractor'

// ─── Types ────────────────────────────────────────────────────────────────────

type Recipe = LoadedRecipe

type Props = {
  recipe: Recipe
  recipeId: string
}

// ─── Timer hook ───────────────────────────────────────────────────────────────

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
      return
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [running, seconds])

  const toggle = useCallback(() => setRunning((r) => !r), [])
  const reset  = useCallback(() => { setSeconds(initialSeconds); setRunning(false) }, [initialSeconds])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return { display: `${mm}:${ss}`, running, toggle, reset, done: seconds === 0 }
}

// ─── Step timer ───────────────────────────────────────────────────────────────

function StepTimer({ seconds: initialSeconds }: { seconds: number }) {
  const timer = useTimer(initialSeconds)
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/82 px-4 py-3 shadow-sm">
      <Timer className={['h-4 w-4', timer.done ? 'text-emerald-400' : 'text-[#D97757]'].join(' ')} />
      <span className={['text-lg font-mono font-bold tabular-nums', timer.done ? 'text-emerald-600' : 'text-slate-950'].join(' ')}>
        {timer.display}
      </span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={timer.toggle}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100"
          aria-label={timer.running ? 'Pause' : 'Start'}
        >
          {timer.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={timer.reset}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100"
          aria-label="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Ingredient check step ────────────────────────────────────────────────────

function IngredientCheckStep({ ingredients }: { ingredients: Recipe['ingredients'] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D97757] text-sm font-bold text-white">
          ✓
        </div>
        <p className="text-sm text-slate-500">Check your ingredients</p>
      </div>
      <h2 className="mb-4 text-xl font-medium text-slate-950">
        Gather everything before you start
      </h2>
      <ul className="space-y-2">
        {ingredients.map((ing, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className={[
                'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                checked.has(i)
                  ? 'border-emerald-200 bg-emerald-50 text-slate-500 line-through'
                  : 'border-orange-100 bg-white/82 text-slate-700 hover:bg-orange-50',
              ].join(' ')}
            >
              <span className="text-sm">{ing.name}</span>
              <span className="flex items-center gap-2 text-sm text-slate-500">
                {ing.quantity} {ing.unit}
                {checked.has(i) && <Check className="h-4 w-4 text-emerald-400" />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── CookMode ─────────────────────────────────────────────────────────────────

export function CookMode({ recipe, recipeId }: Props) {
  // -1 = ingredient check step, 0..n-1 = cooking steps
  const [current, setCurrent] = useState(-1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [showComplete, setShowComplete] = useState(false)
  const [keepAwake, setKeepAwake] = useState(true)
  const [wakeLockSupported, setWakeLockSupported] = useState(true)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const signature = recipeSignature(recipe)

  const steps = recipe.steps
  const isIngredientStep = current === -1
  const isFirst = current === -1
  const isLast  = current === steps.length - 1
  const step    = steps[current] ?? null

  useEffect(() => {
    setCurrent(-1)
    setCompleted(new Set())
    setShowComplete(false)
  }, [signature])

  // ── Wake lock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function acquireWakeLock() {
      if (!keepAwake) return
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // Wake lock not available — non-critical
        }
      } else {
        setWakeLockSupported(false)
      }
    }
    acquireWakeLock()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquireWakeLock()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [keepAwake])

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showComplete) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (!isLast) setCurrent((c) => Math.min(steps.length - 1, c + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (!isFirst) setCurrent((c) => Math.max(-1, c - 1))
      } else if (e.key === 'Escape') {
        window.history.back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFirst, isLast, steps.length, showComplete])

  function markDone(idx: number) {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(idx)
      return next
    })
  }

  // Total steps including ingredient check
  const totalDisplaySteps = steps.length + 1
  const currentDisplayStep = current + 2 // ingredient check = step 1

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.16),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#fefce8_30%,#f8fafc_100%)] text-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100/80 bg-white/82 px-4 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-slate-700"
            aria-label="Exit cook mode"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-500">Cook Mode</p>
            <p className="text-sm font-semibold text-slate-950 truncate max-w-[180px]">{recipe.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setKeepAwake((value) => !value)}
            disabled={!wakeLockSupported}
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border text-slate-700',
              keepAwake ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-orange-100 bg-orange-50',
              !wakeLockSupported ? 'opacity-40' : '',
            ].join(' ')}
            aria-label={keepAwake ? 'Disable screen wake lock' : 'Keep screen awake'}
            title={wakeLockSupported ? 'Keep screen awake' : 'Wake lock is not supported on this browser'}
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-orange-100">
          <div
            className="h-full bg-[#D97757] transition-all duration-300"
            style={{ width: `${(currentDisplayStep / totalDisplaySteps) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
          {isIngredientStep ? (
            <div className="mx-auto w-full max-w-lg space-y-4">
              <IngredientCheckStep ingredients={recipe.ingredients} />
            </div>
          ) : step ? (
            <div className="mx-auto w-full max-w-lg">
              {/* Step number */}
              <div className="mb-4 flex items-center gap-2">
                <div className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white transition-colors',
                  completed.has(current) ? 'bg-emerald-500' : 'bg-[#D97757]',
                ].join(' ')}>
                  {completed.has(current) ? <Check className="h-4 w-4" /> : step.order}
                </div>
                {completed.has(current) && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>

              {/* Instruction */}
              <p className="text-xl font-medium leading-relaxed text-slate-950">{step.instruction}</p>

              {/* Timer if step has one */}
              {(step.timerSeconds ?? extractTimerSeconds(step.instruction)) && (
                <StepTimer seconds={(step.timerSeconds ?? extractTimerSeconds(step.instruction))!} />
              )}

              {/* Mark done */}
              {!completed.has(current) && (
                <button
                  type="button"
                  onClick={() => markDone(current)}
                  className="mt-6 rounded-2xl border border-orange-100 bg-white/82 px-4 py-2 text-sm text-slate-600 transition hover:bg-orange-50"
                >
                  ✓ Mark as done
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <div className="border-t border-orange-100/80 bg-white/82 px-5 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg gap-3">
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.max(-1, c - 1))}
              disabled={isFirst}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => setShowComplete(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finish cooking!
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#D97757] py-3 text-sm font-semibold text-white transition hover:bg-[#c4694a]"
              >
                {isIngredientStep ? "Let's cook!" : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cook Complete Dialog */}
      {showComplete && (
        <CookCompleteDialog
          recipe={recipe}
          recipeId={recipeId}
          onClose={() => setShowComplete(false)}
        />
      )}
    </>
  )
}
