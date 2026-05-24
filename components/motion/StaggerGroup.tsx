'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion/variants'
import { ReactNode, Children } from 'react'

interface StaggerGroupProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerGroup({ children, className, staggerDelay, once = true }: StaggerGroupProps) {
  const shouldReduceMotion = useReducedMotion()
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const container = staggerDelay ? {
    ...staggerContainer,
    visible: {
      ...(staggerContainer.visible as object),
      transition: { staggerChildren: staggerDelay, delayChildren: 0.1 }
    }
  } : staggerContainer

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      className={className}
    >
      {Children.map(children, (child) => (
        <motion.div variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
