'use client'

import { useState } from 'react'
import { Loader2, Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Turnstile } from './Turnstile'

type Mode = 'login' | 'signup'

type Props = {
  mode: Mode
  next?: string
}

export function EmailAuthForm({ mode, next = '/dashboard' }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        mode,
        next,
        captchaToken,
      }),
    })

    setLoading(false)

    if (!res.ok && res.status === 429) {
      setError('Too many attempts. Please wait a minute and try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
          Check your email
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          If this email is eligible, we&apos;ll send a magic link to <strong>{email}</strong>. Click it to{' '}
          {mode === 'login' ? 'sign in' : 'create your account'}.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail('') }}
          className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-neutral-900 pl-10 pr-4 py-3 text-sm outline-none transition-colors',
            'border-neutral-200 dark:border-neutral-700',
            'focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/20',
            error && 'border-red-400 dark:border-red-600'
          )}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <Turnstile onToken={setCaptchaToken} />

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D97757] to-[#E8895A] text-white px-4 py-3.5 text-sm font-semibold tracking-wide shadow-lg shadow-[#D97757]/40 hover:from-[#C86646] hover:to-[#D97757] hover:shadow-[#D97757]/50 active:scale-[0.98] active:shadow-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {mode === 'login' ? 'Send magic link' : 'Create account'}
      </button>
    </form>
  )
}
