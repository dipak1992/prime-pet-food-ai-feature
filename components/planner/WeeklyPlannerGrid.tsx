'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DAY_LABELS, DAY_FULL, GROCERY_ICONS } from '@/lib/planner/types'
import type { SmartMealResult } from '@/lib/engine/types'
import {
  Clock,
  ChefHat,
  Users,
  DollarSign,
  RefreshCw,
  Loader2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Leaf,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { persistMealForRecipe } from '@/lib/recipes/canonical'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'

// ── Cuisine visual map ────────────────────────────────────────

const CUISINE_STYLE: Record<string, { bg: string; emoji: string }> = {
  italian:       { bg: 'bg-rose-50 border-rose-200',          emoji: '🍝' },
  mexican:       { bg: 'bg-amber-50 border-amber-200',         emoji: '🌮' },
  asian:         { bg: 'bg-teal-50 border-teal-200',           emoji: '🥢' },
  american:      { bg: 'bg-orange-50 border-orange-200',       emoji: '🍔' },
  indian:        { bg: 'bg-orange-50 border-orange-200',       emoji: '🍛' },
  mediterranean: { bg: 'bg-sky-50 border-sky-200',              emoji: '🥗' },
  comfort:       { bg: 'bg-emerald-50 border-emerald-200',      emoji: '🫕' },
  global:        { bg: 'bg-violet-50 border-violet-200',        emoji: '🌏' },
}

function getStyle(cuisine?: string) {
  const key = (cuisine?.toLowerCase().split(' ')[0] ?? '')
  return CUISINE_STYLE[key] ?? CUISINE_STYLE.comfort
}

// ── Stage labels ──────────────────────────────────────────────

const STAGE_LABEL: Record<string, string> = {
  adult: '🧑 Adult',
  kid: '🧒 Kid',
  toddler: '🐣 Toddler',
  baby: '🍼 Baby',
}

// ── Meal card ─────────────────────────────────────────────────

interface MealDayCardProps {
  meal: SmartMealResult
  dayLabel: string
  date: string
  onRegenerate: () => void
  isRegenerating: boolean
}

function MealDayCard({ meal, dayLabel, date, onRegenerate, isRegenerating }: MealDayCardProps) {
  const [showVariations, setShowVariations] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const router = useRouter()
  const { status } = usePaywallStatus()
  const addCustomItem = useWeeklyPlanStore((s) => s.addCustomItem)
  const style = getStyle(meal.cuisineType)
  const pantryItems = meal.ingredients.filter((i) => i.fromPantry)
  const toBuyItems = meal.ingredients.filter((i) => !i.fromPantry)

  function openRecipe(cook = false) {
    if (cook && !status.isPro) {
      setPaywallOpen(true)
      return
    }
    persistMealForRecipe(meal, '/planner', 'weekly')
    if (cook) sessionStorage.setItem('recipe-open-cook', 'true')
    else sessionStorage.removeItem('recipe-open-cook')
    router.push('/tonight/recipe')
  }

  function addGroceries() {
    const items = meal.shoppingList?.length
      ? meal.shoppingList
      : toBuyItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        }))

    for (const item of items) {
      addCustomItem({
        name: item.name,
        quantity: Number.parseFloat(String(item.quantity)) || 1,
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Ingredients added to grocery list.')
  }

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden', style.bg)}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span className="text-4xl flex-shrink-0 leading-none mt-1">{getStyle(meal.cuisineType).emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">{dayLabel} · {date}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{meal.cuisineType}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{meal.difficulty}</Badge>
          </div>
          <h3 className="font-bold text-base leading-snug">{meal.title}</h3>
          <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">{meal.tagline}</p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <SaveMealButton meal={meal} source="weekly" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate this day"
          >
            {isRegenerating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 px-4 pb-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{meal.totalTime}m</span>
        <span className="flex items-center gap-1"><ChefHat className="h-3.5 w-3.5" />{meal.prepTime}m prep</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meal.servings} servings</span>
        {meal.estimatedCost > 0 && (
          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />${meal.estimatedCost.toFixed(2)}</span>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-current/10 bg-white/45">
        <button
          type="button"
          onClick={() => openRecipe(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-white/70"
        >
          <ChefHat className="h-3.5 w-3.5" />
          Cook
        </button>
        <button
          type="button"
          onClick={addGroceries}
          className="flex items-center justify-center gap-1.5 border-l border-current/10 py-2.5 text-xs font-semibold text-blue-700 hover:bg-white/70"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Grocery
        </button>
      </div>

      {/* Pantry usage hint */}
      {pantryItems.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs text-emerald-700 font-medium">
          <Leaf className="h-3 w-3" />
          Uses {pantryItems.length} pantry item{pantryItems.length > 1 ? 's' : ''}:{' '}
          {pantryItems.slice(0, 3).map((i) => i.name).join(', ')}
          {pantryItems.length > 3 && ` +${pantryItems.length - 3} more`}
        </div>
      )}

      {/* Toggle: Ingredients */}
      <div className="border-t border-current/10">
        <button
          onClick={() => setShowIngredients((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
        >
          <span>{GROCERY_ICONS['produce']} {toBuyItems.length} ingredient{toBuyItems.length !== 1 ? 's' : ''} to buy</span>
          {showIngredients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showIngredients && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {toBuyItems.map((i, idx) => (
              <span key={idx} className="text-xs bg-white/70 border border-white/60 rounded-full px-2 py-0.5">
                {i.quantity} {i.unit} {i.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Toggle: Cooking steps */}
      {meal.steps && meal.steps.length > 0 && (
        <div className="border-t border-current/10">
          <button
            onClick={() => setShowSteps((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
          >
            <span>📋 {meal.steps.length} cooking step{meal.steps.length !== 1 ? 's' : ''}</span>
            {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showSteps && (
            <ol className="px-4 pb-3 space-y-1.5 list-decimal list-inside">
              {meal.steps.map((step, idx) => (
                <li key={idx} className="text-xs leading-relaxed text-muted-foreground">
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Toggle: Family variations */}
      {meal.variations && meal.variations.length > 0 && (
        <div className="border-t border-current/10">
          <button
            onClick={() => setShowVariations((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
          >
            <span>👨‍👩‍👧 {meal.variations.length} family variation{meal.variations.length !== 1 ? 's' : ''}</span>
            {showVariations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showVariations && (
            <div className="px-4 pb-4 space-y-3">
              {meal.variations.map((v, idx) => (
                <div key={idx} className="rounded-xl bg-white/60 border border-white/80 p-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {STAGE_LABEL[v.stage] ?? v.label}
                    </span>
                    <span className="font-medium text-sm">{v.title}</span>
                    {v.allergyWarnings.length > 0 && (
                      <Badge variant="destructive" className="text-xs">⚠ Allergy note</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{v.description}</p>
                  {v.modifications.length > 0 && (
                    <ul className="space-y-0.5">
                      {v.modifications.map((m, mi) => (
                        <li key={mi} className="text-xs flex gap-1.5">
                          <span className="text-primary flex-shrink-0">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {v.safetyNotes.length > 0 && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                      {v.safetyNotes.join(' · ')}
                    </div>
                  )}
                  {v.textureNotes && (
                    <div className="mt-1 text-xs text-sky-700">Texture: {v.textureNotes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Full Recipe */}
      <div className="border-t border-current/10 px-4 py-2">
        <button
          onClick={() => openRecipe(false)}
          className="w-full text-center text-sm font-semibold text-primary hover:underline"
        >
          🍳 View Full Recipe
        </button>
      </div>

      {/* Selection reason */}
      {meal.meta?.selectionReason && (
        <div className="border-t border-current/10 px-4 py-2 text-xs text-muted-foreground italic">
          {meal.meta.selectionReason}
        </div>
      )}
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title="Unlock full recipes with Plus"
        description="Cook weekly meals with guided recipes, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/planner"
      />
    </div>
  )
}

// ── Empty day slot ────────────────────────────────────────────

function EmptyDay({
  dayLabel,
  date,
  isGenerating,
}: {
  dayLabel: string
  date: string
  isGenerating: boolean
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border/60 py-10 flex flex-col items-center text-center text-muted-foreground gap-2">
      {isGenerating ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Generating {dayLabel}…</p>
        </>
      ) : (
        <>
          <span className="text-3xl">🍽️</span>
          <p className="text-sm font-medium">{dayLabel} · {date}</p>
          <p className="text-xs">No meal planned yet</p>
        </>
      )}
    </div>
  )
}

// ── Main grid ─────────────────────────────────────────────────

export interface WeeklyPlannerGridProps {
  days: Array<{ dayIndex: number; date: string; meal: SmartMealResult | null }>
  selectedDayIndex: number
  generatingDayIndex: number | null
  lockedDayIndexes?: number[]
  onSelectDay: (i: number) => void
  onLockedDayClick?: (dayIndex: number) => void
  onRegenerate: (dayIndex: number) => void
}

function LockedDayCard({
  dayLabel,
  date,
  meal,
  onUpgradeClick,
}: {
  dayLabel: string
  date: string
  meal: SmartMealResult | null
  onUpgradeClick?: () => void
}) {
  // If we have meal teaser data, render it blurred underneath a lock overlay
  if (meal) {
    const style = getStyle(meal.cuisineType)
    return (
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blurred meal preview underneath */}
        <div
          className={cn(
            'rounded-2xl border-2 overflow-hidden pointer-events-none select-none',
            style.bg,
          )}
          style={{ filter: 'blur(6px)', opacity: 0.65 }}
          aria-hidden="true"
        >
          <div className="flex items-start gap-3 p-4">
            <span className="text-4xl flex-shrink-0 leading-none mt-1">{style.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">{dayLabel}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{meal.cuisineType}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{meal.difficulty}</Badge>
              </div>
              <h3 className="font-bold text-base leading-snug">{meal.title}</h3>
              <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">{meal.tagline}</p>
            </div>
          </div>
          <div className="flex gap-4 px-4 pb-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{meal.totalTime}m</span>
            <span className="flex items-center gap-1"><ChefHat className="h-3.5 w-3.5" />{meal.prepTime}m prep</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meal.servings} servings</span>
          </div>
          <div className="border-t border-current/10 px-4 py-2 text-sm font-medium">
            ••••••• ingredients to buy
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-background/30 via-background/50 to-background/85">
          <div className="mx-4 max-w-sm rounded-2xl bg-background/95 border border-amber-300/60 shadow-lg p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              <span className="text-amber-700">{dayLabel}</span> is locked on Free
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Unlock this meal — <strong className="text-foreground">{meal.title}</strong> — plus the full grocery list with Plus.
            </p>
            <button
              type="button"
              onClick={onUpgradeClick}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold py-2.5 px-4 hover:opacity-90 transition-opacity"
            >
              Unlock all 7 days →
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              7-day free trial · cancel anytime
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fallback — no teaser data
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/80 bg-gradient-to-br from-amber-50 to-background px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
        <Lock className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{dayLabel} · {date}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        This day is part of the Plus-only weekly plan unlock.
      </p>
      <button
        type="button"
        onClick={onUpgradeClick}
        className="mt-4 rounded-xl bg-amber-500 text-white text-sm font-semibold py-2 px-4 hover:bg-amber-600"
      >
        Start 7-day free trial
      </button>
    </div>
  )
}

export function WeeklyPlannerGrid({
  days,
  selectedDayIndex,
  generatingDayIndex,
  lockedDayIndexes = [],
  onSelectDay,
  onLockedDayClick,
  onRegenerate,
}: WeeklyPlannerGridProps) {
  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {days.map((day) => {
          const today = new Date().toISOString().split('T')[0]
          const isToday = day.date === today
          const hasMeal = day.meal !== null
          const isLocked = lockedDayIndexes.includes(day.dayIndex)
          return (
            <button
              key={day.dayIndex}
              type="button"
              onClick={() => {
                if (isLocked) {
                  onLockedDayClick?.(day.dayIndex)
                  return
                }
                onSelectDay(day.dayIndex)
              }}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors border min-w-[52px]',
                isLocked
                  ? 'border-amber-300/80 bg-amber-50 text-amber-900'
                  : selectedDayIndex === day.dayIndex
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-border/60 hover:border-primary/40 bg-card',
              )}
            >
              <span className="text-[10px] uppercase tracking-wide opacity-70">{DAY_LABELS[day.dayIndex]}</span>
              <span className={cn('text-base font-bold', isToday && selectedDayIndex !== day.dayIndex && 'text-primary')}>
                {new Date(day.date + 'T00:00:00').getDate()}
              </span>
              {isLocked ? (
                <Lock className="mt-0.5 h-3 w-3" />
              ) : (
                <span className={cn('w-1.5 h-1.5 rounded-full mt-0.5', hasMeal ? 'bg-emerald-400' : 'bg-transparent')} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day */}
      {days[selectedDayIndex] && (() => {
        const day = days[selectedDayIndex]
        const isLocked = lockedDayIndexes.includes(day.dayIndex)
        const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        })
        if (isLocked) {
          return (
            <LockedDayCard
              dayLabel={DAY_FULL[day.dayIndex]}
              date={dateLabel}
              meal={day.meal}
              onUpgradeClick={() => onLockedDayClick?.(day.dayIndex)}
            />
          )
        }
        return day.meal ? (
          <MealDayCard
            key={day.dayIndex}
            meal={day.meal}
            dayLabel={DAY_FULL[day.dayIndex]}
            date={dateLabel}
            onRegenerate={() => onRegenerate(day.dayIndex)}
            isRegenerating={generatingDayIndex === day.dayIndex}
          />
        ) : (
          <EmptyDay
            dayLabel={DAY_FULL[day.dayIndex]}
            date={dateLabel}
            isGenerating={generatingDayIndex === day.dayIndex}
          />
        )
      })()}
    </div>
  )
}
