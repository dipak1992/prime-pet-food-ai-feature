'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, ChevronRight, Recycle, Sparkles } from 'lucide-react'
import { CardShell } from './shared/CardShell'
import { useDashboardStore } from '@/stores/dashboardStore'
import { cn } from '@/lib/utils'
import type { TonightState } from '@/lib/dashboard/types'

type Props = {
  state: TonightState
}

export function TonightCard({ state }: Props) {
  const regenerate = useDashboardStore((s) => s.regenerateTonight)
  const isRegenerating = useDashboardStore((s) => s.isRegeneratingTonight)

  // --- EMPTY STATE ---
  if (!state.recipe) {
    return (
      <CardShell
        ariaLabel="Tonight's dinner"
        className="p-8 md:p-10 min-h-[420px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#FDF6F1] to-white dark:from-neutral-900 dark:to-neutral-950"
      >
        <div className="text-5xl mb-4" aria-hidden>
          🍽️
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Let&rsquo;s plan your first dinner
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mb-6">
          Tell us about your household and we&rsquo;ll have tonight&rsquo;s dinner ready in seconds.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-6 py-3 min-h-[48px] transition-colors"
        >
          Get started
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardShell>
    )
  }

  const { recipe, reason, usesLeftover } = state

  return (
    <CardShell ariaLabel="Tonight's dinner" className="flex flex-col min-h-[420px]">
      {/* Image */}
      <div className="relative aspect-[16/10] md:aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
          className={cn(
            'object-cover transition-opacity duration-300',
            isRegenerating && 'opacity-40'
          )}
          onError={(e) => {
            // Fallback: hide broken image, show gradient
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-medium px-3 py-1.5">
            <Sparkles className="w-3 h-3" />
            Tonight
          </span>
          {usesLeftover && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur text-white text-xs font-medium px-3 py-1.5">
              <Recycle className="w-3 h-3" />
              Uses {usesLeftover.leftoverName}
            </span>
          )}
          {state.isFromPantry && !usesLeftover && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757]/90 backdrop-blur text-white text-xs font-medium px-3 py-1.5">
              From your fridge
            </span>
          )}
        </div>

        {/* Cost badge */}
        <div className="absolute bottom-4 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur text-neutral-900 dark:text-neutral-100 text-xs font-semibold px-3 py-1.5 shadow-sm">
            ~${recipe.costTotal.toFixed(0)} · ${recipe.costPerServing.toFixed(2)}/serving
          </span>
        </div>

        {/* Regenerating overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-neutral-950/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full shadow-lg">
              <div className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
              <span className="text-sm font-medium">Finding another…</span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-6 md:p-7 flex flex-col">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
          {recipe.name}
        </h2>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {recipe.cookTimeMin} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </span>
          <span className="capitalize">· {recipe.difficulty}</span>
        </div>

        {/* Reason */}
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Why this?</span>{' '}
          {reason}
        </p>

        {/* CTAs */}
        <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/meals/${recipe.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
          >
            Cook this
            <ChevronRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => regenerate()}
            disabled={isRegenerating || state.alternativesAvailable === 0}
            className="inline-flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Show another
          </button>

          <Link
            href="/pantry"
            className="inline-flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors"
            aria-label="Scan fridge for fresh suggestions"
          >
            📸
          </Link>
        </div>
      </div>
    </CardShell>
  )
}
