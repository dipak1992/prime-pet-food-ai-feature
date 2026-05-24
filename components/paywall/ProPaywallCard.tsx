'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Crown, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PRO_UNLOCKS, ROI_ASSUMPTIONS } from '@/lib/paywall/config'
import { getUpgradeFeatureCopy, type UpgradeFeature } from '@/lib/paywall/feature-copy'
import posthog from 'posthog-js'

interface ProPaywallCardProps {
  title: string
  description: string
  isAuthenticated: boolean
  redirectPath?: string
  compact?: boolean
  tier?: 'pro'
  feature?: UpgradeFeature
}

export function ProPaywallCard({
  title,
  description,
  isAuthenticated,
  redirectPath = '/dashboard',
  compact = false,
  feature,
}: ProPaywallCardProps) {
  const signupHref = `/signup?redirect=${encodeURIComponent(redirectPath)}`
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`
  const router = useRouter()
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const featureCopy = getUpgradeFeatureCopy(feature)
  const unlocks = feature ? featureCopy.bullets : PRO_UNLOCKS

  const handleStartTrial = useCallback(async () => {
    setIsStartingTrial(true)
    posthog.capture('paywall_trial_started', {
      redirect_path: redirectPath,
      tier: 'pro',
    })
    try {
      const res = await fetch('/api/paywall/start-trial', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not start trial')
        return
      }
      toast.success('Your 7-day Plus trial is active!', {
        description: 'Enjoy full access to every feature.',
      })
      router.refresh()
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsStartingTrial(false)
    }
  }, [router, redirectPath])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-sage-muted/30 to-amber-50/40 p-6 sm:p-8 shadow-lg shadow-primary/5">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-primary/20">
          <Crown className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <Badge className="mb-2.5 border-primary/20 bg-primary/8 text-primary text-[11px] font-semibold tracking-wide uppercase">
            <Lock className="mr-1.5 h-3 w-3" />
            {isAuthenticated ? featureCopy.eyebrow : 'Account Required'}
          </Badge>
          <h3 className="text-xl font-bold tracking-tight leading-snug">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">{description}</p>
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-900">
            <span className="font-bold">Plus can pay for itself:</span>{' '}
            avoiding one ${ROI_ASSUMPTIONS.avoidedTakeoutNight} takeout night or using food before it becomes waste can offset the monthly cost.
          </div>
        </div>
      </div>

      {!compact && (
        <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
          {unlocks.slice(0, 6).map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 rounded-xl border border-primary/8 bg-white/80 px-3.5 py-2.5 text-[13px] font-medium"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {isAuthenticated ? (
          <>
            <Button
              onClick={handleStartTrial}
              disabled={isStartingTrial}
              size="lg"
              className="gradient-sage border-0 text-white hover:opacity-90 shadow-md shadow-primary/15 gap-2"
            >
              {isStartingTrial ? 'Starting trial…' : 'Try Plus free for 7 days'}
              {!isStartingTrial && <ArrowRight className="h-4 w-4" />}
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground">
              <Link href="/upgrade">Upgrade</Link>
            </Button>
            <p className="text-center text-[11px] text-muted-foreground/70 sm:text-left sm:ml-1">
              No credit card · Cancel anytime
            </p>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="gradient-sage border-0 text-white hover:opacity-90 shadow-md shadow-primary/15 gap-2">
              <Link href={signupHref}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground">
              <Link href="/upgrade">Upgrade</Link>
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
