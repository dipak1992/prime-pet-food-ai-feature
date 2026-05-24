/**
 * Scheduling helpers — timezone-aware "is this reminder due?" checks.
 *
 * Used by the cron endpoint to decide whether to send a reminder to a user
 * based on their stored schedule row.
 */

export interface ReminderScheduleRow {
  dinner_enabled?: boolean
  dinner_hour?: number       // 0–23 in user's local timezone
  weekly_enabled?: boolean
  weekly_day?: number        // 0=Sun … 6=Sat
  timezone: string           // IANA, e.g. "America/New_York"
  last_dinner_sent_at?: string | null
  last_weekly_sent_at?: string | null
}

/** Returns true if dinner reminder should fire right now for this user. */
export function isDinnerReminderDue(schedule: ReminderScheduleRow): boolean {
  if (!schedule.dinner_enabled) return false

  const now = nowInTz(schedule.timezone)
  const todayKey = dateKey(now)

  // Already sent today?
  if (schedule.last_dinner_sent_at?.slice(0, 10) === todayKey) return false

  return now.getHours() === (schedule.dinner_hour ?? -1)
}

/** Returns true if weekly reminder should fire right now for this user. */
export function isWeeklyReminderDue(schedule: ReminderScheduleRow): boolean {
  if (!schedule.weekly_enabled) return false

  const now = nowInTz(schedule.timezone)
  const thisWeek = weekStartKey(now)

  // Already sent this week?
  if (schedule.last_weekly_sent_at?.slice(0, 10) === thisWeek) return false

  return now.getDay() === (schedule.weekly_day ?? -1)
}


// ─── Internal helpers ────────────────────────────────────────────────────────

/** Get current Date object expressed in a given IANA timezone. */
function nowInTz(timezone: string): Date {
  try {
    const str = new Date().toLocaleString('en-US', { timeZone: timezone })
    return new Date(str)
  } catch {
    // Fallback to UTC if timezone is unrecognised
    return new Date()
  }
}

function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday of the week containing `d`, formatted as YYYY-MM-DD. */
function weekStartKey(d: Date): string {
  const copy = new Date(d)
  const dow = copy.getDay()
  const diff = dow === 0 ? -6 : 1 - dow   // Monday = 1
  copy.setDate(copy.getDate() + diff)
  return dateKey(copy)
}
