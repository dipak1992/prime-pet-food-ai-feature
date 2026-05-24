'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Crown, Lock, CheckCircle2, Sparkles, ArrowRight, Gift, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PRO_UNLOCKS, FAMILY_PLUS_UNLOCKS } from '@/lib/paywall/config'
import posthog from 'posthog-js'

type PaywallTier = 'pro' | 'family'

interface ProPaywallCardProps {
  title: string
  description: string
  isAuthenticated: boolean
  redirectPath?: string
  compact?: boolean
  tier?: PaywallTier
}

export function ProPaywallCard({
  title,
  description,
  isAuthenticated,
  redirectPath = '/dashboard',
  compact = false,
  tier = 'pro',
}: ProPaywallCardProps) {
  const signupHref = `/signup?redirect=${encodeURIComponent(redirectPath)}`
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`
  const router = useRouter()
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  const isFamilyTier = tier === 'family'
  const displayTier = isFamilyTier ? 'Family Plus' : 'Pro'
  const unlocks = isFamilyTier ? FAMILY_PLUS_UNLOCKS : PRO_UNLOCKS
  const Icon = isFamilyTier ? Gift : Crown
  const tierBadgeText = isFamilyTier ? 'Family Feature' : 'Pro Feature'
  const gradientClass = isFamilyTier 
    ? 'from-amber-500 to-orange-600' 
    : 'from-primary to-emerald-600'
  const buttonClass = isFamilyTier
    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-0 text-white hover:opacity-90 shadow-md shadow-amber-600/15'
    : 'gradient-sage border-0 text-white hover:opacity-90 shadow-md shadow-primary/15'
  const shadowClass = isFamilyTier ? 'shadow-amber-200/20' : 'shadow-primary/5'

  const handleStartTrial = useCallback(async () => {
    setIsStartingTrial(true)
    posthog.capture('paywall_trial_started', { 
      redirect_path: redirectPath,
      tier,
    })
    try {
      const res = await fetch('/api/paywall/start-trial', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not start trial')
        return
      }
      toast.success(`Your 7-day ${displayTier} trial is active!`, {
        description: 'Enjoy full access to every feature.',
      })
      router.refresh()
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsStartingTrial(false)
    }
  }, [router, redirectPath, tier, displayTier])

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white ${isFamilyTier ? 'via-amber-50/30 to-yellow-50/40' : 'via-sage-muted/30 to-amber-50/40'} p-6 sm:p-8 shadow-lg ${shadowClass}`}>
      {/* Decorative glow */}
      <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${isFamilyTier ? 'bg-amber-300/8' : 'bg-primary/8'} blur-3xl`} />
      <div className={`pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full ${isFamilyTier ? 'bg-orange-300/10' : 'bg-amber-300/10'} blur-3xl`} />

      {/* Header */}
      <div className="relative flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-md ${isFamilyTier ? 'shadow-amber-600/20' : 'shadow-primary/20'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <Badge className={`mb-2.5 ${isFamilyTier ? 'border-amber-300/20 bg-amber-100/60 text-amber-700' : 'border-primary/20 bg-primary/8 text-primary'} text-[11px] font-semibold tracking-wide uppercase`}>
            <Lock className="mr-1.5 h-3 w-3" />
            {isAuthenticated ? tierBadgeText : 'Account Required'}
          </Badge>
          <h3 className="text-xl font-bold tracking-tight leading-snug">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">{description}</p>
        </div>
      </div>

      {!compact && (
        <>
          {/* Benefits grid */}
          <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
            {unlocks.map((item) => (
              <div
                key={item}
                className={`flex items-center gap-2.5 rounded-xl border ${isFamilyTier ? 'border-amber-200/30 bg-amber-50/50' : 'border-primary/8 bg-white/80'} px-3.5 py-2.5 text-[13px] font-medium`}
              >
                <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isFamilyTier ? 'text-amber-600' : 'text-primary'}`} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Family feature highlight */}
          {isFamilyTier && (
            <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-yellow-50/60 px-4 py-3">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-900">
                  Supports up to 6 household member profiles
                </p>
                <p className="text-[11px] text-amber-700/70 mt-0.5">
                  Everyone&apos;s preferences, one smarter dinner plan. Profiles store allergies, age groups, and food goals — not separate logins.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* CTAs */}
      <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {isAuthenticated ? (
          <>
            <Button
              onClick={handleStartTrial}
              disabled={isStartingTrial}
              size="lg"
              className={`${buttonClass} gap-2`}
            >
              {isStartingTrial ? 'Starting trial…' : `Try ${displayTier} free for 7 days`}
              {!isStartingTrial && <ArrowRight className="h-4 w-4" />}
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground">
              <Link href="/pricing">Compare plans</Link>
            </Button>
            <p className="text-center text-[11px] text-muted-foreground/70 sm:text-left sm:ml-1">
              No credit card · Cancel anytime
            </p>
          </>
        ) : (
          <>
            <Button asChild size="lg" className={`${buttonClass} gap-2`}>
              <Link href={signupHref}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground">
              <Link href="/pricing">See all plans</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground/70 sm:text-left">
              Already have an account?{' '}
              <Link href={loginHref} className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
