'use client'

import { Children, ReactNode, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  itemClassName?: string
  dotTone?: 'warm' | 'light'
  ariaLabel?: string
}

export function MobileCarouselRail({
  children,
  className,
  itemClassName,
  dotTone = 'warm',
  ariaLabel = 'Swipe through cards',
}: Props) {
  const items = Children.toArray(children)
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const updateActiveIndex = () => {
    const rail = railRef.current
    if (!rail) return

    const cards = Array.from(rail.children) as HTMLElement[]
    const nearest = cards.reduce(
      (best, card, index) => {
        const distance = Math.abs(card.offsetLeft - rail.scrollLeft)
        return distance < best.distance ? { index, distance } : best
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    )
    setActiveIndex(nearest.index)
  }

  const scrollTo = (index: number) => {
    const rail = railRef.current
    const card = rail?.children[index] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  if (items.length === 0) return null

  return (
    <div className={cn(className)}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px 0px' }}
        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          aria-label={ariaLabel}
          ref={railRef}
          onScroll={updateActiveIndex}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((child, index) => (
            <motion.div
              key={index}
              className={cn('snap-center', itemClassName)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="mt-4 flex justify-center gap-1" aria-label="Carousel pagination">
        {items.map((_, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={index}
              type="button"
              aria-label={`Show card ${index + 1}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => scrollTo(index)}
              className="flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2"
            >
              <motion.span
                layout
                className={cn(
                  'block h-1.5 rounded-full',
                  isActive ? 'w-5' : 'w-1.5',
                  dotTone === 'light'
                    ? isActive ? 'bg-[#F3B18E]' : 'bg-white/25'
                    : isActive ? 'bg-[#D97757]' : 'bg-neutral-300 dark:bg-neutral-700',
                )}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
