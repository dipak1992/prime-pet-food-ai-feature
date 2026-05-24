'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Send,
  Copy,
  Check,
  ChefHat,
  Heart,
  Sparkles,
  Share2,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InviteRole = 'viewer' | 'editor'

interface InviteResult {
  inviteCode: string
  inviteLink: string
  invitedEmail?: string
  householdName?: string
  alreadyExists?: boolean
}

interface Props {
  /** Compact mode for embedding in dashboard cards */
  compact?: boolean
  /** Household name to display */
  householdName?: string
  /** Current member count */
  memberCount?: number
  /** Max members allowed */
  maxMembers?: number
}

const BENEFITS = [
  { icon: ChefHat, label: 'Plan meals together', color: 'text-orange-600' },
  { icon: Heart, label: 'Shared preferences', color: 'text-rose-500' },
  { icon: Sparkles, label: 'Synced grocery lists', color: 'text-violet-600' },
]

export function InviteCoChef({ compact = false, householdName, memberCount = 1, maxMembers = 6 }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('editor')
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const generateInvite = useCallback(async (withEmail?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: withEmail || undefined,
          role,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to create invite')
        return
      }

      const data: InviteResult = await res.json()
      setInviteResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void generateInvite(email || undefined)
  }

  const handleQuickInvite = () => {
    void generateInvite()
  }

  const copyLink = async () => {
    if (!inviteResult?.inviteLink) return
    await navigator.clipboard.writeText(inviteResult.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareLink = async () => {
    if (!inviteResult?.inviteLink) return
    if (navigator.share) {
      await navigator.share({
        title: `Join ${householdName || 'my household'} on MealEase`,
        text: `I'm inviting you to be my Co-Chef! Plan meals together, share grocery lists, and cook smarter.`,
        url: inviteResult.inviteLink,
      }).catch(() => {})
    } else {
      await copyLink()
    }
  }

  // ── Compact mode: just a CTA button ──
  if (compact && !showForm && !inviteResult) {
    return (
      <motion.button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center gap-3 rounded-xl border border-dashed border-violet-300/60 bg-gradient-to-r from-violet-50/80 to-purple-50/60 p-4 text-left transition-all hover:border-violet-400 hover:shadow-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
          <Users className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Invite a Co-Chef</p>
          <p className="text-xs text-muted-foreground truncate">
            Plan meals together · Share grocery lists
          </p>
        </div>
        <Send className="h-4 w-4 text-violet-500 flex-shrink-0" />
      </motion.button>
    )
  }

  // ── Success state: show invite link ──
  if (inviteResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/80 p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Invite created!</p>
            <p className="text-xs text-emerald-700/80">
              {inviteResult.invitedEmail
                ? `Sent to ${inviteResult.invitedEmail}`
                : 'Share this link with your Co-Chef'}
            </p>
          </div>
        </div>

        {/* Invite link display */}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white/80 px-3 py-2.5">
          <span className="flex-1 truncate text-xs font-mono text-foreground">
            {inviteResult.inviteLink}
          </span>
          <button
            onClick={() => void copyLink()}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => void shareLink()}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join me as a Co-Chef on MealEase! Plan meals together: ${inviteResult.inviteLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1ebe5d] transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={`mailto:${inviteResult.invitedEmail || ''}?subject=${encodeURIComponent(`Join me on MealEase as my Co-Chef!`)}&body=${encodeURIComponent(`Hey! I'm inviting you to be my Co-Chef on MealEase. We can plan meals together, share grocery lists, and keep everyone's preferences in sync.\n\nJoin here: ${inviteResult.inviteLink}`)}`}
            className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-emerald-50 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        </div>

        {/* Send another */}
        <button
          onClick={() => { setInviteResult(null); setEmail(''); setShowForm(true) }}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
        >
          + Invite another Co-Chef
        </button>
      </motion.div>
    )
  }

  // ── Main invite form ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50/80 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100">
          <Users className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground">Invite a Co-Chef</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {memberCount}/{maxMembers} members · Collaborate on meal planning
          </p>
        </div>
      </div>

      {/* Benefits */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-1.5 rounded-full bg-white/80 border border-violet-100 px-2.5 py-1"
            >
              <b.icon className={cn('h-3.5 w-3.5', b.color)} />
              <span className="text-xs font-medium text-foreground">{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Role selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setRole('editor')}
          className={cn(
            'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
            role === 'editor'
              ? 'border-violet-400 bg-violet-100 text-violet-800 shadow-sm'
              : 'border-border bg-white/60 text-muted-foreground hover:border-violet-200'
          )}
        >
          <ChefHat className="h-3.5 w-3.5 mx-auto mb-1" />
          Co-Chef (can edit)
        </button>
        <button
          onClick={() => setRole('viewer')}
          className={cn(
            'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
            role === 'viewer'
              ? 'border-violet-400 bg-violet-100 text-violet-800 shadow-sm'
              : 'border-border bg-white/60 text-muted-foreground hover:border-violet-200'
          )}
        >
          <Users className="h-3.5 w-3.5 mx-auto mb-1" />
          Viewer (read only)
        </button>
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Partner's email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/80 border-violet-200 focus:border-violet-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 gap-1.5"
          >
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Invite
              </>
            )}
          </Button>
        </div>

        {/* Quick invite (no email) */}
        <button
          type="button"
          onClick={handleQuickInvite}
          disabled={loading}
          className="w-full text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
        >
          Or generate a shareable link without email →
        </button>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-600 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Cancel for compact mode */}
      {compact && (
        <button
          onClick={() => setShowForm(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      )}
    </motion.div>
  )
}
