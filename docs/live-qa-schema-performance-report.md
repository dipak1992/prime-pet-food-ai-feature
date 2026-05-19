# Prime Pet Food Live QA, Schema, Performance, and Analytics Report

Date: 2026-05-19

## Live Mobile QA

Checked against `https://theprimepetfood.com` at a mobile viewport.

| Page | Result |
| --- | --- |
| Homepage | Loads with H1 `Calmer dogs start with a better chew.` Mobile menu opens and drawer links are visible. Chatbot present. |
| Product page | Loads with H1 `Himalayan Regular Yak Chews for Dogs`. Chatbot present. |
| Cart | Loads with H1 `Your cart`. Chatbot present. |
| FAQ | Loads with H1 `Answers for safer, calmer chew time.` Chatbot present. |
| Safety hub | Loads with H1 `Yak Chew Safety & Science Hub`. Chatbot present. |
| Prime Pet Food Scale | Loads with H1 `The Prime Pet Food Scale`. Chatbot present. |
| Chew Duration Predictor | Loads with H1 `How Long Will This Last For MY Dog?`. Chatbot present. |
| Subscribe & Save | Loads with H1 `The calm-time routine that runs itself.` Chatbot present. |

No 404 states were detected in the checked pages.

## Schema Validation

Validated by fetching live HTML and parsing all `application/ld+json` blocks as JSON.

| Page | Schema blocks | Valid JSON-LD | Primary types found |
| --- | ---: | ---: | --- |
| Product page | 4 | 4 | `Product`, `BreadcrumbList`, `Organization`, `WebSite`, `DefinedTermSet`, `ItemList`, `WebApplication` |
| FAQ page | 3 | 3 | `BreadcrumbList`, `Organization`, `WebSite`, `DefinedTermSet`, `ItemList`, `WebApplication`, `FAQPage` |
| Safety hub | 4 | 4 | `BreadcrumbList`, `Organization`, `WebSite`, `CollectionPage`, `FAQPage`, `DefinedTermSet`, `ItemList`, `WebApplication` |
| Prime Pet Food Scale | 4 | 4 | `BreadcrumbList`, `Organization`, `WebSite`, `WebPage`, `FAQPage`, `DefinedTermSet`, `ItemList`, `WebApplication` |
| Chew Duration Predictor | 4 | 4 | `BreadcrumbList`, `Organization`, `WebSite`, `WebApplication`, `FAQPage`, `DefinedTermSet`, `ItemList` |

Google Rich Results and Schema.org Validator do not provide a stable local CLI/API in this repo, so the practical validation performed here confirms that all embedded JSON-LD is parseable and contains the expected rich-result schema types.

## Performance Check

Live Core Web Vitals sampled with `agent-browser vitals`.

| Page | TTFB | FCP | LCP | CLS |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 25ms | 316ms | 400ms | 0.01 |
| Product page | 36.9ms | 1168ms | Not reported by tool | 0 |
| Cart | 16.9ms | 532ms | 600ms | 0 |
| Prime Pet Food Scale | 13.6ms | 276ms | 384ms | 0 |
| Chew Duration Predictor | 18.9ms | 288ms | 288ms | 0 |
| Subscribe & Save | 18.3ms | 616ms | 616ms | 0 |

Current results do not indicate that motion, chatbot, or video assets are causing obvious live mobile Core Web Vitals regressions. Product page should be checked again after the latest analytics snippet deploys because the tool did not report LCP for that route.

## Analytics Hooks Implemented

Added `snippets/prime-analytics-events.liquid` and rendered it from `layout/theme.liquid`.

Tracked events:

- `prime_add_to_cart_submit`
- `prime_add_to_cart_click`
- `prime_quiz_step_answered`
- `prime_quiz_completed`
- `prime_safety_content_click`
- `prime_safety_block_interaction`
- `prime_puff_hack_click`
- `prime_puff_hack_video_play`
- `prime_subscription_cta_click`

Destinations:

- GA4 via `gtag`
- PostHog via `posthog.capture`
- Shopify analytics via `Shopify.analytics.publish`
- Local debug buffer in `localStorage.prime_analytics_events`

Chatbot category and answer tracking already existed through `prime_chatbot_*` events. This report confirms those remain separate and active.

## Authority Work

Added `docs/authority-outreach-roadmap.md` for the off-site work that cannot be completed inside the Shopify theme:

- veterinarian or dental professional review of the Prime Pet Food Scale
- trainer/behavior consultant quotes on canine decompression
- founder interviews
- Reddit/forum presence with transparent brand disclosure
- PR/backlink targets
- UGC and review capture plan

## Remaining Manual Checks

- Run Google Rich Results Test manually for the five schema pages after deployment.
- Confirm events appear in GA4/PostHog/Shopify analytics after the analytics snippet is deployed.
- Re-test product page LCP after deployment.
- Collect expert quotes and approved credentials before adding them to public pages.
