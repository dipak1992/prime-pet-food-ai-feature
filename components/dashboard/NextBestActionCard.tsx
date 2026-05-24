'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  MessageSquareQuote,
  Refrigerator,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { trackEvent, Analytics } from '@/lib/analytics'
import type { DashboardPayload, Nudge } from '@/lib/dashboard/types'

const REVIEW_DISMISS_KEY = 'mealease_review_prompt_dismissed_v1'

type Props = {
  user: DashboardPayload['user']
  retention: DashboardPayload['retention']
  nudge: Nudge | null
}

export function NextBestActionCard({ user, retention, nudge }: Props) {
  const [reviewDismissed, setReviewDismissed] = useState(true)

  useEffect(() => {
    setReviewDismissed(window.localStorage.getItem(REVIEW_DISMISS_KEY) === '1')
  }, [])

  const action = useMemo(() => {
    if (nudge) {
      return {
        icon: Sparkles,
        eyebrow: 'Next best action',
        title: nudge.title,
        body: nudge.body,
        cta: nudge.ctaLabel,
        href: nudge.ctaHref,
        tone: 'orange' as const,
      }
    }

    if (retention.expiringSoon > 0) {
      return {
        icon: Refrigerator,
        eyebrow: 'Use soon',
        title: `${retention.expiringSoon} leftover${retention.expiringSoon === 1 ? '' : 's'} need attention`,
        body: 'Turn what is already cooked into the easiest next meal.',
        cta: 'Use leftovers',
        href: '/leftovers',
        tone: 'emerald' as const,
      }
    }

    if (retention.isDinnerWindow) {
      return {
        icon: Utensils,
        eyebrow: 'Dinner window',
        title: 'Pick tonight before the evening gets noisy',
        body: 'Your smart pick is ready. Cook it, swap it, or save it for later.',
        cta: 'Review tonight',
        href: '/dashboard',
        tone: 'orange' as const,
      }
    }

    if (retention.isSunday || retention.plannedDays < 3) {
      return {
        icon: CalendarDays,
        eyebrow: 'Plan rhythm',
        title: retention.plannedDays > 0
          ? `${retention.plannedDays} day${retention.plannedDays === 1 ? '' : 's'} planned`
          : 'Set up the next few dinners',
        body: 'Keep the week simple with a short plan and grocery list.',
        cta: 'Plan week',
        href: '/planner',
        tone: 'violet' as const,
      }
    }

    const reviewQualifies =
      !reviewDismissed &&
      (retention.plannedDays >= 3 || retention.expiringSoon > 0 || user.plan !== 'free')

    if (reviewQualifies) {
      return {
        icon: MessageSquareQuote,
        eyebrow: 'Quick feedback',
        title: 'Has MealEase saved a dinner decision?',
        body: 'Share a quick win so we can improve the dashboard around what actually helps.',
        cta: 'Share story',
        href: '/contact',
        tone: 'orange' as const,
        review: true,
      }
    }

    return {
      icon: Sparkles,
      eyebrow: 'Keep connected',
      title: 'Tonight, leftovers, groceries, and budget are in one place',
      body: 'Start with tonight, then let the rest of the week follow.',
      cta: 'Open planner',
      href: '/planner',
      tone: 'orange' as const,
    }
  }, [nudge, retention, reviewDismissed, user.plan])

  const Icon = action.icon
  const tone =
    action.tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
      : action.tone === 'violet'
        ? 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300'
        : 'border-orange-200 bg-orange-50 text-[#D97757] hover:border-orange-300'

  return (
    <section
      aria-label="Next best action"
      className={`rounded-2xl border p-4 transition hover:shadow-sm ${tone}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{action.eyebrow}</p>
          <h2 className="mt-0.5 text-sm font-bold text-neutral-950">{action.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">{action.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={action.href}
              onClick={() => {
                if (action.review) {
                  trackEvent(Analytics.REVIEW_PROMPT_CLICKED, {
                    destination: 'contact',
                    plan: user.plan,
                  })
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800"
            >
              {action.cta}
              <ArrowRight className="h-3 w-3" />
            </Link>
            {action.review && (
              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem(REVIEW_DISMISS_KEY, '1')
                  setReviewDismissed(true)
                }}
                className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-800"
              >
                Not now
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
