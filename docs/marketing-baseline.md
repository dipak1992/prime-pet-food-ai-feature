# MealEase Marketing Baseline

## Verified Stats Registry

All public stats should come from `lib/marketing/stats.ts`.

Current launch-safe claim status:

| Claim | Decision | Public Copy |
|---|---|---|
| Household count | Soften | Private beta |
| Meals planned | Soften | Beta data in review |
| Rating | Soften | Early beta |
| Weekly savings | Soften | Varies by household |
| Time saved | Soften | Measured during beta |

Do not publish hard numbers until the source, time window, and calculation method are documented.

## Messaging Cleanup List

Use this product sentence across homepage, signup, pricing, and comparison pages:

> MealEase learns your household, plans dinner, and builds the grocery list.

Replace broad copy:

| Avoid | Use |
|---|---|
| AI-powered meal planning | Household dinner planning with a grocery list |
| Grocery commerce | Smart grocery list |
| Calm family system | Dinner, week plan, groceries, leftovers, and budget in one flow |
| Save $X/week | See estimated costs before shopping |
| Trusted by X households | Built with beta households |

## Route And CTA Inventory

| Area | Current Routes | Decision |
|---|---|---|
| First use | `/start`, `/demo/scan`, `/tonight` | Keep `/start` as the primary activation path. Keep scanner and Tonight as supporting routes. |
| Dashboard | `/dashboard` | Keep as authenticated home. |
| Weekly plan | `/planner`, `/plan` | Simplify toward one canonical weekly planning route. Prefer `/planner` for app navigation; keep `/plan` only if needed for legacy links. |
| Groceries | `/grocery-list` | Keep. Tie clearly to Week Plan. |
| Leftovers | `/leftovers` | Keep. |
| Budget | `/budget` | Keep. |
| Pricing | `/pricing`, `/upgrade` | Keep. Clarify one primary paid CTA. |
| Signup | `/signup`, `/login`, `/onboarding` | Keep. Signup should support `next` redirects after first-use value. |

## Keep / Simplify / Remove

| Decision | Items |
|---|---|
| Keep | Tonight, Week Plan, Groceries, Leftovers, Budget, scanner demo, comparison pages, blog. |
| Simplify | Product story, navigation labels, onboarding, pricing CTAs, grocery list persistence. |
| Remove or soften | Inflated stats, unverifiable testimonials, generic AI repetition, "grocery commerce" consumer-facing copy, duplicate CTAs. |
