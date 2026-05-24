'use client'

import { LeftoverCookedPrompt } from './LeftoverCookedPrompt'

/**
 * Mounted globally in app/(app)/layout.tsx so the cooked prompt
 * can appear from any page when markCooked() is called.
 */
export function GlobalCookedPrompt() {
  return <LeftoverCookedPrompt />
}
