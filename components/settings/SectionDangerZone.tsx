'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SectionDangerZone() {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    if (confirm !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/settings', { method: 'DELETE' })
      if (res.ok) {
        router.push('/goodbye')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-red-400">
        <AlertTriangle className="h-4 w-4" />
        Danger zone
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Permanently delete your account and all associated data. This cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Type <strong className="text-red-400">DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-red-500/60"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setConfirm('') }}
              className="rounded-2xl border border-orange-100 bg-white/82 px-4 py-2.5 text-sm text-slate-500 hover:bg-orange-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirm !== 'DELETE' || deleting}
              className="flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Permanently delete
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
