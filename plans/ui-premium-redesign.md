# MealEase UI/UX Premium Redesign Architecture Plan

> **Design Direction:** "Calm Household Intelligence" — Linear precision, Notion warmth, Apple whitespace mastery.  
> **Principle:** Polish and elevate, never redesign from scratch.  
> **Date:** 2026-05-16

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Design Token System](#2-design-token-system)
3. [Motion System Specification](#3-motion-system-specification)
4. [Component Upgrade Plan](#4-component-upgrade-plan)
5. [Page-by-Page Implementation](#5-page-by-page-implementation)
6. [File Creation and Modification List](#6-file-creation-and-modification-list)
7. [Implementation Phases](#7-implementation-phases)

---

## 1. Current State Audit

### 1.1 Color System

**Current palette — oklch-based:**

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `oklch(0.66 0.17 145)` — sage green | Buttons, links, active states |
| `--coral` | `oklch(0.63 0.17 30)` — `#D97757` | CTA buttons, accents, brand warmth |
| `--cream` | `oklch(0.974 0.008 155)` — `#FDF6F1` | Section backgrounds, testimonial cards |
| `--background` | `oklch(0.974 0.008 155)` — soft green-white | Page background |
| `--foreground` | `oklch(0.22 0.02 255)` — near-black | Body text |
| `--muted-foreground` | `oklch(0.52 0.015 255)` | Secondary text |

**Issues identified:**

- No intermediate neutral scale — only foreground + muted-foreground
- Coral `#D97757` used as raw hex in 40+ places instead of token
- Dark mode tokens are generic grayscale — lose brand identity
- No semantic success/warning/info colors defined — only destructive
- Shadow system is ad-hoc with custom colors inline
- Chart colors are disconnected from brand palette

### 1.2 Typography

**Current fonts:**

- **Sans:** Inter variable `--font-inter` — body, UI
- **Serif:** Fraunces variable `--font-serif` with optical size axis — headings, display

**Current usage patterns:**

- Hero h1: `font-serif text-[38px] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[64px] font-bold`
- Section h2: `font-serif text-4xl md:text-5xl font-bold tracking-tight`
- Body: `text-base sm:text-lg leading-[1.6]` or `text-sm leading-relaxed`
- Labels: `text-xs font-semibold uppercase tracking-[0.18em]`

**Issues identified:**

- No defined type scale — sizes are ad-hoc per component
- Inconsistent heading weights — `font-bold` vs `font-semibold`
- Mobile h1/h2 overrides use `!important` in globals.css — fragile
- Line heights vary between `leading-tight`, `leading-snug`, `leading-relaxed` with no system
- Fraunces optical size axis is loaded — good for display vs body serif

### 1.3 Spacing

**Current patterns:**

- Container: `px-5 sm:px-8` with `max-w-[1200px]` / `max-w-[1400px]`
- Section padding: `py-20 md:py-28` — inconsistent, some use `py-16 md:py-24`, `py-24 md:py-32`
- Card padding: `p-5` / `p-6` / `p-8` — no system
- Gap: ranges from `gap-2` to `gap-16` without clear rationale

**Issues identified:**

- No consistent section rhythm
- Card internal spacing varies — p-4, p-5, p-6, p-8
- Container widths are hardcoded magic numbers
- Mobile overflow handling is solid — `overflow-x: clip`

### 1.4 Border Radius

**Current:** Base `--radius: 0.875rem` with computed scale from 8.4px to 30.8px.

**Actual usage:** Components use `rounded-2xl`, `rounded-3xl`, `rounded-full` directly — rarely using the token scale.

### 1.5 Motion and Animation

**Current implementation:**

- CSS-only `me-fade-in` animation — 0.55s cubic-bezier, translateY 18px
- `FadeIn` component wraps with CSS class + `animationDelay`
- Framer Motion used in `MealCard` and `TonightCard` — expand/collapse, enter/exit
- `prefers-reduced-motion` respected for CSS animation
- `content-visibility: auto` used for below-fold sections

**Issues identified:**

- `FadeIn` is CSS-only — no intersection observer, fires on page load not scroll
- No stagger system — delays are manually set per instance
- No shared Framer Motion variants — each component defines its own
- No hover micro-interactions on cards — only buttons have `active:scale-[0.98]`
- No page transitions
- Framer Motion v12.38 installed and working
- GPU-friendly transforms used in existing animations

### 1.6 Component Patterns

**Landing shared primitives:**

- `Container` — width wrapper — good, keep
- `Button` — link-based CTA with 3 variants — good foundation
- `FadeIn` — CSS animation wrapper — needs upgrade to IntersectionObserver

**UI library — shadcn:**

- Standard components: Button, Card, Badge, Dialog, Sheet, Tabs, etc.
- CVA-based variant system
- Compact sizing — h-8 default buttons, too small for premium feel

**Dashboard patterns:**

- `CardShell` — rounded-3xl container with ring border
- `TonightCard` — hero image + overlay + content pattern
- `MealCard` — expandable sections with Framer Motion

**Issues identified:**

- Two separate Button components — landing vs UI — with different APIs
- No glass-morphism component — `.glass-card` utility exists but unused
- Badge system is basic — no semantic color variants for meal tags
- No Section wrapper component — each section manually sets padding/bg

---

## 2. Design Token System

### 2.1 Color Palette — Expanded

```css
/* === globals.css additions — Premium Token System === */

@theme inline {
  /* --- Brand Core: Sage --- */
  --color-sage-50:  oklch(0.97 0.02 145);
  --color-sage-100: oklch(0.94 0.04 145);
  --color-sage-200: oklch(0.88 0.08 145);
  --color-sage-300: oklch(0.80 0.12 145);
  --color-sage-400: oklch(0.72 0.15 145);
  --color-sage-500: oklch(0.66 0.17 145);
  --color-sage-600: oklch(0.58 0.18 145);
  --color-sage-700: oklch(0.50 0.16 145);
  --color-sage-800: oklch(0.40 0.13 145);
  --color-sage-900: oklch(0.30 0.10 145);

  /* --- Brand Core: Coral --- */
  --color-coral-50:  oklch(0.97 0.02 30);
  --color-coral-100: oklch(0.93 0.06 30);
  --color-coral-200: oklch(0.87 0.10 30);
  --color-coral-300: oklch(0.78 0.14 30);
  --color-coral-400: oklch(0.70 0.16 30);
  --color-coral-500: oklch(0.63 0.17 30);
  --color-coral-600: oklch(0.56 0.16 30);
  --color-coral-700: oklch(0.48 0.14 30);
  --color-coral-800: oklch(0.38 0.11 30);
  --color-coral-900: oklch(0.28 0.08 30);

  /* --- Neutrals: warm-tinted --- */
  --color-neutral-25:  oklch(0.99 0.003 80);
  --color-neutral-50:  oklch(0.98 0.005 80);
  --color-neutral-100: oklch(0.96 0.006 80);
  --color-neutral-200: oklch(0.92 0.008 80);
  --color-neutral-300: oklch(0.87 0.008 80);
  --color-neutral-400: oklch(0.70 0.010 80);
  --color-neutral-500: oklch(0.55 0.012 255);
  --color-neutral-600: oklch(0.45 0.014 255);
  --color-neutral-700: oklch(0.35 0.015 255);
  --color-neutral-800: oklch(0.25 0.016 255);
  --color-neutral-900: oklch(0.18 0.016 255);
  --color-neutral-950: oklch(0.12 0.014 255);

  /* --- Semantic --- */
  --color-success: oklch(0.72 0.17 145);
  --color-warning: oklch(0.80 0.16 85);
  --color-info:    oklch(0.70 0.14 240);
  --color-error:   oklch(0.577 0.245 27.325);
}

:root {
  /* --- Surfaces --- */
  --surface-primary:   oklch(1 0 0);
  --surface-secondary: oklch(0.98 0.005 80);
  --surface-tertiary:  oklch(0.96 0.008 155);
  --surface-elevated:  oklch(1 0 0);
  --surface-overlay:   oklch(0.12 0.014 255 / 60%);
}
```

### 2.2 Typography Scale

```css
@layer utilities {
  .display-xl {
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }
  .display-lg {
    font-family: var(--font-serif);
    font-size: clamp(2rem, 4vw + 0.5rem, 3rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .display-md {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 2.5vw + 0.25rem, 1.875rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  .heading-lg {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .heading-md {
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
  }
  .body-lg {
    font-family: var(--font-sans);
    font-size: 1.125rem;
    font-weight: 400;
    line-height: 1.6;
  }
  .body-md {
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.6;
  }
  .body-sm {
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.5;
  }
  .label-lg {
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .label-sm {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
}
```

### 2.3 Spacing — Section Rhythm

```css
@layer utilities {
  .section-padding-sm { padding-top: 4rem; padding-bottom: 4rem; }
  .section-padding-md { padding-top: 5rem; padding-bottom: 5rem; }
  .section-padding-lg { padding-top: 6rem; padding-bottom: 6rem; }
}

@media (min-width: 768px) {
  .section-padding-sm { padding-top: 5rem; padding-bottom: 5rem; }
  .section-padding-md { padding-top: 7rem; padding-bottom: 7rem; }
  .section-padding-lg { padding-top: 8rem; padding-bottom: 8rem; }
}
```

### 2.4 Shadow Scale

```css
:root {
  --shadow-xs:    0 1px 2px oklch(0.20 0.01 80 / 0.04);
  --shadow-sm:    0 1px 3px oklch(0.20 0.01 80 / 0.06),
                  0 1px 2px oklch(0.20 0.01 80 / 0.04);
  --shadow-md:    0 4px 6px oklch(0.20 0.01 80 / 0.05),
                  0 2px 4px oklch(0.20 0.01 80 / 0.04);
  --shadow-lg:    0 10px 15px oklch(0.20 0.01 80 / 0.06),
                  0 4px 6px oklch(0.20 0.01 80 / 0.04);
  --shadow-xl:    0 20px 25px oklch(0.20 0.01 80 / 0.08),
                  0 8px 10px oklch(0.20 0.01 80 / 0.04);
  --shadow-2xl:   0 25px 50px oklch(0.20 0.01 80 / 0.14);

  /* Colored shadows for CTAs */
  --shadow-coral: 0 4px 14px oklch(0.63 0.17 30 / 0.25);
  --shadow-sage:  0 4px 14px oklch(0.66 0.17 145 / 0.20);

  /* Card elevation states */
  --shadow-card:       0 1px 3px oklch(0.20 0.01 80 / 0.04),
                       0 0 0 1px oklch(0.20 0.01 80 / 0.04);
  --shadow-card-hover: 0 8px 24px oklch(0.20 0.01 80 / 0.08),
                       0 2px 8px oklch(0.20 0.01 80 / 0.04);
}
```

### 2.5 Border Radius Scale

```css
:root {
  --radius-xs:   0.375rem;  /* 6px */
  --radius-sm:   0.5rem;    /* 8px */
  --radius-md:   0.75rem;   /* 12px */
  --radius-lg:   1rem;      /* 16px */
  --radius-xl:   1.25rem;   /* 20px */
  --radius-2xl:  1.5rem;    /* 24px */
  --radius-3xl:  2rem;      /* 32px */
  --radius-full: 9999px;
}
```

### 2.6 Transition and Easing Tokens

```css
:root {
  --duration-instant:  100ms;
  --duration-fast:     150ms;
  --duration-normal:   250ms;
  --duration-slow:     400ms;
  --duration-slower:   600ms;

  --ease-out:       cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-gentle:    cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Motion System Specification

### 3.1 Core Principles

1. **GPU-only:** All animations use `transform` and `opacity` exclusively
2. **Respect preferences:** `prefers-reduced-motion: reduce` disables all motion
3. **No layout shifts:** Animated elements have fixed dimensions or use `will-change`
4. **Lazy activation:** Below-fold animations only trigger on viewport entry
5. **Reusable variants:** Shared Framer Motion variant objects, never inline

### 3.2 Framer Motion Variant Library

**File:** `lib/motion/variants.ts`

```typescript
import type { Variants, Transition } from 'framer-motion'

// --- Shared Transitions ---
export const gentleTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
}

export const quickTransition: Transition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
}

// --- Fade Up: primary reveal ---
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: gentleTransition },
}

// --- Fade In: no movement ---
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

// --- Scale Up: cards, modals ---
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: gentleTransition },
}

// --- Slide In from Left ---
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: gentleTransition },
}

// --- Slide In from Right ---
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: gentleTransition },
}

// --- Stagger Container ---
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

// --- Hover Interactions ---
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: quickTransition },
}

export const tapScale = {
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

// --- Page Transitions ---
export const pageEnter: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
```

### 3.3 Motion Components

**File:** `components/motion/ScrollReveal.tsx`

```typescript
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  fadeUp,
  fadeIn,
  scaleUp,
  slideInLeft,
  slideInRight,
} from '@/lib/motion/variants'

type Variant = 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideLeft' | 'slideRight'

const variantMap: Record<Variant, typeof fadeUp> = {
  fadeUp,
  fadeIn,
  scaleUp,
  slideLeft: slideInLeft,
  slideRight: slideInRight,
}

interface Props {
  children: React.ReactNode
  variant?: Variant
  delay?: number
  className?: string
}

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className,
}: Props) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={variantMap[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
```

**File:** `components/motion/StaggerGroup.tsx`

```typescript
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, staggerContainerSlow } from '@/lib/motion/variants'

interface Props {
  children: React.ReactNode
  className?: string
  slow?: boolean
}

export function StaggerGroup({ children, className, slow = false }: Props) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={slow ? staggerContainerSlow : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  )
}
```

**File:** `components/motion/HoverCard.tsx`

```typescript
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { hoverLift, tapScale } from '@/lib/motion/variants'

interface Props {
  children: React.ReactNode
  className?: string
}

export function HoverCard({ children, className }: Props) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{ ...hoverLift, ...tapScale }}
    >
      {children}
    </motion.div>
  )
}
```

**File:** `components/motion/AnimatedCounter.tsx`

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface Props {
  value: string
  className?: string
}

export function AnimatedCounter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(shouldReduceMotion ? value : '0')

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setDisplay(value)
      return
    }

    const numericMatch = value.match(/[\d.]+/)
    if (!numericMatch) {
      setDisplay(value)
      return
    }

    const target = parseFloat(numericMatch[0])
    const prefix = value.slice(0, value.indexOf(numericMatch[0]))
    const suffix = value.slice(
      value.indexOf(numericMatch[0]) + numericMatch[0].length
    )
    const duration = 1200
    const start = performance.now()

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased

      setDisplay(
        `${prefix}${Number.isInteger(target) ? Math.round(current) : current.toFixed(1)}${suffix}`
      )

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, value, shouldReduceMotion])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
```

### 3.4 Micro-Interactions Spec

| Interaction | Property | Duration | Easing | Notes |
|-------------|----------|----------|--------|-------|
| Button press | `scale: 0.97` | 100ms | ease-out | Active state |
| Button hover | `translateY: -1px` + shadow | 150ms | ease-out | Subtle lift |
| Card hover | `translateY: -4px` + shadow | 250ms | ease-out | Elevation change |
| Toggle switch | `translateX` | 200ms | spring | Framer spring |
| Badge appear | `scale: 0 to 1` | 300ms | spring 260/20 | Pop in |
| Nav scroll | `backdrop-blur` + border | 150ms | ease-gentle | On scroll threshold |
| Accordion | `height: auto` | 250ms | ease-out | Framer AnimatePresence |
| Tab switch | `opacity + x` | 200ms | ease-out | Content crossfade |
| Stat counter | Number increment | 1200ms | ease-out cubic | On viewport entry |

### 3.5 Performance Rules

```typescript
// lib/motion/config.ts
export const MOTION_CONFIG = {
  viewportMargin: '-80px',
  animateOnce: true,
  maxConcurrent: 6,
} as const

// All motion components must:
// 1. Check useReducedMotion() and render static fallback
// 2. Use viewport={{ once: true }} to prevent re-triggering
// 3. Only animate transform and opacity
// 4. Never cause layout shifts (no width/height/padding animations)
// 5. Use will-change sparingly (only on actively animating elements)
```

---

## 4. Component Upgrade Plan

### 4.1 New Shared Primitives to Create

| Component | Path | Purpose |
|-----------|------|---------|
| `Section` | `components/layout/Section.tsx` | Consistent section wrapper with padding, bg, id |
| `SectionHeader` | `components/layout/SectionHeader.tsx` | Label + h2 + subtitle pattern |
| `ScrollReveal` | `components/motion/ScrollReveal.tsx` | IntersectionObserver-based reveal |
| `StaggerGroup` | `components/motion/StaggerGroup.tsx` | Stagger children on reveal |
| `HoverCard` | `components/motion/HoverCard.tsx` | Card with hover elevation |
| `AnimatedCounter` | `components/motion/AnimatedCounter.tsx` | Number count-up on reveal |
| `GlassCard` | `components/ui/GlassCard.tsx` | Glassmorphism surface |
| `GradientBorder` | `components/ui/GradientBorder.tsx` | Animated gradient border wrapper |

### 4.2 Section Component Spec

```typescript
// components/layout/Section.tsx
interface SectionProps {
  children: React.ReactNode
  id?: string
  className?: string
  background?: 'white' | 'cream' | 'dark' | 'gradient'
  padding?: 'sm' | 'md' | 'lg'
  container?: boolean | 'wide'
  ariaLabelledBy?: string
}

// Background map:
// white:    bg-white dark:bg-neutral-950
// cream:    bg-[oklch(0.974_0.008_155)] dark:bg-neutral-900
// dark:     bg-neutral-950 text-white
// gradient: gradient-hero

// Padding map:
// sm: py-16 md:py-20
// md: py-20 md:py-28 (default)
// lg: py-24 md:py-32
```

### 4.3 SectionHeader Component Spec

```typescript
// components/layout/SectionHeader.tsx
interface SectionHeaderProps {
  label?: string        // Uppercase tracking-wide coral label
  title: string         // h2 display text
  highlight?: string    // Italic coral-colored portion of title
  subtitle?: string     // Body text below
  align?: 'left' | 'center'
  id?: string           // For aria-labelledby
}

// Renders:
// <div class="max-w-2xl [mx-auto if center] mb-14 md:mb-20">
//   {label && <p class="label-lg text-coral-500 mb-3">{label}</p>}
//   <h2 id={id} class="display-lg text-neutral-900">
//     {title} <span class="italic text-coral-500">{highlight}</span>
//   </h2>
//   {subtitle && <p class="body-lg text-neutral-500 mt-4">{subtitle}</p>}
// </div>
```

### 4.4 Existing Component Upgrades

#### Landing `Button` — Enhanced

**Current:** 3 variants — primary, secondary, ghost  
**Upgrade:**

- Add `size` prop: `sm` / `md` / `lg`
- Add gradient shimmer on primary hover — subtle left-to-right highlight
- Increase min-height: sm=40px, md=48px, lg=56px
- Add `icon` prop for leading/trailing icon support
- Keep `rounded-full` — it works for the brand

```typescript
// Updated sizes:
const sizes = {
  sm: 'min-h-[40px] px-5 text-sm',
  md: 'min-h-[48px] px-6 text-base',   // current default
  lg: 'min-h-[56px] px-8 text-lg',
}

// Updated primary style:
const primaryStyle = `
  bg-gradient-to-r from-coral-500 to-coral-400
  text-white font-semibold
  shadow-[var(--shadow-coral)]
  hover:shadow-lg hover:brightness-105
  active:scale-[0.97] active:shadow-sm
  transition-all duration-150
`
```

#### Landing `FadeIn` — Replace with `ScrollReveal`

**Current:** CSS-only animation that fires on page load.
**Action:** Deprecate. Replace all usages with `ScrollReveal` component.

Migration pattern:
```diff
- <FadeIn delay={0.1}>
-   <div>...</div>
- </FadeIn>
+ <ScrollReveal delay={0.1}>
+   <div>...</div>
+ </ScrollReveal>
```

#### `CardShell` — Enhanced

**Current:** Basic rounded-3xl with ring border.
**Upgrade:**

- Add `elevated` prop for hover shadow transition
- Add `glass` prop for glassmorphism variant
- Add subtle border gradient option
- Integrate with `HoverCard` motion wrapper

```typescript
interface CardShellProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  ariaLabel?: string
  elevated?: boolean    // NEW: adds hover shadow transition
  glass?: boolean       // NEW: glassmorphism background
}
```

#### `MealCard` — Polish

**Current:** Functional but dense.
**Upgrades:**

- Add `HoverCard` wrapper for subtle lift on hover
- Refine badge colors to use new semantic token scale
- Add subtle gradient divider between sections instead of plain border
- Smooth expand/collapse with consistent spring transition
- Add skeleton loading state

#### `TonightCard` — Polish

**Current:** Well-designed hero card.
**Upgrades:**

- Add subtle parallax on the hero image on scroll — 5% translateY
- Refine the gradient overlay to use smoother oklch transitions
- Add shimmer loading state during regeneration instead of just spinner
- Animate the swap counter with `AnimatedCounter`

#### Nav — Enhanced

**Current:** Functional sticky nav with backdrop-blur.
**Upgrades:**

- Add scroll-triggered border opacity transition — transparent at top, visible on scroll
- Reduce nav height from h-16 to h-14 on scroll — subtle compression
- Add subtle shadow on scroll: `shadow-sm` appears after 50px scroll
- Mobile menu: add slide-down animation with Framer Motion

#### `MobileTabBar` — Polish

**Current:** Basic fixed bottom nav.
**Upgrades:**

- Add active indicator animation — pill slides between tabs
- Add haptic-style scale feedback on tap: `active:scale-[0.92]` on icon
- Increase icon size slightly: h-5 w-5 to h-[22px] w-[22px]
- Add subtle top shadow for depth separation

### 4.5 GlassCard Component Spec

```typescript
// components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'heavy'
}

// Styles:
// light:  bg-white/60 backdrop-blur-md border border-white/40
// medium: bg-white/75 backdrop-blur-lg border border-white/50 shadow-lg
// heavy:  bg-white/88 backdrop-blur-xl border border-white/60 shadow-xl
```

### 4.6 GradientBorder Component Spec

```typescript
// components/ui/GradientBorder.tsx
interface GradientBorderProps {
  children: React.ReactNode
  className?: string
  animate?: boolean  // subtle rotation animation
}

// Implementation: uses a pseudo-element with conic-gradient
// rotating slowly (20s linear infinite) behind a solid bg inner
// Colors: from-sage-400 via-coral-400 to-sage-600
```

---

## 5. Page-by-Page Implementation

### 5.1 Homepage / Landing — Priority 1

#### Hero Section

**Current state:** Split layout with phone mockup, CSS fade-in animations.
**Target state:** Premium scroll-reactive hero with depth layers.

**Specific changes:**

1. Replace `FadeIn` with `ScrollReveal` throughout
2. Add stagger to trust items using `StaggerGroup`
3. Add subtle floating animation to phone mockup — `animate={{ y: [0, -8, 0] }}` with 6s duration
4. Add gradient mesh background behind hero — subtle animated blobs using CSS
5. Refine the hero gradient: smoother transition from cream to white
6. Add parallax depth to the background image — 10% scroll offset

```typescript
// Hero background enhancement:
<div className="absolute inset-0 -z-10">
  {/* Gradient mesh — two animated blobs */}
  <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full
    bg-sage-100/40 blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
  <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full
    bg-coral-100/30 blur-[100px] animate-[float_25s_ease-in-out_infinite_reverse]" />
</div>
```

#### ProductProofStrip

- Wrap in `ScrollReveal` with `fadeUp`
- Add `AnimatedCounter` for any numeric stats

#### ConversionStory

- Replace `FadeIn` with `ScrollReveal`
- Add `HoverCard` to each workflow step card
- Add stagger animation to the 4-step grid

#### FounderNote

- Add subtle quote mark decoration — large serif quote in coral-100
- Wrap in `ScrollReveal`

#### HowItWorks

- Replace step circles with animated number reveal
- Add connecting line animation — draws on scroll using SVG path
- Each step card gets `HoverCard` wrapper
- Stagger the 3 steps with `StaggerGroup`

#### FivePillarsSection

- Add `HoverCard` to each pillar card
- Stagger reveal with `StaggerGroup`
- Add subtle icon animation on hover — scale 1.1

#### AutopilotSection

- `ScrollReveal` wrapper
- Add timeline/flow animation if applicable

#### GroceryCommerceSection

- `ScrollReveal` wrapper
- Add before/after comparison animation

#### ConnectedSystem

- `ScrollReveal` wrapper
- Add connection line animations between nodes

#### ComparisonTable

- `ScrollReveal` with `fadeUp`
- Add row-by-row stagger on reveal
- Highlight the MealEase column with subtle gradient background

#### SocialProof

- Stats row: use `AnimatedCounter` for each stat
- Testimonial cards: `StaggerGroup` + `HoverCard`
- Flow section: stagger the 5 steps

#### PricingTeaser

- Add `HoverCard` to pricing cards
- Plus card: add subtle animated gradient border using `GradientBorder`
- Price number: `AnimatedCounter`
- Add toggle animation for monthly/yearly if added later

#### FAQ

- Smooth accordion animation using Framer Motion `AnimatePresence`
- Add subtle rotate animation on chevron icon

#### FinalCTA

- `ScrollReveal` with `scaleUp` variant for dramatic entrance
- Add subtle particle/sparkle effect behind CTA button
- Pulsing glow on primary CTA

#### Footer

- `ScrollReveal` with `fadeIn`
- Add subtle hover underline animation on links

### 5.2 Pricing Page — Priority 2

**File:** `app/pricing/page.tsx`

**Upgrades:**

- Use `Section` + `SectionHeader` components
- Pricing cards with `HoverCard` + `GradientBorder` on recommended plan
- Feature comparison table with stagger reveal
- Add FAQ section with smooth accordions
- Toggle animation for billing period switch
- Trust badges row with `StaggerGroup`

### 5.3 Auth Pages — Priority 3

**Files:** `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`

**Current:** `AuthShell` with split layout — form + hero image.
**Upgrades:**

- Add subtle entrance animation to form card — `scaleUp` variant
- Add floating testimonial cards on the image side — subtle parallax
- Refine glass card on mobile — increase blur, add subtle border gradient
- Add form field focus animations — border color transition to coral
- Add success state animation on form submit — checkmark with spring
- Smooth transition between login/signup if navigating between them

### 5.4 Feature Pages — Priority 4

**Files:** `app/features/*/page.tsx`

**Upgrades:**

- Consistent `Section` + `SectionHeader` usage
- Feature demo sections with `ScrollReveal`
- Comparison/benefit cards with `HoverCard`
- CTA sections with `FinalCTA`-style treatment

### 5.5 Dashboard Pages — Priority 5

**Files:** `app/(app)/dashboard/`, `components/dashboard/`

**Upgrades:**

- `TonightCard`: parallax image, shimmer loading, smoother transitions
- `MealCard`: hover lift, refined badges, skeleton states
- `WeekPlanStrip`: horizontal scroll with snap + momentum
- `QuickActions`: icon hover animations
- `GreetingHeader`: time-based greeting with fade transition
- All cards: consistent use of `CardShell` with `elevated` prop

### 5.6 Mobile Navigation — Priority 6

**File:** `components/layout/MobileTabBar.tsx`

**Upgrades:**

- Animated active indicator pill — slides between tabs
- Icon scale animation on tap
- Subtle top border gradient
- Safe area handling refinement

---

## 6. File Creation and Modification List

### 6.1 New Files to Create

| File | Type | Purpose |
|------|------|---------|
| `lib/motion/variants.ts` | Utility | Shared Framer Motion variants |
| `lib/motion/config.ts` | Utility | Motion configuration constants |
| `components/motion/ScrollReveal.tsx` | Component | Viewport-triggered reveal |
| `components/motion/StaggerGroup.tsx` | Component | Stagger children animation |
| `components/motion/HoverCard.tsx` | Component | Hover elevation wrapper |
| `components/motion/AnimatedCounter.tsx` | Component | Number count-up animation |
| `components/layout/Section.tsx` | Component | Section wrapper primitive |
| `components/layout/SectionHeader.tsx` | Component | Section heading pattern |
| `components/ui/GlassCard.tsx` | Component | Glassmorphism card |
| `components/ui/GradientBorder.tsx` | Component | Animated gradient border |

### 6.2 Files to Modify

| File | Changes |
|------|---------|
| `app/globals.css` | Add token system, typography utilities, shadow scale, new keyframes |
| `components/landing/shared/FadeIn.tsx` | Deprecate — add re-export to ScrollReveal |
| `components/landing/shared/Button.tsx` | Add size prop, gradient primary, icon support |
| `components/landing/Hero.tsx` | Replace FadeIn, add mesh bg, floating phone animation |
| `components/landing/HowItWorks.tsx` | ScrollReveal, StaggerGroup, animated connector |
| `components/landing/SocialProof.tsx` | AnimatedCounter, StaggerGroup, HoverCard |
| `components/landing/PricingTeaser.tsx` | HoverCard, GradientBorder on Plus card |
| `components/landing/ConversionStory.tsx` | ScrollReveal, HoverCard on step cards |
| `components/landing/FinalCTA.tsx` | ScrollReveal scaleUp, CTA glow effect |
| `components/landing/FAQ.tsx` | Framer Motion accordion animation |
| `components/landing/FivePillarsSection.tsx` | StaggerGroup, HoverCard |
| `components/landing/AutopilotSection.tsx` | ScrollReveal |
| `components/landing/GroceryCommerceSection.tsx` | ScrollReveal |
| `components/landing/ConnectedSystem.tsx` | ScrollReveal, connection animations |
| `components/landing/ComparisonTable.tsx` | ScrollReveal, row stagger |
| `components/landing/Footer.tsx` | ScrollReveal fadeIn, link hover animations |
| `components/landing/Nav.tsx` | Scroll-triggered styles, mobile menu animation |
| `components/landing/FounderNote.tsx` | ScrollReveal, decorative quote |
| `components/landing/ProductProofStrip.tsx` | ScrollReveal, AnimatedCounter |
| `components/dashboard/shared/CardShell.tsx` | Add elevated/glass props |
| `components/dashboard/TonightCard.tsx` | Parallax, shimmer loading |
| `components/hub/MealCard.tsx` | HoverCard wrapper, refined badges |
| `components/layout/MobileTabBar.tsx` | Animated indicator, tap feedback |
| `components/auth/AuthShell.tsx` | Entrance animation, field focus states |

---

## 7. Implementation Phases

### Phase 1: Foundation — Token System and Motion Primitives

**Goal:** Establish the design system infrastructure without changing any visible UI.

**Tasks:**

- [ ] Add expanded color tokens to `globals.css`
- [ ] Add typography utility classes to `globals.css`
- [ ] Add shadow scale CSS variables to `globals.css`
- [ ] Add transition/easing tokens to `globals.css`
- [ ] Create `lib/motion/variants.ts`
- [ ] Create `lib/motion/config.ts`
- [ ] Create `components/motion/ScrollReveal.tsx`
- [ ] Create `components/motion/StaggerGroup.tsx`
- [ ] Create `components/motion/HoverCard.tsx`
- [ ] Create `components/motion/AnimatedCounter.tsx`
- [ ] Create `components/layout/Section.tsx`
- [ ] Create `components/layout/SectionHeader.tsx`
- [ ] Create `components/ui/GlassCard.tsx`
- [ ] Create `components/ui/GradientBorder.tsx`

### Phase 2: Landing Page — Above the Fold

**Goal:** Premium first impression — hero + nav + proof strip.

**Tasks:**

- [ ] Upgrade `Nav.tsx` — scroll-triggered styles, mobile animation
- [ ] Upgrade `Hero.tsx` — ScrollReveal, mesh background, floating phone
- [ ] Upgrade `ProductProofStrip.tsx` — ScrollReveal, counters
- [ ] Upgrade landing `Button.tsx` — sizes, gradient, shimmer

### Phase 3: Landing Page — Below the Fold

**Goal:** Consistent premium feel across all landing sections.

**Tasks:**

- [ ] Upgrade `ConversionStory.tsx`
- [ ] Upgrade `FounderNote.tsx`
- [ ] Upgrade `HowItWorks.tsx`
- [ ] Upgrade `FivePillarsSection.tsx`
- [ ] Upgrade `AutopilotSection.tsx`
- [ ] Upgrade `GroceryCommerceSection.tsx`
- [ ] Upgrade `ConnectedSystem.tsx`
- [ ] Upgrade `ComparisonTable.tsx`
- [ ] Upgrade `SocialProof.tsx`
- [ ] Upgrade `PricingTeaser.tsx`
- [ ] Upgrade `FAQ.tsx`
- [ ] Upgrade `FinalCTA.tsx`
- [ ] Upgrade `Footer.tsx`

### Phase 4: Auth and Pricing

**Goal:** Premium conversion pages.

**Tasks:**

- [ ] Upgrade `AuthShell.tsx` — entrance animation, focus states
- [ ] Upgrade pricing page — HoverCard, GradientBorder, toggle
- [ ] Add form micro-interactions

### Phase 5: Dashboard and App Shell

**Goal:** Polished in-app experience.

**Tasks:**

- [ ] Upgrade `CardShell.tsx` — elevated/glass variants
- [ ] Upgrade `TonightCard.tsx` — parallax, shimmer
- [ ] Upgrade `MealCard.tsx` — HoverCard, refined badges
- [ ] Upgrade `MobileTabBar.tsx` — animated indicator
- [ ] Add skeleton loading states to key cards
- [ ] Refine `AppLayout.tsx` transitions

---

## Appendix: Design Reference Mapping

| Reference | What to Borrow | Where to Apply |
|-----------|---------------|----------------|
| **Linear** | Clean geometric shapes, precise 4px grid, monochrome + one accent | Section layouts, spacing consistency, icon style |
| **Notion** | Warm neutrals, readable 15px body, calm hover states | Typography scale, card interactions, dashboard |
| **Perplexity** | Glass effects, streaming feel, modern AI aesthetic | GlassCard, loading states, Copilot UI |
| **Stripe** | Premium gradients, micro-interactions, trust signals | CTA buttons, pricing cards, social proof |
| **Apple** | Whitespace mastery, scroll animations, type hierarchy | Section rhythm, hero parallax, display typography |

---

## Appendix: CSS Keyframes to Add

```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
}

@keyframes shimmer-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes gradient-rotate {
  0% { --gradient-angle: 0deg; }
  100% { --gradient-angle: 360deg; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.63 0.17 30 / 0.4); }
  50% { box-shadow: 0 0 0 8px oklch(0.63 0.17 30 / 0); }
}
```

---

## Appendix: Tailwind Classes Quick Reference

**Premium card pattern:**
```html
<div class="rounded-2xl bg-white ring-1 ring-neutral-200/60
  shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
  transition-shadow duration-250 ease-out">
```

**Section pattern:**
```html
<section class="section-padding-md bg-white dark:bg-neutral-950">
  <div class="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
    <!-- SectionHeader -->
    <!-- Content -->
  </div>
</section>
```

**Premium CTA button:**
```html
<a class="inline-flex items-center justify-center gap-2 rounded-full
  min-h-[48px] px-6 text-base font-semibold
  bg-gradient-to-r from-coral-500 to-coral-400 text-white
  shadow-[var(--shadow-coral)]
  hover:shadow-lg hover:brightness-105
  active:scale-[0.97] transition-all duration-150">
  Plan dinner free
</a>
```

**Glass card pattern:**
```html
<div class="rounded-2xl bg-white/75 backdrop-blur-lg
  border border-white/50 shadow-lg">
```

---

*End of plan. This document serves as the single source of truth for all UI/UX premium redesign implementation tasks.*