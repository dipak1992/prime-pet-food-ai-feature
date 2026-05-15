# Prime Pet Food LLM SEO Architecture

## Executive Summary

Prime Pet Food should be structured as both a premium ecommerce store and a crawlable knowledge hub for Himalayan yak cheese dog chews. The strongest SEO and AI-search opportunity is not generic "dog treats"; it is the semantic territory around yak chews, long-lasting dog chews, rawhide alternatives, aggressive chewers, dog enrichment, safety, digestibility, and Himalayan craftsmanship.

The store already has a strong base: product schema, FAQ schema, article schema, breadcrumb schema, a yak chew guide hub, programmatic SEO page templates, FAQ content, a manufacturing page, and contextual product education. This implementation strengthens the entity graph and internal linking layer so Google and LLM retrieval systems can understand how the pages relate.

## Page Intent Map

| Page Type | Primary Intent | SEO Role |
|---|---|---|
| Homepage | Brand discovery and conversion | Entity introduction and product positioning |
| Product page | Buying decision | Purchase intent, Product schema, offer/review signals |
| Yak chew guide hub | Topic navigation | Internal knowledge graph and crawl path |
| Programmatic SEO pages | Long-tail answers | Breed, problem, safety, comparison, and duration capture |
| Blog articles | Editorial authority | Supporting explanations and internal links to canonical guide pages |
| FAQ page | Quick answers | FAQ schema, objection handling, answer extraction |
| Manufacturing page | Trust and authenticity | Origin, process, Nepal/Himalayan craftsmanship |
| Subscribe page | Retention and replenishment | Subscription intent and reorder routines |
| Wholesale page | B2B intent | Retailer, bulk, MOQ, and wholesale portal discovery |

## Topic Clusters

1. Himalayan yak cheese chews
   Canonical: `/products/himalayan-yak-chews-for-dogs`
   Support: `/pages/how-himalayan-yak-cheese-chews-are-made`, `/pages/yak-chew-guides`

2. Long-lasting dog chews
   Canonical: `/pages/longest-lasting-dog-chews`
   Support: `/pages/how-long-do-yak-chews-last`, `/pages/how-long-will-this-last-for-my-dog`

3. Rawhide alternatives
   Canonical: `/pages/best-rawhide-alternative`
   Support: `/pages/yak-chews-vs-bully-sticks`, FAQ safety answers, product page

4. Aggressive chewer solutions
   Canonical: `/pages/best-long-lasting-chew-for-aggressive-chewers`
   Support: breed pages, duration estimator, product sizing guidance

5. Dog enrichment
   Canonical: `/pages/dog-chews-for-bored-dogs`
   Support: crate training, separation anxiety routines, homepage enrichment sections

6. Safety and digestibility
   Canonical: `/pages/yak-chew-safety-guide`
   Support: `/pages/are-yak-chews-digestible`, FAQ, product safety sections

7. Breed and life-stage guides
   Canonical hub: `/pages/yak-chew-guides`
   Support: Labradors, Golden Retrievers, German Shepherds, Huskies, French Bulldogs, small dogs, puppies

## Implemented Changes

- Added `snippets/prime-semantic-schema.liquid`.
- Rendered the semantic graph from `layout/theme.liquid`.
- Expanded `snippets/seo-topic-links.liquid` with manufacturing, safety, natural chew, and puppy guide links.
- Expanded `sections/prime-seo-internal-links.liquid` for product-page semantic crawl paths.
- Expanded `sections/seo-chew-hub.liquid` with safety, digestibility, natural chews, small dogs, puppies, and manufacturing pages.
- Added managed SEO page records in `content/pages/seo-pages.json`:
  - `/pages/yak-chews-for-small-dogs`
  - `/pages/yak-chews-for-puppies`
  - `/pages/yak-chew-safety-guide`
  - `/pages/are-yak-chews-digestible`
  - `/pages/natural-dog-chews`
- Added template-specific copy logic in `sections/seo-chew-page.liquid` for those pages.

## Schema Strategy

Current and recommended schema coverage:

- Product schema: Product page, including brand, offers, aggregate rating.
- FAQ schema: FAQ page, process page, SEO guide pages.
- BreadcrumbList schema: Global page templates and breadcrumb snippet.
- Article schema: Blog article template.
- Organization/WebSite schema: Global semantic schema.
- DefinedTermSet and ItemList: Added for LLM-friendly topic relationships.

Do not duplicate page-level schema unnecessarily. The global graph should explain entity relationships; individual pages should explain the specific page intent.

## Internal Linking Rules

- Product page links to duration, safety, rawhide alternative, manufacturing, and guide hub.
- Blog articles include the `seo-topic-links` module.
- Programmatic SEO pages link back to the product page, estimator, guide hub, and related guides.
- FAQ answers link to the estimator, product page, and contact page where relevant.
- Manufacturing page links to product, FAQ, wholesale, and rawhide alternative pages.
- Wholesale page links should stay B2B-focused and avoid consumer keyword clutter.

## Blog Roadmap

Prioritize editorial content that supports existing canonical pages:

1. How to introduce a yak chew to your dog safely.
2. Yak chews for puppies: when to wait and what to ask your vet.
3. Best enrichment routines for aggressive chewers.
4. Rawhide alternatives compared: yak chews, bully sticks, collagen, antlers.
5. What to do when a dog swallows a chew piece.
6. How to use the leftover yak chew nub.
7. Dog boredom signs and chew-based enrichment routines.
8. Breed chew behavior guides for Goldens, Labs, Shepherds, Huskies, and French Bulldogs.

Each blog should answer the query directly in the first 2-3 sentences, then link to the canonical guide page.

## Metadata Rules

- Use one primary intent per page.
- Title format: Primary query | Prime Pet Food.
- Descriptions should mention the user problem, product/entity, and outcome.
- Avoid repeating the same meta description across programmatic pages.
- Keep page H1 aligned with search intent, not brand slogan.

## AI Search Optimization Rules

- Start important sections with direct answers.
- Use concise H2/H3 headings that match natural language questions.
- Name entities consistently: Prime Pet Food, Himalayan yak cheese chews, rawhide-free dog chews, dog enrichment, Nepal/Himalayas.
- Avoid vague claims without context. Explain why process, size, density, supervision, and ingredients matter.
- Maintain clear crawl paths from guides to product and from product back to guides.

## Technical SEO Checklist

- Keep canonical fallbacks for legacy duplicate URLs until Shopify 301s are configured.
- Sync `content/pages/seo-pages.json` after adding managed SEO pages.
- Recheck Shopify sitemap after publish.
- Keep generated images compressed and lazy loaded outside first-viewport heroes.
- Keep FAQ accordions crawlable with native `details` markup.
- Avoid noindex on canonical SEO guide templates.
- Preserve technical event names such as `prime:profile:ready`; they are not customer-facing copy.

## Next Implementation Priorities

1. Run the page sync for new SEO pages.
2. Add unique body sections for the five new guide pages if traffic justifies deeper copy.
3. Add in-body links from top blog posts to the relevant canonical guide pages.
4. Add review schema from a real reviews provider if available.
5. Add Shopify 301 redirects for legacy duplicate URLs listed in the cleanup audit.
6. Build a content QA process for thin or duplicate programmatic pages before scaling to more breeds.
