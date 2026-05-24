'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, fadeIn, slideInLeft, slideInRight } from '@/lib/motion/variants'
import { ReactNode } from 'react'

type Direction = 'up' | 'fade' | 'left' | 'right'

interface ScrollRevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  className?: string
  once?: boolean
}

const variantMap = {
  up: fadeUp,
  fade: fadeIn,
  left: slideInLeft,
  right: slideInRight,
}

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className,
  once = true 
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={variantMap[direction]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
