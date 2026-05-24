'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-emerald-700/15 bg-white/95 backdrop-blur p-3">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
          Personalized picks in under 20 seconds
        </p>
        <Button asChild className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-emerald-700/15" size="lg">
          <Link href="/signup">Start Free 7-Day Trial</Link>
        </Button>
      </div>
    </div>
  )
}
