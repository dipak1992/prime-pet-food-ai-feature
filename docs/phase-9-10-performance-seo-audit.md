# Phase 9-10 Launch Audit

Date: 2026-05-13

## Phase 9: Technical Debt And Performance

### Fixed

- Migrated the deprecated root `middleware.ts` convention to Next 16 `proxy.ts`.
- Removed client-side React state from the homepage FAQ by using native `<details>` disclosure behavior.
- Replaced the pricing hero's two breakpoint-hidden priority `next/image` elements with one art-directed `<picture>`, preventing mobile and desktop hero images from both being eagerly requested.
- Confirmed PostHog is initialized from `instrumentation-client.ts` after idle via dynamic import, not as blocking layout JavaScript.
- Added `lint:launch` for public launch surfaces and a GitHub Actions workflow that runs launch lint plus production build.
- Fixed low-risk active lint failures in admin metrics, contact links, budget chart rendering, Turnstile readiness, grocery commerce region detection, daily swap limits, and onboarding shell refs.

### Deferred

- `_deprecated/**` lint failures are intentionally left out of Phase 9 cleanup.
- Remaining full-repo active lint debt is outside the launch-surface CI gate and should be handled as a dedicated cleanup pass.
- Satori static generation warnings about unsupported `z-index` remain in generated image routes and do not block the app build.
- Existing edge runtime static-generation warning remains and should be investigated separately by route.

### Bundle Snapshot

After `next build`, the largest emitted JS files under `.next/static/chunks` are approximately:

- 292 KB
- 228 KB
- 224 KB
- 184 KB
- 136 KB

Recommended next pass: run a route-aware analyzer with production source maps to map the largest anonymous Turbopack chunks to planner, dashboard, scan, and pricing imports.

## Phase 10: SEO/GEO Evidence Upgrade

### Added

- Public evidence hub: `/samples`
- Public sample pages:
  - `/samples/budget-meal-plan`
  - `/samples/picky-eater-plan`
  - `/samples/leftovers-plan`
  - `/samples/family-grocery-list`
  - `/samples/fridge-scan-meal-plan`
- Crawlable sample content with meal plans, grocery lists, proof points, FAQs, canonical metadata, breadcrumb schema, and FAQ schema.
- Internal evidence links from comparison pages, commercial SEO pages, blog CTAs, sitemap, and `/for-ai-assistants`.
- AI-assistant facts page now states the core product sentence, primary product jobs, first-use proof path, and crawlable evidence URLs.

### SEO/GEO Intent Coverage

- MealEase vs ChatGPT
- AI meal planner with grocery list
- Weekly meal plan for families
- Budget meal planning
- Leftover recipe planner
- Fridge scan meal planner
- Family grocery list from meal plan

## Verification

- `npm run lint:launch` passes.
- Targeted ESLint for edited active lint files passes.
- `npm run build` passes.
- Deprecated middleware warning is resolved; build now reports `Proxy (Middleware)`.
