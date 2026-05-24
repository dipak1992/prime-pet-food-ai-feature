'use client'

import { useMemo } from 'react'
import { useLearningStore } from '@/lib/learning/store'

interface FeedbackEntry {
  action?: string
  liked?: boolean
  saved?: boolean
}

export function ProgressCard() {
  const { feedbackHistory } = useLearningStore()

  const stats = useMemo(() => {
    const history = (feedbackHistory ?? []) as FeedbackEntry[]
    const decisionsHelped = history.length
    const homeCooked = history.filter(
      (f) => f.action === 'like' || f.liked === true
    ).length
    const estimatedSaved = homeCooked * 12
    return { decisionsHelped, homeCooked, estimatedSaved }
  }, [feedbackHistory])

  if (stats.decisionsHelped === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
        Your Progress
      </h2>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-border/60 py-4 px-3">
          <span className="text-xl font-bold text-foreground tabular-nums">
            {stats.decisionsHelped}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
            decisions
            <br />
            helped
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-border/60 py-4 px-3">
          <span className="text-xl font-bold text-foreground tabular-nums">
            {stats.homeCooked}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
            meals
            <br />
            home-cooked
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-border/60 py-4 px-3">
          <span className="text-xl font-bold text-primary tabular-nums">
            ~${stats.estimatedSaved}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
            estimated
            <br />
            saved
          </span>
        </div>
      </div>
    </section>
  )
}
