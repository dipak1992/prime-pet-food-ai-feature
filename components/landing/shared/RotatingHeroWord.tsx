'use client'

import { useEffect, useMemo, useState } from 'react'

export function RotatingHeroWord() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(
    () => ['tonight', 'busy weeks', 'fridge food', 'your budget', 'real life'],
    [],
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timeoutId = window.setTimeout(() => {
      setTitleNumber((current) => (current === titles.length - 1 ? 0 : current + 1))
    }, 2100)

    return () => window.clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <span className="relative inline-block min-h-[1.08em] w-full overflow-hidden align-bottom text-[#D97757]" aria-live="polite">
      <span key={titles[titleNumber]} className="me-word-swap block whitespace-nowrap italic">
        {titles[titleNumber]}.
      </span>
    </span>
  )
}
