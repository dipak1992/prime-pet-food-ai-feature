# MealEase AI Architecture Audit

**Date:** May 8, 2026  
**Auditor:** AI Systems Architect  
**Codebase:** nutrinest-ai (Next.js 15 / TypeScript / Supabase)

---

## EXECUTIVE SUMMARY

**Current AI Architecture Score: 5.5 / 10**

MealEase has a surprisingly sophisticated *hybrid* AI system — not just "prompts glued to API calls." It combines a **deterministic rule-based engine** (for instant Tonight/Snap meals) with **LLM-powered generation** (for Weekly Autopilot and full meal plans). It also has a real **adaptive learning system** with EMA-based preference rolling on the server side.

However, it is NOT an agent architecture. It's a well-engineered **prompt-response system with a local recommendation engine**. The gap between "current state" and "true AI-powered food OS" is significant but bridgeable.

---

## PART 1 — CURRENT AI SYSTEM AUDIT

### Is there an actual AI architecture?

**Partially.** There are two distinct AI layers:

| Layer | Type | Where |
|-------|------|-------|
| **Smart Meal Engine** | Deterministic scoring/ranking | `lib/engine/engine.ts` (728 lines) |
| **LLM Generation** | Prompt → JSON response | `lib/ai/service.ts` + `lib/ai/meal-generator.ts` |

### Honest Assessment

| Question | Answer |
|----------|--------|
| Is there an AI architecture? | **Hybrid** — rule engine + LLM, but no orchestration layer |
| Or just simple prompt-response flows? | **No** — the rule engine is sophisticated (scoring weights, allergen maps, locality swaps, family intelligence) |
| Are prompts centralized? | **Partially** — `lib/ai/meal-generator.ts` and `lib/plan/autopilot-prompt.ts` are centralized; vision prompt is inline |
| Is orchestration modular? | **No** — each feature has its own API route with embedded logic |
| Is memory persistent? | **Yes** — dual-layer: client-side Zustand (`lib/learning/store.ts`) + server-side Supabase (`lib/learning/learn.ts`) |
| Is recommendation stateful? | **Yes** — EMA-based preference snapshots with cuisine/protein/tag affinities |
| Is context reusable? | **No** — each request rebuilds context from scratch |
| Is personalization real or shallow? | **Real** — multi-signal learning (like/reject/save/cook/skip), time-of-day, weekday/weekend patterns |
| Are there agent-like systems? | **No** — no planning, no tool-calling, no multi-step reasoning |
| Is AI logic scattered? | **Somewhat** — engine logic is centralized, but AI calls are in individual API routes |
| Are prompts hardcoded? | **Yes** — inline in route files and dedicated prompt files |
| Is there an AI abstraction layer? | **Yes** — `lib/ai/service.ts` provides provider fallback (OpenAI → Anthropic) |

---

## PART 2 — CURRENT AI FEATURES INVENTORY

### Feature 1: Tonight Meal Suggestions

**How it works:**
- Client calls `/api/decide` with household, preferences, mode
- Server builds `SmartMealRequest` with family overrides, server-side excludes
- `generateSmartMeal()` in `lib/engine/engine.ts` scores 21,000+ meal candidates against 15+ weighted criteria
- Returns single best meal with variations, shopping list, steps

**Strengths:**
- Instant response (no LLM call — pure deterministic scoring)
- Allergen-safe (hard -10000 penalty)
- Family-intelligent (spicy penalty with kids, texture bonuses)
- Learned boosts from feedback history

**Weaknesses:**
- Static meal database (21K lines of hardcoded meals)
- No real-time ingredient pricing
- No seasonal awareness
- Cannot generate truly novel meals

**Scalability:** ✅ Excellent — O(n) scoring, no API calls, sub-50ms response

---

### Feature 2: Snap & Cook (Vision)

**How it works:**
- User photos fridge → `/api/pantry/vision` → OpenAI GPT-4o vision
- Returns ingredient list → `/api/pantry/match` → `matchPantryMeals()` ranks by pantry overlap
- Returns top 3 meals user can make from detected ingredients

**Strengths:**
- Real computer vision (GPT-4o multimodal)
- Pantry overlap scoring is smart
- Merges server-side pantry items with scanned items

**Weaknesses:**
- Single-shot vision (no follow-up questions)
- No ingredient quantity estimation
- No freshness/expiry detection from photos
- Matching is keyword-based (not semantic)

**Scalability:** ⚠️ Moderate — vision API calls are expensive ($0.01-0.03/image)

---

### Feature 3: Weekly Autopilot

**How it works:**
- `/api/plan/autopilot` → loads household, budget, leftovers, pantry, locked days
- Builds rich context prompt via `buildAutopilotPrompt()`
- Calls OpenAI `gpt-4o-mini` with `response_format: json_object`
- Parses 7-day plan with recipes, reasons, cuisine spread
- Persists to Supabase

**Strengths:**
- Context-rich (household, budget, leftovers, pantry, locked days, cuisine prefs)
- Respects locked days (user control)
- Uses cheaper model (gpt-4o-mini)
- Feature quota enforcement (5/week)

**Weaknesses:**
- Single LLM call for entire week (no iterative refinement)
- No feedback loop (can't say "I don't like Wednesday's meal")
- No ingredient overlap optimization post-generation
- No cost validation against real grocery prices
- Hallucination risk on recipes

**Scalability:** ⚠️ Moderate — $0.01-0.05 per plan generation

---

### Feature 4: Full Meal Plan Generation (Family)

**How it works:**
- `lib/ai/meal-generator.ts` → Claude claude-opus-4-5 (expensive!)
- Massive system prompt with safety rules, realism rules, variation quality
- Generates 7-day plan with member variations, grocery list, insights
- Validated against Zod schema

**Strengths:**
- Extremely detailed prompting (safety, realism, overlap)
- Per-member variations (baby/toddler/kid/adult)
- Grocery list with cost estimates
- Schema validation

**Weaknesses:**
- Uses claude-opus-4-5 (most expensive model — ~$0.50-2.00/plan!)
- No caching or deduplication
- No incremental generation
- Single monolithic prompt (no chain-of-thought)

**Scalability:** ❌ Poor — cost-prohibitive at scale

---

### Feature 5: Adaptive Learning System

**How it works:**
- **Client-side:** Zustand store records like/reject/save → computes `PreferenceSignal` → derives `LearnedBoosts`
- **Server-side:** `/api/signal` → `onSignal()` → writes to `meal_signals` table → updates `user_preference_snapshot` with EMA rolling
- Boosts feed back into `generateSmartMeal()` scoring

**Strengths:**
- Dual-layer (client for instant, server for persistence)
- EMA-based decay (preferences evolve over time)
- Multi-dimensional: cuisine, protein, tags, difficulty, time, picky score
- Time-context aware (weekday vs weekend patterns)

**Weaknesses:**
- Client and server snapshots can diverge
- No cross-household learning
- No collaborative filtering ("users like you also liked...")
- Learning is per-meal, not per-ingredient

**Scalability:** ✅ Good — lightweight computation, Supabase storage

---

### Feature 6: Budget Intelligence

**How it works:**
- Budget tracking via `budgets` + `budget_weekly_spend` tables
- `/api/budget/swap` → **MOCK DATA** (hardcoded swap suggestions!)
- No actual AI-powered cost optimization

**Strengths:**
- Tracking infrastructure exists
- UI is complete

**Weaknesses:**
- **Swap suggestions are completely mocked** — no AI at all
- No real grocery price data
- No cost prediction for generated meals

**Scalability:** N/A — feature is a stub

---

### Feature 7: Leftovers Intelligence

**How it works:**
- Tracks leftovers in Supabase with expiry dates
- Auto-expires stale items
- Feeds leftover ingredients into autopilot context
- "Smart Leftovers" mode in Snap & Cook uses `/api/decide` with leftover items as pantry

**Strengths:**
- Expiry tracking with urgency levels
- Integrates with autopilot planning
- Insights computation (waste reduction %)

**Weaknesses:**
- No proactive "use this before it expires" meal suggestions
- No leftover combination intelligence
- Relies on user manual input (no auto-detection from cooking)

**Scalability:** ✅ Good

---

## PART 3 — DOES A TRUE AI AGENT SYSTEM EXIST?

| Component | Exists? | Quality |
|-----------|---------|---------|
| Agents | ❌ No | — |
| Planners | ⚠️ Partial | Single-shot LLM, no iterative planning |
| Orchestrators | ❌ No | Each route is independent |
| Memory Systems | ✅ Yes | EMA preference snapshots, dual-layer |
| Context Engines | ⚠️ Partial | Context rebuilt per-request, not persistent |
| Reasoning Layers | ❌ No | No chain-of-thought, no self-reflection |
| Tool Calling | ❌ No | LLM never calls tools/functions |
| State Management | ✅ Yes | Zustand + Supabase, well-structured |
| Preference Learning | ✅ Yes | Sophisticated EMA-based system |
| Multi-step AI Workflows | ❌ No | All AI is single-request/response |

### What's Missing

1. **No orchestration layer** — features don't communicate with each other
2. **No agent loop** — LLM can't ask clarifying questions or iterate
3. **No tool use** — LLM can't query pantry, check prices, or look up recipes
4. **No planning/reasoning** — no chain-of-thought, no self-correction
5. **No cross-feature intelligence** — tonight doesn't know about this week's plan
6. **No proactive behavior** — system only responds, never initiates
7. **No semantic understanding** — ingredient matching is keyword-based

---

## PART 4 — HOW CRITICAL IS AI ARCHITECTURE?

### What breaks at scale without it?

| Users | What Breaks |
|-------|-------------|
| 1K | Nothing — current system works fine |
| 10K | LLM costs for meal-generator.ts become unsustainable ($5K-20K/month) |
| 50K | Meal database staleness (same 200 meals recycled), user fatigue |
| 100K | No collaborative learning = missed personalization opportunity |
| 500K | Need real-time pricing, seasonal awareness, regional adaptation |

### Specific Risks

1. **User retention suffers** — without cross-feature memory, the app feels "dumb" after week 3 (same suggestions, no learning from cooking history)
2. **Personalization plateaus** — current learning only adjusts scoring weights, can't generate new meal concepts
3. **Cost explosion** — claude-opus-4-5 for family plans is $0.50-2.00/call; at 10K users that's $5K-20K/month
4. **Engineering debt** — each new feature requires a new API route with duplicated context-loading logic
5. **Grocery commerce blocked** — can't do real budget intelligence without real pricing data and an optimization layer

### Startup-Focused Priority

For a pre-revenue/early-revenue startup at <5K users:
- **Current architecture is adequate for launch**
- The deterministic engine is actually a strength (fast, cheap, predictable)
- Focus AI investment on the **Weekly Autopilot** (highest perceived value) and **Budget Swap** (currently mocked)

---

## PART 5 — WHAT SHOULD MEALEASE ACTUALLY BUILD?

MealEase is a **Household Food Operating System**. The AI architecture should reflect this:

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                         │
│  Tonight │ Snap │ Plan │ Leftovers │ Budget │ Household  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              AI ORCHESTRATION LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Router   │  │ Context  │  │ Response Formatter   │  │
│  │ (intent) │  │ Builder  │  │ (schema validation)  │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              DECISION ENGINE (Hybrid)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Rule Engine  │  │ LLM Engine   │  │ ML Ranker    │  │
│  │ (instant)    │  │ (generative) │  │ (future)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              MEMORY & CONTEXT LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Household │  │Preference│  │ Pantry   │  │History │ │
│  │ Memory   │  │ Signal   │  │ State    │  │ Graph  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              DATA & TOOLS LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Meal DB   │  │Grocery   │  │ Recipe   │  │Pricing │ │
│  │(curated) │  │ Engine   │  │ Parser   │  │  API   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## PART 6 — RECOMMENDED AI SYSTEM DESIGN

### A. AI Orchestration Layer

**Recommendation: Lightweight Decision Router (NOT a full agent framework)**

MealEase doesn't need LangChain, CrewAI, or AutoGen. It needs a **decision router** that:

1. Receives intent (tonight, plan, snap, leftover, budget)
2. Loads unified context (household + preferences + pantry + budget + history)
3. Routes to the appropriate engine (rule-based OR LLM)
4. Validates and formats response

```typescript
// lib/ai/orchestrator.ts
export async function orchestrate(intent: Intent, userId: string): Promise<OrchestratorResult> {
  const context = await buildUnifiedContext(userId)
  const strategy = selectStrategy(intent, context)
  
  switch (strategy) {
    case 'deterministic': return runRuleEngine(intent, context)
    case 'generative':    return runLLMEngine(intent, context)
    case 'hybrid':        return runHybridEngine(intent, context)
  }
}
```

**Why NOT full agents:** MealEase interactions are bounded (user wants ONE meal, not a conversation). Agent loops add latency and cost without proportional UX benefit.

---

### B. Memory System

**Current state:** Good foundation (EMA snapshots + meal_signals table)

**What to add:**

| Memory Type | Storage | TTL | Purpose |
|-------------|---------|-----|---------|
| Session context | Redis/in-memory | 30 min | Current interaction state |
| Preference signal | Supabase `user_preference_snapshot` | Persistent | Cuisine/protein/time affinities |
| Meal history | Supabase `meal_signals` | 90 days | What was cooked, rejected, saved |
| Household memory | Supabase `household_memory` | Persistent | "Mom doesn't like cilantro" |
| Pantry state | Supabase `pantry_items` | Real-time | What's in the fridge |
| Weekly continuity | Supabase `weekly_plans` | 4 weeks | Don't repeat this week's meals |
| Seasonal patterns | Computed | Monthly | Summer = lighter meals, winter = comfort |
| Budget patterns | Supabase `budget_weekly_spend` | 12 weeks | Spending trends |

**Key improvement:** Build a `UnifiedContext` loader that assembles ALL relevant memory in one call:

```typescript
// lib/ai/context.ts
export async function buildUnifiedContext(userId: string): Promise<UnifiedContext> {
  const [prefs, pantry, leftovers, budget, history, household] = await Promise.all([
    getPreferenceSnapshot(userId),
    getPantryState(userId),
    getActiveLeftovers(userId),
    getBudgetState(userId),
    getRecentHistory(userId, 14), // last 14 days
    getHouseholdMemory(userId),
  ])
  return { prefs, pantry, leftovers, budget, history, household, timestamp: Date.now() }
}
```

---

### C. Agent System (Lightweight Specialists)

**NOT autonomous agents.** These are **specialized decision functions** with shared context:

| Specialist | Input | Output | Engine |
|-----------|-------|--------|--------|
| Tonight Decider | context + mode | 1 meal | Rule engine (existing) |
| Weekly Planner | context + preferences | 7 meals | LLM (gpt-4o-mini) |
| Pantry Matcher | context + scanned items | 3 meals | Rule engine (existing) |
| Leftover Transformer | context + expiring items | 1-3 meals | Rule engine + LLM fallback |
| Budget Optimizer | context + week plan | swap suggestions | Rule engine + pricing data |
| Grocery Compiler | week plan + pantry | shopping list | Deterministic |

**Key principle:** Use the rule engine for instant responses, LLM only when generative creativity is needed.

---

### D. Tool System

**Current tools (implicit):**
- Meal database lookup (21K meals)
- Pantry state query
- Leftover state query
- Budget state query

**Tools to add:**
- **Grocery price estimator** — even a simple per-category average would improve budget accuracy
- **Seasonal ingredient checker** — boost in-season produce
- **Recipe parser** — extract structured data from user-submitted recipes
- **Nutrition calculator** — basic macro estimation from ingredients

**NOT needed yet:** External API integrations (grocery delivery, price comparison). These are Phase 3.

---

### E. Prompt Architecture

**Current state:**
- `lib/ai/meal-generator.ts` — monolithic system prompt (90 lines)
- `lib/plan/autopilot-prompt.ts` — well-structured builder function
- `app/api/pantry/vision/route.ts` — inline prompt constant

**Recommendation:**

```
lib/ai/
├── service.ts          ← provider abstraction (EXISTS)
├── orchestrator.ts     ← NEW: intent router
├── context.ts          ← NEW: unified context builder
├── prompts/
│   ├── registry.ts     ← prompt registry with versioning
│   ├── tonight.ts      ← tonight-specific prompts
│   ├── autopilot.ts    ← weekly planning prompts (MOVE from lib/plan/)
│   ├── vision.ts       ← pantry vision prompts (EXTRACT from route)
│   ├── budget.ts       ← budget swap prompts (NEW)
│   └── shared/
│       ├── safety.ts   ← allergen/safety rules (reusable)
│       ├── household.ts← household context formatter
│       └── format.ts   ← output format instructions
├── schemas/
│   ├── meal.ts         ← meal output schema (EXISTS as schemas.ts)
│   ├── plan.ts         ← plan output schema
│   └── grocery.ts      ← grocery output schema
└── engines/
    ├── rule-engine.ts  ← MOVE from lib/engine/engine.ts
    ├── llm-engine.ts   ← NEW: unified LLM caller with model routing
    └── hybrid.ts       ← NEW: rule + LLM combination
```

---

### F. AI State Management

**Current:** Zustand stores (client) + Supabase tables (server) — this is good.

**Add:**
1. **Request deduplication** — if user taps "Try Another" 5x in 2 seconds, don't fire 5 API calls
2. **Optimistic context** — pre-load context on page mount, not on button click
3. **Weekly continuity** — when generating tonight's meal, check what's already planned this week
4. **Cross-feature signals** — cooking a meal should update leftovers, budget, and learning simultaneously

---

## PART 7 — USER EXPERIENCE STRATEGY

### How AI Should FEEL in MealEase

| Principle | Implementation |
|-----------|---------------|
| **Invisible intelligence** | No "AI is thinking..." spinners for rule-engine results |
| **Calm confidence** | One suggestion, not 10 options (decision fatigue killer) |
| **Proactive, not reactive** | Push notification: "Your chicken expires tomorrow — here's a quick stir-fry" |
| **One-tap workflows** | "Cook this" → auto-updates leftovers, budget, history |
| **No typing required** | Photo scan, tap chips, swipe to reject |
| **Learns silently** | Never say "I'm learning your preferences" — just get better |

### Anti-patterns to avoid:
- ❌ Chat interfaces ("Ask MealEase anything")
- ❌ Visible AI branding on every card
- ❌ "Powered by GPT-4" badges
- ❌ Long loading states for simple decisions
- ❌ Asking users to rate meals explicitly

---

## PART 8 — PERFORMANCE / COST OPTIMIZATION

### Current Cost Structure (estimated at 5K users)

| Feature | Model | Cost/call | Calls/user/week | Monthly cost |
|---------|-------|-----------|-----------------|--------------|
| Tonight | None (rule engine) | $0 | 10 | $0 |
| Snap Vision | GPT-4o | $0.02 | 3 | $1,200 |
| Autopilot | GPT-4o-mini | $0.02 | 1 | $400 |
| Family Plan | Claude claude-opus-4-5 | $1.00 | 0.5 | $10,000 ❌ |

### Recommendations

1. **Replace Claude claude-opus-4-5 with GPT-4o-mini** for family plans — 50x cheaper, quality is sufficient for structured JSON output
2. **Cache vision results** — same fridge photo within 1 hour = same ingredients
3. **Batch autopilot** — generate plans during off-peak hours, serve from cache
4. **Model routing:**
   - Simple decisions → rule engine (free)
   - Structured generation → gpt-4o-mini ($0.01-0.02)
   - Creative/complex → gpt-4o ($0.05-0.10)
   - Vision → gpt-4o (no alternative yet)
5. **Streaming** — use for autopilot generation (show meals appearing one by one)

### Cost at Scale

| Users | Current Architecture | Optimized Architecture |
|-------|---------------------|----------------------|
| 5K | ~$12K/month | ~$2K/month |
| 50K | ~$120K/month | ~$15K/month |
| 500K | Unsustainable | ~$80K/month |

---

## PART 9 — FUTURE SCALE READINESS

| Dimension | Current Readiness | Notes |
|-----------|------------------|-------|
| 10K users | ✅ Ready | Rule engine scales infinitely, LLM costs manageable |
| 100K users | ⚠️ Needs work | Need model routing, caching, batch generation |
| Millions of AI calls | ❌ Not ready | Need queue system, async processing, result caching |
| Grocery commerce | ❌ Not ready | No pricing data, no store integration |
| Mobile apps | ✅ Ready | PWA already works, API-first architecture |
| Multi-region | ⚠️ Partial | Locality swaps exist (UK, India) but no i18n infrastructure |

---

## PART 10 — FINAL OUTPUT

### 1. Current AI Architecture Score: **5.5 / 10**

### 2. What Already Exists (Strengths)

- ✅ Sophisticated deterministic scoring engine (728 lines, 15+ weighted criteria)
- ✅ 21,000-line curated meal database with rich metadata
- ✅ Dual-layer adaptive learning (client Zustand + server EMA snapshots)
- ✅ Provider abstraction with fallback (OpenAI → Anthropic)
- ✅ Family-intelligent scoring (allergens, picky eaters, age-appropriate)
- ✅ Signal system for feedback persistence
- ✅ Feature quota enforcement
- ✅ Zod schema validation on AI outputs

### 3. What is Missing

- ❌ Orchestration layer (features are siloed)
- ❌ Unified context builder (each route loads its own data)
- ❌ Cross-feature intelligence (tonight doesn't know about the week plan)
- ❌ Real budget swap AI (currently mocked)
- ❌ Proactive suggestions (no push-based intelligence)
- ❌ Semantic ingredient matching (keyword-only)
- ❌ Collaborative filtering (no "users like you" signals)
- ❌ Prompt versioning/testing infrastructure
- ❌ Cost-optimized model routing

### 4. Biggest Architectural Risks

1. **Claude claude-opus-4-5 for family plans** — $1+/call will bankrupt the startup at scale
2. **No unified context** — adding features means duplicating data-loading logic
3. **Static meal database** — 200 meals will feel repetitive after 2 months of daily use
4. **Mocked budget swaps** — a paid feature that doesn't actually use AI
5. **Client/server learning divergence** — preferences can get out of sync

### 5. Recommended AI Architecture

**Hybrid Decision System** with:
- Rule engine for instant responses (Tonight, Snap matching)
- LLM for generative tasks (Autopilot, novel meals)
- Unified context layer shared across all features
- Lightweight orchestrator (NOT a full agent framework)

### 6. Recommended Folder Structure

```
lib/ai/
├── orchestrator.ts        # Intent router + strategy selector
├── context.ts             # Unified context builder
├── service.ts             # Provider abstraction (EXISTS)
├── model-router.ts        # Cost-optimized model selection
├── prompts/
│   ├── registry.ts        # Versioned prompt registry
│   ├── autopilot.ts       # Weekly planning prompts
│   ├── vision.ts          # Pantry vision prompts
│   ├── budget-swap.ts     # Budget optimization prompts
│   └── shared/
│       ├── safety.ts      # Allergen/safety rules
│       └── household.ts   # Household context formatter
├── engines/
│   ├── rule-engine.ts     # Deterministic scoring (EXISTING engine.ts)
│   ├── llm-engine.ts      # Unified LLM caller
│   └── hybrid.ts          # Rule + LLM combination
└── schemas/
    ├── meal.ts            # Output validation (EXISTS)
    └── plan.ts            # Plan output validation
```

### 7. Recommended Orchestration Flow

```
User Action → Intent Classification → Context Load → Strategy Selection
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    │                     │                     │
                              Rule Engine           LLM Engine            Hybrid
                              (instant)            (generative)        (rule + LLM)
                                    │                     │                     │
                                    └─────────────────────┼─────────────────────┘
                                                          │
                                                   Schema Validation
                                                          │
                                                   Signal Recording
                                                          │
                                                   Response to Client
```

### 8. Recommended Memory System

- **Hot memory** (in-request): Unified context object
- **Warm memory** (session): Redis/edge cache for repeated requests
- **Cold memory** (persistent): Supabase tables (signals, preferences, history)
- **Computed memory** (derived): Preference snapshots, affinity scores

### 9. Recommended Agent System

**Don't build agents.** Build **specialized decision functions** that share context:
- `decideTonight(context)` — rule engine
- `planWeek(context, preferences)` — LLM
- `matchPantry(context, items)` — rule engine
- `suggestSwaps(context, plan)` — LLM (replace mock)
- `transformLeftovers(context, items)` — hybrid

### 10. What to Build Now vs Later

#### NOW (Before 5K users — next 30 days)

1. **Replace Claude claude-opus-4-5 with GPT-4o-mini** in meal-generator.ts (saves $10K+/month)
2. **Build real budget swap AI** (replace mock with gpt-4o-mini call)
3. **Create unified context builder** (`lib/ai/context.ts`)
4. **Add model router** (cheap model for simple tasks, expensive for complex)
5. **Extract prompts** from inline routes into `lib/ai/prompts/`

#### LATER (5K-50K users — 60-90 days)

6. Build orchestration layer
7. Add cross-feature intelligence (tonight ↔ weekly plan)
8. Implement proactive notifications ("use your chicken before it expires")
9. Add collaborative filtering signals
10. Build prompt A/B testing infrastructure

#### MUCH LATER (50K+ users)

11. Semantic ingredient matching (embeddings)
12. Real grocery pricing integration
13. Regional meal adaptation at scale
14. Custom meal generation (truly novel recipes)
15. Voice interface for hands-free cooking

### 11. Technical Debt Warnings

| Debt | Severity | Fix Effort |
|------|----------|------------|
| Claude claude-opus-4-5 usage | 🔴 Critical | 1 hour (swap model string) |
| Mocked budget swaps | 🟡 High | 4 hours (add LLM call) |
| Duplicated context loading | 🟡 High | 8 hours (unified builder) |
| Inline prompts in routes | 🟢 Medium | 4 hours (extract to files) |
| No prompt versioning | 🟢 Medium | 6 hours (registry system) |
| Static meal database | 🟢 Medium | Ongoing (add 50 meals/month) |
| No cross-feature signals | 🟡 High | 12 hours (event bus) |
| Client/server learning divergence | 🟢 Medium | 4 hours (sync on login) |

### 12. 30-Day AI Architecture Roadmap

| Week | Focus | Deliverables |
|------|-------|-------------|
| **Week 1** | Cost optimization | Swap claude-opus-4-5 → gpt-4o-mini; add model router; measure baseline costs |
| **Week 2** | Unified context | Build `lib/ai/context.ts`; refactor `/api/decide` and `/api/plan/autopilot` to use it |
| **Week 3** | Budget swap AI | Replace mock with real LLM-powered swap suggestions; extract prompts to registry |
| **Week 4** | Cross-feature intelligence | Tonight checks weekly plan for variety; leftover expiry triggers proactive suggestions |

---

## CONCLUSION

MealEase is **NOT** "just an app using AI." It has a genuinely sophisticated hybrid system:
- A 728-line deterministic scoring engine that delivers instant, allergen-safe, family-intelligent meal decisions
- A dual-layer adaptive learning system with EMA-based preference evolution
- A 21,000-line curated meal database with rich metadata

The path forward is **NOT** to rebuild everything as agents. It's to:
1. **Optimize costs** (model routing, caching)
2. **Unify context** (shared memory layer)
3. **Fill gaps** (real budget AI, cross-feature intelligence)
4. **Scale the rule engine** (more meals, seasonal awareness, regional adaptation)

The deterministic engine is MealEase's **competitive moat** — it's fast, cheap, predictable, and safe. LLMs should augment it for generative tasks, not replace it.

**Target state:** A hybrid AI system where 80% of decisions are instant (rule engine) and 20% are generative (LLM), with a unified memory layer that makes every interaction smarter than the last.