import posthog from 'posthog-js'
import type { ScanType, ScanErrorKind } from './types'

export type ScanEvent =
  | 'scan_opened'
  | 'scan_captured'
  | 'scan_classified'
  | 'scan_mode_picked'
  | 'scan_completed'
  | 'scan_error'
  | 'scan_retake'
  | 'scan_closed'
  | 'scan_save_pantry'
  | 'scan_ingredient_manual_add'
  | 'scan_add_to_log'

export interface ScanEventProps {
  mode?: string
  type?: ScanType
  confidence?: number
  error?: ScanErrorKind
  duration_ms?: number
  ingredient_count?: number
  recipe_count?: number
  [key: string]: unknown
}

export function trackScan(event: ScanEvent, props: ScanEventProps = {}): void {
  try {
    posthog.capture(event, { ...props, source: 'scan_modal' })
  } catch {
    // PostHog not initialized yet — silently ignore
  }
}
