'use client'

import dynamic from 'next/dynamic'

const MobileStickyCTA = dynamic(
  () => import('@/components/landing/MobileStickyCTA').then((mod) => mod.MobileStickyCTA),
  { ssr: false },
)

export function DeferredMobileStickyCTA() {
  return <MobileStickyCTA />
}
