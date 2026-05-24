'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check, Send } from 'lucide-react'
import { TOPIC_LABELS, type ContactPayload, type ContactTopic } from '@/lib/contact/types'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [form, setForm] = useState<ContactPayload>({
    name: '',
    email: '',
    topic: 'general',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong')
      }

      setStatus('success')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Got it — thanks!
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your message is on its way to Dipak and Suprabha. You&apos;ll hear back within 24 hours.
        </p>
        <button
          onClick={() => {
            setForm({ name: '', email: '', topic: 'general', message: '' })
            setStatus('idle')
          }}
          className="mt-6 text-sm font-medium text-[#D97757] hover:text-[#C86646]"
        >
          Send another message →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            maxLength={80}
            placeholder="First name"
            className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-[#D97757]"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            maxLength={120}
            placeholder="you@email.com"
            className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-[#D97757]"
          />
        </Field>
      </div>

      <Field label="Topic">
        <div className="flex flex-wrap gap-2 mt-1">
          {(Object.keys(TOPIC_LABELS) as ContactTopic[]).map((t) => {
            const active = form.topic === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => update('topic', t)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#D97757] text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
              >
                {TOPIC_LABELS[t]}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Message" required>
        <textarea
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="Tell us what's on your mind…"
          className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-[#D97757] resize-none leading-relaxed"
        />
        <div className="flex justify-between mt-1 text-xs text-neutral-500">
          <span>{form.message.length} / 2000</span>
          <span>Minimum 10 characters</span>
        </div>
      </Field>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-900 p-3 text-sm text-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting' || form.message.length < 10}
        className={cn(
          'w-full sm:w-auto inline-flex items-center justify-center gap-2',
          'bg-[#D97757] hover:bg-[#C86646] text-white font-medium rounded-full px-6 py-3 min-h-[52px]',
          'disabled:opacity-60 disabled:cursor-not-allowed'
        )}
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send message
          </>
        )}
      </button>

      <p className="text-xs text-neutral-500">
        By sending, you agree to our{' '}
        <Link href="/privacy" className="underline hover:text-[#D97757]">
          Privacy Policy
        </Link>
        . We&apos;ll never add you to a marketing list without asking.
      </p>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
        {required && <span className="text-[#D97757] ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
