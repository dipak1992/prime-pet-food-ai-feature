'use client'

import { useEffect, useRef } from 'react'
import { trackEvent, Analytics } from '@/lib/analytics'
import type { TimeBlock } from '@/lib/dashboard-messages'

interface Props {
  line: string
  timeBlock: TimeBlock
}

/**
 * SupportLine — one subtle line beneath the hero greeting.
 *
 * Rules:
 *  - Max 12 words, 8 preferred
 *  - Smaller than hero text, lower contrast than CTA buttons
 *  - No animation, no banner, no popup
 *  - Mobile-first, never wraps to two lines at 320px
 */
export function SupportLine({ line, timeBlock }: Props) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackEvent(Analytics.SUPPORT_MESSAGE_SEEN, {
        line,
        time_block: timeBlock,
      })
    }
  }, [line, timeBlock])

  return (
    <p className="mt-1 text-[13px] leading-snug text-muted-foreground/70">
      {line}
    </p>
  )
}
