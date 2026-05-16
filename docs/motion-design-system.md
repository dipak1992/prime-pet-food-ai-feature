# Prime Pet Food — Motion & Design System
**Project:** Prime Pet Food — Premium Himalayan Yak Cheese Dog Chews  
**Website:** theprimepetfood.com  
**Stack:** Shopify Ignite v2.5.0 (vanilla JS, vanilla CSS)  
**Generated:** 2026-05-16 via UI/UX Pro Max Design Intelligence  
**Brand Feel:** Premium · Calm · Trust · Wellness · Modern Dog Parenting · Warmth  
**Reference Brands:** Apple, Linear, Stripe, luxury DTC wellness brands

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Recommended Style](#2-recommended-style)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Motion & Animation Principles](#5-motion--animation-principles)
6. [UX Guidelines for Scroll & Reveal](#6-ux-guidelines-for-scroll--reveal)
7. [CSS Design Tokens](#7-css-design-tokens)
8. [Anti-Patterns to Avoid](#8-anti-patterns-to-avoid)
9. [Pre-Delivery Checklist](#9-pre-delivery-checklist)

---

## 1. Design System Overview

**Search Query:** `premium pet food DTC ecommerce wellness luxury calm trust`  
**Pattern Match:** Enterprise Gateway → adapted for premium DTC storytelling  
**Recommended Hybrid:** Nature Distilled × Storytelling-Driven × Trust & Authority

Prime Pet Food sits at the intersection of **luxury DTC wellness** and **trust-first pet care**. The design system should feel like a premium dog-parent lifestyle brand — warm, grounded, and confident — not clinical or playful. Think Aesop meets Chewy's premium tier.

### Page Structure (Recommended)
1. **Hero** — Full-bleed lifestyle photography, single headline, one CTA
2. **Trust Signals** — Ingredient sourcing, certifications, vet-approved badges
3. **Product Showcase** — Bento-style product cards with scroll-reveal
4. **Story / Mission** — Founder narrative, Himalayan origin story
5. **Social Proof** — Dog parent testimonials, UGC photos
6. **CTA / Purchase** — Clean, frictionless add-to-cart

---

## 2. Recommended Style

### Primary: Nature Distilled
> **Best match for Prime Pet Food** — earthy warmth, organic materials feel, premium artisan quality

| Property | Value |
|----------|-------|
| **Style Category** | Nature Distilled |
| **Keywords** | Muted earthy, skin tones, wood, soil, sand, terracotta, warmth, organic materials, handmade warmth |
| **Light Mode** | ✓ Full |
| **Performance** | ⚡ Excellent |
| **Accessibility** | ✓ WCAG AA |
| **Complexity** | Low |

**CSS/Technical Keywords:**
```css
background: warm earth tones;
color: #C67B5C, #D4C4A8, #6B7B3C;
border-radius: organic (varied 8–20px);
box-shadow: soft natural (0 2px 12px rgba(0,0,0,0.08));
/* texture overlays: grain at 0.1 opacity */
font-family: humanist sans-serif;
```

**Design System Variables:**
```css
--terracotta: #C67B5C;
--sand-beige: #D4C4A8;
--warm-clay: #B5651D;
--soft-cream: #F5F0E1;
--olive-green: #6B7B3C;
--grain-opacity: 0.1;
```

---

### Secondary Layer: Storytelling-Driven
> Applied to the brand origin / mission section — scroll-triggered narrative reveals

| Property | Value |
|----------|-------|
| **Style Category** | Storytelling-Driven |
| **Keywords** | Narrative flow, scroll-triggered reveals, chapter-like structure, emotional imagery |
| **Best For** | Premium/lifestyle brands, mission-driven products, founder stories |
| **Performance** | ⚠ Moderate (animations — use sparingly) |
| **Accessibility** | ✓ WCAG AA |

**CSS/Technical Keywords:**
```css
/* scroll-snap sections */
scroll-snap-type: y mandatory;
/* Intersection Observer for reveals */
/* parallax backgrounds — subtle, 0.3–0.5 speed */
/* narrative typography: varied sizes */
/* image-text alternating layout */
```

**Design System Variables:**
```css
--section-min-height: 100vh;
--reveal-duration: 600ms;
--narrative-font: serif; /* Lora */
--chapter-spacing: 6rem;
--parallax-speed: 0.3; /* conservative for wellness feel */
```

---

### Trust Layer: Trust & Authority
> Applied to ingredient sourcing, certifications, vet-approved sections

| Property | Value |
|----------|-------|
| **Style Category** | Trust & Authority |
| **Keywords** | Certificates/badges, expert credentials, case studies with metrics, security/quality badges |
| **Best For** | Premium/luxury products, healthcare, food safety |
| **Performance** | ⚡ Excellent |
| **Accessibility** | ✓ WCAG AAA |

**Design System Variables:**
```css
--badge-height: 48px;
--trust-color: #1E40AF; /* used sparingly as accent only */
--security-green: #059669;
--card-shadow: 0 4px 6px rgba(0,0,0,0.08);
--metric-highlight: #B5651D; /* warm clay, not yellow */
```

---

## 3. Color System

### Recommended Palette: Luxury/Premium Brand × Nature Distilled Hybrid

**Rationale:** The Luxury/Premium Brand palette (dark charcoal + gold) provides the premium authority signal. Nature Distilled warm earth tones soften it into wellness territory. Together they create the "premium dog wellness" feel — not cold luxury, not playful pet store.

| Role | Hex | CSS Variable | Notes |
|------|-----|--------------|-------|
| **Primary** | `#1C1917` | `--color-primary` | Warm near-black (stone-900) |
| **On Primary** | `#FFFFFF` | `--color-on-primary` | |
| **Secondary** | `#44403C` | `--color-secondary` | Warm dark brown |
| **On Secondary** | `#FFFFFF` | `--color-on-secondary` | |
| **Accent / CTA** | `#A16207` | `--color-accent` | Warm gold (WCAG 3:1 adjusted) |
| **On Accent** | `#FFFFFF` | `--color-on-accent` | |
| **Background** | `#FAFAF9` | `--color-background` | Warm off-white |
| **Foreground** | `#0C0A09` | `--color-foreground` | |
| **Card** | `#FFFFFF` | `--color-card` | |
| **Card Foreground** | `#0C0A09` | `--color-card-foreground` | |
| **Muted** | `#F5F0E1` | `--color-muted` | Soft cream (Nature Distilled) |
| **Muted Foreground** | `#64748B` | `--color-muted-foreground` | |
| **Border** | `#D6D3D1` | `--color-border` | Warm stone |
| **Destructive** | `#DC2626` | `--color-destructive` | |
| **Ring** | `#1C1917` | `--color-ring` | |
| **Terracotta** | `#C67B5C` | `--color-terracotta` | Nature accent |
| **Sand Beige** | `#D4C4A8` | `--color-sand` | Section backgrounds |
| **Warm Clay** | `#B5651D` | `--color-clay` | Hover states, highlights |
| **Olive Green** | `#6B7B3C` | `--color-olive` | Ingredient / natural badges |

### Color Usage Rules
- **Background sections alternate:** `#FAFAF9` → `#F5F0E1` → `#FAFAF9`
- **CTAs:** Warm gold `#A16207` on dark `#1C1917` backgrounds; dark `#1C1917` on light backgrounds
- **Never use:** Cool grays, clinical whites (#FFFFFF as page background), neon accents
- **Trust badges:** Olive green `#6B7B3C` for "natural/organic" signals; warm clay `#B5651D` for premium/quality signals

### Contrast Verification
| Pair | Ratio | WCAG |
|------|-------|------|
| `#0C0A09` on `#FAFAF9` | ~19:1 | ✓ AAA |
| `#FFFFFF` on `#1C1917` | ~19:1 | ✓ AAA |
| `#FFFFFF` on `#A16207` | ~4.6:1 | ✓ AA |
| `#0C0A09` on `#F5F0E1` | ~17:1 | ✓ AAA |

---

## 4. Typography

### Recommended Pairing: Lora + Raleway

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| **Display / Hero** | Lora | 600–700 | Serif warmth, premium feel |
| **Section Headings** | Lora | 500–600 | Consistent serif authority |
| **Body Text** | Raleway | 400 | Clean, modern, readable |
| **Labels / UI** | Raleway | 500–600 | Buttons, nav, badges |
| **Fine Print** | Raleway | 300 | Ingredients, legal |

**Mood:** Calm · Wellness · Health · Relaxing · Natural · Organic  
**Best For:** Health apps, wellness, spa, meditation, yoga, organic brands

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap');
```

**Google Fonts URL:**  
https://fonts.google.com/share?selection.family=Lora:wght@400;500;600;700|Raleway:wght@300;400;500;600;700

### Type Scale (Shopify CSS Custom Properties)
```css
:root {
  --font-heading: 'Lora', Georgia, serif;
  --font-body: 'Raleway', system-ui, sans-serif;

  /* Scale */
  --text-xs:   0.75rem;   /* 12px — fine print */
  --text-sm:   0.875rem;  /* 14px — labels */
  --text-base: 1rem;      /* 16px — body (iOS auto-zoom threshold) */
  --text-lg:   1.125rem;  /* 18px — lead text */
  --text-xl:   1.25rem;   /* 20px — subheadings */
  --text-2xl:  1.5rem;    /* 24px — section titles */
  --text-3xl:  1.875rem;  /* 30px — page titles */
  --text-4xl:  2.25rem;   /* 36px — hero subtitle */
  --text-5xl:  3rem;      /* 48px — hero headline */
  --text-hero: clamp(2.5rem, 6vw, 5rem); /* responsive hero */

  /* Line Heights */
  --leading-tight:  1.25;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose:  1.75;

  /* Letter Spacing */
  --tracking-tight:  -0.025em; /* headings */
  --tracking-normal:  0em;
  --tracking-wide:    0.05em;  /* labels, badges */
  --tracking-widest:  0.1em;   /* all-caps labels */
}
```

### Typography Rules
- **Hero headline:** Lora 600, `clamp(2.5rem, 6vw, 5rem)`, tracking `-0.025em`
- **Body text minimum:** 16px (prevents iOS auto-zoom)
- **Line length:** 60–72 characters per line on desktop; 35–55 on mobile
- **Line height body:** 1.625 (relaxed — wellness brands breathe)
- **Never:** Raleway Light (300) for body text — too thin for readability at small sizes

---

## 5. Motion & Animation Principles

### Core Philosophy
> **Motion should feel like a calm exhale, not a performance.**  
> Every animation must convey meaning — entrance, transition, confirmation. No decorative motion.

### Duration Tokens
```css
:root {
  --duration-instant:  100ms;  /* press feedback */
  --duration-fast:     150ms;  /* micro-interactions, hover */
  --duration-normal:   200ms;  /* standard transitions */
  --duration-moderate: 300ms;  /* card reveals, state changes */
  --duration-slow:     400ms;  /* page section reveals */
  --duration-narrative: 600ms; /* scroll-triggered story reveals */
  --duration-morph:    500ms;  /* image crossfades */
}
```

### Easing Tokens
```css
:root {
  --ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1.0);  /* entering elements */
  --ease-in:     cubic-bezier(0.4, 0.0, 1.0, 1.0);  /* exiting elements */
  --ease-inout:  cubic-bezier(0.4, 0.0, 0.2, 1.0);  /* state changes */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* subtle spring for cards */
  --ease-natural: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* wellness/organic feel */
}
```

### Motion Patterns by Component

#### Scroll Reveal (Intersection Observer)
```css
/* Initial state — set via JS class */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.reveal-stagger > * {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--duration-moderate) var(--ease-out),
    transform var(--duration-moderate) var(--ease-out);
}

.reveal-stagger.is-visible > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger.is-visible > *:nth-child(2) { transition-delay: 60ms; }
.reveal-stagger.is-visible > *:nth-child(3) { transition-delay: 120ms; }
.reveal-stagger.is-visible > *:nth-child(4) { transition-delay: 180ms; }
.reveal-stagger.is-visible > * { opacity: 1; transform: translateY(0); }
```

#### Product Card Hover
```css
.product-card {
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(28, 25, 23, 0.12);
}
```

#### Button Press Feedback
```css
.btn {
  transition:
    transform var(--duration-instant) var(--ease-in),
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.btn:active {
  transform: scale(0.97);
}
```

#### Image Crossfade (Product Gallery)
```css
.gallery-image {
  transition: opacity var(--duration-morph) var(--ease-inout);
}

.gallery-image.is-exiting { opacity: 0; }
.gallery-image.is-entering { opacity: 1; }
```

#### Hero Section Entrance
```css
/* Stagger hero elements on page load */
.hero-headline {
  animation: fadeSlideUp var(--duration-slow) var(--ease-out) 100ms both;
}
.hero-subtext {
  animation: fadeSlideUp var(--duration-slow) var(--ease-out) 200ms both;
}
.hero-cta {
  animation: fadeSlideUp var(--duration-moderate) var(--ease-out) 320ms both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Navigation Scroll Behavior
```css
html {
  scroll-behavior: smooth;
}

/* Sticky nav fade-in on scroll */
.site-header {
  transition:
    background-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    backdrop-filter var(--duration-normal) var(--ease-out);
}

.site-header.is-scrolled {
  background-color: rgba(250, 250, 249, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(28, 25, 23, 0.08);
}
```

### Reduced Motion (Required)
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .reveal,
  .reveal-stagger > * {
    opacity: 1;
    transform: none;
  }
}
```

### Vanilla JS Intersection Observer (Shopify-compatible)
```javascript
// scroll-reveal.js — drop into assets/, include in theme.liquid
(function () {
  'use strict';

  const THRESHOLD = 0.15;
  const ROOT_MARGIN = '0px 0px -60px 0px';

  function initReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
    );

    elements.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // Stagger groups
  function initStagger() {
    const groups = document.querySelectorAll('[data-reveal-stagger]');
    if (!groups.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      groups.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-stagger', 'is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
    );

    groups.forEach(el => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initStagger();
  });
})();
```

**Usage in Liquid templates:**
```liquid
<div data-reveal>
  <h2 class="section-title">{{ section.settings.heading }}</h2>
</div>

<div data-reveal-stagger>
  {% for product in collection.products limit: 4 %}
    <div class="product-card">...</div>
  {% endfor %}
</div>
```

---

## 6. UX Guidelines for Scroll & Reveal

*Source: UI/UX Pro Max ux-guidelines.csv — 11 results for "animation scroll reveal premium ecommerce motion"*

### Critical (High Severity)

| Rule | Do | Don't |
|------|----|-------|
| **Reduced Motion** | Check `prefers-reduced-motion` media query | Ignore accessibility motion settings |
| **Motion Sensitivity** | Respect `prefers-reduced-motion`; avoid parallax/scroll-jacking | Force scroll effects that cause nausea |
| **Excessive Motion** | Animate 1–2 key elements per view maximum | Animate everything that moves |
| **Smooth Scroll** | `html { scroll-behavior: smooth; }` | Jump directly to anchor without transition |
| **Horizontal Scroll** | `max-w-full overflow-x-hidden` | Content wider than viewport |
| **Loading States** | Use skeleton screens or spinners for async ops | Leave UI frozen with no feedback |
| **Hover vs Tap** | Use `click`/`tap` for primary interactions | Rely only on `hover` for important actions |

### Medium Severity

| Rule | Do | Don't |
|------|----|-------|
| **Duration Timing** | 150–300ms for micro-interactions | Animations longer than 500ms for UI |
| **Continuous Animation** | Use for loading indicators only | Use `animate-bounce` on decorative icons |
| **Transform Performance** | Use `transform` and `opacity` only | Animate `width`/`height`/`top`/`left` |
| **Easing Functions** | `ease-out` entering, `ease-in` exiting | `linear` for UI transitions |

### Scroll Reveal Timing Guide

| Element Type | Delay | Duration | Easing |
|-------------|-------|----------|--------|
| Hero headline | 100ms | 400ms | ease-out |
| Hero subtext | 200ms | 400ms | ease-out |
| Hero CTA | 320ms | 300ms | ease-out |
| Section heading | 0ms | 400ms | ease-out |
| Product cards (stagger) | 0/60/120/180ms | 300ms | ease-out |
| Trust badges | 0/80/160ms | 300ms | ease-out |
| Testimonials | 0/100ms | 400ms | ease-out |
| Footer | 0ms | 300ms | ease-out |

---

## 7. CSS Design Tokens

Complete token set for Shopify Ignite v2.5.0 (vanilla CSS custom properties):

```css
/* ============================================
   PRIME PET FOOD — Design Tokens
   /assets/design-tokens.css
   ============================================ */

:root {

  /* ── Colors ─────────────────────────────── */
  --color-primary:           #1C1917;
  --color-on-primary:        #FFFFFF;
  --color-secondary:         #44403C;
  --color-on-secondary:      #FFFFFF;
  --color-accent:            #A16207;
  --color-on-accent:         #FFFFFF;
  --color-background:        #FAFAF9;
  --color-foreground:        #0C0A09;
  --color-card:              #FFFFFF;
  --color-card-foreground:   #0C0A09;
  --color-muted:             #F5F0E1;
  --color-muted-foreground:  #64748B;
  --color-border:            #D6D3D1;
  --color-destructive:       #DC2626;
  --color-ring:              #1C1917;

  /* Nature Distilled accents */
  --color-terracotta:        #C67B5C;
  --color-sand:              #D4C4A8;
  --color-clay:              #B5651D;
  --color-cream:             #F5F0E1;
  --color-olive:             #6B7B3C;

  /* ── Typography ──────────────────────────── */
  --font-heading:  'Lora', Georgia, serif;
  --font-body:     'Raleway', system-ui, sans-serif;

  --text-xs:    0.75rem;
  --text-sm:    0.875rem;
  --text-base:  1rem;
  --text-lg:    1.125rem;
  --text-xl:    1.25rem;
  --text-2xl:   1.5rem;
  --text-3xl:   1.875rem;
  --text-4xl:   2.25rem;
  --text-5xl:   3rem;
  --text-hero:  clamp(2.5rem, 6vw, 5rem);

  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   1.75;

  --tracking-tight:   -0.025em;
  --tracking-normal:   0em;
  --tracking-wide:     0.05em;
  --tracking-widest:   0.1em;

  /* ── Spacing (8pt grid) ──────────────────── */
  --space-1:   0.25rem;   /*  4px */
  --space-2:   0.5rem;    /*  8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;      /* 128px */

  /* ── Border Radius ───────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  20px;
  --radius-full: 9999px;

  /* ── Shadows ─────────────────────────────── */
  --shadow-xs:  0 1px 2px rgba(28, 25, 23, 0.05);
  --shadow-sm:  0 2px 4px rgba(28, 25, 23, 0.06);
  --shadow-md:  0 4px 12px rgba(28, 25, 23, 0.08);
  --shadow-lg:  0 8px 24px rgba(28, 25, 23, 0.10);
  --shadow-xl:  0 12px 40px rgba(28, 25, 23, 0.12);

  /* ── Motion ──────────────────────────────── */
  --duration-instant:   100ms;
  --duration-fast:      150ms;
  --duration-normal:    200ms;
  --duration-moderate:  300ms;
  --duration-slow:      400ms;
  --duration-narrative: 600ms;
  --duration-morph:     500ms;

  --ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in:      cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-inout:   cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-natural: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* ── Layout ──────────────────────────────── */
  --container-sm:  640px;
  --container-md:  768px;
  --container-lg:  1024px;
  --container-xl:  1280px;
  --container-2xl: 1440px;

  --gutter-mobile:  1rem;    /* 16px */
  --gutter-tablet:  2rem;    /* 32px */
  --gutter-desktop: 3rem;    /* 48px */

  /* ── Grain Texture ───────────────────────── */
  --grain-opacity: 0.04; /* very subtle on light backgrounds */
}
```

---

## 8. Anti-Patterns to Avoid

### Style Anti-Patterns
| ❌ Avoid | ✅ Instead |
|---------|-----------|
| Vibrant & block-based layouts | Warm, organic, flowing sections |
| Playful colors (bright orange, neon) | Muted earth tones, warm neutrals |
| Cool gray color schemes | Warm stone/sand neutrals |
| Clinical white backgrounds | Warm off-white `#FAFAF9` |
| Liquid Glass / iridescent effects | Nature Distilled warmth |
| Skeuomorphism (heavy textures) | Subtle grain overlay (4% opacity max) |

### Motion Anti-Patterns
| ❌ Avoid | ✅ Instead |
|---------|-----------|
| Animating `width`, `height`, `top`, `left` | `transform: translateY()` + `opacity` |
| `linear` easing | `ease-out` (enter) / `ease-in` (exit) |
| Animations > 500ms for UI | 150–300ms micro, 400ms reveals |
| Scroll-jacking / parallax overuse | Single subtle parallax on hero only |
| `animate-bounce` on decorative icons | Static or single-trigger entrance |
| Infinite decorative animations | Loading spinners only |
| Ignoring `prefers-reduced-motion` | Always wrap in media query |
| Animating 5+ elements simultaneously | Max 2 key elements per view |
| Hover-only interactions | Click/tap primary, hover as enhancement |

### Typography Anti-Patterns
| ❌ Avoid | ✅ Instead |
|---------|-----------|
| Raleway 300 for body text | Raleway 400 minimum |
| Body text < 16px | 16px base (iOS auto-zoom threshold) |
| Mixing serif + serif (two Lora weights as heading + body) | Lora heading + Raleway body |
| Tight letter-spacing on body text | Default tracking; tight only on headings |
| Line height < 1.5 for body | 1.625 (relaxed) for wellness feel |
| All-caps body paragraphs | All-caps labels/badges only (tracking-widest) |

### Color Anti-Patterns
| ❌ Avoid | ✅ Instead |
|---------|-----------|
| Cool gray backgrounds (`#F9FAFB`) | Warm off-white `#FAFAF9` |
| Neon or saturated accent colors | Warm gold `#A16207` |
| Pink/lavender (beauty spa palette) | Earth tones (terracotta, sand, clay) |
| Blue as primary brand color | Reserve blue for trust badges only |
| Pure black `#000000` text | Warm near-black `#0C0A09` |
| Raw hex values in component CSS | CSS custom properties (`var(--color-*)`) |

---

## 9. Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis used as icons — use SVG (Heroicons, Lucide, or custom)
- [ ] All icons from consistent family (stroke width 1.5px, same corner radius)
- [ ] Earth tone color palette applied consistently across all sections
- [ ] Warm off-white `#FAFAF9` used as page background (not pure white)
- [ ] Lora used for all headings; Raleway for all body/UI text
- [ ] Google Fonts loaded with `display=swap` to prevent FOIT

### Motion & Animation
- [ ] `prefers-reduced-motion` media query wraps ALL animations and transitions
- [ ] Scroll reveal uses `transform: translateY()` + `opacity` only (no layout properties)
- [ ] Hero entrance stagger: headline 100ms → subtext 200ms → CTA 320ms
- [ ] Product card stagger: 0 / 60 / 120 / 180ms delays
- [ ] No animation duration exceeds 600ms (narrative reveals only)
- [ ] No more than 2 key elements animate simultaneously per viewport
- [ ] Hover effects use `ease-out` 200ms; exits use `ease-in`
- [ ] No infinite decorative animations (loading spinners only)
- [ ] `scroll-behavior: smooth` on `html` element
- [ ] Intersection Observer fires once per element (`unobserve` after trigger)

### Accessibility
- [ ] All body text ≥ 16px (prevents iOS auto-zoom)
- [ ] Text contrast ≥ 4.5:1 on all backgrounds (verified with tool)
- [ ] `#FFFFFF` on `#A16207` gold verified ≥ 4.5:1 ✓
- [ ] All interactive elements have visible focus rings (2px, `--color-ring`)
- [ ] `cursor: pointer` on all clickable elements
- [ ] All product images have descriptive `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] Color is never the only indicator of meaning

### Layout & Responsive
- [ ] Tested at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1440px (desktop)
- [ ] No horizontal scroll on any breakpoint
- [ ] `max-width: var(--container-xl)` with `margin: 0 auto` on all sections
- [ ] Mobile gutters: 16px; tablet: 32px; desktop: 48px
- [ ] Touch targets ≥ 44×44px on all interactive elements
- [ ] Section spacing uses 8pt grid (`--space-*` tokens)
- [ ] `min-height: 100dvh` (not `100vh`) for full-screen sections on mobile

### Performance (Shopify Ignite)
- [ ] Product images use WebP format with `srcset` for responsive sizes
- [ ] `width` and `height` attributes set on all `<img>` tags (prevents CLS)
- [ ] Below-fold images use `loading="lazy"`
- [ ] Google Fonts loaded via `<link rel="preconnect">` + `<link rel="preload">`
- [ ] `scroll-reveal.js` deferred (`defer` attribute) — non-blocking
- [ ] Grain texture overlay uses CSS `::after` pseudo-element (no extra DOM nodes)
- [ ] No `backdrop-filter` on frequently-scrolled elements (performance cost)

### Shopify-Specific
- [ ] Design tokens in `/assets/design-tokens.css` included in `theme.liquid`
- [ ] `scroll-reveal.js` in `/assets/` with `defer` in `theme.liquid`
- [ ] Section schema settings use token-aligned values (no raw hex in settings)
- [ ] Metafields for product trust badges (vet-approved, ingredient source) configured
- [ ] Mobile nav uses bottom-safe-area padding for gesture bar clearance

---

*Generated by UI/UX Pro Max Design Intelligence — Prime Pet Food Design System v1.0*
*Stack: Shopify Ignite v2.5.0 · Style: Nature Distilled × Storytelling-Driven × Trust & Authority*
*Fonts: Lora (headings) + Raleway (body) · Colors: Luxury/Premium × Earth Tones hybrid*