'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface HoverCardProps {
  children: ReactNode
  className?: string
  lift?: number
  scale?: number
}

export function HoverCard({ children, className, lift = 2, scale = 1.01 }: HoverCardProps) {
  const shouldReduceMotion = useReducedMotion()
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
