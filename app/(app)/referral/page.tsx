'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Gift, Users, Zap, Crown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  REFERRAL_BONUS_DAYS_PER_INVITE,
  REFERRAL_MAX_BONUS_DAYS,
  REFERRAL_TEMP_PRO_THRESHOLD,
  REFERRAL_TEMP_PRO_DAYS,
  REFERRAL_REWARDS,
} from '@/lib/referral/config'

interface ReferralStats {
  code: string | null
  totalReferrals: number
  bonusDays: number
  tempProUntil: string | null
  isTempPro: boolean
  nextTempProIn: number
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    Promise.resolve().then(() => setOrigin(window.location.origin))
    fetch('/api/referral/me')
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const referralLink = stats?.code ? `${origin}/r/${stats.code}` : ''

  const cycleProgress = stats
    ? stats.totalReferrals % REFERRAL_TEMP_PRO_THRESHOLD
    : 0

  const tempProDate = stats?.tempProUntil
    ? new Date(stats.tempProUntil).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Refer Friends, Earn Rewards
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite 1 friend for Plus trial days. Invite 3 to unlock Smart Menu Scan.
        </p>
      </div>

      {/* Referral link card */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <p className="mb-2 text-sm font-medium">Your referral link</p>
        {loading ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="flex-1 truncate text-sm font-mono text-foreground">
              {referralLink || '—'}
            </span>
            {referralLink && <CopyButton text={referralLink} />}
          </div>
        )}
        {stats?.code && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Code: <span className="font-mono font-semibold tracking-wider">{stats.code}</span>
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Users,
            label: 'Friends joined',
            value: loading ? '—' : String(stats?.totalReferrals ?? 0),
            color: 'text-primary',
          },
          {
            icon: Zap,
            label: 'Bonus days',
            value: loading ? '—' : `+${stats?.bonusDays ?? 0}`,
            color: 'text-amber-600',
          },
          {
            icon: Crown,
            label: 'Temp Plus',
            value: loading ? '—' : stats?.isTempPro ? 'Active' : 'Inactive',
            color: stats?.isTempPro ? 'text-emerald-600' : 'text-muted-foreground',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm text-center">
            <Icon className={cn('mx-auto mb-1.5 h-5 w-5', color)} />
            <p className={cn('text-xl font-bold', color)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Temp Plus status */}
      {stats?.isTempPro && tempProDate && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Crown className="h-5 w-5 flex-shrink-0" />
          <span>
            <span className="font-semibold">Temp Plus active</span> — expires{' '}
            <span className="font-semibold">{tempProDate}</span>
          </span>
        </div>
      )}

      {/* Rewards info */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
        <p className="text-sm font-semibold">How rewards work</p>

        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {REFERRAL_REWARDS.map((reward) => (
              <div key={reward.label} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Invite {reward.referrals}
                </p>
                <p className="mt-1 text-sm font-semibold">{reward.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{reward.description}</p>
              </div>
            ))}
          </div>

          {/* Bonus days */}
          <div className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">
                +{REFERRAL_BONUS_DAYS_PER_INVITE} extra planner day per referral
              </p>
              <p className="text-xs text-muted-foreground">
                Free plan starts at 3 days. Each referral unlocks 1 more, up to{' '}
                {3 + REFERRAL_MAX_BONUS_DAYS} days total.
              </p>
              {stats && !loading && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{
                      width: `${Math.min((stats.bonusDays / REFERRAL_MAX_BONUS_DAYS) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Temp Plus */}
          <div className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Crown className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">
                Every {REFERRAL_TEMP_PRO_THRESHOLD} referrals → {REFERRAL_TEMP_PRO_DAYS}-day Temp Plus
              </p>
              <p className="text-xs text-muted-foreground">
                Unlocks the full 7-day planner, grocery list, pantry, and insights.
              </p>
              {stats && !loading && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-400 transition-all"
                      style={{
                        width: `${(cycleProgress / REFERRAL_TEMP_PRO_THRESHOLD) * 100}%`,
                      }}
                    />
                  </div>
                  {stats.nextTempProIn > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {stats.nextTempProIn} more referral{stats.nextTempProIn !== 1 ? 's' : ''} until next Temp Plus
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share CTA */}
      {referralLink && (
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'MealEase — free meal planning for families',
                  text: 'Join me on MealEase for smart family meal planning.',
                  url: referralLink,
                }).catch(() => {})
              } else {
                navigator.clipboard.writeText(referralLink)
              }
            }}
          >
            <Gift className="mr-2 h-4 w-4" />
            Share your referral link
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join me on MealEase for smart family meal planning: ${referralLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Try MealEase — free family meal planning')}&body=${encodeURIComponent(`Hey! I\'ve been using MealEase to plan family meals and it\'s great. Sign up free with my link: ${referralLink}`)}`}
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
