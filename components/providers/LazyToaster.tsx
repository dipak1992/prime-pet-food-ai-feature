'use client'

import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'

export function LazyToaster() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setReady(true), {
        timeout: 3500,
      })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = globalThis.setTimeout(() => setReady(true), 2500)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  if (!ready) {
    return null
  }

  return <Toaster richColors position="top-right" />
}
