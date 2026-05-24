import { Variants, Transition } from 'framer-motion'

// Shared easing curves
export const easing = {
  smooth: [0.25, 0.1, 0.25, 1.0],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  gentle: { type: 'spring', stiffness: 200, damping: 26 },
  snappy: { type: 'spring', stiffness: 400, damping: 35 },
} as const

// Fade up (for scroll reveals)
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: easing.smooth }
  },
}

// Fade in (no movement)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

// Scale up (for cards on hover)
export const scaleUp: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2, ease: easing.smooth } },
  tap: { scale: 0.98 },
}

// Stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: easing.smooth }
  },
}

// Slide in from sides
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easing.smooth } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easing.smooth } },
}

// For page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easing.smooth } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
