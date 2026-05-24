'use client'

import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'

type NotifPrefs = {
  dinner_reminders: boolean
  weekly_plan_ready: boolean
  grocery_reminders: boolean
  leftover_alerts: boolean
  budget_alerts: boolean
  marketing: boolean
}

type Props = {
  prefs: NotifPrefs
}

function Toggle({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[#D97757]' : 'bg-orange-100',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function SectionNotifications({ prefs: initial }: Props) {
  const [prefs, setPrefs] = useState<NotifPrefs>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  function toggle(key: keyof NotifPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: prefs }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white/82 p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-950">
        <Bell className="h-4 w-4 text-[#D97757]" />
        Notifications
      </h2>

      <div className="divide-y divide-white/5">
        <Toggle label="Dinner reminders"     description="A gentle evening nudge when it is time to decide dinner" checked={prefs.dinner_reminders} onChange={() => toggle('dinner_reminders')} />
        <Toggle label="Weekly plan ready"    description="Get notified when your meal plan is generated"  checked={prefs.weekly_plan_ready}  onChange={() => toggle('weekly_plan_ready')} />
        <Toggle label="Grocery reminders"    description="Reminders to check your grocery list"           checked={prefs.grocery_reminders}  onChange={() => toggle('grocery_reminders')} />
        <Toggle label="Leftover alerts"      description="Suggestions when leftovers are about to expire" checked={prefs.leftover_alerts}    onChange={() => toggle('leftover_alerts')} />
        <Toggle label="Budget alerts"        description="Alerts when you're close to your weekly budget" checked={prefs.budget_alerts}      onChange={() => toggle('budget_alerts')} />
        <Toggle label="Product updates"      description="Occasional tips and new feature announcements"  checked={prefs.marketing}          onChange={() => toggle('marketing')} />
      </div>

      <button type="button" onClick={handleSave} disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-2xl bg-[#D97757] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c4694a] disabled:opacity-60">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saved ? '✓ Saved' : 'Save preferences'}
      </button>
    </section>
  )
}
