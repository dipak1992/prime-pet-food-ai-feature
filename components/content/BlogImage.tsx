'use client'

/**
 * BlogImage — Mobile-safe blog image component.
 *
 * Root cause of mobile image failure:
 * - Bare <img> with aspect-[16/9] collapses on mobile when parent width is 0
 *   before the image loads (no intrinsic size reserved by browser)
 * - loading="lazy" on above-fold cards means images never load on small viewports
 *   because the intersection observer fires before layout is stable
 *
 * Fix:
 * - Use a padding-top trick (56.25% = 16:9) on a relative container to
 *   reserve space before the image loads — zero layout shift
 * - Next.js <Image fill> inside the positioned container handles srcset,
 *   WebP conversion, and lazy loading correctly
 * - onError fallback shows a premium branded placeholder — no broken boxes
 * - priority prop for above-fold cards (first 4 on index page)
 */

import Image from 'next/image'
import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

interface BlogImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  /** aspect ratio as percentage string, default "56.25" (16:9) */
  aspectPercent?: string
}

export function BlogImage({
  src,
  alt,
  priority = false,
  className = '',
  aspectPercent = '56.25',
}: BlogImageProps) {
  const [errored, setErrored] = useState(false)

  return (
    // Outer wrapper: reserves exact height via padding-top trick
    // This is the most reliable cross-browser way to maintain aspect ratio
    // before an image loads — works on all mobile browsers including Safari iOS
    <div
      className={`relative w-full overflow-hidden bg-muted ${className}`}
      style={{ paddingTop: `${aspectPercent}%` }}
    >
      {errored ? (
        // ── Premium fallback — no broken boxes ──────────────────────────────
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
            <UtensilsCrossed className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">MealEase Guide</p>
        </div>
      ) : (
        // ── Real image — fill the reserved container ─────────────────────────
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          // sizes: mobile gets full viewport width, desktop gets card width
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
          className="object-cover"
          onError={() => setErrored(true)}
          // Unsplash images are always HTTPS — safe to unoptimize if needed
          // but Next.js Image optimization is preferred for WebP + srcset
        />
      )}
    </div>
  )
}
