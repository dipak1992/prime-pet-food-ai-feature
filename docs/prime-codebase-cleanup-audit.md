# Prime Pet Food Codebase Cleanup Audit

Date: 2026-05-14

## Executive Summary

This Shopify theme contains the active Prime custom experience plus legacy Ignite theme sections, PageFly output, old page templates, and active app embeds. Cleanup should be conservative: remove only confirmed-unused files, preserve SEO landing pages, and redirect old public URLs before deleting any live Shopify pages.

## What Was Audited

- Theme templates, section groups, sections, snippets, assets, blocks, layouts, config, and locales.
- Static references from JSON templates, section groups, Liquid `render`/`section` calls, and asset references.
- Live sitemap and robots.txt.
- App embeds and tracking-sensitive code in `config/settings_data.json`.
- Internal links to duplicate page handles.

## High-Confidence Findings

### Keep

- SEO landing pages under `/pages/how-long-*`, `/pages/best-*`, `/pages/dog-chews-*`, and breed pages. These target long-tail yak chew and dog enrichment queries.
- Active Prime templates:
  - `page.about-us.json`
  - `page.contact.json`
  - `page.faq.json`
  - `page.subscribe-and-save.json`
  - `page.wholesale.json`
  - breed/SEO templates
  - `product.json`
  - `cart.json`
- App-related code until apps are confirmed unused in Shopify Admin:
  - PageFly
  - Seal Subscriptions
  - Bundlex
  - Yotpo
  - Qikify
  - SEOAnt

### Improve / Redirect

The live sitemap still exposes older duplicate pages:

| Old URL | Target | Action |
|---|---|---|
| `/pages/who-we-are` | `/pages/about-us` | 301 redirect |
| `/pages/contact-us` | `/pages/contact` | 301 redirect |
| `/pages/faqs` | `/pages/faq` | 301 redirect |
| `/pages/return-policy` | `/pages/refund-policy` | 301 redirect |
| `/pages/wholesale-application` | `/pages/wholesale` | 301 redirect |

Theme-level canonical fallbacks were added for these URLs, but proper Shopify 301 redirects are still recommended.

### Do Not Delete Yet

These may look unused in static scans but are risky because Shopify can assign them dynamically or apps can depend on them:

- Customer account sections: `main-account`, `main-login`, `main-register`, `main-order`, etc.
- Theme-editor sections with presets.
- PageFly files and product template `product.pf-eb98f979.json` until product assignment is verified.
- Cart drawer assets until drawer loading is verified in production.
- Tracking/app embeds in `settings_data.json`.

## Safe Local Cleanup Performed

- Removed local `.DS_Store` metadata files from the workspace.
- Added canonical fallback mappings for old duplicate page URLs in `layout/theme.liquid`.

## Redirect Implementation Status

Attempted Shopify Admin GraphQL `urlRedirectCreate`, but the current Admin token is missing the required `write_online_store_navigation` scope.

Manual Shopify Admin redirects still needed:

1. Go to **Online Store -> Navigation -> View URL Redirects**.
2. Add the redirects listed above.
3. Recheck `/sitemap_pages_1.xml` after Shopify recrawls page visibility.

## Performance Plan

1. Confirm whether PageFly product template `product.pf-eb98f979.json` is still assigned to any product. If not, remove PageFly product section/template after redirect/assignment checks.
2. Verify active apps. Disable/remove unused app embeds before removing related theme code.
3. Audit large theme images for Shopify image CDN sizing rather than deleting files that are still referenced by sections.
4. Extract large inline section CSS only after the visual system stabilizes.
5. Avoid deleting default theme sections unless this is a dedicated custom theme with no theme-editor reuse needs.

## Remaining Risks

- Backlink and Search Console traffic data were not available locally. Any live page deletion should be checked against Google Search Console and backlink data first.
- Shopify redirects could not be created with the current API token scope.
- Some old pages are still live in the sitemap, so canonical fallback is only an interim SEO safeguard.
