'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Crown, Sparkles } from 'lucide-react'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useUpgradeTrigger } from '@/lib/pillars/use-upgrade-trigger'
import { PILLAR_CARDS, TONIGHT_CHIPS, hasAccess } from '@/lib/pillars/config'
import { KidsSection } from '@/components/hub/KidsSection'
import { cn } from '@/lib/utils'
import type { PillarCard } from '@/lib/pillars/config'

// ── NEW badge logic (14-day window from launch) ───────────────────────────────
const SCAN_FEATURE_LAUNCH = new Date('2026-04-24T00:00:00Z')
const NEW_BADGE_MS = 14 * 24 * 60 * 60 * 1000
function isScanFeatureNew(): boolean {
  return Date.now() - SCAN_FEATURE_LAUNCH.getTime() < NEW_BADGE_MS
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Pillar Card Component ─────────────────────────────────────────────────────

function PillarCardUI({
  card,
  index,
  isPro,
  isFamily,
  userTier,
}: {
  card: PillarCard
  index: number
  isPro: boolean
  isFamily: boolean
  userTier: 'free' | 'pro' | 'family'
}) {
  const showPremiumCta = card.premiumCta && hasAccess(userTier, card.premiumCta.requiredTier)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={card.href}
        className={cn(
          'block rounded-2xl border p-5 transition-all hover:shadow-lg',
          `bg-gradient-to-br ${card.gradient}`,
          card.borderColor,
          card.hoverBorder,
        )}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0 mt-0.5">{card.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-foreground leading-tight">
              {card.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {card.subtitle}
            </p>

            {/* Tonight chips — only on Tonight card */}
            {card.id === 'tonight' && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {TONIGHT_CHIPS.map((chip) => {
                  const locked = !hasAccess(userTier, chip.requiredTier)
                  return (
                    <span
                      key={chip.id}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                        locked
                          ? 'bg-gray-100 text-gray-400 border border-gray-200/60'
                          : 'bg-white/80 text-foreground border border-border/60 hover:bg-white',
                      )}
                    >
                      {chip.emoji} {chip.label}
                      {locked && <Crown className="h-2.5 w-2.5 ml-0.5 text-amber-400" />}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Plan card — Build Plan CTA + premium Autopilot CTA */}
            {card.id === 'plan' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                  Build Plan
                </span>
                {card.premiumCta && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold',
                      showPremiumCta
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-gray-100 text-gray-400 border border-gray-200/60',
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    {card.premiumCta.label}
                    {!showPremiumCta && <Crown className="h-2.5 w-2.5 ml-0.5 text-amber-400" />}
                  </span>
                )}
              </div>
            )}

            {/* Scan & Decide card — 3 sub-features */}
            {card.id === 'cook' && (
              <div className="mt-3 space-y-1.5">
                {/* Snap & Cook */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                    📸 Snap &amp; Cook
                  </span>
                </div>
                {/* Smart Menu Scan — NEW */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                    🍽️ Smart Menu Scan
                  </span>
                  {isScanFeatureNew() && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-2 py-0.5 text-[9px] font-bold text-white leading-none shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
                {/* Food Check — NEW */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                    📊 Food Check
                  </span>
                  {isScanFeatureNew() && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-2 py-0.5 text-[9px] font-bold text-white leading-none shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
                {/* Subtext */}
                <p className="text-[10px] text-muted-foreground/70 pt-0.5">
                  Use what you have · Order smarter · Check food instantly
                </p>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  )
}

// ── Contextual Upgrade Banner ─────────────────────────────────────────────────

function UpgradeBanner() {
  const trigger = useUpgradeTrigger()

  if (!trigger) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <Link
        href={`/pricing?intent=${trigger.targetTier}&trigger=${trigger.id}`}
        className="block rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/80 p-4 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">{trigger.message}</p>
            <p className="text-xs font-medium text-amber-700 mt-1.5 flex items-center gap-1">
              {trigger.cta} <ChevronRight className="h-3 w-3" />
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Main Dashboard Hub ────────────────────────────────────────────────────────

interface Props {
  displayName: string
}

export function DashboardHub({ displayName }: Props) {
  const firstName = displayName
  const { status } = usePaywallStatus()
  const greeting = useMemo(() => getGreeting(), [])

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #fef7f0 0%, #f0fdf4 12%, #ffffff 40%, #ffffff 100%)',
      }}
    >
      <div className="mx-auto max-w-lg px-5 pb-16 pt-6">
        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {greeting}, {firstName}
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
            What&apos;s for dinner tonight?
          </h1>
        </div>

        {/* ── 4 Pillar Cards ── */}
        <div className="flex flex-col gap-3">
          {PILLAR_CARDS.map((card, i) => (
            <PillarCardUI
              key={card.id}
              card={card}
              index={i}
              isPro={status.isPro}
              isFamily={status.isFamily}
              userTier={status.tier}
            />
          ))}
        </div>

        {/* ── For the Kids Section ── */}
        <KidsSection />

        {/* ── Contextual Upgrade Banner ── */}
        <div className="mt-6">
          <UpgradeBanner />
        </div>

        {/* ── Subtle intelligence indicator ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Intelligence layer active — learning your preferences</span>
        </motion.div>
      </div>
    </div>
  )
}
