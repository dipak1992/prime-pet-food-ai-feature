'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export function NewsletterBlock() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      // TODO: wire to your newsletter provider (Resend, ConvertKit, etc.)
      await new Promise((r) => setTimeout(r, 700))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="my-12 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-200 dark:ring-emerald-900 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
        <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
          You&apos;re on the list.
        </h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Check your inbox for a hello from us.
        </p>
      </div>
    )
  }

  return (
    <div className="my-12 rounded-3xl bg-gradient-to-br from-[#FDF6F1] to-white dark:from-neutral-900 dark:to-neutral-950 ring-1 ring-[#D97757]/20 p-6 md:p-8">
      <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        Get the next one in your inbox.
      </h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        One email a week, never more. Cancel anytime.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@email.com"
          className="flex-1 bg-white dark:bg-neutral-800 rounded-full px-5 py-3 text-sm outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-[#D97757]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-5 py-3 min-h-[48px] disabled:opacity-60"
        >
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          Subscribe
        </button>
      </form>
    </div>
  )
}
