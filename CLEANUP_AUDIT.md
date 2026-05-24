# MealEase AI — Cleanup Audit Report

> Generated: 2026-04-25
> New architecture: **5 Pillars** — Tonight Suggestions, Snap & Cook, Weekly Autopilot, Leftovers AI, Budget Intelligence

---

## ✅ KEEP (do not touch)

These files directly support the 5 pillars or are essential infrastructure.

### Core Infrastructure
| File | Reason |
|------|--------|
| `app/layout.tsx` | Root layout |
| `app/globals.css` | Global styles |
| `app/favicon.ico` | Favicon |
| `app/apple-icon.tsx` | Apple icon generator |
| `app/icon.tsx` | Icon generator |
| `app/manifest.ts` | PWA manifest |
| `app/global-error.tsx` | Error boundary |
| `app/(app)/layout.tsx` | App shell layout |
| `app/(auth)/layout.tsx` | Auth layout |
| `middleware.ts` | CSP + Supabase session |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `postcss.config.mjs` | PostCSS config |
| `eslint.config.mjs` | ESLint config |
| `components.json` | shadcn/ui config |
| `config/site.ts` | Site metadata (will need text updates for 5-pillar positioning) |
| `instrumentation.ts` | Sentry instrumentation |
| `instrumentation-client.ts` | Sentry client instrumentation |
| `sentry.client.config.ts` | Sentry client config |
| `sentry.server.config.ts` | Sentry server config |
| `sentry.edge.config.ts` | Sentry edge config |
| `vercel.json` | Vercel config |
| `.gitignore` | Git ignore |
| `.env.example` | Env template |

### Auth Routes
| File | Reason |
|------|--------|
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/signup/page.tsx` | Signup page |
| `app/(auth)/forgot-password/page.tsx` | Forgot password |
| `app/(auth)/reset-password/page.tsx` | Reset password |
| `app/auth/callback/route.ts` | Auth callback |

### Pillar 1: Tonight Suggestions
| File | Reason |
|------|--------|
| `app/(app)/dashboard/tonight/page.tsx` | Tonight page |
| `app/(app)/decide/page.tsx` | Decide/tonight redirect |
| `app/api/tonight/route.ts` | Tonight API |
| `app/api/decide/route.ts` | Decide API |
| `app/api/decide/swap/route.ts` | Swap meal API |
| `app/api/smart-meal/route.ts` | Smart meal generation |
| `app/api/regenerate-meal/route.ts` | Regenerate meal |
| `app/api/signal/route.ts` | Signal/feedback API |
| `app/tonight/page.tsx` | Public tonight page |
| `app/tonight/recipe/page.tsx` | Tonight recipe detail |
| `components/tonight/OneShotSuggestion.tsx` | Tonight suggestion component |
| `components/hub/TonightRecommendation.tsx` | Tonight card on hub |
| `lib/tonight-meals.ts` | Tonight meal data |
| `lib/decide/client.ts` | Decide client logic |
| `lib/engine/engine.ts` | Smart meal engine |
| `lib/engine/meals.ts` | Meal database |
| `lib/engine/meals-extended.ts` | Extended meals |
| `lib/engine/meals-nepali.ts` | Nepali meals |
| `lib/engine/types.ts` | Engine types |
| `lib/engine/decide.ts` | Decide engine |
| `lib/engine/badges.ts` | Meal badges |

### Pillar 2: Snap & Cook
| File | Reason |
|------|--------|
| `app/(app)/dashboard/cook/page.tsx` | Cook/scan page |
| `app/(app)/pantry/page.tsx` | Pantry page |
| `app/api/pantry/route.ts` | Pantry CRUD |
| `app/api/pantry/scan/route.ts` | Pantry scan |
| `app/api/pantry/match/route.ts` | Pantry match |
| `app/api/pantry/match-v2/route.ts` | Pantry match v2 |
| `app/api/pantry/vision/route.ts` | Vision scan |
| `app/api/pantry/vision-v2/route.ts` | Vision scan v2 |
| `app/api/analyze-image/route.ts` | Image analysis |
| `components/hub/PantryCapture.tsx` | Pantry photo capture |
| `components/hub/PantryMatchList.tsx` | Pantry match results |
| `components/hub/SnapCookErrorBoundary.tsx` | Error boundary |
| `lib/pantry/constraint-engine.ts` | Pantry constraint engine |
| `lib/pantry/types.ts` | Pantry types |

### Pillar 3: Weekly Autopilot
| File | Reason |
|------|--------|
| `app/(app)/planner/page.tsx` | Planner page |
| `app/(app)/grocery-list/page.tsx` | Grocery list page |
| `app/api/generate-plan/route.ts` | Generate weekly plan |
| `app/api/weekly-plan/route.ts` | Weekly plan API |
| `app/api/plan/adjust/route.ts` | Adjust plan |
| `app/api/plan/publish/route.ts` | Publish plan |
| `components/planner/WeeklyGrid.tsx` | Weekly grid |
| `components/planner/WeeklyPlannerGrid.tsx` | Planner grid |
| `components/planner/WeeklyPlannerV2.tsx` | Planner v2 |
| `components/grocery/GroceryListPanel.tsx` | Grocery list |
| `lib/planner/adapt.ts` | Plan adaptation |
| `lib/planner/grocery.ts` | Grocery generation |
| `lib/planner/store.ts` | Planner store |
| `lib/planner/types.ts` | Planner types |

### Pillar 4: Leftovers AI *(NEW — tables exist in schema, no UI yet)*
| File | Reason |
|------|--------|
| `db/schema.sql` (leftovers + leftover_suggestions tables) | Database schema ready |

### Pillar 5: Budget Intelligence *(NEW — tables exist in schema, no UI yet)*
| File | Reason |
|------|--------|
| `db/schema.sql` (budget_settings, weekly_spend, ingredient_prices tables) | Database schema ready |

### Shared Infrastructure (used across pillars)
| File | Reason |
|------|--------|
| `lib/supabase/client.ts` | Supabase browser client |
| `lib/supabase/server.ts` | Supabase server client |
| `lib/supabase/service.ts` | Supabase service role client |
| `lib/supabase/middleware.ts` | Supabase session middleware |
| `lib/ai/service.ts` | AI text generation (OpenAI + Anthropic) |
| `lib/ai/meal-generator.ts` | AI meal generation |
| `lib/ai/schemas.ts` | AI response schemas |
| `lib/stripe.ts` | Stripe client |
| `lib/analytics.ts` | Analytics wrapper |
| `lib/api-response.ts` | API response helpers |
| `lib/rate-limit.ts` | Rate limiting (Upstash) |
| `lib/logger.ts` | Logger |
| `lib/utils.ts` | Utility functions |
| `lib/env.ts` | Environment variable access |
| `lib/seo.ts` | SEO helpers |
| `lib/demo-data.ts` | Demo data |
| `lib/reward-toast.ts` | Reward toast |
| `lib/posthog-server.ts` | PostHog server |
| `lib/store/index.ts` | Zustand store |
| `lib/store/goals.ts` | Goals store |
| `lib/learning/engine.ts` | Adaptive learning engine |
| `lib/learning/learn.ts` | Learning logic |
| `lib/learning/store.ts` | Learning store |
| `lib/learning/types.ts` | Learning types |
| `lib/sync/middleware.ts` | Sync middleware for learning |
| `lib/meal-engine/preferences.ts` | Meal preferences |
| `lib/meal-engine/preferences-types.ts` | Preference types |
| `lib/hooks/use-dashboard-message.ts` | Dashboard message hook |
| `lib/hooks/use-household-config.ts` | Household config hook |
| `lib/dashboard-messages.ts` | Dashboard messages |
| `lib/family/service.ts` | Family service |
| `lib/family/types.ts` | Family types |
| `types/index.ts` | Core TypeScript types |
| `components/providers.tsx` | React providers |
| `components/providers/PostHogProvider.tsx` | PostHog provider |
| `components/ui/*` (all files) | shadcn/ui components — keep all |

### API Routes (shared/infrastructure)
| File | Reason |
|------|--------|
| `app/api/onboarding/route.ts` | Onboarding API |
| `app/api/onboarding/status/route.ts` | Onboarding status |
| `app/api/dietary-preferences/route.ts` | Dietary preferences |
| `app/api/personal-preferences/route.ts` | Personal preferences |
| `app/api/settings/route.ts` | User settings |
| `app/api/contact/route.ts` | Contact form |
| `app/api/stripe/checkout/route.ts` | Stripe checkout |
| `app/api/stripe/portal/route.ts` | Stripe portal |
| `app/api/stripe/webhook/route.ts` | Stripe webhook |
| `app/api/webhook/stripe/route.ts` | Stripe webhook (duplicate?) |
| `app/api/checkout/session/route.ts` | Checkout session |
| `app/api/email/reminders/route.ts` | Email reminders |
| `app/api/email/webhook/route.ts` | Email webhook |
| `app/api/unsubscribe/route.ts` | Email unsubscribe |
| `app/api/push/subscribe/route.ts` | Push subscribe |
| `app/api/push/test/route.ts` | Push test |
| `app/api/habit/feedback/route.ts` | Habit feedback |
| `app/api/habit/streak/route.ts` | Habit streak |
| `app/api/habit/notifications/route.ts` | Habit notifications |
| `app/api/family/household/route.ts` | Household API |
| `app/api/family/members/route.ts` | Family members API |
| `app/api/family/members/[id]/route.ts` | Family member by ID |
| `app/api/content/meals/route.ts` | Public meals API |
| `app/api/content/meals/[id]/route.ts` | Meal by ID |
| `app/api/content/plans/route.ts` | Public plans API |
| `app/api/guest-meal/route.ts` | Guest meal (no auth) |

### Pages (shared/infrastructure)
| File | Reason |
|------|--------|
| `app/(app)/settings/page.tsx` | Settings page |
| `app/(app)/saved/page.tsx` | Saved meals |
| `app/(app)/meal/[id]/page.tsx` | Meal detail |
| `app/onboarding/page.tsx` | Onboarding flow |
| `app/offline/page.tsx` | Offline fallback |
| `app/privacy/page.tsx` | Privacy policy |
| `app/terms/page.tsx` | Terms of service |
| `app/meals/page.tsx` | Public meals listing |
| `app/meals/[slug]/page.tsx` | Public meal detail |
| `app/share/meal/[slug]/page.tsx` | Shared meal page |
| `app/share/plan/[slug]/page.tsx` | Shared plan page |

### Components (shared)
| File | Reason |
|------|--------|
| `components/layout/AppLayout.tsx` | App layout wrapper |
| `components/layout/MobileTabBar.tsx` | Mobile tab bar |
| `components/layout/Navbar.tsx` | Navbar |
| `components/layout/LegalDocument.tsx` | Legal page layout |
| `components/content/SaveMealButton.tsx` | Save meal button |
| `components/content/ShareButton.tsx` | Share button |
| `components/content/ShareMealButton.tsx` | Share meal button |
| `components/content/EditMealModal.tsx` | Edit meal modal |
| `components/settings/DietaryPreferencesTab.tsx` | Dietary preferences |
| `components/onboarding/OnboardingPromptPopup.tsx` | Onboarding popup |
| `components/hub/AdjustChipRail.tsx` | Adjust chips |
| `components/hub/MealCard.tsx` | Meal card |
| `components/hub/ProgressCard.tsx` | Progress card |
| `components/hub/ShareFooter.tsx` | Share footer |
| `components/hub/SmartToolsRow.tsx` | Smart tools row |
| `components/hub/SupportLine.tsx` | Support line |
| `components/meals/MealCard.tsx` | Public meal card |
| `components/habit/InsightCards.tsx` | Insight cards |
| `components/habit/MicroFeedback.tsx` | Micro feedback |
| `components/habit/StreakBadge.tsx` | Streak badge |
| `components/habit/TodayCard.tsx` | Today card |
| `components/habit/NotificationSettings.tsx` | Notification settings |
| `components/pwa/PWAInstallPrompt.tsx` | PWA install prompt |
| `components/pwa/PWAServiceWorkerRegister.tsx` | SW register |
| `components/pwa/PushSubscriptionManager.tsx` | Push subscription |

### Email System
| File | Reason |
|------|--------|
| `lib/email/client.ts` | Email client |
| `lib/email/send.ts` | Email send |
| `lib/email/scheduler.ts` | Email scheduler |
| `lib/email/triggers.ts` | Email triggers |
| `lib/email/unsubscribe.ts` | Unsubscribe logic |
| `lib/email/templates/shared.ts` | Shared template utils |
| `lib/email/templates/welcome.tsx` | Welcome email |
| `lib/email/templates/magic-link.tsx` | Magic link email |
| `lib/email/templates/dinner-reminder.tsx` | Dinner reminder |
| `lib/email/templates/weekly-reminder.tsx` | Weekly reminder |
| `lib/email/templates/trial-started.tsx` | Trial started |
| `lib/email/templates/trial-ending-soon.tsx` | Trial ending |
| `lib/email/templates/pro-confirmation.tsx` | Pro confirmation |
| `lib/email/templates/payment-receipt.tsx` | Payment receipt |
| `lib/email/templates/churn-winback.tsx` | Churn winback |
| `lib/email/templates/reactivation.tsx` | Reactivation |
| `lib/email/templates/referral-reward.tsx` | Referral reward |
| `lib/email/templates/support-confirmation.tsx` | Support confirmation |
| `lib/email/templates/admin.tsx` | Admin email |

### Push / PWA
| File | Reason |
|------|--------|
| `lib/push/client.ts` | Push client |
| `lib/push/subscribe.ts` | Push subscribe |
| `lib/push/vapid.ts` | VAPID keys |
| `public/sw.js` | Service worker |

### Paywall / Stripe
| File | Reason |
|------|--------|
| `lib/paywall/config.ts` | Paywall config (needs update for 5 pillars) |
| `lib/paywall/server.ts` | Server-side paywall check |
| `lib/paywall/stripe-mapping.ts` | Stripe price mapping |
| `lib/paywall/use-paywall-status.ts` | Client paywall hook |
| `app/api/paywall/start-trial/route.ts` | Start trial API |
| `app/api/paywall/status/route.ts` | Paywall status API |

### Public Assets (keep)
| File | Reason |
|------|--------|
| `public/icons/*` | App icons |
| `public/MealeaseAi.heif` | Logo asset |
| `public/founders/dipak-suprabha.jpg` | Founder photo |
| `public/images/founders-family.jpg` | Founder family photo |
| `public/googleb9f78ddb06848f05.html` | Google verification |

---

## 🔄 REBUILD (related but needs full rebuild)

These files exist but will be completely replaced with new 5-pillar versions.

### Landing Page
| File | Action |
|------|--------|
| `app/page.tsx` | Rebuild — new 5-pillar landing page |
| `components/landing/LandingHero.tsx` | Rebuild |
| `components/landing/LandingOutcomes.tsx` | Rebuild |
| `components/landing/LandingProductProof.tsx` | Rebuild |
| `components/landing/LandingEatingOut.tsx` | Rebuild |
| `components/landing/LandingEmotionalStory.tsx` | Rebuild |
| `components/landing/LandingHouseholdTiers.tsx` | Rebuild |
| `components/landing/LandingTestimonials.tsx` | Rebuild |
| `components/landing/LandingFinalCTA.tsx` | Rebuild |
| `components/landing/LandingFeatures.tsx` | Rebuild |
| `components/landing/LandingHowItWorks.tsx` | Rebuild |
| `components/landing/LandingPain.tsx` | Rebuild |
| `components/landing/LandingSmartAI.tsx` | Rebuild |
| `components/landing/LandingBeforeAfter.tsx` | Rebuild |
| `components/landing/FamilyIntelligence.tsx` | Rebuild |
| `components/landing/PricingPreview.tsx` | Rebuild |
| `components/landing/ProductDemoModal.tsx` | Rebuild |
| `components/landing/StickyMobileCta.tsx` | Rebuild |
| `components/layout/PublicSiteHeader.tsx` | Rebuild — new nav for 5 pillars |
| `components/layout/PublicSiteFooter.tsx` | Rebuild |
| `lib/landing/` | Rebuild (currently empty dir) |

### Dashboard
| File | Action |
|------|--------|
| `app/(app)/dashboard/page.tsx` | Rebuild — new 5-pillar hub |
| `components/dashboard/DashboardClient.tsx` | Rebuild |
| `components/dashboard/MealResultCard.tsx` | Rebuild |
| `components/dashboard/MealSwipeStack.tsx` | Rebuild |
| `components/dashboard/MilestoneBanner.tsx` | Rebuild |
| `components/dashboard/QuickSuggestion.tsx` | Rebuild |
| `components/dashboard/SmartChips.tsx` | Rebuild |
| `components/dashboard/SmartInput.tsx` | Rebuild |
| `components/hub/DashboardHub.tsx` | Rebuild — new hub |
| `components/hub/HomeHub.tsx` | Rebuild |
| `components/hub/HeroSection.tsx` | Rebuild |

### Pricing Page
| File | Action |
|------|--------|
| `app/pricing/page.tsx` | Rebuild — new 5-pillar pricing |
| `components/pricing/PricingContent.tsx` | Rebuild |
| `lib/analytics/pricing-events.ts` | Rebuild |

### About Page
| File | Action |
|------|--------|
| `app/about/page.tsx` | Rebuild |
| `components/about/AboutCTA.tsx` | Rebuild |
| `components/about/AboutHero.tsx` | Rebuild |
| `components/about/AboutPageContent.tsx` | Rebuild |
| `components/about/AboutSnippet.tsx` | Rebuild |
| `components/about/FounderStory.tsx` | Rebuild |
| `components/about/Principles.tsx` | Rebuild |
| `components/about/WhyBuiltIt.tsx` | Rebuild |

### Blog
| File | Action |
|------|--------|
| `app/blog/page.tsx` | Rebuild |
| `app/blog/[slug]/page.tsx` | Rebuild |
| `app/blog/category/[slug]/page.tsx` | Rebuild |
| `lib/content/blog.ts` | Rebuild (1673 lines of blog content) |
| `lib/content/blog-posts-batch2.ts` | Rebuild |
| `lib/content/types.ts` | Rebuild |
| `lib/content/unsplash.ts` | Rebuild |
| `lib/content/dailyMeal.ts` | Rebuild |
| `lib/content/public.ts` | Rebuild |
| `components/content/BlogImage.tsx` | Rebuild |
| `mdx-components.tsx` | Rebuild (if blog uses MDX) |

### Paywall / Upgrade Flows
| File | Action |
|------|--------|
| `components/paywall/PaywallDialog.tsx` | Rebuild — new 5-pillar upgrade flow |
| `components/paywall/ProPaywallCard.tsx` | Rebuild |
| `lib/pillars/config.ts` | Rebuild — currently 4-pillar, needs 5-pillar update |
| `lib/pillars/use-upgrade-trigger.ts` | Rebuild |

### Pillar Config (currently 4-pillar, needs 5-pillar rewrite)
| File | Action |
|------|--------|
| `lib/pillars/config.ts` | Rebuild — add Leftovers AI + Budget Intelligence pillars, remove "Scan & Decide" / "Household" as top-level pillars |

### Onboarding
| File | Action |
|------|--------|
| `app/onboarding/page.tsx` | Rebuild — align with 5 pillars |

### Referral System
| File | Action |
|------|--------|
| `app/(app)/referral/page.tsx` | Rebuild |
| `app/r/[code]/page.tsx` | Rebuild |
| `app/api/referral/apply/route.ts` | Rebuild |
| `app/api/referral/me/route.ts` | Rebuild |
| `lib/referral/config.ts` | Rebuild |
| `lib/referral/server.ts` | Rebuild |

### Insights Page
| File | Action |
|------|--------|
| `app/(app)/insights/page.tsx` | Rebuild — align with 5-pillar metrics |

### Family / Household Management
| File | Action |
|------|--------|
| `app/(app)/family/page.tsx` | Rebuild — household management stays but UI needs refresh |
| `app/(app)/dashboard/household/page.tsx` | Rebuild |

---

## ❌ DELETE (remove from codebase)

### Weekend Mode (meal + movie pairing)
| File | Reason |
|------|--------|
| `app/(app)/weekend/page.tsx` | Weekend Mode removed |
| `app/api/weekend-mode/route.ts` | Weekend Mode API removed |
| `components/weekend/WeekendModeClient.tsx` | Weekend Mode UI removed |
| `components/weekend/WeekendModeFetcher.tsx` | Weekend Mode fetcher removed |
| `components/hub/WeekendModeCard.tsx` | Weekend Mode hub card removed |
| `lib/weekend/generate-entertainment.ts` | Entertainment generation removed |
| `lib/email/templates/weekend-reminder.tsx` | Weekend reminder email removed |
| `types/index.ts` → `EntertainmentPrefs`, `EntertainmentResult`, `WeekendModeResult` types | Remove these type blocks |
| `supabase/migrations/011_weekend_mode.sql` | Weekend Mode migration (mark for drop) |

### Standalone Food Check
| File | Reason |
|------|--------|
| `app/api/food-check/route.ts` | Standalone Food Check removed |
| `components/cook/FoodCheck.tsx` | Food Check UI removed |
| `types/cook-tools.ts` → `FoodVerdict`, `FoodCheckResult` types | Remove these type blocks |

### Standalone Smart Menu Scan
| File | Reason |
|------|--------|
| `app/api/menu-scan/route.ts` | Standalone Menu Scan removed |
| `components/cook/SmartMenuScan.tsx` | Menu Scan UI removed |
| `types/cook-tools.ts` → `MenuScanGoal`, `MenuScanGoalOption`, `MENU_SCAN_GOALS`, `MenuScanRecommendation`, `MenuScanResult` types | Remove these type blocks |
| `supabase/migrations/020_cook_tools.sql` | Cook tools migration (mark for drop — personal_preferences table + scan_history table) |

### Standalone Kids Tools
| File | Reason |
|------|--------|
| `app/kids/page.tsx` | Standalone Kids page removed (903 lines) |
| `app/kids-tool/page.tsx` | Kids Tool page removed (830 lines) |
| `app/kids-tool/result/page.tsx` | Kids Tool result page removed |
| `app/api/kids-tool/route.ts` | Kids Tool API removed (383 lines) |
| `lib/kids-tool-utils.ts` | Kids Tool utilities removed |
| `components/hub/KidsSection.tsx` | Kids section hub card removed |

### Zero-Cook Mode (delivery ordering)
| File | Reason |
|------|--------|
| `app/api/zero-cook/route.ts` | Zero-Cook API removed — not a pillar |
| `components/zero-cook/ProviderButtons.tsx` | Zero-Cook UI removed |
| `components/zero-cook/useZeroCookRecommend.ts` | Zero-Cook hook removed |
| `components/zero-cook/ZeroCookMealCard.tsx` | Zero-Cook card removed |
| `components/zero-cook/ZeroCookSheet.tsx` | Zero-Cook sheet removed |
| `components/zero-cook/ZeroCookTeaser.tsx` | Zero-Cook teaser removed |
| `lib/zero-cook/providers.ts` | Zero-Cook providers removed |
| `lib/zero-cook/recommendation.ts` | Zero-Cook recommendation removed |
| `lib/zero-cook/types.ts` | Zero-Cook types removed |

### Guest Hosting Planner (Family-tier feature, not a pillar)
| File | Reason |
|------|--------|
| `app/(app)/dashboard/guest-hosting/page.tsx` | Guest hosting removed — not a pillar |

### Conflict Balancing (Family-tier feature, not a pillar)
| File | Reason |
|------|--------|
| `app/(app)/dashboard/conflict-balancing/page.tsx` | Conflict balancing removed — not a pillar |

### Shared Planning (Family-tier feature, not a pillar)
| File | Reason |
|------|--------|
| `app/(app)/dashboard/shared-planning/page.tsx` | Shared planning removed — not a pillar |

### Sentry Example (dev artifact)
| File | Reason |
|------|--------|
| `app/sentry-example-page/page.tsx` | Dev example — remove |
| `app/api/sentry-example-api/route.ts` | Dev example — remove |

### Stale Public Assets
| File | Reason |
|------|--------|
| `public/landing/app-cooking.jpg` | Old landing images — will be replaced |
| `public/landing/date-night.jpg` | Old landing images |
| `public/landing/family-dinner.jpg` | Old landing images |
| `public/landing/grocery.jpg` | Old landing images |
| `public/landing/hero.jpg` | Old landing images |
| `public/landing/pantry.jpg` | Old landing images |
| `public/mobile/date-night-mobile.jpg` | Old mobile images |
| `public/mobile/family-mobile.jpg` | Old mobile images |
| `public/mobile/hero-mobile.jpg` | Old mobile images |
| `public/hero.mp4` | Old hero video |
| `public/file.svg` | Next.js default — unused |
| `public/globe.svg` | Next.js default — unused |
| `public/next.svg` | Next.js default — unused |
| `public/vercel.svg` | Next.js default — unused |
| `public/window.svg` | Next.js default — unused |

### Stale Docs
| File | Reason |
|------|--------|
| `docs/founder-launch-checklist.md` | Outdated launch doc |
| `docs/launch-runbook.md` | Outdated launch doc |
| `docs/pantry-fix-audit.md` | Outdated audit |
| `docs/pantry-v2-implementation.md` | Outdated implementation doc |
| `docs/pricing-deployment.md` | Outdated pricing doc |
| `docs/pricing-model-3tier.md` | Outdated pricing model |
| `docs/SEO_FEATURE_EXPANSION.md` | Outdated SEO doc |
| `docs/SEO_STRATEGY.md` | Outdated SEO doc |
| `docs/vercel-env-worksheet.md` | Outdated env doc |
| `posthog-setup-report.md` | Setup report — no longer needed |

### Stale Type File
| File | Reason |
|------|--------|
| `types/cook-tools.ts` | Entire file can be deleted once Food Check + Menu Scan are removed |

---

## 🤔 UNCLEAR (need founder input)

| Item | Question |
|------|----------|
| `app/(app)/admin/page.tsx` | **Keep admin page?** Is there an admin dashboard you want to preserve, or rebuild from scratch? |
| `app/api/guest-meal/route.ts` | **Keep guest meal endpoint?** This serves unauthenticated users with generic meal suggestions. Useful for landing page demos? |
| `lib/referral/` + `app/(app)/referral/` + `app/r/[code]/` | **Keep referral system?** It's not a pillar but could be a growth lever. Rebuild or delete entirely? |
| `lib/learning/` (engine, learn, store, types) + `lib/sync/middleware.ts` | **Keep adaptive learning?** This learns from user feedback to improve suggestions. It's an "invisible intelligence layer" — keep as-is, rebuild, or defer? |
| `components/hub/SmartToolsRow.tsx` | **What goes in Smart Tools?** Currently links to Food Check, Menu Scan, Kids Tools. All being removed. Delete or rebuild with new tools? |
| `app/(app)/family/page.tsx` + family API routes | **Keep family member management?** Household/member profiles support the pillars (allergies, preferences). Keep the management UI or rebuild? |
| `app/(app)/dashboard/household/page.tsx` | **Household page vs Family page?** Both seem to manage household settings. Consolidate into one? |
| `scripts/fetch-mealdb.ts` + `scripts/seed-public-meals.ts` | **Keep seed scripts?** Useful for development but not production. Delete or keep for dev tooling? |
| `app/api/webhook/stripe/route.ts` vs `app/api/stripe/webhook/route.ts` | **Duplicate Stripe webhook?** Two webhook routes exist. Which is canonical? Delete the other. |
| `content/` directory (empty) | **Was content planned?** Empty directory — delete or keep for future MDX content? |
| `nutrinest-ai/nutrinest-ai/` nested directory | **Nested project copy?** There's a nested directory that appears to be a stale copy. Delete? |
| `AGENTS.md` + `CLAUDE.md` + `.claude/` | **Keep AI agent instructions?** These are AI coding assistant config files. Keep or update? |

---

## 📦 DEPENDENCIES TO REMOVE

These npm packages are **only** used by deleted features:

| Package | Used By | Action |
|---------|---------|--------|
| `gray-matter` | Blog (MDX frontmatter parsing) | Remove when blog is deleted (re-add if rebuilt with MDX) |
| `reading-time` | Blog (reading time calculation) | Remove when blog is deleted |
| `@mdx-js/loader` | Blog (MDX support) | Remove when blog is deleted |
| `@mdx-js/react` | Blog (MDX support) | Remove when blog is deleted |
| `@next/mdx` | Blog (MDX support) | Remove when blog is deleted |
| `@types/mdx` | Blog (MDX types) | Remove when blog is deleted |

### Packages to KEEP (used across pillars)
All other packages are used by core infrastructure:
- `@anthropic-ai/sdk` — AI provider (Pillar 1, 2, 3, 4)
- `openai` — AI provider (Pillar 1, 2, 3, 4)
- `@supabase/ssr` + `@supabase/supabase-js` — Database
- `stripe` — Billing
- `@sentry/nextjs` — Error tracking
- `posthog-js` + `posthog-node` — Analytics
- `resend` + `@react-email/components` + `@react-email/render` — Email
- `@upstash/ratelimit` + `@upstash/redis` — Rate limiting
- `web-push` + `@types/web-push` — Push notifications
- `@tanstack/react-query` — Data fetching
- `zustand` — State management
- `framer-motion` — Animations
- `react-hook-form` + `@hookform/resolvers` — Forms
- `zod` — Validation
- `date-fns` — Date utilities
- `lucide-react` — Icons
- `sonner` — Toast notifications
- `next-themes` — Theme support
- `shadcn` + `class-variance-authority` + `clsx` + `tailwind-merge` + `tw-animate-css` — UI system
- `@base-ui/react` — Base UI primitives

---

## 🔑 ENV VARS TO REMOVE

| Variable | Used By | Action |
|----------|---------|--------|
| *(none identified)* | All current env vars are used by core infrastructure | **No env vars to remove** |

> **Note:** All env vars in `.env.example` are used by Supabase, AI providers, Stripe, PostHog, Sentry, or Resend — all of which are kept. The `WEB_PUSH_*` vars referenced in `lib/env.ts` (not in `.env.example`) should be added to `.env.example` if push notifications are kept.

---

## 🗄️ DATABASE MIGRATIONS NEEDED

### Tables/Columns to DROP (via new migration)

| Table/Column | Source Migration | Reason |
|--------------|-----------------|--------|
| `onboarding_preferences.entertainment_prefs` | `011_weekend_mode.sql` | Weekend Mode removed |
| `reminder_schedules.last_weekend_sent_at` | `011_weekend_mode.sql` | Weekend Mode removed |
| `personal_preferences` table | `020_cook_tools.sql` | Food Check / Menu Scan removed |
| `scan_history` table | `020_cook_tools.sql` | Food Check / Menu Scan removed |

### Tables to KEEP (already in `db/schema.sql` for new pillars)

| Table | Pillar |
|-------|--------|
| `profiles` | Core |
| `households` | Core |
| `household_members` | Core |
| `member_allergies` | Core |
| `member_conditions` | Core |
| `recipes` | Shared across all pillars |
| `plans` + `plan_days` | Pillar 3: Weekly Autopilot |
| `meals` + `meal_variations` | Shared |
| `pantry_items` | Pillar 2: Snap & Cook |
| `scans` | Pillar 2: Snap & Cook |
| `tonight_suggestions` | Pillar 1: Tonight Suggestions |
| `leftovers` + `leftover_suggestions` | Pillar 4: Leftovers AI *(NEW — needs UI)* |
| `budget_settings` + `weekly_spend` + `ingredient_prices` | Pillar 5: Budget Intelligence *(NEW — needs UI)* |
| `grocery_lists` + `grocery_items` + `grocery_exports` | Pillar 3 + 5 |
| `meal_feedback` | Shared feedback |
| `contextual_nudges` | Shared UX |
| `user_subscriptions` | Billing |
| `push_subscriptions` | Notifications |
| `recently_shown_meals` | Freshness/variety |

### Migration strategy
All 21 migration files should remain in `supabase/migrations/` for history. Create a **new migration** (e.g., `022_cleanup_removed_features.sql`) to drop the Weekend Mode and Cook Tools columns/tables.

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| ✅ KEEP | ~130 files |
| 🔄 REBUILD | ~55 files |
| ❌ DELETE | ~50 files |
| 🤔 UNCLEAR | 10 items needing founder input |
| 📦 Packages to remove | 6 (all blog/MDX related) |
| 🔑 Env vars to remove | 0 |
| 🗄️ DB objects to drop | 4 (2 columns + 2 tables) |

### Estimated Lines of Code to Delete
| Feature | Approx Lines |
|---------|-------------|
| Weekend Mode | ~400 |
| Kids Tools (pages + API + utils) | ~2,250 |
| Food Check + Menu Scan | ~600 |
| Zero-Cook Mode | ~350 |
| Guest Hosting / Conflict / Shared Planning | ~1,035 |
| Sentry examples | ~50 |
| Stale docs | ~500 |
| **Total** | **~5,185 lines** |

---

> ⚠️ **DO NOT DELETE ANYTHING YET.** Review this audit, answer the UNCLEAR questions, then proceed with cleanup in small, reversible commits.
