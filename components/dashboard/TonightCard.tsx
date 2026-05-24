'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Users, ChevronRight, Recycle, Sparkles, Leaf, DollarSign, Heart, RefreshCw, ShieldCheck } from 'lucide-react'
import { CardShell } from './shared/CardShell'
import { useDashboardStore } from '@/stores/dashboardStore'
import { cn } from '@/lib/utils'
import { persistMealForRecipe } from '@/lib/recipes/canonical'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useDailySwapLimit } from '@/lib/paywall/use-daily-swap-limit'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { trackTonightEvent } from '@/lib/tonight/analytics'
import { resolveTonightMealImage } from '@/lib/tonight/images'
import type { Recipe, TonightState } from '@/lib/dashboard/types'
import type { SmartMealResult } from '@/lib/engine/types'

type Props = {
  state: TonightState
}

/** Map recipe tags to visual badges */
function getTagBadges(tags?: string[]) {
  if (!tags || tags.length === 0) return []
  const tagMap: Record<string, { label: string; icon: typeof Clock; color: string }> = {
    'quick': { label: 'Quick', icon: Clock, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
    'family-friendly': { label: 'Family', icon: Users, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    'budget': { label: 'Budget', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    'healthy': { label: 'Healthy', icon: Heart, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    'high-protein': { label: 'High Protein', icon: Leaf, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    'vegetarian': { label: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  }
  return tags
    .map((t) => tagMap[t])
    .filter(Boolean)
    .slice(0, 3)
}

/** Pick a deterministic food emoji based on meal name */
function getMealEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('pasta') || n.includes('spaghetti') || n.includes('noodle')) return '🍝'
  if (n.includes('pizza')) return '🍕'
  if (n.includes('burger') || n.includes('sandwich')) return '🍔'
  if (n.includes('taco') || n.includes('burrito') || n.includes('mexican')) return '🌮'
  if (n.includes('sushi') || n.includes('japanese') || n.includes('ramen')) return '🍜'
  if (n.includes('curry') || n.includes('indian')) return '🍛'
  if (n.includes('salad')) return '🥗'
  if (n.includes('soup') || n.includes('stew') || n.includes('chili')) return '🍲'
  if (n.includes('chicken')) return '🍗'
  if (n.includes('fish') || n.includes('salmon') || n.includes('shrimp')) return '🐟'
  if (n.includes('steak') || n.includes('beef') || n.includes('meat')) return '🥩'
  if (n.includes('rice') || n.includes('bowl')) return '🍚'
  if (n.includes('wrap') || n.includes('pita')) return '🫔'
  return '🍽️'
}

function toSmartMeal(recipe: Recipe, reason: string, isFromPantry: boolean): SmartMealResult {
  return {
    id: recipe.id,
    title: recipe.name,
    tagline: reason,
    description: reason,
    cuisineType: 'comfort',
    imageUrl: recipe.image,
    prepTime: 10,
    cookTime: recipe.cookTimeMin,
    totalTime: recipe.cookTimeMin + 10,
    estimatedCost: recipe.costTotal,
    servings: recipe.servings,
    difficulty: recipe.difficulty === 'medium' ? 'moderate' : recipe.difficulty,
    tags: recipe.tags ?? ['Tonight Suggestions'],
    ingredients: [
      { name: recipe.name, quantity: '1', unit: 'meal', fromPantry: isFromPantry, category: 'other' },
      { name: 'Protein or main ingredient', quantity: '1', unit: 'portion', fromPantry: isFromPantry, category: 'protein' },
      { name: 'Vegetables or side', quantity: '2', unit: 'cups', fromPantry: false, category: 'produce' },
      { name: 'Seasoning and sauce', quantity: '1', unit: 'to taste', fromPantry: true, category: 'condiment' },
    ],
    steps: [
      `Gather the ingredients for ${recipe.name}.`,
      'Prep the main ingredient and vegetables before heating the pan.',
      `Cook ${recipe.name} over medium heat until everything is hot and cooked through.`,
      'Taste, adjust seasoning, and serve warm.',
    ],
    variations: [],
    leftoverTip: 'Save extra portions in an airtight container for lunch tomorrow.',
    shoppingList: [
      { name: 'Protein or main ingredient', quantity: '1', unit: 'portion', category: 'protein', estimatedCost: Math.max(0, recipe.costTotal * 0.6), substituteOptions: [] },
      { name: 'Vegetables or side', quantity: '2', unit: 'cups', category: 'produce', estimatedCost: Math.max(0, recipe.costTotal * 0.25), substituteOptions: [] },
    ],
    meta: {
      score: 1,
      matchedPantryItems: isFromPantry ? [recipe.name] : [],
      pantryUtilization: isFromPantry ? 0.5 : 0,
      simplifiedForEnergy: recipe.cookTimeMin <= 30,
      pickyEaterAdjusted: false,
      localityApplied: false,
      selectionReason: reason,
    },
    chefVerified: recipe.chefVerified,
  }
}

export function TonightCard({ state }: Props) {
  const router = useRouter()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallCopy, setPaywallCopy] = useState({
    title: 'Unlock full recipes with Plus',
    description: 'Cook with guided steps, unlimited swaps, premium meal tools, smarter Tonight suggestions, and better planning.',
  })
  const { status } = usePaywallStatus()
  const swaps = useDailySwapLimit(status, 'dashboard-tonight')
  const regenerate = useDashboardStore((s) => s.regenerateTonight)
  const isRegenerating = useDashboardStore((s) => s.isRegeneratingTonight)
  const resolvedMealImage = state.recipe ? resolveTonightMealImage(state.recipe) : null

  // Track view
  useEffect(() => {
    if (state.recipe) {
      trackTonightEvent('dashboard_tonight_viewed', {
        meal_id: state.recipe.id,
        meal_name: state.recipe.name,
        is_personalized: status.isPro,
        plan: status.isPro ? 'plus' : 'free',
      })
    }
  }, [state.recipe?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined' || !resolvedMealImage) return
    const img = new window.Image()
    img.src = resolvedMealImage
  }, [resolvedMealImage])

  // --- EMPTY STATE ---
  if (!state.recipe) {
    return (
      <CardShell
        ariaLabel="Tonight's dinner"
        className="overflow-hidden min-h-[280px] md:min-h-[380px] flex flex-col items-center justify-center text-center"
      >
        {/* Premium food photo background */}
        <div className="absolute inset-0">
          <Image
            src="/cards/tonight.jpg"
            alt=""
            fill
            sizes="(min-width: 1280px) 900px, 100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/80 via-neutral-900/70 to-neutral-950/60" />
        </div>
        <div className="relative z-10 p-6 md:p-10 flex flex-col items-center">
          <div className="text-5xl mb-4 drop-shadow-sm md:text-6xl md:mb-5" aria-hidden>🍽️</div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
            Let&rsquo;s plan your first dinner
          </h2>
          <p className="text-white/75 max-w-sm mb-6">
            Tell us about your household and we&rsquo;ll have tonight&rsquo;s dinner ready in seconds.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] text-white font-semibold rounded-full px-6 py-3 min-h-[48px] transition-all shadow-lg shadow-[#D97757]/40 active:scale-[0.98]"
          >
            Get started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardShell>
    )
  }

  const { recipe, reason, usesLeftover } = state
  const badges = getTagBadges(recipe.tags)
  const mealEmoji = getMealEmoji(recipe.name)
  const mealImage = resolvedMealImage ?? '/landing/family-dinner.jpg'

  function handleCookThis() {
    trackTonightEvent('cook_clicked', { meal_id: recipe.id, meal_name: recipe.name, plan: status.isPro ? 'plus' : 'free' })
    persistMealForRecipe(toSmartMeal(recipe, reason, state.isFromPantry), '/dashboard', 'tonight')
    sessionStorage.removeItem('recipe-open-cook')
    router.push('/tonight/recipe')
  }

  function handleRegenerate() {
    trackTonightEvent('swap_clicked', { meal_id: recipe.id, meal_name: recipe.name, plan: status.isPro ? 'plus' : 'free' })
    if (!swaps.recordSwap()) {
      setPaywallCopy({
        title: "You\u2019ve used your free meal changes today",
        description: "Free includes 3 meal swaps per day. Upgrade to Plus for unlimited meal swaps, personalized picks, and guided cooking.",
      })
      setPaywallOpen(true)
      return
    }
    void regenerate()
  }

  return (
    <CardShell ariaLabel="Tonight's dinner" className="flex flex-col min-h-[300px] md:min-h-[400px] overflow-visible sm:overflow-hidden">
      {/* Hero banner — premium food photo with overlay */}
      <div className="relative px-5 pt-5 pb-4 md:px-8 md:pt-8 md:pb-6 overflow-hidden min-h-[200px] md:min-h-[240px]">
        {/* Food photo background */}
        <div className="absolute inset-0">
          <Image
            key={mealImage}
            src={mealImage}
            alt={recipe.name}
            fill
            sizes="(min-width: 1280px) 900px, 100vw"
            className="object-cover object-center transition-opacity duration-300"
            priority
          />
          {/* Dual overlay: dark top for text + warm bottom tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/82 via-neutral-900/72 to-[#3d1a08]/55" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(217,119,87,0.18),transparent)]" />
        </div>

        {/* Decorative large emoji watermark */}
        <div
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-[88px] leading-none select-none pointer-events-none opacity-[0.18] sm:block"
          aria-hidden
        >
          {mealEmoji}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Top row: Tonight badge + context badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D97757] text-white text-xs font-bold px-3 py-1.5 shadow-sm shadow-orange-900/40">
              <Sparkles className="w-3 h-3" />
              {status.isPro ? 'Tonight\u2019s Smart Pick' : 'Tonight\u2019s Pick'}
            </span>
            {usesLeftover && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1.5 border border-emerald-700/50 backdrop-blur-sm">
                <Recycle className="w-3 h-3" />
                Uses {usesLeftover.leftoverName}
              </span>
            )}
            {state.isFromPantry && !usesLeftover && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-900/60 text-sky-300 text-xs font-semibold px-3 py-1.5 border border-sky-700/50 backdrop-blur-sm">
                From your fridge
              </span>
            )}
            {recipe.chefVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold px-3 py-1.5 border border-teal-700/50 backdrop-blur-sm" title="Reviewed and verified by a professional chef">
                <ShieldCheck className="w-3 h-3" />
                Chef-Verified
              </span>
            )}
          </div>

          {/* Meal name */}
          <h2 className="font-serif text-xl md:text-3xl font-bold text-white leading-tight sm:pr-16 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
            {recipe.name}
          </h2>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 md:gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Clock className="w-3.5 h-3.5 text-[#E8895A]" />
              {recipe.cookTimeMin} min
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Users className="w-3.5 h-3.5 text-[#E8895A]" />
              {recipe.servings} servings
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 capitalize">
              {recipe.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-900/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              ~${recipe.costPerServing.toFixed(2)}/serving
            </span>
          </div>

          {/* Benefit tags */}
          {badges.length > 0 && (
            <div className="hidden flex-wrap gap-2 mt-3 sm:flex">
              {badges.map((badge, i) => {
                const Icon = badge.icon
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white/85 border border-white/15"
                  >
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {!status.isPro && (
          <p className="relative z-10 mt-3 text-xs font-medium text-white/60">
            {swaps.remaining > 0
              ? `${swaps.remaining} swap${swaps.remaining === 1 ? '' : 's'} left today`
              : 'Free swaps used today'}
          </p>
        )}

        {/* Regenerating overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 px-5 py-2.5 rounded-full shadow-xl border border-neutral-100 dark:border-neutral-800">
              <RefreshCw className="w-4 h-4 text-[#D97757] animate-spin" />
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Finding another…</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-200/60 dark:via-orange-900/30 to-transparent" />

      {/* Body */}
      <div className="flex-1 px-5 pb-5 md:px-8 md:pb-7 flex flex-col bg-white dark:bg-neutral-950">
        {/* Reason */}
        <div className="mt-3 flex gap-2.5 md:mt-4">
          <div className="shrink-0 w-1 rounded-full bg-gradient-to-b from-[#D97757] to-amber-400" />
          <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Why this? </span>
            {reason}
          </p>
        </div>

        {/* CTAs — Cook This + Show Another */}
        <div className="tonight-sticky-actions -mx-5 mt-auto flex flex-col gap-2.5 border-t border-orange-100/70 bg-white/95 px-5 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:mx-0 sm:flex-row sm:border-0 sm:bg-transparent sm:px-0 sm:pt-5 sm:pb-0 sm:shadow-none sm:backdrop-blur-0 sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 sm:static">
          <button
            type="button"
            onClick={handleCookThis}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] text-white font-semibold rounded-full px-5 py-3 min-h-[48px] transition-all shadow-md shadow-orange-200/50 dark:shadow-none active:scale-[0.98]"
          >
            Cook this
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || state.alternativesAvailable === 0}
            className="inline-flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-full px-5 py-3 min-h-[48px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-200 dark:border-neutral-700"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
            {isRegenerating ? 'Finding…' : 'Show another'}
          </button>
        </div>
        {!status.isPro && (
          <button
            type="button"
            onClick={() => {
              setPaywallCopy({
                title: 'Ready to cook smarter?',
                description: 'Want meals based on your preferences, groceries, and leftovers? Upgrade to Plus for smarter Tonight picks and full recipe guidance.',
              })
              setPaywallOpen(true)
            }}
            className="mt-3 text-left text-xs text-[#D97757] hover:text-[#C86646]"
          >
            Want meals based on your preferences, groceries, and leftovers?
          </button>
        )}
      </div>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title={paywallCopy.title}
        description={paywallCopy.description}
        isAuthenticated={status.isAuthenticated}
        redirectPath="/dashboard"
      />
    </CardShell>
  )
}
