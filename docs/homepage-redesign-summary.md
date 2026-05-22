# Prime Pet Food — Homepage Redesign Summary

**Project:** Full homepage redesign for Prime Pet Food Shopify store  
**Status:** ✅ Complete and deployment-ready  
**Date:** May 2026  

---

## Overview

A complete ground-up redesign of the Prime Pet Food homepage, replacing the legacy `prime-homepage-experience` section with 11 purpose-built, self-contained Shopify sections. The redesign follows a premium DTC brand aesthetic inspired by Patagonia, Ritual, and Apple product pages — emphasizing whitespace, editorial typography, cinematic imagery, and emotional storytelling.

---

## Sections Built (in page order)

| # | Section File | Schema Name | CSS Prefix | Purpose |
|---|---|---|---|---|
| 1 | `sections/prime-announcement-bar.liquid` | Prime Announcement Bar | `.prime-announcement-bar` | Rotating marketing messages at top of page |
| 2 | `sections/prime-header.liquid` | Prime Header | `.prime-header` | Fixed smart-sticky nav with mobile drawer |
| 3 | `sections/prime-hero.liquid` | Prime Hero | `.prime-hero` | Cinematic full-viewport hero with parallax |
| 4 | `sections/prime-rawhide-comparison.liquid` | Prime Rawhide Comparison | `.prime-compare` | Animated comparison cards: Prime vs Rawhide |
| 5 | `sections/prime-value-duration.liquid` | Prime Value Duration | `.prime-value` | "$0.22/hour" value prop with animated timeline |
| 6 | `sections/prime-ingredients.liquid` | Prime Ingredients | `.prime-ingredients` | Editorial 4-ingredient storytelling cards |
| 7 | `sections/prime-himalayan-story.liquid` | Prime Himalayan Story | `.prime-story` | Documentary-style origin story with parallax hero |
| 8 | `sections/prime-puff-instructions.liquid` | Prime Puff Instructions | `.prime-puff` | Zero-waste microwave puff tutorial (3 steps) |
| 9 | `sections/prime-reviews-ugc.liquid` | Prime Reviews UGC | `.prime-reviews` | Photo-first UGC review grid with count-up animation |
| 10 | `sections/prime-subscribe-save.liquid` | Prime Subscribe Save | `.prime-subscribe` | Subscription section with frequency selector |
| 11 | `sections/prime-footer-redesign.liquid` | Prime Footer Redesign | `.prime-footer` | Full footer: brand statement, nav, email signup, legal |

---

## Homepage Template

**File:** [`templates/index.json`](../templates/index.json)

All 11 sections are registered with the correct `type` values (matching section filenames without `.liquid`) and in the correct display order:

```json
{
  "sections": {
    "announcement_bar": { "type": "prime-announcement-bar" },
    "header":           { "type": "prime-header" },
    "hero":             { "type": "prime-hero" },
    "rawhide_comparison": { "type": "prime-rawhide-comparison" },
    "value_duration":   { "type": "prime-value-duration" },
    "ingredients":      { "type": "prime-ingredients" },
    "himalayan_story":  { "type": "prime-himalayan-story" },
    "puff_instructions": { "type": "prime-puff-instructions" },
    "reviews_ugc":      { "type": "prime-reviews-ugc" },
    "subscribe_save":   { "type": "prime-subscribe-save" },
    "footer_redesign":  { "type": "prime-footer-redesign" }
  }
}
```

---

## Design System

**File:** [`assets/prime-design-system.css`](../assets/prime-design-system.css)  
**Loaded in:** [`layout/theme.liquid`](../layout/theme.liquid) (line 607)

```liquid
{{ 'prime-design-system.css' | asset_url | stylesheet_tag }}
```

### Color Tokens

| Token | Value | Use |
|---|---|---|
| `--prime-cream` | `#FAF7F2` | Primary background |
| `--prime-cream-dark` | `#F5F0E8` | Secondary background |
| `--prime-charcoal` | `#2C2C2C` | Primary text |
| `--prime-charcoal-light` | `#5A5A5A` | Secondary text |
| `--prime-sage` | `#7A8B6F` | Nature/calm accent |
| `--prime-sage-light` | `#E8EDE4` | Sage background tint |
| `--prime-terracotta` | `#C4724F` | CTA / action color |
| `--prime-terracotta-hover` | `#A85D3F` | CTA hover state |
| `--prime-gold` | `#B8963E` | Premium / quality accent |
| `--prime-white` | `#FFFFFF` | Pure white |
| `--prime-black` | `#1A1A1A` | Near-black |

### Typography Tokens

| Token | Value |
|---|---|
| `--prime-font-heading` | `Georgia, "Times New Roman", serif` |
| `--prime-font-body` | System UI sans-serif stack |
| `--prime-font-display` | `clamp(2.5rem, 5vw, 4.5rem)` |
| `--prime-font-h1` | `clamp(2rem, 4vw, 3.5rem)` |
| `--prime-font-h2` | `clamp(1.75rem, 3vw, 2.75rem)` |
| `--prime-font-h3` | `clamp(1.25rem, 2vw, 1.75rem)` |

### Spacing Tokens

`--prime-space-xs` through `--prime-space-3xl` — 8px base scale

### Animation Tokens

| Token | Value |
|---|---|
| `--prime-duration-fast` | `150ms` |
| `--prime-duration-normal` | `300ms` |
| `--prime-duration-slow` | `600ms` |
| `--prime-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## How to Customize Each Section in Shopify Admin

Navigate to **Online Store → Themes → Customize** and select the homepage.

### 1. Prime Announcement Bar
- Add/remove/reorder **Message** blocks (up to any number)
- Toggle **auto-rotate** and set **rotation speed** (2–8 seconds)
- Customize **background color** and **text color**
- Toggle **show close button**

### 2. Prime Header
- Upload a **logo image** or use text logo ("PRIME")
- Add **Navigation Link** blocks with label, URL, and optional highlight color
- Toggle **smart sticky header** (hides on scroll down, reappears on scroll up)
- Toggle **transparent over hero** (header starts transparent, gains background on scroll)

### 3. Prime Hero
- Upload **hero image** (2500×1400px recommended) and optional **mobile hero image**
- Edit **headline**, **subheadline**, **CTA text** and **CTA URL**
- Add **Trust Badge** blocks (checkmark, leaf, shield, globe icons)
- Adjust **overlay opacity** (0–100%)
- Toggle **scroll indicator**

### 4. Prime Rawhide Comparison
- Edit **heading** and **subheading**
- Add/edit **Comparison Card** blocks — each has a category, icon, rawhide score (1–10), prime score (1–10), and description text
- Choose **background style**: Cream, White, or Dark
- Edit **CTA text** and **URL**

### 5. Prime Value Duration
- Edit **eyebrow**, **heading**, **subheading**, and **pull quote**
- Set **price per hour** display value (e.g. `$0.22`)
- Add **Comparison Stat** blocks — each shows a product name, price/hour, duration, and ingredients count. Mark one as "Prime Pick" to highlight it
- Edit **CTA text**, **URL**, and **starting price note**

### 6. Prime Ingredients
- Edit **eyebrow**, **heading**, **subheading**, and **bottom statement**
- Add **Ingredient** blocks — each has a number (01–04), name, role (small caps label), story text, and optional image
- If no image is uploaded, falls back to `prime-home-ingredient-[yak-milk|cow-milk|lime|salt].jpg`
- Edit **CTA text** and **URL**

### 7. Prime Himalayan Story
- Upload **hero image** (wide landscape, 2400×1029px) — falls back to `prime-himalayan-yak-story-hero.jpg`
- Upload **founder photo** — falls back to `prime-founder.png`
- Edit **eyebrow**, **heading**, 3 **story paragraphs**, **founder quote**, **founder name**
- Add **Process Step** blocks (title + description) — automatically uses `prime-yak-process-*.jpg` images
- Edit **closing statement**, **CTA text**, and **URL**

### 8. Prime Puff Instructions
- Edit **eyebrow**, **heading**, **subheading**
- Add **Step** blocks — each has a number, icon (water/microwave/star/clock/check), title, instruction, and time badge
- Toggle **show infographic image** (uses `prime-puff-instructions-infographic.jpg` by default)
- Edit **safety note**, **value statement**, **CTA text** and **URL**

### 9. Prime Reviews UGC
- Edit **eyebrow**, **heading**, **aggregate rating**, **review count**, **social proof text**
- Add **Review Card** blocks — each has a dog photo (falls back to UGC assets), dog name, breed, star rating (1–5), quote, customer name, and location
- Mark one card as **Featured** to span 2 columns with a horizontal layout
- Set **reviews link** (to all reviews page) and **CTA URL**

### 10. Prime Subscribe & Save
- Edit **eyebrow**, **heading**, **subheading**
- Upload **hero image** — falls back to `prime-subscribe-save-hero.jpg`
- Set **save percentage**, **one-time price**, **subscription price**, **subscriber count**
- Add **Benefit** blocks — each has an icon (truck/discount/pause/bell/heart/check), title, and description
- Edit **bottom statement**, **CTA text/URL**, and **secondary link text/URL**

### 11. Prime Footer Redesign
- Edit **brand statement**, **brand subtext**, **brand description**
- Set **Instagram**, **Facebook**, and **TikTok** URLs
- Edit **email signup heading** and **privacy note**
- Add **Navigation Link** blocks — assign each to Shop, Learn, or Support column

---

## Assets Used

All assets are in the [`assets/`](../assets/) directory.

### Hero & Lifestyle
| File | Used In |
|---|---|
| `prime-homepage-hero-lifestyle-golden-v2.jpg` | Hero section (fallback) |
| `prime-himalayan-yak-story-hero.jpg` | Himalayan Story section (fallback) |
| `prime-founder.png` | Himalayan Story section (founder photo fallback) |
| `prime-subscribe-save-hero.jpg` | Subscribe & Save section (fallback) |
| `prime-puff-instructions-infographic.jpg` | Puff Instructions section (infographic fallback) |

### Ingredient Photos
| File | Used In |
|---|---|
| `prime-home-ingredient-yak-milk.jpg` | Ingredients section (card 1 fallback) |
| `prime-home-ingredient-cow-milk.jpg` | Ingredients section (card 2 fallback) |
| `prime-home-ingredient-lime.jpg` | Ingredients section (card 3 fallback) |
| `prime-home-ingredient-salt.jpg` | Ingredients section (card 4 fallback) |

### Process Photos
| File | Used In |
|---|---|
| `prime-yak-process-boiling-curd.jpg` | Himalayan Story — Step 1 |
| `prime-yak-process-drying-racks.jpg` | Himalayan Story — Step 2 |
| `prime-yak-process-finished-chews.jpg` | Himalayan Story — Step 3 |

### UGC / Review Photos
| File | Used In |
|---|---|
| `prime-ugc-golden-retriever-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-german-shepherd-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-labrador-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-beagle-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-french-bulldog-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-poodle-chew-card.jpg` | Reviews UGC (fallback pool) |
| `prime-ugc-dog-chew-card.jpg` | Reviews UGC (fallback pool) |

### Design System
| File | Loaded In |
|---|---|
| `prime-design-system.css` | `layout/theme.liquid` (global, all pages) |

---

## Technical Architecture

### Self-Contained Sections
Each section is fully self-contained with its own:
- **CSS** (scoped with unique class prefix, no global pollution)
- **JavaScript** (IIFE-wrapped, no global variables)
- **Liquid** template logic
- **Schema** with settings and blocks

### CSS Class Prefix Isolation
No two sections share a CSS prefix:

| Section | Prefix |
|---|---|
| Announcement Bar | `.prime-announcement-bar` |
| Header | `.prime-header` |
| Hero | `.prime-hero` |
| Rawhide Comparison | `.prime-compare` |
| Value Duration | `.prime-value` |
| Ingredients | `.prime-ingredients` |
| Himalayan Story | `.prime-story` |
| Puff Instructions | `.prime-puff` |
| Reviews UGC | `.prime-reviews` |
| Subscribe & Save | `.prime-subscribe` |
| Footer Redesign | `.prime-footer` |

### Accessibility
All sections include:
- Semantic HTML (`<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`, `<blockquote>`, `<aside>`)
- ARIA labels and roles where needed
- `aria-hidden="true"` on decorative elements
- Focus-visible styles for keyboard navigation
- `prefers-reduced-motion` media query support in all animated sections

### Performance
- Images use `loading="lazy"` (except hero which uses `loading="eager"` + `fetchpriority="high"`)
- Responsive `srcset` and `sizes` on hero images
- JavaScript uses `IntersectionObserver` for scroll animations (no scroll event polling)
- `requestAnimationFrame` used for parallax effects
- `{ passive: true }` on all scroll event listeners

---

## Known Limitations & Next Steps

### Subscription Integration
The Subscribe & Save section (section 10) currently links to a URL. For full functionality, it should be connected to a subscription app (e.g. Recharge, Bold Subscriptions, or Shopify's native subscriptions). The frequency selector UI is built but not wired to a real subscription form.

### Review Platform Integration
The Reviews UGC section uses manually-entered blocks. For live review data, integrate with Okendo, Yotpo, Judge.me, or Shopify's native reviews. The section can be replaced or supplemented with the app's widget.

### Header Search
The header search button currently redirects to `/search`. For a better UX, wire it to Shopify's predictive search API or a search drawer.

### Analytics Events
No custom analytics events are fired. Consider adding `dataLayer.push()` or `analytics.track()` calls on CTA clicks for conversion tracking.

### A/B Testing
The hero headline and CTA copy are good candidates for A/B testing. The section's schema makes it easy to swap copy without code changes.

### Image Optimization
All fallback images are served from Shopify's CDN via `asset_url`. For best performance, ensure all uploaded images are compressed before upload (target: <500KB for hero, <200KB for cards).

---

## Deployment Checklist

- [x] All 11 section files exist in `sections/`
- [x] `templates/index.json` references all 11 sections with correct type names
- [x] `layout/theme.liquid` loads `prime-design-system.css`
- [x] All fallback asset files exist in `assets/`
- [x] All section schemas are valid JSON (no trailing commas, proper structure)
- [x] No CSS class prefix conflicts between sections
- [x] All sections have `prefers-reduced-motion` support
- [x] All interactive elements have keyboard accessibility
- [ ] Upload product images to Shopify admin for hero, ingredients, and subscribe sections
- [ ] Set social media URLs in Footer section settings
- [ ] Set CTA URLs in all sections pointing to correct collection/product pages
- [ ] Connect Subscribe & Save CTA to actual subscription flow
- [ ] Test on mobile (375px), tablet (768px), and desktop (1440px)
- [ ] Test with Shopify Theme Editor to verify all settings work
- [ ] Run Lighthouse audit (target: Performance >90, Accessibility >95)
