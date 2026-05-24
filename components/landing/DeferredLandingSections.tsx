'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const LandingSectionsClient = dynamic(
  () => import('./LandingSectionsClient').then((mod) => mod.LandingSectionsClient),
  {
    ssr: false,
    loading: () => <LandingSectionsFallback />,
  },
)

export function DeferredLandingSections() {
  const [canLoad, setCanLoad] = useState(false)

  useEffect(() => {
    const load = () => setCanLoad(true)

    window.addEventListener('scroll', load, { passive: true, once: true })
    window.addEventListener('pointerdown', load, { passive: true, once: true })

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 2200 })
      return () => {
        window.cancelIdleCallback(idleId)
        window.removeEventListener('scroll', load)
        window.removeEventListener('pointerdown', load)
      }
    }

    const timeoutId = globalThis.setTimeout(load, 1800)
    return () => {
      globalThis.clearTimeout(timeoutId)
      window.removeEventListener('scroll', load)
      window.removeEventListener('pointerdown', load)
    }
  }, [])

  if (!canLoad) return <LandingSectionsFallback />

  return <LandingSectionsClient />
}

function LandingSectionsFallback() {
  return (
    <section className="bg-white py-10 dark:bg-neutral-950 md:py-12" aria-hidden>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <div className="h-24 rounded-[1.75rem] bg-[#FDF6F1] ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800" />
      </div>
    </section>
  )
}
