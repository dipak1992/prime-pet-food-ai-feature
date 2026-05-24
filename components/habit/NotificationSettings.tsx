'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Bell, CalendarDays, Mail, Gift, Megaphone, Loader2 } from 'lucide-react'

interface NotifPrefs {
  dinner_reminders: boolean
  weekly_reminders: boolean
  referral_emails: boolean
  product_updates: boolean
}

interface DinnerSchedule {
  enabled: boolean
  preferred_hour: number
}

const PREF_DEFAULTS: NotifPrefs = {
  dinner_reminders: true,
  weekly_reminders: true,
  referral_emails: true,
  product_updates: true,
}

const HOUR_OPTIONS = [
  { label: '4:00 PM', value: 16 },
  { label: '5:00 PM', value: 17 },
  { label: '6:00 PM', value: 18 },
  { label: '7:00 PM', value: 19 },
]

const PREF_FIELDS: Array<{
  key: keyof NotifPrefs
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    key: 'dinner_reminders',
    label: "Tonight's Dinner Reminders",
    description: "Daily nudge at your preferred time with what's on the menu.",
    icon: <Bell className="h-4 w-4 text-primary" />,
  },
  {
    key: 'weekly_reminders',
    label: 'Weekly Meal-Planning Reminder',
    description: 'Sunday morning prompt to plan meals for the week ahead.',
    icon: <CalendarDays className="h-4 w-4 text-primary" />,
  },
  {
    key: 'referral_emails',
    label: 'Referral Rewards',
    description: 'Get notified when you earn a reward from referring a friend.',
    icon: <Gift className="h-4 w-4 text-primary" />,
  },
  {
    key: 'product_updates',
    label: 'Product Updates',
    description: 'Occasional news about new features and improvements.',
    icon: <Megaphone className="h-4 w-4 text-primary" />,
  },
]

const ESSENTIAL_ITEMS = [
  { label: 'Account & Security Emails', description: 'Magic links, password resets, and sign-in confirmations.' },
  { label: 'Billing & Receipts', description: 'Invoices and payment confirmations for Pro subscriptions.' },
  { label: 'Support Replies', description: 'Responses to your contact form submissions.' },
]

export function NotificationSettings() {
  const supabase = createClient()
  const [prefs, setPrefs] = useState<NotifPrefs>(PREF_DEFAULTS)
  const [dinner, setDinner] = useState<DinnerSchedule>({ enabled: false, preferred_hour: 17 })
  const [loading, setLoading] = useState(true)
  const [savingPref, setSavingPref] = useState<keyof NotifPrefs | null>(null)
  const [savingHour, setSavingHour] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [prefsRes, schedRes] = await Promise.all([
        supabase
          .from('notification_preferences')
          .select('dinner_reminders, weekly_reminders, referral_emails, product_updates')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('notification_preferences')
          .select('enabled, preferred_hour')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      if (prefsRes.data) {
        setPrefs({
          dinner_reminders: prefsRes.data.dinner_reminders ?? PREF_DEFAULTS.dinner_reminders,
          weekly_reminders: prefsRes.data.weekly_reminders ?? PREF_DEFAULTS.weekly_reminders,
          referral_emails:  prefsRes.data.referral_emails  ?? PREF_DEFAULTS.referral_emails,
          product_updates:  prefsRes.data.product_updates  ?? PREF_DEFAULTS.product_updates,
        })
      }
      if (schedRes.data) {
        setDinner({
          enabled: (schedRes.data as { enabled?: boolean }).enabled ?? false,
          preferred_hour: (schedRes.data as { preferred_hour?: number }).preferred_hour ?? 17,
        })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function togglePref(key: keyof NotifPrefs) {
    const next = !prefs[key]
    setPrefs(p => ({ ...p, [key]: next }))
    setSavingPref(key)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingPref(null); return }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, [key]: next }, { onConflict: 'user_id' })

    setSavingPref(null)
    if (error) {
      setPrefs(p => ({ ...p, [key]: !next }))
      toast.error('Couldn\'t save that — try again')
    } else {
      toast.success('Preference saved')
    }
  }

  async function setDinnerHour(hour: number) {
    setDinner(d => ({ ...d, preferred_hour: hour }))
    setSavingHour(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingHour(false); return }

    await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, preferred_hour: hour }, { onConflict: 'user_id' })

    setSavingHour(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Configurable preferences */}
      <div className="glass-card rounded-xl border border-border/60 p-5">
        <h2 className="font-semibold mb-4">Email Preferences</h2>
        <div className="divide-y divide-border/40">
          {PREF_FIELDS.map(({ key, label, description, icon }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 shrink-0">{icon}</span>
                <div className="min-w-0">
                  <Label htmlFor={key} className="cursor-pointer font-medium text-sm">{label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {savingPref === key && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                <Switch
                  id={key}
                  checked={prefs[key]}
                  onCheckedChange={() => togglePref(key)}
                  disabled={savingPref === key}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dinner reminder time picker */}
      {prefs.dinner_reminders && (
        <div className="glass-card rounded-xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-semibold text-sm">Dinner Reminder Time</Label>
            {savingHour && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {HOUR_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDinnerHour(value)}
                disabled={savingHour}
                className={[
                  'rounded-xl py-2.5 text-sm font-medium border transition-colors',
                  dinner.preferred_hour === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-foreground hover:bg-muted/60',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Emails are sent based on your local timezone.
          </p>
        </div>
      )}

      {/* Always-on essentials */}
      <div className="glass-card rounded-xl border border-border/60 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Essential Emails</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          These are required for your account to function and cannot be disabled.
        </p>
        <div className="divide-y divide-border/40">
          {ESSENTIAL_ITEMS.map(({ label, description }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <Switch checked disabled aria-label="Always enabled" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
