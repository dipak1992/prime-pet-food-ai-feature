# Prime Pet Food SEO Keyword Hierarchy

This file is the source of truth for preventing yak-chew keyword cannibalization across Shopify pages, blogs, collections, and products.

## Primary Commercial URL

| URL | Primary Intent | Target Keyword | Notes |
|---|---|---|---|
| `/products/himalayan-yak-chews-for-dogs` | Buy | Himalayan yak chews for dogs | Product page owns purchase intent, Product JSON-LD, reviews, price, size selection, and add-to-cart. |

## Hub URL

| URL | Primary Intent | Target Keyword | Notes |
|---|---|---|---|
| `/pages/yak-chew-guides` | Learn / route | yak chew guides | Hub page links to every supporting guide and should not compete with the product page for purchase terms. |

## Duration Cluster

| URL | Primary Intent | Target Keyword | Internal Link Target |
|---|---|---|---|
| `/pages/how-long-will-this-last-for-my-dog` | Tool | dog chew duration estimator | Product page, duration guides, My Dog dashboard |
| `/pages/how-long-do-yak-chews-last` | Informational | how long do yak chews last | Estimator and product page |
| `/pages/longest-lasting-dog-chews` | Buyer guide | longest lasting dog chews | Product page and aggressive chewer guide |

## Comparison Cluster

| URL | Primary Intent | Target Keyword | Internal Link Target |
|---|---|---|---|
| `/pages/best-rawhide-alternative` | Alternative | best rawhide alternative for dogs | Product page and yak vs bully sticks |
| `/pages/yak-chews-vs-bully-sticks` | Comparison | yak chews vs bully sticks | Product page and rawhide alternative guide |

## Problem Cluster

| URL | Primary Intent | Target Keyword | Internal Link Target |
|---|---|---|---|
| `/pages/best-long-lasting-chew-for-aggressive-chewers` | Problem / buyer | best chew for aggressive chewers | Product page, estimator, duration guide |
| `/pages/dog-chews-for-bored-dogs` | Problem / enrichment | dog chews for bored dogs | Product page, enrichment blogs |
| `/pages/dog-chews-for-separation-anxiety` | Problem / calming | dog chews for separation anxiety | Crate training, bored dogs, estimator |
| `/pages/best-chews-for-crate-training` | Problem / training | best chews for crate training | Separation anxiety, bored dogs, product page |

## Breed Cluster

| URL | Primary Intent | Target Keyword | Notes |
|---|---|---|---|
| `/pages/yak-chews-for-labradors` | Breed sizing | yak chews for Labradors | Breed page owns Lab-specific sizing and duration. |
| `/pages/yak-chews-for-golden-retrievers` | Breed sizing | yak chews for Golden Retrievers | Breed page owns Golden-specific sizing and duration. |
| `/pages/yak-chews-for-german-shepherds` | Breed sizing | yak chews for German Shepherds | Breed page owns Shepherd-specific sizing and duration. |
| `/pages/yak-chews-for-huskies` | Breed sizing | yak chews for Huskies | Breed page owns Husky-specific enrichment. |
| `/pages/yak-chews-for-french-bulldogs` | Breed sizing | yak chews for French Bulldogs | Breed page owns compact-dog sizing. |

## Cannibalization Rules

- Only the product page should target direct buy terms such as "buy yak chews", "Himalayan yak chews for dogs", and exact product-name queries.
- The hub page should target navigation and learning terms, not purchase terms.
- Breed pages must use breed-specific H1s and link back to the estimator and product page.
- Blog posts may support the same topic but should link to the matching page URL as the canonical landing page for that keyword.
- Legacy PageFly product templates should be noindexed when they are still present for historical compatibility.
- Legacy breed-template suffixes (`golden-retriever-yak-chews`, `labrador-yak-chews`, `aggressive-chewer-yak-chews`) are noindexed if assigned. The canonical managed URLs are the `/pages/yak-chews-for-*` and `/pages/best-long-lasting-chew-for-aggressive-chewers` entries above.
- Every SEO guide should include contextual links to the product page, duration estimator, and at least two related guides.

## Managed Content Source

Programmatic SEO pages are managed in `content/pages/seo-pages.json` and published with `npm run pages:push`.
