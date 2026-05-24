'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Zap, Sparkles, CalendarDays, ChevronRight, BookMarked, Flame } from 'lucide-react'
import { MealSwipeStack } from '@/components/dashboard/MealSwipeStack'
import { SmartInput } from '@/components/dashboard/SmartInput'
import { QuickSuggestion } from '@/components/dashboard/QuickSuggestion'
import { MilestoneBanner } from '@/components/dashboard/MilestoneBanner'
import { StreakBadge } from '@/components/habit/StreakBadge'
import { TodayCard } from '@/components/habit/TodayCard'
import { InsightCards } from '@/components/habit/InsightCards'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { DEMO_WEEKLY_PLAN } from '@/lib/demo-data'
import type { LifeStage } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

type SituationMode = 'tired' | 'ingredients' | 'smart' | 'planner' | null

const SITUATIONS: {
  id: Exclude<SituationMode, null>
  emoji: string
  label: string
  hint: string
  inputPlaceholder?: string
}[] = [
  {
    id: 'tired',
    emoji: '⚡',
    label: "I don't want to think",
    hint: 'One tap — dinner decided',
  },
  {
    id: 'ingredients',
    emoji: '📸',
    label: 'Snap & Cook',
    hint: 'Snap your fridge or list ingredients',
    inputPlaceholder: 'e.g. chicken, broccoli, garlic, pasta…',
  },
  {
    id: 'smart',
    emoji: '✨',
    label: 'Surprise me',
    hint: 'Picked for your family, not just anyone',
  },
  {
    id: 'planner',
    emoji: '📅',
    label: 'Plan my week',
    hint: '7 dinners, zero repeats',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getH1(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'What are we cooking today?'
  if (h >= 11 && h < 17) return "What's for dinner tonight?"
  return 'What sounds good tonight?'
}

function stageToEmoji(stage: LifeStage): string {
  if (stage === 'baby')   return '👶'
  if (stage === 'toddler') return '🧒'
  if (stage === 'kid')    return '👦'
  return '🧑'
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  userName: string
}

export function DashboardClient({ userName }: Props) {
  const [mode, setMode] = useState<SituationMode>(null)
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null)

  const firstName = userName.includes('@') ? userName.split('@')[0] : userName
  const activeMode = SITUATIONS.find(s => s.id === mode)

  useEffect(() => {
    fetch('/api/habit/streak')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.current_streak >= 1) setStreak(data)
      })
      .catch(() => null)
  }, [])

  // ── Stores ──────────────────────────────────────────────────────────────────
  const { state: { members } } = useOnboardingStore()
  const { hasKids, householdType } = useLightOnboardingStore()
  const { feedbackHistory } = useLearningStore()
  const { status: paywallStatus } = usePaywallStatus()

  // ── Derived stats ────────────────────────────────────────────────────────────
  const savedCount = useMemo(() =>
    (feedbackHistory ?? []).filter((f: { action?: string; saved?: boolean }) =>
      f.action === 'save' || f.saved === true
    ).length,
    [feedbackHistory]
  )

  const mealsPlannedCount = useMemo(() =>
    DEMO_WEEKLY_PLAN.days.filter(d => d?.meals?.length > 0).length,
    []
  )

  const totalInteractions = useMemo(() =>
    (feedbackHistory ?? []).length,
    [feedbackHistory]
  )

  // ── Family emojis ─────────────────────────────────────────────────────────
  const familyEmojis = useMemo(() => {
    if (members && members.length > 0) {
      return members.slice(0, 5).map(m => stageToEmoji(m.stage ?? 'adult'))
    }
    const base: string[] = householdType === 'solo' ? ['🧑'] : ['🧑', '🧑']
    if (hasKids) base.push('🧒')
    return base
  }, [members, hasKids, householdType])

  function selectMode(id: Exclude<SituationMode, null>) {
    setMode(id)
    setInput('')
    setSubmitted(false)
    // tired & smart modes — skip input step
    if (id === 'tired' || id === 'smart') setSubmitted(true)
  }

  function handleBack() {
    setMode(null)
    setInput('')
    setSubmitted(false)
  }

  function handleSmartSubmit(value: string, detectedMode?: 'ingredients' | 'inspiration') {
    // If image analysis detected a different mode, switch to it
    if (detectedMode && detectedMode !== mode) {
      const mapped: SituationMode = detectedMode === 'ingredients' ? 'ingredients' : 'smart'
      setMode(mapped)
    }
    setInput(value)
    setSubmitted(true)
  }

  const initial = firstName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fef7f0 0%, #f0fdf4 15%, #ffffff 40%, #ffffff 100%)' }}>
      {/* ── Top bar — only shown when a mode is active (Back button) ── */}
      {mode && (
        <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </motion.button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-5 py-6">
        <AnimatePresence mode="wait">

          {/* ── Home screen ── */}
          {!mode && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Greeting + Title */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">
                    {getGreeting()}, {firstName}
                  </p>
                  <StreakBadge />
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                  {getH1()}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Getting smarter about what your family loves.
                </p>

                {/* Family profile chip */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-1">
                    {familyEmojis.map((emoji, i) => (
                      <span
                        key={i}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border-2 border-white text-base ring-1 ring-border/20"
                        title={`Member ${i + 1}`}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Learning your family
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Adapting for you
                  </span>
                </div>
              </div>

              {/* ── HERO CTA — inline decide (stays on dashboard) ── */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                onClick={() => selectMode('tired')}
                className="glass-card flex items-center gap-4 w-full px-6 py-5 rounded-2xl border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 hover:shadow-lg transition-all group text-left mb-4"
              >
                <span className="text-4xl flex-shrink-0">😴</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold group-hover:text-primary transition-colors">I don&apos;t want to think</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Just pick something simple for tonight →</p>
                </div>
              </motion.button>

              {/* ── Surprise me — accent card with gradient ── */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                onClick={() => selectMode('smart')}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left mb-5 transition-all hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #fef3c7 100%)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                }}
              >
                <span className="text-3xl flex-shrink-0">🎲</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-violet-900">Surprise me</p>
                  <p className="text-xs text-violet-600/80 mt-0.5">Picked based on what your family tends to enjoy</p>
                </div>
                <Sparkles className="h-5 w-5 text-violet-400 flex-shrink-0" />
              </motion.button>

              {/* ── Secondary modes — 2×2 grid like landing page ── */}
              <p className="text-xs text-muted-foreground mb-3">Or choose a different approach:</p>
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => selectMode('ingredients')}
                  className="glass-card rounded-xl p-4 border border-border/60 hover:border-primary/40 hover:shadow-md transition-all group text-center"
                >
                  <span className="text-2xl block mb-1.5">📸</span>
                  <span className="text-xs font-semibold group-hover:text-primary transition-colors block">Snap & Cook</span>
                  <span className="text-[11px] text-muted-foreground">Snap your fridge</span>
                </motion.button>

                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/grocery-list"
                    className="glass-card rounded-xl p-4 border border-border/60 hover:border-primary/40 hover:shadow-md transition-all group text-center block"
                  >
                    <span className="text-2xl block mb-1.5">🛒</span>
                    <span className="text-xs font-semibold group-hover:text-primary transition-colors block">Grocery list</span>
                    <span className="text-[11px] text-muted-foreground">Auto-built for you</span>
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/kids"
                    className="glass-card rounded-xl p-4 border border-border/60 hover:border-primary/40 hover:shadow-md transition-all group text-center block"
                  >
                    <span className="text-2xl block mb-1.5">👶</span>
                    <span className="text-xs font-semibold group-hover:text-primary transition-colors block">Baby &amp; Kids</span>
                    <span className="text-[11px] text-muted-foreground">Age-safe meals</span>
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/planner"
                    className="glass-card rounded-xl p-4 border border-border/60 hover:border-primary/40 hover:shadow-md transition-all group text-center block"
                  >
                    <span className="text-2xl block mb-1.5">📅</span>
                    <span className="text-xs font-semibold group-hover:text-primary transition-colors block">Plan my week</span>
                    <span className="text-[11px] text-muted-foreground">Full meal planning</span>
                  </Link>
                </motion.div>
              </div>

              {/* Today's meal suggestion — moved up so it's above the fold */}
              <div className="mt-5">
                <TodayCard />
              </div>

              {/* "Your family is covered" strip */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">Gets better with every meal</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">
                    The more you use MealEase, the more it knows what works for your family.
                  </p>
                </div>
              </div>

              {/* Quick stats bar */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <span className="text-lg font-bold text-foreground">{mealsPlannedCount}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">meals this<br/>week</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <span className="text-lg font-bold text-foreground">{savedCount}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">meals<br/>saved</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-border/60 py-2.5 px-2 text-center">
                  <span className="text-lg font-bold text-foreground">{totalInteractions}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">meals<br/>explored</span>
                </div>
              </div>

              {/* Streak card */}
              {streak && streak.current_streak >= 1 && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 flex-shrink-0">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-orange-900">
                      🔥 {streak.current_streak}-day cooking streak!
                    </p>
                    <p className="text-xs text-orange-700/80 mt-0.5">
                      {streak.current_streak >= streak.longest_streak
                        ? 'Personal best — keep it going!'
                        : `Best: ${streak.longest_streak} days · Cook tonight to keep it going`}
                    </p>
                  </div>
                </div>
              )}

              {/* Weekend Mode banner — PRO only, Fri 5pm+ / Sat / Sun */}
              {(() => {
                const d = new Date()
                const day = d.getDay()
                const hour = d.getHours()
                const isWeekend =
                  day === 0 || day === 6 || (day === 5 && hour >= 17)
                return isWeekend && paywallStatus.isPro ? (
                  <Link
                    href="/weekend"
                    className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl flex-shrink-0">🎬</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-amber-900">Weekend Mode</p>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        Dinner + movie picked for tonight →
                      </p>
                    </div>
                  </Link>
                ) : null
              })()}

              {/* Value Accumulator — free users only */}
              {!paywallStatus.isPro && totalInteractions > 0 && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        MealEase has learned from {totalInteractions} meal{totalInteractions !== 1 ? 's' : ''} with your family
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {savedCount > 0
                          ? `${savedCount} saved to your favorites. `
                          : ''}
                        Pro members save an average of 4.2 hours per week on meal planning.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing?intent=pro"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Upgrade to Pro
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {/* Milestone offer — free users only */}
              <div className="mt-4">
                <MilestoneBanner isPro={paywallStatus.isPro} />
              </div>

              {/* InsightCards */}
              <div className="mt-4">
                <InsightCards />
              </div>

              {/* Bottom CTA — only shown when no meals are planned yet */}
              {mealsPlannedCount === 0 && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-border/60">
                <div
                  className="relative px-5 py-5"
                  style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
                      <BookMarked className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug">
                        Build your full week in one tap
                      </p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">
                        7 dinners, all age-adapted, zero repeats — ready in seconds.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/planner"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    Plan my week
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              )}
            </motion.div>
          )}

          {/* ── Input step ── */}
          {mode && !submitted && activeMode?.inputPlaceholder && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <span className="text-3xl mb-3 block">{activeMode.emoji}</span>
                <h2 className="text-xl font-bold text-foreground">{activeMode.label}</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeMode.hint}</p>
              </div>

              <SmartInput
                mode={mode as 'ingredients' | 'inspiration'}
                placeholder={activeMode.inputPlaceholder}
                onSubmit={handleSmartSubmit}
              />
            </motion.div>
          )}

          {/* ── Swipe stack ── */}
          {mode && submitted && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {activeMode?.emoji} {mode === 'tired' ? 'Here\u2019s something easy' : mode === 'smart' ? 'Picked for you' : 'Your matches'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mode === 'smart' ? 'Based on your taste · Swipe to explore' : 'Swipe to replace · Save what you love'}
                </p>
              </div>

              <MealSwipeStack
                mode={mode as 'ingredients' | 'inspiration' | 'tired' | 'smart'}
                input={input}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
