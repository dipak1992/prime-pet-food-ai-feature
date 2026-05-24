'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Crown,
  Users,
  Brain,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { useOnboardingStore, useLightOnboardingStore } from '@/lib/store'
import { useLearningStore } from '@/lib/learning/store'
import { getFeatures } from '@/lib/pillars/config'
import { cn } from '@/lib/utils'
import type { FamilyMemberRecord } from '@/lib/family/types'
import { InviteCoChef } from '@/components/household/InviteCoChef'

// ── Section card component ────────────────────────────────────────────────────

interface SectionCardProps {
  emoji: string
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
  locked?: boolean
  badge?: string
  badgeColor?: string
  children?: React.ReactNode
  index: number
}

function SectionCard({
  emoji,
  title,
  subtitle,
  href,
  onClick,
  locked,
  badge,
  badgeColor = 'bg-primary/10 text-primary',
  children,
  index,
}: SectionCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-200',
        (href || onClick) && !locked && 'hover:shadow-md hover:border-[#D97757]/30 cursor-pointer',
        locked && 'opacity-60',
      )}
      onClick={locked ? undefined : onClick}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[15px] font-bold text-foreground leading-tight">
              {title}
            </h3>
            {badge && (
              <Badge className={cn('text-[10px] border-0', badgeColor)}>
                {badge}
              </Badge>
            )}
            {locked && (
              <Crown className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
          {children}
        </div>
        {(href || onClick) && !locked && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.div>
  )

  if (href && !locked) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// ── Member preview chip ───────────────────────────────────────────────────────

function MemberChip({ member }: { member: FamilyMemberRecord }) {
  const roleEmoji: Record<string, string> = {
    adult: '🧑',
    teen: '🧑‍🎓',
    child: '👤',
    toddler: '👤',
    baby: '👤',
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 font-medium">
      {roleEmoji[member.role] ?? '👤'} {member.first_name}
      {member.allergies_json?.length > 0 && (
        <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
      )}
      {member.picky_eater_level >= 3 && (
        <span className="text-[10px]">🥄</span>
      )}
    </span>
  )
}

// ── Intelligence summary ──────────────────────────────────────────────────────

function IntelligenceSummary() {
  const { feedbackHistory } = useLearningStore()
  const totalFeedback = feedbackHistory?.length ?? 0
  const likes = feedbackHistory?.filter(f => f.action === 'like' || f.action === 'save').length ?? 0
  const dislikes = feedbackHistory?.filter(f => f.action === 'reject').length ?? 0

  if (totalFeedback === 0) {
    return (
      <div className="mt-3 rounded-lg bg-violet-50/50 border border-violet-200/40 p-3">
        <p className="text-xs text-muted-foreground">
          <Brain className="h-3 w-3 inline mr-1" />
          No preferences learned yet. Use Tonight or Scan &amp; Decide to start teaching MealEase what you like.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Badge variant="secondary" className="text-[11px]">
        {totalFeedback} signals
      </Badge>
      {likes > 0 && (
        <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[11px]">
          ❤️ {likes} liked
        </Badge>
      )}
      {dislikes > 0 && (
        <Badge className="bg-red-50 text-red-700 border-0 text-[11px]">
          👎 {dislikes} skipped
        </Badge>
      )}
    </div>
  )
}

// ── Main Household Pillar ─────────────────────────────────────────────────────

export default function HouseholdPillarPage() {
  const router = useRouter()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallMessage, setPaywallMessage] = useState({ title: '', description: '' })
  const [members, setMembers] = useState<FamilyMemberRecord[]>([])

  const { status } = usePaywallStatus()
  const { state: { householdName } } = useOnboardingStore()
  const light = useLightOnboardingStore()
  const features = useMemo(() => getFeatures(status.tier), [status.tier])

  // Load household profiles for all authenticated tiers
  useEffect(() => {
    if (!status.isAuthenticated) return
    fetch('/api/family/members', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setMembers(data.members ?? [])
      })
      .catch(() => {})
  }, [status.isAuthenticated])

  const handleLockedClick = useCallback((title: string, description: string) => {
    setPaywallMessage({ title, description })
    setPaywallOpen(true)
  }, [])

  const householdTypeLabel = light.householdType === 'solo'
    ? 'Just me'
    : light.householdType === 'couple'
      ? 'Couple'
      : light.householdType === 'family'
        ? 'Family'
        : 'Not set'

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
            🏠 Household
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite a co-chef, manage profiles, and keep meal preferences together
          </p>
        </div>

        {status.isAuthenticated && (
          <div className="mb-6">
            <InviteCoChef
              householdName={householdName || undefined}
              memberCount={members.length}
              maxMembers={6}
            />
          </div>
        )}

        {/* Household summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl border border-[#D97757]/15 bg-gradient-to-br from-[#D97757]/5 to-white p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {householdName || 'My Household'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {householdTypeLabel}
                {light.lowEnergy && ' · Low energy mode'}
              </p>
            </div>
            <Badge
              className={cn(
                'text-xs border-0',
                status.isPro
                  ? 'bg-[#D97757]/10 text-[#D97757]'
                  : 'bg-neutral-100 text-neutral-600',
              )}
            >
              {status.isPro && <Crown className="h-3 w-3 mr-1" />}
              {status.isPro ? 'Plus' : 'Free'}
            </Badge>
          </div>

          {/* Trait badges */}
          <div className="flex flex-wrap gap-1.5">
            {light.cuisines.length > 0 && (
              <Badge className="bg-white text-neutral-700 border border-neutral-200 text-[11px]">
                🍽️ {light.cuisines.slice(0, 3).join(', ')}
                {light.cuisines.length > 3 && ` +${light.cuisines.length - 3}`}
              </Badge>
            )}
            {light.pickyEater && (
              <Badge className="bg-orange-50 text-orange-700 border-0 text-[11px]">
                🥄 Picky-eater friendly
              </Badge>
            )}
            {light.lowEnergy && (
              <Badge className="bg-blue-50 text-blue-700 border-0 text-[11px]">
                ⚡ Low energy
              </Badge>
            )}
          </div>

          {/* Household members preview */}
          {status.isPro && members.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#D97757]/15">
              <p className="text-[11px] font-medium text-muted-foreground mb-2">
                Household Members ({members.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {members.map(m => (
                  <MemberChip key={m.id} member={m} />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Section cards */}
        <div className="flex flex-col gap-3">
          {/* 1. Profile & Preferences */}
          <SectionCard
            index={0}
            emoji="👤"
            title="Profile & Preferences"
            subtitle="Household type, cuisines, dietary needs, cooking time"
            href="/settings"
            badge={light.householdType ? 'Set up' : 'Needs setup'}
            badgeColor={light.householdType ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
          >
            {!light.householdType && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push('/onboarding')
                  }}
                >
                  <Sparkles className="h-3 w-3" /> Set up now
                </Button>
              </div>
            )}
          </SectionCard>

          {/* 2. Household Profiles */}
          <SectionCard
            index={1}
            emoji="👤"
            title="Household Profiles"
            subtitle={
              status.isPro
                ? 'Add up to 6 household member profiles with preferences, allergies, and food goals'
                : 'Add your personal profile. Upgrade to Plus for up to 6 profiles.'
            }
            badge={
              status.isPro
                ? `${members.length} profiles`
                : 'Free · 1 profile'
            }
            badgeColor={
              status.isPro
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-50 text-slate-600'
            }
          >
            <p className="mt-1.5 text-[11px] text-muted-foreground/70">
              Profiles store preferences, allergies, and food goals — not separate logins.
            </p>
          </SectionCard>

          {/* 3. Household Memory */}
          <SectionCard
            index={2}
            emoji="🧠"
            title="Household Memory"
            subtitle={
              features.householdMemory
                ? 'MealEase learns from your feedback to suggest better meals over time'
                : 'Unlock intelligent learning that remembers what your household likes'
            }
            locked={!features.householdMemory}
            onClick={
              !features.householdMemory
                ? () => handleLockedClick(
                    'Unlock Household Memory',
                    'Plus unlocks intelligent learning — MealEase remembers preferences, feedback, and patterns to suggest better meals every week.'
                  )
                : undefined
            }
            badge={features.householdMemory ? 'Active' : 'Plus'}
            badgeColor={features.householdMemory ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
          >
            {features.householdMemory && <IntelligenceSummary />}
          </SectionCard>

        </div>

        {/* Upgrade prompt for free users */}
        {status.tier === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6"
          >
            <Link
              href="/upgrade?feature=household"
              className="block rounded-2xl border border-[#D97757]/25 bg-gradient-to-r from-[#D97757]/8 to-[#D97757]/3 p-4 hover:shadow-md hover:border-[#D97757]/40 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D97757]/15 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-[#D97757]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">
                    Unlock Household Memory & more
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Plus remembers your preferences and adds profiles for everyone.
                  </p>
                  <p className="text-xs font-semibold text-[#D97757] mt-1.5 flex items-center gap-1">
                    See plans <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Intelligence indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400"
        >
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            features.householdMemory
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-neutral-300',
          )} />
          <span>
            {features.householdMemory
              ? 'Intelligence layer active — learning your preferences'
              : 'Upgrade to Plus to activate the intelligence layer'}
          </span>
        </motion.div>
      </div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="household"
        title={paywallMessage.title}
        description={paywallMessage.description}
        isAuthenticated={status.isAuthenticated}
        redirectPath="/dashboard/household"
      />
    </div>
  )
}
