'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SectionSecurity() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signOutEverywhere() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signout-all', { method: 'POST' })
      if (!res.ok) {
        setError('Could not sign out all sessions. Please try again.')
        return
      }
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white/82 p-6">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-950">
        <ShieldCheck className="h-4 w-4 text-[#D97757]" />
        Security
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Sign out from every browser and device connected to your account.
      </p>
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={signOutEverywhere}
        disabled={loading}
        className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/82 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Sign out all devices
      </button>
    </section>
  )
}
