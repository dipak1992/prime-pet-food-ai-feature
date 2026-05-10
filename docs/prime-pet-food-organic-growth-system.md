# Prime Pet Food Organic Growth System

## Current Audit

This repository is a Shopify theme. Live Shopify blog article bodies are not fully stored in the repo, so the theme-level audit is based on available templates, homepage sections, product templates, article templates, and configured blog surfaces.

What already exists:

- Homepage has strong yak chew positioning around natural ingredients, long-lasting chewing, Himalayan origin, rawhide comparison, FAQs, reviews, and a Dog Behavior blog carousel.
- Product pages already include a chew analyzer block, comparison table, product FAQs, sizing guidance, video social proof, and yak chew education.
- Article pages support title, excerpt, featured image, article body, products, comments, newsletter capture, article schema, and now an internal topic-link module.
- The site is already focused more tightly than generic "dog treats"; the strongest existing topical lanes are yak chews, rawhide alternatives, chew duration, safe sizing, dog behavior, and enrichment.

SEO gaps found:

- Programmatic intent pages were missing for breed-specific searches like "yak chews for Labradors" and "yak chews for German Shepherds".
- Problem-intent pages were missing for high-conversion searches like "best long lasting chew for aggressive chewers", "dog chews for bored dogs", "best rawhide alternative", "separation anxiety chews", and "crate training chews".
- "How long does it last?" intent was underdeveloped even though it is one of the strongest purchase-hesitation keywords for yak chews.
- Existing blog articles were not systematically linking into product, analyzer, breed, problem, and comparison pages.
- The analyzer existed, but it needed stronger analytics, email capture, SEO landing-page placement, and reusable placement metadata.

Duplicate-content risk:

- Breed pages can become thin if only the breed name changes. The new template uses page-handle-specific chewing behavior, boredom patterns, chew intensity, size guidance, duration ranges, and FAQs for priority pages.
- Problem pages should not be cloned from one another. Each page needs a distinct pain point, buyer anxiety, and usage routine.
- Shopify Admin page SEO titles and meta descriptions should be manually set per page. Do not publish dozens of near-empty pages before writing unique intro copy and FAQs for each high-priority handle.

## Implemented Architecture

Theme files added:

- `sections/seo-chew-page.liquid`: scalable SEO page renderer for breed, problem, duration, and comparison pages.
- `sections/seo-chew-hub.liquid`: crawlable hub page for the full yak chew guide cluster.
- `sections/chew-analyzer-landing.liquid`: dedicated SEO landing page for "How Long Will This Last For MY Dog?"
- `templates/page.seo-chew.json`: assign this template to programmatic SEO pages.
- `templates/page.seo-hub.json`: assign this template to the yak chew guide hub.
- `templates/page.chew-duration-tool.json`: assign this template to the analyzer landing page.
- `assets/seo-chew-pages.css`: mobile-first styles for the SEO content system.
- `snippets/seo-topic-links.liquid`: internal-link module for existing blog posts.

Existing files upgraded:

- `assets/chew-analyzer.js`: added completion tracking, engagement-time tracking, Shopify analytics publish support, placement metadata, email-capture event, and product URL routing.
- `assets/chew-analyzer.css`: added email-capture and landing-page form styles.
- `sections/chew-analyzer.liquid`: homepage hero mode now embeds the analyzer instead of only linking away.
- `snippets/chew-analyzer-widget.liquid`: adds product URL and placement attributes for analytics and routing.
- `sections/main-article.liquid`: blog posts now automatically link into the SEO cluster.
- `scripts/page-sync.mjs`: creates and updates Shopify pages from `content/pages/seo-pages.json`, including SEO title and description metadata.

## Page Handles To Create In Shopify

Assign `page.seo-chew` to these pages:

- `/pages/yak-chews-for-golden-retrievers`
- `/pages/yak-chews-for-labradors`
- `/pages/yak-chews-for-huskies`
- `/pages/yak-chews-for-german-shepherds`
- `/pages/yak-chews-for-french-bulldogs`
- `/pages/best-long-lasting-chew-for-aggressive-chewers`
- `/pages/dog-chews-for-bored-dogs`
- `/pages/best-rawhide-alternative`
- `/pages/dog-chews-for-separation-anxiety`
- `/pages/best-chews-for-crate-training`
- `/pages/how-long-do-yak-chews-last`
- `/pages/longest-lasting-dog-chews`
- `/pages/yak-chews-vs-bully-sticks`

Assign `page.chew-duration-tool` to:

- `/pages/how-long-will-this-last-for-my-dog`

Assign `page.seo-hub` to:

- `/pages/yak-chew-guides`

Recommended SEO metadata:

- Keep titles under roughly 60 characters where possible.
- Use intent-specific meta descriptions, not repeated boilerplate.
- Use the product phrase "Himalayan yak cheese dog chew" naturally, not in every heading.
- For breed pages, title format: `Yak Chews for [Breed] | Size, Duration & Safety`
- For problem pages, title format: `[Problem] | Prime Pet Food Yak Chew Guide`
- For duration pages, title format: `[Question/Comparison] | Yak Chew Guide`

## Content Expansion Rules

Publish slowly in clusters:

1. Duration and comparison pages first because they answer purchase hesitation.
2. Aggressive chewer, bored dog, and rawhide alternative pages second because they carry strong buyer pain.
3. Breed pages third, starting with Labrador, Golden Retriever, German Shepherd, Husky, and French Bulldog.

Each new page should include:

- A unique first paragraph based on the dog owner problem.
- Breed or problem-specific chew behavior.
- Weight and size guidance.
- Expected duration range.
- One safety paragraph.
- One product recommendation block.
- Three unique FAQs.
- Links to the analyzer, product page, one comparison page, and two blog posts.

## Blog Reuse Strategy

Do not duplicate existing blog posts. Use them as supporting nodes:

- Add article tags around `yak chews`, `aggressive chewers`, `bored dogs`, `rawhide alternative`, `crate training`, and `chew duration`.
- Update high-performing posts with contextual links to the new pages.
- Use the new automatic `seo-topic-links` module as the baseline, then add manual in-body links where relevant.
- Convert existing broad dog behavior posts into internal-link sources for high-intent commercial pages.

## Analytics Events

The analyzer now emits:

- `chew_analyzer_widget_loaded`
- `chew_analyzer_widget_opened`
- `chew_analyzer_step_viewed`
- `chew_analyzer_breed_selected`
- `chew_analyzer_answer_selected`
- `chew_analyzer_completed`
- `chew_analyzer_results_shown`
- `chew_analyzer_email_capture_submitted`
- `chew_analyzer_add_to_cart_clicked`
- `chew_analyzer_subscribe_clicked`
- `chew_analyzer_engagement_time`

Events are sent to GA4 via `gtag`, PostHog via `posthog.capture`, Shopify analytics via `Shopify.analytics.publish`, and the DOM via `chew-analyzer:*` custom events.

## Future Upgrades

The current analyzer is intentionally API-free. The next upgrades can add:

- Dog profile memory tied to customer accounts or email.
- Breed-specific product bundle URLs.
- Variant-level add-to-cart instead of product-page routing.
- Photo upload and AI vision for size/body-condition estimation.
- Personalized replenishment and subscription cadence.
- PostHog funnels by placement: homepage, product page, SEO landing page, and blog.
