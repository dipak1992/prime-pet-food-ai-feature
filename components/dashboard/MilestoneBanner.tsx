'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { X, Gift, Star, Sparkles } from 'lucide-react'
import { useLearningStore } from '@/lib/learning/store'

interface Milestone {
  id: string
  minSaves?: number
  minInteractions?: number
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  href: string
  gradient: string
}

const MILESTONES: Milestone[] = [
  {
    id: 'first-save',
    minSaves: 1,
    icon: <Star className="h-5 w-5 text-amber-500" />,
    title: 'Your first saved meal!',
    description: 'Plus lets you build a full week around your favorites — with a grocery list.',
    cta: 'See Plus plans',
    href: '/pricing',
    gradient: 'from-amber-50 to-orange-50',
  },
  {
    id: '5-saves',
    minSaves: 5,
    icon: <Gift className="h-5 w-5 text-rose-500" />,
    title: '5 meals saved — build a week around them',
    description: 'You have enough favorites for a full weekly plan. Plus unlocks all 7 days + grocery list.',
    cta: 'Start free trial',
    href: '/pricing',
    gradient: 'from-rose-50 to-pink-50',
  },
  {
    id: '10-interactions',
    minInteractions: 10,
    icon: <Sparkles className="h-5 w-5 text-violet-500" />,
    title: 'MealEase has learned your taste',
    description: 'After 10+ meals explored, your recommendations are dialed in. Plus unlocks the full experience.',
    cta: 'Unlock Plus',
    href: '/pricing',
    gradient: 'from-violet-50 to-indigo-50',
  },
]

const DISMISSED_KEY = 'mealease-milestones-dismissed'

function getDismissed(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')
  } catch {
    return []
  }
}

function setDismissed(ids: string[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids))
}

export function MilestoneBanner({ isPro }: { isPro: boolean }) {
  const { feedbackHistory } = useLearningStore()
  const [dismissed, setDismissedState] = useState<string[]>(getDismissed)

  const activeMilestone = useMemo(() => {
    if (isPro) return null
    const saves = (feedbackHistory ?? []).filter(
      (f: { action?: string }) => f.action === 'save'
    ).length
    const interactions = (feedbackHistory ?? []).length

    // Find the highest-priority (last matching) milestone that hasn't been dismissed
    let best: Milestone | null = null
    for (const m of MILESTONES) {
      if (dismissed.includes(m.id)) continue
      const savesOk = m.minSaves === undefined || saves >= m.minSaves
      const interactionsOk = m.minInteractions === undefined || interactions >= m.minInteractions
      if (savesOk && interactionsOk) best = m
    }
    return best
  }, [feedbackHistory, isPro, dismissed])

  if (!activeMilestone) return null

  function handleDismiss() {
    const next = [...dismissed, activeMilestone!.id]
    setDismissedState(next)
    setDismissed(next)
  }

  return (
    <div
      className={`relative rounded-2xl border border-border/60 bg-gradient-to-r ${activeMilestone.gradient} p-4 pr-10`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 flex-shrink-0 shadow-sm">
          {activeMilestone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{activeMilestone.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {activeMilestone.description}
          </p>
          <Link
            href={activeMilestone.href}
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline"
          >
            {activeMilestone.cta} →
          </Link>
        </div>
      </div>
    </div>
  )
}
