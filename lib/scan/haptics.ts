/**
 * Trigger a haptic vibration if the browser supports it.
 * @param pattern - vibration duration in ms, or a pattern array
 */
export function haptic(pattern: number | number[] = 40): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Ignore — some browsers throw on vibrate
    }
  }
}

/** Short tap feedback */
export const hapticTap = () => haptic(30)

/** Success feedback */
export const hapticSuccess = () => haptic([40, 30, 80])

/** Error feedback */
export const hapticError = () => haptic([80, 40, 80])
