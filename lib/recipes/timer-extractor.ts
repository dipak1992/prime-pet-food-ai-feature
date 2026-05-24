const TIME_PATTERNS = [
  /\b(?:for|about|around)\s+(\d{1,3})\s*(seconds?|secs?)\b/i,
  /\b(?:for|about|around)\s+(\d{1,3})\s*(minutes?|mins?)\b/i,
  /\b(?:for|about|around)\s+(\d{1,2})\s*(hours?|hrs?)\b/i,
  /\b(\d{1,3})\s*(?:to|-)\s*(\d{1,3})\s*(minutes?|mins?)\b/i,
  /\b(\d{1,3})\s*(minutes?|mins?)\b/i,
]

export function extractTimerSeconds(instruction: string): number | undefined {
  const trimmed = instruction.trim()

  for (const pattern of TIME_PATTERNS) {
    const match = trimmed.match(pattern)
    if (!match) continue

    if (match[2]?.toLowerCase().startsWith('to') || match[3]?.toLowerCase().startsWith('min')) {
      const low = Number(match[1])
      const high = Number(match[2])
      if (Number.isFinite(low) && Number.isFinite(high)) return Math.round(((low + high) / 2) * 60)
    }

    const amount = Number(match[1])
    const unit = (match[2] ?? match[3] ?? '').toLowerCase()
    if (!Number.isFinite(amount) || amount <= 0) continue

    if (unit.startsWith('sec')) return amount
    if (unit.startsWith('hour') || unit.startsWith('hr')) return amount * 60 * 60
    return amount * 60
  }

  return undefined
}

export function enrichStepsWithTimers<T extends { instruction: string; timerSeconds?: number }>(steps: T[]): T[] {
  return steps.map((step) => ({
    ...step,
    timerSeconds: step.timerSeconds ?? extractTimerSeconds(step.instruction),
  }))
}
