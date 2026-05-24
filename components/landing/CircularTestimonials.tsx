'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

type CircularTestimonialsProps = {
  testimonials: Testimonial[]
  autoplay?: boolean
}

function calculateGap(width: number) {
  const minWidth = 320
  const maxWidth = 960
  const minGap = 28
  const maxGap = 72

  if (width <= minWidth) return minGap
  if (width >= maxWidth) return maxGap
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
}: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(720)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const testimonialsLength = testimonials.length
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials],
  )

  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
      autoplayIntervalRef.current = null
    }
  }, [])

  const handleNext = useCallback(() => {
    stopAutoplay()
    setActiveIndex((prev) => (prev + 1) % testimonialsLength)
  }, [stopAutoplay, testimonialsLength])

  const handlePrev = useCallback(() => {
    stopAutoplay()
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength)
  }, [stopAutoplay, testimonialsLength])

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!autoplay || shouldReduceMotion || testimonialsLength <= 1) return

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    }, 5200)

    return stopAutoplay
  }, [autoplay, shouldReduceMotion, stopAutoplay, testimonialsLength])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev()
      if (event.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleNext, handlePrev])

  function getImageStyle(index: number) {
    const gap = calculateGap(containerWidth)
    const maxStickUp = gap * 0.7
    const isActive = index === activeIndex
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
    const isRight = (activeIndex + 1) % testimonialsLength === index

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: 'auto' as const,
        transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)',
      }
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: 'auto' as const,
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.86) rotateY(14deg)`,
      }
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: 'auto' as const,
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.86) rotateY(-14deg)`,
      }
    }

    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none' as const,
      transform: 'translateX(0px) translateY(18px) scale(0.72)',
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#FBFAF3] p-4 ring-1 ring-orange-100 dark:bg-neutral-900 dark:ring-neutral-800 sm:p-6 lg:p-8">
      <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12 lg:gap-16">
        <div
          ref={imageContainerRef}
          className="relative mx-auto h-[17rem] w-full max-w-[23rem] perspective-[1000px] sm:h-[20rem] sm:max-w-[28rem] md:h-[22rem] md:max-w-none lg:h-[24rem]"
        >
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.src}
              type="button"
              aria-label={`Show testimonial from ${testimonial.name}`}
              onClick={() => {
                stopAutoplay()
                setActiveIndex(index)
              }}
              className="absolute inset-0 mx-auto flex h-full w-[74%] flex-col items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/70 bg-[radial-gradient(circle_at_30%_18%,rgba(243,177,142,0.34),transparent_30%),linear-gradient(145deg,#fffaf4,#f6eadf)] px-5 text-center shadow-2xl shadow-neutral-900/16 transition-all duration-700 ease-[cubic-bezier(.4,2,.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2 dark:border-white/10 dark:bg-[radial-gradient(circle_at_30%_18%,rgba(217,119,87,0.24),transparent_30%),linear-gradient(145deg,#171717,#0f0f0f)] sm:w-[68%] md:w-[72%]"
              style={getImageStyle(index)}
            >
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.42),transparent_38%,rgba(217,119,87,0.12))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_38%,rgba(217,119,87,0.14))]" />
              <div className="relative z-10">
                <div className="mx-auto rounded-full bg-white p-2 shadow-xl shadow-neutral-900/12 ring-1 ring-orange-100 dark:bg-neutral-950 dark:ring-white/10">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28 md:h-32 md:w-32">
                    <Image
                      src={testimonial.src}
                      alt={testimonial.name}
                      fill
                      sizes="(max-width: 768px) 112px, 128px"
                      quality={100}
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B85F43] dark:text-[#F3B18E]">
                  Household feedback
                </p>
                <p className="mt-2 font-serif text-xl font-bold text-neutral-950 dark:text-neutral-50">
                  {testimonial.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex min-h-[20rem] flex-col justify-between md:min-h-[24rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-neutral-50 md:text-3xl">
                {activeTestimonial.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#B85F43] dark:text-[#F3B18E]">
                {activeTestimonial.designation}
              </p>
              <blockquote className="mt-7">
                <p className="text-lg leading-8 text-neutral-700 dark:text-neutral-300 md:text-xl md:leading-9">
                  {activeTestimonial.quote.split(' ').map((word, index) => (
                    <motion.span
                      key={`${activeIndex}-${word}-${index}`}
                      initial={shouldReduceMotion ? false : { filter: 'blur(8px)', opacity: 0, y: 5 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(0px)', opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut', delay: Math.min(0.025 * index, 0.32) }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </p>
              </blockquote>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-2" aria-label="Testimonial pagination">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  onClick={() => {
                    stopAutoplay()
                    setActiveIndex(index)
                  }}
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2',
                    index === activeIndex ? 'w-7 bg-[#D97757]' : 'w-2 bg-neutral-300 dark:bg-neutral-700',
                  )}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <ArrowButton label="Previous testimonial" onClick={handlePrev}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </ArrowButton>
              <ArrowButton label="Next testimonial" onClick={handleNext}>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ArrowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-sm transition-colors hover:bg-[#D97757] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F3B18E]"
    >
      {children}
    </button>
  )
}
