# SEO Legacy URL Cleanup — Implementation Guide

## Fix #7: Legacy Visual/URL Contamination

### What Was Done (Theme-Level)

1. **Canonical tag overrides** expanded in `layout/theme.liquid` to cover legacy product URLs:
   - `/products/small-yak-chews` → `/products/himalayan-yak-chews-for-dogs`
   - `/products/large-yak-cheese` → `/products/himalayan-yak-chews-for-dogs`
   - `/products/medium-yak-chews` → `/products/himalayan-yak-chews-for-dogs`
   - `/products/yak-cheese-chews` → `/products/himalayan-yak-chews-for-dogs`
   - `/products/himalayan-dog-chew` → `/products/himalayan-yak-chews-for-dogs`
   - `/products/natural-yak-chews` → `/products/himalayan-yak-chews-for-dogs`
   - `/collections/yak-chews` → `/collections/all`
   - `/collections/dog-chews` → `/collections/all`

2. **Noindex tags** already applied to ad landing pages and deprecated templates via `theme.liquid` line 61-65.

### What Must Be Done in Shopify Admin

1. **Import 301 Redirects**:
   - Go to **Settings → Navigation → URL Redirects**
   - Click **Import** and upload `docs/shopify-redirects-import.csv`
   - This creates proper 301 redirects for all legacy URLs

2. **Submit Updated Sitemap**:
   - Go to **Google Search Console** → Sitemaps
   - Resubmit: `https://theprimepetfood.com/sitemap.xml`
   - Shopify auto-generates sitemaps; the noindex tags ensure deprecated pages are excluded from indexing

3. **Request Removal of Outdated Google Image Results**:
   - Use [Google's Removals Tool](https://search.google.com/search-console/removals) in Search Console
   - Submit URLs for old product pages with outdated packaging imagery
   - For cached images: use "Remove outdated content" at https://search.google.com/search-console/remove-outdated-content

4. **Verify Canonical Tags**:
   - All active pages now output `<link rel="canonical">` via `theme.liquid` lines 33-37
   - Legacy URLs that still resolve will point canonical to the correct current page
