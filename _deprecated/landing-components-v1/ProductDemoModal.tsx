'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Moon,
  Camera,
  Calendar,
  Users,
  Sparkles,
  Clock,
  ShieldCheck,
  DollarSign,
  Check,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Scene definitions ────────────────────────────────────────────────────────

const SCENES = [
  {
    id: 'tonight',
    step: '01',
    icon: Moon,
    emoji: '🌙',
    label: 'Feed Everyone Tonight',
    tagline: 'Dinner decided in 18 seconds',
    accentColor: 'text-orange-400',
    accentBg: 'bg-orange-500',
    accentLight: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/20',
    gradientFrom: 'from-orange-950/40',
    gradientTo: 'to-slate-950',
    description:
      'Tap once. Get a personalized dinner idea built around your household — allergies, preferences, and what you have. No scrolling, no debating.',
    preview: {
      title: 'Creamy Pesto Salmon Bowls',
      time: '22 min',
      servings: '4',
      match: '94% match',
      tags: ['Dairy-free option', 'Kid-friendly', 'High protein'],
      chips: [
        { icon: Clock, text: '22 min', color: 'text-orange-400' },
        { icon: Users, text: '4 servings', color: 'text-orange-400' },
        { icon: ShieldCheck, text: 'Allergy-safe', color: 'text-emerald-400' },
      ],
    },
  },
  {
    id: 'snap',
    step: '02',
    icon: Camera,
    emoji: '📸',
    label: 'Snap & Cook',
    tagline: 'Photo your fridge. Get meals instantly.',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500',
    accentLight: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    gradientFrom: 'from-emerald-950/40',
    gradientTo: 'to-slate-950',
    description:
      'Take a photo of your fridge or pantry shelf. AI identifies every ingredient and builds meals from what you already own. Less waste, less spending.',
    preview: {
      title: 'Garlic Butter Chicken Stir-Fry',
      time: '18 min',
      servings: '3',
      match: '85% pantry match',
      tags: ['Only 2 items to buy', 'Quick prep', 'Budget-friendly'],
      chips: [
        { icon: Camera, text: 'AI detected 14 items', color: 'text-emerald-400' },
        { icon: DollarSign, text: 'Save $22 this week', color: 'text-emerald-400' },
        { icon: Check, text: '85% pantry match', color: 'text-emerald-400' },
      ],
    },
  },
  {
    id: 'autopilot',
    step: '03',
    icon: Calendar,
    emoji: '📅',
    label: 'Weekly Autopilot',
    tagline: 'Your entire week, planned in one tap',
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-500',
    accentLight: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    gradientFrom: 'from-blue-950/40',
    gradientTo: 'to-slate-950',
    description:
      '7 unique dinners, zero repeats, auto-generated grocery list with budget tracking. Regenerate any night. Share with your partner.',
    preview: {
      title: 'Week of Apr 21 — Family Plan',
      time: '~25 min avg',
      servings: '4',
      match: '$68 total',
      tags: ['7 unique meals', 'Auto-balanced', 'Shared with partner'],
      chips: [
        { icon: Calendar, text: '7 nights planned', color: 'text-blue-400' },
        { icon: DollarSign, text: '$68 grocery total', color: 'text-blue-400' },
        { icon: Sparkles, text: 'One-tap regenerate', color: 'text-blue-400' },
      ],
    },
  },
  {
    id: 'family',
    step: '04',
    icon: Users,
    emoji: '🏠',
    label: 'Family Plus Tools',
    tagline: 'One meal. Every version handled.',
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500',
    accentLight: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
    gradientFrom: 'from-violet-950/40',
    gradientTo: 'to-slate-950',
    description:
      'Picky toddler? Partner on keto? Baby with allergies? Cook once — each person gets their own adapted plate. Up to 6 household members.',
    preview: {
      title: 'Lemon Herb Chicken — 4 Versions',
      time: '28 min',
      servings: '4',
      match: '6 members',
      tags: ['Dairy-free for mom', 'Soft veggies for toddler', 'Keto for dad'],
      chips: [
        { icon: Users, text: '6 members supported', color: 'text-violet-400' },
        { icon: ShieldCheck, text: 'Allergy profiles', color: 'text-violet-400' },
        { icon: Zap, text: 'Auto-adapted plates', color: 'text-violet-400' },
      ],
    },
  },
]

// ─── Scene card UI ────────────────────────────────────────────────────────────

function SceneCard({ scene }: { scene: (typeof SCENES)[0] }) {
  const Icon = scene.icon
  return (
    <div className="relative flex flex-col h-full">
      {/* Ambient gradient background */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-60',
          scene.gradientFrom,
          scene.gradientTo,
        )}
      />

      <div className="relative z-[1] flex flex-col h-full p-6 sm:p-8">
        {/* Scene header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
              scene.accentLight,
              scene.accentBorder,
            )}
          >
            <Icon className={cn('h-6 w-6', scene.accentColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-bold tracking-widest uppercase', scene.accentColor)}>
                Step {scene.step}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {scene.emoji} {scene.label}
            </h3>
            <p className={cn('text-sm font-medium mt-0.5', scene.accentColor)}>{scene.tagline}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-6">
          {scene.description}
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {scene.preview.chips.map((chip) => {
            const ChipIcon = chip.icon
            return (
              <div
                key={chip.text}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                  scene.accentLight,
                  scene.accentBorder,
                  'text-white/80',
                )}
              >
                <ChipIcon className={cn('h-3.5 w-3.5', chip.color)} />
                {chip.text}
              </div>
            )
          })}
        </div>

        {/* Meal preview card */}
        <div
          className={cn(
            'mt-auto rounded-2xl border p-4 backdrop-blur-sm',
            scene.accentBorder,
            'bg-white/[0.06]',
          )}
        >
          {/* Mode badge */}
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white mb-3',
              scene.accentBg,
            )}
          >
            {scene.emoji} {scene.label}
          </div>

          <h4 className="text-base font-bold text-white mb-2">{scene.preview.title}</h4>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-white/55 flex items-center gap-1">
              <Clock className="h-3 w-3 text-white/40" />
              {scene.preview.time}
            </span>
            <span className="text-xs text-white/55 flex items-center gap-1">
              <Users className="h-3 w-3 text-white/40" />
              Serves {scene.preview.servings}
            </span>
            <span className={cn('text-xs font-semibold ml-auto', scene.accentColor)}>
              {scene.preview.match}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {scene.preview.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-white/[0.08] border border-white/10 px-2 py-0.5 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface ProductDemoModalProps {
  open: boolean
  onClose: () => void
}

export function ProductDemoModal({ open, onClose }: ProductDemoModalProps) {
  const [activeScene, setActiveScene] = useState(0)
  const [direction, setDirection] = useState(1)

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => {
      setDirection(1)
      setActiveScene((prev) => (prev + 1) % SCENES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [open, activeScene])

  // Reset on open
  useEffect(() => {
    if (open) setActiveScene(0)
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveScene((prev) => (prev + 1) % SCENES.length)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveScene((prev) => (prev - 1 + SCENES.length) % SCENES.length)
  }, [])

  const goTo = useCallback((i: number) => {
    setDirection(i > activeScene ? 1 : -1)
    setActiveScene(i)
  }, [activeScene])

  const scene = SCENES[activeScene]

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl pointer-events-auto rounded-[28px] border border-white/10 bg-slate-950 shadow-[0_32px_100px_-16px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
                {/* Logo / title */}
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-white/80">How MealEase Works</span>
                </div>

                {/* Step indicator */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {SCENES.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => goTo(i)}
                      aria-label={`Go to scene ${i + 1}: ${s.label}`}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        i === activeScene
                          ? `w-6 ${scene.accentBg}`
                          : 'w-1.5 bg-white/20 hover:bg-white/40',
                      )}
                    />
                  ))}
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label="Close demo"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scene content */}
              <div className="relative min-h-[420px] sm:min-h-[460px] overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={scene.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <SceneCard scene={scene} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.07] bg-white/[0.02]">
                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    aria-label="Previous scene"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next scene"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Mobile step dots */}
                  <div className="flex sm:hidden items-center gap-1 ml-2">
                    {SCENES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => goTo(i)}
                        aria-label={`Scene ${i + 1}`}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          i === activeScene
                            ? `w-5 ${scene.accentBg}`
                            : 'w-1.5 bg-white/20',
                        )}
                      />
                    ))}
                  </div>

                  <span className="hidden sm:block text-xs text-white/30 ml-1">
                    {activeScene + 1} / {SCENES.length}
                  </span>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-5 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all"
                >
                  <Link href="/signup" onClick={onClose}>
                    Get Started Free
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
