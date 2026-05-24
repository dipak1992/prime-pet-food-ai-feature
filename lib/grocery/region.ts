// ============================================================
// Grocery Commerce — Region Detection
// Detects user's country using timezone, locale, and manual override
// ============================================================

import type { DetectedRegion } from './types'

/** Timezones that map to US */
const US_TIMEZONES = new Set([
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Adak', 'Pacific/Honolulu', 'America/Phoenix',
  'America/Boise', 'America/Indiana/Indianapolis', 'America/Detroit',
  'America/Kentucky/Louisville', 'America/Menominee', 'America/Nome',
  'America/Juneau', 'America/Sitka', 'America/Yakutat', 'America/Metlakatla',
])

/** Timezones that map to Canada */
const CA_TIMEZONES = new Set([
  'America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg',
  'America/Halifax', 'America/St_Johns', 'America/Regina', 'America/Moncton',
  'America/Iqaluit', 'America/Yellowknife', 'America/Whitehorse',
  'America/Dawson', 'America/Dawson_Creek', 'America/Rankin_Inlet',
  'America/Resolute', 'America/Thunder_Bay', 'America/Nipigon',
  'America/Rainy_River', 'America/Atikokan', 'America/Cambridge_Bay',
  'America/Inuvik', 'America/Creston', 'America/Fort_Nelson',
  'America/Glace_Bay', 'America/Goose_Bay', 'America/Pangnirtung',
])

/** Locale prefixes that indicate US/CA */
const US_LOCALE_PREFIXES = ['en-US', 'en-us']
const CA_LOCALE_PREFIXES = ['en-CA', 'en-ca', 'fr-CA', 'fr-ca']

const STORAGE_KEY = 'mealease-grocery-region'

/**
 * Detect user's region using multiple signals.
 * Priority: manual override > timezone > locale > fallback
 */
export function detectRegion(): DetectedRegion {
  // 1. Check manual override from localStorage
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(STORAGE_KEY)
    if (override === 'US' || override === 'CA' || override === 'OTHER') {
      return override
    }
  }

  // 2. Check timezone
  if (typeof Intl !== 'undefined') {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (US_TIMEZONES.has(tz)) return 'US'
      if (CA_TIMEZONES.has(tz)) return 'CA'
    } catch {
      // Timezone detection failed, continue
    }
  }

  // 3. Check navigator locale
  if (typeof navigator !== 'undefined') {
    const langs = navigator.languages ?? [navigator.language]
    for (const lang of langs) {
      if (US_LOCALE_PREFIXES.some((p) => lang.startsWith(p))) return 'US'
      if (CA_LOCALE_PREFIXES.some((p) => lang.startsWith(p))) return 'CA'
    }
    // Generic English without country code — check timezone again as tiebreaker
    // If we got here with English, default to US (largest English market)
    const primaryLang = langs[0] ?? ''
    if (primaryLang.startsWith('en')) return 'US'
  }

  // 4. Fallback
  return 'OTHER'
}

/** Set manual region override */
export function setRegionOverride(region: DetectedRegion): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, region)
  }
}

/** Clear manual region override (revert to auto-detection) */
export function clearRegionOverride(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/** Get the stored override (or null if none) */
export function getRegionOverride(): DetectedRegion | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'US' || stored === 'CA' || stored === 'OTHER') return stored
  return null
}
