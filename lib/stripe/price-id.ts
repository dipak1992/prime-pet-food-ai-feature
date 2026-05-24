const STRIPE_PRICE_ID_RE = /^price_[A-Za-z0-9]+$/
const STRIPE_PRICE_ID_IN_TEXT_RE = /price_[A-Za-z0-9]+/

export function normalizeStripePriceId(raw: string | null | undefined): string {
  const value = raw?.trim() ?? ''
  if (!value) return ''
  if (STRIPE_PRICE_ID_RE.test(value)) return value

  const match = value.match(STRIPE_PRICE_ID_IN_TEXT_RE)?.[0] ?? ''
  if (match) {
    console.warn('[stripe] Price ID env var contains extra text; using extracted price ID.')
  }
  return match
}

export function isStripePriceId(value: string): boolean {
  return STRIPE_PRICE_ID_RE.test(value)
}
