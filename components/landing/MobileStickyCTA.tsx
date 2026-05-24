'use client'

import { useEffect, useState } from 'react'
import { Button } from './shared/Button'

export function MobileStickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 360)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!visible) return null

  return (
    <div className="me-sticky-cta fixed inset-x-3 bottom-3 z-[90] flex gap-2 rounded-full bg-white/92 p-2 shadow-2xl shadow-neutral-900/18 ring-1 ring-neutral-200/80 backdrop-blur md:hidden dark:bg-neutral-950/92 dark:ring-neutral-800">
      <Button href="/signup" className="min-h-11 flex-1 px-4 text-sm">
        Start free
      </Button>
      <Button href="#pricing" variant="ghost" className="min-h-11 flex-1 border border-neutral-200 px-4 text-sm dark:border-neutral-800">
        See pricing
      </Button>
    </div>
  )
}
