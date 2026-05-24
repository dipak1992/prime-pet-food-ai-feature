'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Crown,
  Sparkles,
  RefreshCw,
  Clock,
  ChefHat,
  DollarSign,
  Users,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useLearningStore } from '@/lib/learning/store'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { TONIGHT_CHIPS, hasAccess } from '@/lib/pillars/config'
import { decideMeal, householdFromMembers, fallbackHousehold } from '@/lib/decide/client'
import { SaveMealButton } from '@/components/content/SaveMealButton'
import { ShareMealButton } from '@/components/content/ShareMealButton'
import { SaveReminderCard } from '@/components/shared/SaveReminderCard'
import { cn } from '@/lib/utils'
import type { TonightMode } from '@/lib/pillars/config'
import type { SmartMealResult } from '@/lib/engine/types'

// ── Loading shimmer ───────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Finding something great for tonight…',
  'Personalizing for your household…',
  'Adding the finishing touches…',
  'Your dinner idea is ready! ✨',
]

function LoadingPhase({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = LOADING_MESSAGES.map((_, i) =>
      setTimeout(() => {
        setStep(i)
        if (i === LOADING_MESSAGES.length - 1) setTimeout(onComplete, 400)
      }, i * 450)
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="mb-6"
      >
        <Sparkles className="h-10 w-10 text-primary" />
      </motion.div>
      <div className="space-y-2 text-center">
        {LOADING_MESSAGES.map((text, i) => (
          <motion.p
            key={text}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'text-sm transition-colors',
              i <= step ? 'text-foreground font-medium' : 'text-muted-foreground',
              i === step && 'text-primary',
            )}
          >
            {i < step ? '✓ ' : i === step ? '● ' : '○ '}{text}
          </motion.p>
        ))}
      </div>
      <div className="mt-6 w-40 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / LOADING_MESSAGES.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

// ── Variation Card ────────────────────────────────────────────────────────────

interface VariationProps {
  emoji: string
  label: string
  title: string
  modifications: string[]
  safetyNotes: string[]
  servingTip: string
}

function VariationCard({ variation, index }: { variation: VariationProps; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-neutral-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{variation.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{variation.label}</p>
            <p className="text-xs text-muted-foreground">{variation.title}</p>
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Modifications</p>
                <ul className="space-y-1">
                  {variation.modifications.map((m) => (
                    <li key={m} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              {variation.safetyNotes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Safety Notes
                  </p>
                  <ul className="space-y-1">
                    {variation.safetyNotes.map((n) => (
                      <li key={n} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">💡 {variation.servingTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Tonight Pillar ───────────────────────────────────────────────────────

export default function TonightPillarPage() {
  const router = useRouter()
  const [activeChip, setActiveChip] = useState<TonightMode>('fast')
  const [meal, setMeal] = useState<SmartMealResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const animationDoneRef = useRef(false)
  const fetchPendingRef = useRef(false)
  const seenIdsRef = useRef<string[]>([])

  const { status } = usePaywallStatus()
  const { state: { members } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const { getBoosts } = useLearningStore()

  const getHousehold = useCallback(() =>
    members?.length
      ? householdFromMembers(members)
      : fallbackHousehold(light.householdType, light.hasKids, light.kidsAgeGroup),
    [members, light.householdType, light.hasKids, light.kidsAgeGroup])

  const fetchMeal = useCallback(async (chipMode: TonightMode, countsAsTonightSwap = false) => {
    setLoading(true)
    animationDoneRef.current = false
    fetchPendingRef.current = true

    try {
      const body: Record<string, unknown> = {
        household: getHousehold(),
        cuisinePreferences: light.cuisines,
        lowEnergy: chipMode === 'fast',
        maxCookTime: chipMode === 'fast' ? 25 : undefined,
        excludeIds: seenIdsRef.current,
        learnedBoosts: getBoosts() ?? undefined,
        mode: 'tonight',
        countsAsTonightSwap,
      }

      // Mode-specific overrides
      if (chipMode === 'budget') body.budgetMode = true

      const res = await decideMeal(body as unknown as Parameters<typeof decideMeal>[0])
      setMeal(res.meal)
      seenIdsRef.current = [...seenIdsRef.current, res.meal.id].slice(-15)
      fetchPendingRef.current = false
      if (animationDoneRef.current) setLoading(false)
    } catch (error) {
      fetchPendingRef.current = false
      setLoading(false)
      if ((error as { status?: number; code?: string }).status === 402) {
        setPaywallOpen(true)
      }
    }
  }, [getHousehold, light.cuisines, getBoosts])

  const handleChipSelect = useCallback((chipId: TonightMode) => {
    const chip = TONIGHT_CHIPS.find(c => c.id === chipId)
    if (!chip) return

    // Check tier access
    if (!hasAccess(status.tier, chip.requiredTier)) {
      setPaywallOpen(true)
      return
    }

    setActiveChip(chipId)
    setMeal(null)
    fetchMeal(chipId)
  }, [status.tier, fetchMeal])

  const handleTryAnother = useCallback(() => {
    fetchMeal(activeChip, true)
  }, [activeChip, fetchMeal])

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #FDF6F1 0%, #fef3e8 15%, #ffffff 40%, #ffffff 100%)',
      }}
    >
      <div className="mx-auto max-w-lg px-5 pb-16 pt-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            🌙 Tonight
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fast meal ideas for your real situation
          </p>
        </div>

        {/* Quick chips */}
        <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
          {TONIGHT_CHIPS.map((chip) => {
            const locked = !hasAccess(status.tier, chip.requiredTier)
            const isActive = activeChip === chip.id
            return (
              <motion.button
                key={chip.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChipSelect(chip.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border',
                  isActive
                    ? 'bg-[#D97757] text-white border-[#D97757] shadow-sm'
                    : locked
                      ? 'bg-white text-gray-500 border-amber-200 ring-1 ring-amber-100'
                      : 'bg-neutral-100 text-neutral-600 border-transparent hover:bg-neutral-200',
                )}
              >
                {chip.emoji} {chip.label}
                {locked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Crown className="h-3 w-3" />
                    Plus
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingPhase
              key="loading"
              onComplete={() => {
                animationDoneRef.current = true
                if (!fetchPendingRef.current) setLoading(false)
              }}
            />
          ) : meal ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Meal card */}
              <div className="rounded-3xl border border-neutral-100 bg-white overflow-hidden shadow-md">
                <div className="p-5">
                  <Badge variant="outline" className="mb-3 text-xs border-[#D97757]/30 text-[#D97757] bg-[#D97757]/5">
                    {TONIGHT_CHIPS.find(c => c.id === activeChip)?.emoji}{' '}
                    {TONIGHT_CHIPS.find(c => c.id === activeChip)?.label} Mode
                  </Badge>
                  <h2 className="text-xl font-bold text-foreground">{meal.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{meal.tagline}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-[#D97757]" />
                      {meal.prepTime + meal.cookTime}m
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <ChefHat className="h-3.5 w-3.5 text-[#D97757]" />
                      {meal.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-[#D97757]" />
                      ~${meal.estimatedCost.toFixed(0)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-[#D97757]" />
                      Serves {meal.servings}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {meal.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-[#D97757]/8 text-[#D97757] border border-[#D97757]/20 px-2.5 py-0.5 text-[11px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                    {meal.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t border-neutral-100 px-5 py-3 flex items-center gap-2 bg-neutral-50/50">
                  <SaveMealButton meal={meal} source="tonight" className="h-9 w-9 rounded-xl border border-neutral-200" />
                  <ShareMealButton meal={meal} className="h-9 w-9 rounded-xl border border-neutral-200" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryAnother}
                    className="gap-1.5 ml-auto rounded-full border-neutral-200 hover:border-[#D97757]/40 hover:text-[#D97757]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Try another
                  </Button>
                </div>
              </div>

              {/* Family variations */}
              {meal.variations && meal.variations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#D97757]" />
                    Family-Safe Variations
                  </h3>
                  <div className="space-y-2">
                    {meal.variations.map((v, i) => (
                      <VariationCard key={v.stage} variation={v} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-[#D97757]" />
                  How to Make It
                </h3>
                <div className="space-y-2">
                  {meal.steps.map((step, i) => (
                    <div key={i} className="rounded-xl border border-neutral-100 bg-white p-3 flex items-start gap-3 shadow-sm">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#D97757]/10 text-[#D97757] text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Remind CTA */}
              <SaveReminderCard
                mealId={meal.id}
                mealName={meal.title}
                variant="tonight"
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-4xl mb-3">🌙</p>
              <p className="text-sm text-muted-foreground mb-4">
                Tap a chip above to get a meal idea for tonight
              </p>
              <Button
                size="sm"
                onClick={() => handleChipSelect('fast')}
                className="gap-1.5 bg-[#D97757] hover:bg-[#C86646] text-white rounded-full px-5"
              >
                <Sparkles className="h-3.5 w-3.5" /> Get a fast meal
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="guided_cooking"
        title="Unlock this mode"
        description="Upgrade to access Budget mode — plus unlimited meal ideas personalized for your household."
        isAuthenticated={status.isAuthenticated}
        redirectPath="/dashboard/tonight"
      />
    </div>
  )
}
