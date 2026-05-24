'use client'

import { use, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  ChefHat,
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type InviteInfo = {
  valid: boolean
  householdName?: string
  inviterName?: string
  role?: string
  error?: string
}

type AcceptResult = {
  success: boolean
  error?: string
}

const PERKS = [
  { icon: ChefHat, label: 'Plan meals together', desc: 'Both of you can suggest and approve dinners' },
  { icon: Heart, label: 'Shared preferences', desc: 'Allergies, dislikes, and favorites stay in sync' },
  { icon: Sparkles, label: 'Synced grocery lists', desc: 'One list, two shoppers — no duplicates' },
]

export function InviteAcceptClient({ paramsPromise }: { paramsPromise: Promise<{ code: string }> }) {
  const { code } = use(paramsPromise)
  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [result, setResult] = useState<AcceptResult | null>(null)

  useEffect(() => {
    fetch(`/api/family/invite/accept?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        setInfo(data)
        setLoading(false)
      })
      .catch(() => {
        setInfo({ valid: false, error: 'Unable to verify invite' })
        setLoading(false)
      })
  }, [code])

  async function handleAccept() {
    setAccepting(true)
    try {
      const res = await fetch('/api/family/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, error: 'Network error' })
    } finally {
      setAccepting(false)
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Verifying invite...</p>
        </motion.div>
      </div>
    )
  }

  // ── Invalid invite ──
  if (!info?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-4"
        >
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold">Invite not found</h1>
          <p className="text-sm text-muted-foreground">
            {info?.error || 'This invite link may have expired or been revoked.'}
          </p>
          <Button asChild>
            <Link href="/login">Sign up for MealEase</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── Success state ──
  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center space-y-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold">You&apos;re in! 🎉</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ve joined <span className="font-semibold">{info.householdName || 'the household'}</span> as a Co-Chef.
            Start planning meals together!
          </p>
          <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── Accept error ──
  if (result && !result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-4"
        >
          <XCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold">Couldn&apos;t join</h1>
          <p className="text-sm text-muted-foreground">
            {result.error || 'Something went wrong. You may need to sign in first.'}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login?redirect=/invite/{code}">Sign in</Link>
            </Button>
            <Button onClick={handleAccept} className="flex-1">
              Try again
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Main invite acceptance view ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 via-purple-50/30 to-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Invite card */}
        <div className="rounded-3xl border border-violet-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-100/40 p-7 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-violet-600" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                >
                  <ChefHat className="h-3.5 w-3.5 text-emerald-600" />
                </motion.div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              You&apos;re invited to cook together!
            </h1>
            <p className="text-sm text-muted-foreground">
              {info.inviterName ? (
                <><span className="font-semibold text-foreground">{info.inviterName}</span> wants you to join </>
              ) : (
                <>Join </>
              )}
              <span className="font-semibold text-violet-700">{info.householdName || 'their household'}</span>
              {' '}as a {info.role === 'viewer' ? 'Viewer' : 'Co-Chef'}
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 rounded-xl bg-violet-50/60 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                  <perk.icon className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{perk.label}</p>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Accept button */}
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-violet-200/50"
          >
            {accepting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ChefHat className="h-5 w-5 mr-2" />
                Accept & Join as Co-Chef
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Free forever · No credit card required
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={`/login?redirect=/invite/${code}`} className="text-violet-600 font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
