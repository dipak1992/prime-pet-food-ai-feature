# MealEase Copilot — Cuisine & Preference Intelligence Analysis

> **Date:** 2026-05-17  
> **Scope:** Full audit of copilot system + cuisine/preference memory feature analysis  
> **Codebase version:** Production (as of audit date)

---

## PART 1 — CURRENT COPILOT AUDIT

### Current Capabilities

The MealEase Copilot is a **multi-phase conversational AI layer** built on:

1. **Tonight dinner suggestions** — suggest meals based on mode (quick/vegetarian/budget/comfort/healthy) and cook time constraints
2. **Meal swapping** — swap tonight's meal with reason-based filtering (too-complex, too-expensive, not-in-mood, dietary, quicker)
3. **Grocery list management** — add items directly to Supabase `grocery_list_items` table
4. **Weekly plan generation** — route to planner with optional preference string
5. **Plan refinement** — swap_day, rebalance_week, fill_gaps, budget_optimize, lock_and_regenerate operations
6. **Budget optimization** — find cheaper swaps across the week
7. **Leftover suggestions** — suggest meals from leftover ingredients
8. **Leftover monitoring** — review expiring items and route to reuse workflow
9. **Household preference saving** — persist likes, dislikes, schedule patterns, budget rules, cooking time, household rules to `meal_signals` table
10. **Weekly briefing** — summarize plan gaps, grocery readiness, budget pressure, leftover priorities
11. **Navigation** — route user to any app screen
12. **Proactive nudges** — server-pushed contextual suggestions (Plus only)
13. **Voice input** — Web Speech API transcription (Plus only)

### Prompt System

The system prompt (`lib/copilot/system-prompt.ts`) is:

- **Personality-driven:** "Calm, concise, specific, action-oriented" — speaks like a practical food operator
- **Strictly scoped:** Only handles dinner decisions, cooking, planning, leftovers, budget, grocery
- **Context-injected:** Receives userName, householdSize, dietary restrictions, pantry items (top 10), budget remaining, current screen, time of day, schedule constraints, and conversation memory
- **Action-first:** Prefers tools over generic advice; every action explains what changes and why
- **Response-shaped:** Under 4 sentences, no "Sure" lead-ins, no long markdown

The full system prompt is augmented with:
- `formatCompactContext()` — household size, skill, diet, dislikes, cuisines, budget, pantry, urgent leftovers, learned cuisine likes, season
- `getCrossFeatureSignals()` — cross-feature intelligence hint (e.g., today's planned meal, leftover urgency)

### Context Awareness

The copilot has access to (via `buildUserContext` + `formatCompactContext`):

| Data Source | What It Provides |
|---|---|
| `household_preferences` | Size, dietary, dislikes, cuisines, cook time, budget, goals, skill, proteins |
| `budgets` / `budget_weekly_spend` | Weekly limit, strict mode, spent this week |
| `pantry_items` | Up to 30 pantry items |
| `leftovers` | Active leftovers with expiry (up to 10) |
| `grocery_list_items` | Bought/on-list items (up to 20) |
| `saved_meals` | Recently saved/liked meals (up to 10) |
| `preference_snapshots` | Learned cuisine/protein affinities, rejected items, picky score |
| `copilot_schedule_constraints` | Day-of-week schedule patterns (up to 8) |
| Cross-feature signals | Today's planned meal, reason hints |
| Season | Current season with cooking hint |

### Memory Handling

**Session memory (client-side):**
- Zustand store persisted to `sessionStorage` (last 12 messages + session metadata)
- Session includes: id, startedAt, updatedAt, turnCount, summary, intent
- `compactSummary()` builds a rolling 900-char summary from recent messages
- `inferIntent()` classifies user intent from text patterns
- Session resets after 45 minutes of inactivity

**Persistent memory (server-side, Plus only):**
- `recordCopilotLearning()` extracts signals from every user message:
  - Cuisine mentions (thai, italian, mexican, indian, mediterranean, nepali, japanese, korean)
  - Protein mentions (chicken, beef, pork, salmon, fish, tofu, beans, lentils, eggs, turkey)
  - Tags (quick, kid-friendly, spicy, vegetarian, budget, impressive)
  - Schedule patterns (day + constraint like "soccer", "date night", "busy")
  - Sentiment (positive: loved/love/liked/great/again/favorite; negative: dislike/hate/too spicy/boring)
- Writes to `meal_signals` table with context metadata
- Schedule patterns upserted to `copilot_schedule_constraints`
- `save_household_preference` tool explicitly saves preferences with category

**Learning system (separate from copilot):**
- EMA-based affinity rolling on `user_preference_snapshot`
- Cuisine/protein/tag affinities (0-1 scale)
- Rejection tracking with decay threshold (3x rejection → penalty)
- Picky score, difficulty preference, time range preference
- Client-side `useLearningStore` with feedback history (max 200 events)

### Meal Modification Logic

Meal modifications happen through **routing, not direct mutation**:

1. **Tonight swap:** Triggers `tonight-swap` feature with reason parameter → routes to Tonight screen
2. **Plan refinement:** Builds URL params (operation, day, constraint, keepDays, theme, budgetCap) → routes to `/dashboard` with query string
3. **Budget optimization:** Routes to `/budget` with target and constraint params
4. **Leftover reuse:** Routes to `/leftovers` with focus param

The copilot **never directly modifies the plan or meals**. It always routes to a review workflow where the user confirms changes. This is by design ("controlled review, not automatic black-box change").

### Personalization

**Onboarding-collected preferences:**
- Household size, cooking goal, dietary restrictions, cuisine preferences, spice tolerance, budget style, picky eater mode, dislikes, skill level, weekly budget

**Runtime personalization in Tonight engine:**
1. Leftover matching (highest priority)
2. Pantry ingredient matching
3. Grocery item matching
4. Budget constraint (cheapest when under pressure)
5. Dietary preference filtering
6. **Cuisine preference matching** (Priority 6 in tonight engine)
7. Cook time constraint
8. Budget goal from profile

**Learning-based personalization:**
- Top cuisines/proteins injected into prompt as "Learned preferences"
- Rejected cuisines/proteins injected as "Disliked"
- Picky score triggers "stick to familiar flavors" instruction

### State Management

```
Client (Zustand)                    Server (Supabase)
─────────────────                   ─────────────────
copilotStore                        meal_signals
  ├─ messages (last 12)             user_preference_snapshot
  ├─ session (id, summary, intent)  copilot_schedule_constraints
  ├─ chips (contextual)             household_preferences
  ├─ activeNudge                    grocery_list_items
  └─ state (collapsed/peek/expanded)
                                    
learningStore                       preference_snapshots
  ├─ feedbackHistory (max 200)      budgets / budget_weekly_spend
  ├─ _cachedSignal                  pantry_items
  └─ _cachedBoosts                  leftovers
```

Flow: User message → `sendMessage()` → POST `/api/copilot/chat` → auth + paywall + rate limit → `buildUserContext()` + `getCrossFeatureSignals()` → `buildCopilotSystemPrompt()` → OpenAI gpt-4o-mini (streaming + tools) → SSE back to client → update messages in store.

### Limitations

1. **No explicit cuisine memory in copilot context** — cuisines from `household_preferences` are injected, but there's no "this week I want Thai" temporary instruction system
2. **No weekly instruction layer** — no mechanism for "this week only" preferences that auto-expire
3. **Learning signals are passive** — extracted from message text, not confirmed with user
4. **No cuisine variety tracking** — doesn't know what cuisines were served this week to avoid repetition
5. **Catalog is small** — 21 curated meals in Tonight catalog, no explicit cuisine diversity
6. **Plan refinement has `theme` param but it's just a URL param** — no deep cuisine-aware generation
7. **No "memory confirmation" UX** — preferences are saved silently without user seeing what was remembered
8. **Free users get no memory at all** — all learning/preference features are Plus-gated
9. **No cuisine rotation intelligence** — can't say "we had Italian Monday, so avoid Italian tonight"

### Assessment

- **Does it feel generic or specialized?** It feels **specialized and well-scoped**. The personality is distinct ("practical food operator"), the tools are action-oriented, and the context injection is rich. It's not a generic chatbot.
- **Does it already have hidden preference behavior?** **Yes, significantly.** The learning system already tracks cuisine/protein affinities via EMA. The copilot learning module already extracts cuisine mentions from messages. The Tonight engine already uses cuisine preferences (Priority 6). The system prompt already receives learned cuisine preferences.
- **Quality rating: 7.5/10** — The architecture is solid, the action-first design is excellent, the context awareness is deep. What's missing is the *temporal* dimension (this week vs. always) and the *variety* dimension (don't repeat what we just had).

---

## PART 2 — SHOULD CUISINE MEMORY EXIST?

### Use Cases Analyzed

| Use Case | Current Handling | Gap |
|---|---|---|
| "Thai this week" | `refine_weekly_plan` with `theme: 'thai'` routes to planner | No persistent "this week" instruction; next interaction forgets |
| "More Italian dinners" | `save_household_preference` saves "like: more Italian dinners" | Saved as text blob, not structured cuisine weight |
| "No spicy food this week" | Could use `save_household_preference` with "dislike" category | No auto-expiry; becomes permanent unless manually removed |
| "No repeated cuisines" | **No handling at all** | No cuisine-per-day tracking in copilot context |
| "Mediterranean week" | `refine_weekly_plan` with `theme: 'Mediterranean'` | One-shot; doesn't persist across multiple interactions |

### Would This Improve:

- **Retention:** YES — A copilot that remembers "you said Thai this week" and delivers on it across multiple touchpoints (tonight suggestion, plan generation, swap suggestions) creates a reason to come back. The user thinks "MealEase knows what I want right now."
- **Delight:** YES — The moment a user says "Thai this week" and then opens Tonight to see a Thai suggestion without re-asking is a genuine delight moment. It's the difference between a tool and an assistant.
- **Personalization:** YES — This is the missing *temporal* layer. Permanent preferences exist (household_preferences). Learned preferences exist (EMA affinities). What's missing is "right now" preferences that shape the current week.
- **Stickiness:** YES — Weekly instructions create a ritual: "Tell MealEase what kind of week you want." This is a weekly habit trigger that compounds retention.
- **Conversion:** MODERATE — Free users can't use memory features. Showing them "Plus remembers your weekly preferences" after they say "Thai this week" and get a generic response is a natural upgrade moment.

### Risk Assessment:

- **Overcomplicate UX:** LOW — If done conversationally (no new settings screens), complexity is invisible. The user just talks; the system remembers.
- **Settings fatigue:** LOW — No new settings page needed. Memory lives in the conversation and in a small "active instructions" indicator.
- **Confuse users:** LOW-MEDIUM — Risk: user says "Thai this week" and forgets they said it, then wonders why everything is Thai. Mitigation: show a small "Active: Thai week" badge in copilot header.
- **Weaken simplicity:** LOW — The "calm household AI" feeling is *enhanced* by memory, not weakened. A calm assistant that remembers is calmer than one you have to repeat yourself to.

### Verdict: **BUILD MINIMAL**

Build the temporal instruction layer (this-week preferences) and the variety-awareness layer (don't repeat cuisines). Do NOT build a complex preference management UI. Keep it conversational with a small visual indicator.

---

## PART 3 — BEST UX MODEL

### Options Evaluated:

| Option | Pros | Cons | Fit |
|---|---|---|---|
| A. Conversational only | Zero UI overhead | User can't see/manage what's active | ❌ Too invisible |
| B. Hidden AI memory | Magical feeling | User has no control; can feel creepy | ❌ Too opaque |
| C. Settings-based | Full control | Settings fatigue; breaks "calm" feeling | ❌ Too heavy |
| D. Temporary weekly instructions | Clear scope; auto-expires | Needs some UI indicator | ✅ Good fit |
| E. Saved preferences with confirmation | Transparent; user confirms | Extra friction per interaction | ⚠️ Partial fit |
| **F. Hybrid approach** | Best of D + E | Slightly more complex to build | ✅ **Best fit** |

### Recommended Approach: **F — Hybrid (Conversational + Indicator + Auto-Expiry)**

### Why:

The MealEase user is a busy parent at 5pm. They don't want to manage settings. They want to say something once and have it work. But they also need to know *why* tonight's suggestion is Thai (so it doesn't feel random).

The hybrid approach:
1. User says it conversationally → copilot confirms and saves
2. A small indicator shows what's active ("🍜 Thai week" badge)
3. Weekly instructions auto-expire Sunday night
4. Permanent preferences require explicit confirmation ("Should I remember this always, or just this week?")

### UX Flow:

1. User opens copilot and says: "Let's do Thai this week"
2. Copilot responds: "Got it — I'll lean toward Thai for tonight and any plan changes this week. This resets Sunday night."
3. A small badge appears in copilot header: `🍜 Thai week`
4. Tonight suggestion engine receives "thai" as a temporary cuisine boost
5. Any plan refinement this week includes "theme: thai" as a soft constraint
6. Sunday 11:59pm CT: instruction auto-expires
7. If user says "We always love Japanese food" → copilot asks: "Should I remember that permanently, or just this week?" → permanent saves to `household_preferences.cuisines`

---

## PART 4 — MEMORY SYSTEM DESIGN

### Temporary Instructions

- **Scope:** Current week only (expires Sunday 11:59pm CT, matching the 7am CT meal rotation boundary)
- **Examples:**
  - "Thai this week" → `{ type: 'cuisine_boost', value: 'thai', scope: 'week' }`
  - "Quick meals this week" → `{ type: 'time_constraint', value: 30, scope: 'week' }`
  - "No spicy food this week" → `{ type: 'avoid', value: 'spicy', scope: 'week' }`
  - "Budget week — under $60" → `{ type: 'budget_override', value: 60, scope: 'week' }`
  - "No repeated cuisines" → `{ type: 'variety_rule', value: 'no_repeat_cuisine', scope: 'week' }`
- **Auto-expiry:** Sunday 11:59pm CT (aligned with weekly plan cycle)
- **UI indicator:** Small badge in copilot header showing active instruction(s). Max 2-3 visible; overflow shows "+N more"
- **Storage:** `copilot_weekly_instructions` table:
  ```sql
  CREATE TABLE copilot_weekly_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    instruction_type TEXT NOT NULL, -- 'cuisine_boost', 'avoid', 'time_constraint', 'budget_override', 'variety_rule'
    value TEXT NOT NULL,
    label TEXT NOT NULL, -- human-readable: "Thai week", "No spicy"
    emoji TEXT, -- badge emoji
    week_start DATE NOT NULL, -- ISO date of week start (Sunday)
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  CREATE INDEX idx_cwi_user_week ON copilot_weekly_instructions(user_id, week_start);
  ```

### Saved Preferences

- **Scope:** Permanent until changed
- **Examples:**
  - "We love Japanese food" → adds 'japanese' to `household_preferences.cuisines`
  - "Kids hate spicy" → adds 'spicy' to `household_preferences.dislikes`
  - "We're vegetarian" → adds 'vegetarian' to `household_preferences.dietary_restrictions`
  - "Never suggest liver" → adds 'liver' to `household_preferences.disliked_ingredients`
- **Confirmation required:** YES — copilot asks "Should I remember this permanently?" before writing to `household_preferences`
- **Storage:** Existing `household_preferences` table (already has cuisines, dislikes, dietary_restrictions columns)

### Memory Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    COPILOT PROMPT                         │
│                                                          │
│  System prompt + context + ACTIVE INSTRUCTIONS block     │
│                                                          │
│  ACTIVE WEEKLY INSTRUCTIONS:                             │
│  - Thai cuisine boost (expires Sun)                      │
│  - No spicy (expires Sun)                                │
│                                                          │
│  PERMANENT PREFERENCES:                                  │
│  - Cuisines: Japanese, Italian                           │
│  - Dislikes: liver, anchovies                            │
│  - Dietary: vegetarian                                   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              TONIGHT ENGINE                               │
│                                                          │
│  loadPersonalizationContext() now also loads:             │
│  - copilot_weekly_instructions (active this week)        │
│  - Applies as Priority 5.5 (between dietary and cuisine) │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              PLAN REFINEMENT                              │
│                                                          │
│  refine_weekly_plan() receives active instructions       │
│  as soft constraints alongside user's explicit request   │
└─────────────────────────────────────────────────────────┘
```

---

## PART 5 — WHAT SHOULD NOT BE BUILT

### Dangerous Overengineering:

1. ❌ **Cuisine calendar view** — Don't build a visual calendar showing cuisine-per-day. It's settings fatigue disguised as a feature.
2. ❌ **Preference strength sliders** — "How much do you like Thai? (1-10)" — kills the conversational magic.
3. ❌ **Cuisine rotation algorithm** — Don't build a complex rotation system that auto-assigns cuisines to days. Let the user drive.
4. ❌ **Memory management screen** — No dedicated "Manage your memories" page. If they need to clear something, they say "forget that" in copilot.
5. ❌ **Multi-week instruction planning** — "Thai this week, Italian next week" — too complex, too far ahead.
6. ❌ **Cuisine analytics dashboard** — "You ate Italian 3x this week" — interesting but not actionable for a busy parent.
7. ❌ **Automatic cuisine inference from behavior** — Don't auto-set "Thai week" because they accepted 2 Thai meals. That's creepy.
8. ❌ **Conflict resolution UI** — "Your weekly instruction says Thai but your permanent preference says Italian" — just let the weekly instruction win silently.

### Never Expose to Users:

- EMA affinity scores
- Picky score numbers
- Rejection counts
- Internal signal types
- Learning confidence values
- Cross-feature signal internals

### Complexity Budget:

- **Max new tables:** 1 (`copilot_weekly_instructions`)
- **Max new API endpoints:** 1 (GET/DELETE for active instructions, used by badge UI)
- **Max new UI components:** 1 (instruction badge in copilot header)
- **Max new tool definitions:** 1 (modify `save_household_preference` to handle temporal scope)
- **Max prompt additions:** ~100 tokens for active instructions block
- **Total implementation time:** 2-3 days for a senior engineer

---

## PART 6 — RETENTION & PRODUCT IMPACT

### Weekly Habit Formation
**HIGH IMPACT** — "Tell MealEase what kind of week you want" becomes a Sunday ritual. The user opens copilot, says "comfort food week" or "healthy reset week," and the entire system adapts. This is the kind of micro-ritual that drives weekly active usage.

### Family Personalization
**MEDIUM-HIGH IMPACT** — "Kids are at grandma's this weekend — do something adventurous" is a real use case that temporary instructions handle perfectly. The system adapts to the household's *current* state, not just their permanent profile.

### Emotional Attachment
**HIGH IMPACT** — The moment the copilot says "Since you said Thai this week, here's a Pad Thai that uses the chicken you already have" — that's when the user feels understood. It's the compound effect of memory + context + action.

### "MealEase Understands Us" Feeling
**HIGHEST IMPACT** — This is the core emotional value. Permanent preferences say "we know you." Weekly instructions say "we know you *right now*." The combination creates the feeling of a household food assistant that's actually paying attention.

### Plus Conversion
**MEDIUM IMPACT** — Free users who say "Thai this week" and get a generic response + "Plus remembers your weekly preferences" upgrade message will convert at a higher rate than generic upgrade prompts. It's a *felt* limitation, not an abstract one.

---

## PART 7 — IMPLEMENTATION STRATEGY

### Exact UX Flow

1. **User says temporal preference:** "Thai this week" / "Quick meals only this week" / "No repeats"
2. **Copilot detects temporal intent:** Regex/NLP identifies week-scoped instruction
3. **Copilot confirms:** "Got it — leaning Thai this week. Resets Sunday night. 🍜"
4. **Instruction persisted:** Written to `copilot_weekly_instructions` with auto-expiry
5. **Badge appears:** Small pill in copilot header: `🍜 Thai week`
6. **Tonight engine reads instructions:** `loadPersonalizationContext()` includes active weekly instructions
7. **Plan refinement respects instructions:** Any plan operation this week includes instruction as soft constraint
8. **Copilot prompt includes instructions:** Active instructions block injected into system prompt
9. **Sunday expiry:** Cron or lazy-check removes expired instructions
10. **Next week:** Clean slate unless user sets new instructions

### Memory Architecture

```typescript
// New: lib/copilot/weekly-instructions.ts

export interface WeeklyInstruction {
  id: string
  type: 'cuisine_boost' | 'cuisine_avoid' | 'time_constraint' | 'budget_override' | 'variety_rule' | 'general'
  value: string
  label: string
  emoji: string
  expiresAt: string // ISO timestamp
}

export async function getActiveInstructions(supabase: SupabaseClient, userId: string): Promise<WeeklyInstruction[]> {
  const { data } = await supabase
    .from('copilot_weekly_instructions')
    .select('*')
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5)
  return (data ?? []).map(row => ({
    id: row.id,
    type: row.instruction_type,
    value: row.value,
    label: row.label,
    emoji: row.emoji ?? '📌',
    expiresAt: row.expires_at,
  }))
}

export async function saveWeeklyInstruction(
  supabase: SupabaseClient,
  userId: string,
  instruction: Omit<WeeklyInstruction, 'id' | 'expiresAt'>,
): Promise<void> {
  const weekEnd = getNextSundayMidnight() // Sunday 11:59pm CT
  await supabase.from('copilot_weekly_instructions').insert({
    user_id: userId,
    instruction_type: instruction.type,
    value: instruction.value,
    label: instruction.label,
    emoji: instruction.emoji,
    week_start: getCurrentWeekStart(),
    expires_at: weekEnd.toISOString(),
  })
}

export function extractWeeklyInstruction(text: string): Partial<WeeklyInstruction> | null {
  const lower = text.toLowerCase()
  
  // Cuisine boost: "Thai this week", "Italian week", "Let's do Mexican"
  const cuisineMatch = lower.match(/\b(thai|italian|mexican|indian|mediterranean|japanese|korean|chinese|french|greek|nepali|american)\b.*\b(this week|week|tonight)\b/)
  if (cuisineMatch) {
    return { type: 'cuisine_boost', value: cuisineMatch[1], label: `${capitalize(cuisineMatch[1])} week`, emoji: cuisineEmoji(cuisineMatch[1]) }
  }
  
  // Avoid: "No spicy this week", "Skip seafood this week"
  const avoidMatch = lower.match(/\b(no|skip|avoid|without)\b\s+(\w+).*\b(this week|week)\b/)
  if (avoidMatch) {
    return { type: 'cuisine_avoid', value: avoidMatch[2], label: `No ${avoidMatch[2]}`, emoji: '🚫' }
  }
  
  // Time: "Quick meals this week", "Under 30 min this week"
  const timeMatch = lower.match(/\b(quick|fast|under (\d+))\b.*\b(this week|week)\b/)
  if (timeMatch) {
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 25
    return { type: 'time_constraint', value: String(minutes), label: `Quick week (≤${minutes}min)`, emoji: '⚡' }
  }
  
  // Variety: "No repeated cuisines", "Different every night"
  if (/\b(no repeat|variety|different every|mix it up)\b/.test(lower)) {
    return { type: 'variety_rule', value: 'no_repeat_cuisine', label: 'Variety mode', emoji: '🎲' }
  }
  
  return null
}
```

### Prompt Handling

Add to `buildCopilotSystemPrompt()` context parameter:

```typescript
weeklyInstructions?: Array<{ label: string; type: string; value: string }>
```

Inject into system prompt:

```
${context.weeklyInstructions?.length ? `
ACTIVE WEEKLY INSTRUCTIONS (auto-expire Sunday):
${context.weeklyInstructions.map(i => `- ${i.label} (${i.type}: ${i.value})`).join('\n')}
Respect these as soft constraints for all suggestions, swaps, and plan operations this week.
If the user's request conflicts with a weekly instruction, the explicit request wins.
` : ''}
```

### AI Orchestration

Modify `save_household_preference` tool or add a new tool:

```typescript
{
  type: 'function',
  function: {
    name: 'set_weekly_instruction',
    description: 'Set a temporary weekly instruction that shapes suggestions, swaps, and plans until Sunday night',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['cuisine_boost', 'cuisine_avoid', 'time_constraint', 'budget_override', 'variety_rule', 'general'],
        },
        value: { type: 'string', description: 'The instruction value (cuisine name, time in minutes, budget amount, or rule)' },
        label: { type: 'string', description: 'Human-readable label for the badge (e.g., "Thai week", "No spicy")' },
        emoji: { type: 'string', description: 'Single emoji for the badge' },
      },
      required: ['type', 'value', 'label', 'emoji'],
    },
  },
}
```

### Fallback Behavior

- **Memory empty:** System works exactly as today — no degradation
- **Conflicting instructions:** Last-set wins (most recent instruction takes priority)
- **Instruction + explicit request conflict:** Explicit request wins ("Thai week" is active but user says "give me Italian tonight" → serve Italian)
- **Instruction + dietary conflict:** Dietary restrictions always win (instruction is soft, dietary is hard)
- **No matching meals in catalog:** Gracefully ignore instruction, serve best available, mention "I couldn't find a Thai option tonight, but here's something close"

### Edge Cases

| Edge Case | Handling |
|---|---|
| User sets 5+ instructions | Cap at 3 active; oldest auto-removed with notice |
| User says "forget Thai week" | Delete instruction; confirm "Cleared — back to normal suggestions" |
| User says "Thai this week" on Saturday | Still set it; expires tomorrow. Copilot notes "That's just tonight and tomorrow — want me to set it for next week too?" |
| User says "always Thai" | Route to permanent preference save (household_preferences.cuisines) |
| Instruction conflicts with plan already generated | Don't retroactively change plan; apply to new suggestions and swaps only |
| User on free tier says "Thai this week" | Respond with upgrade message: "Plus remembers weekly preferences and shapes every suggestion around them." |

### Mobile UX

- **Badge placement:** Inside copilot header, right-aligned, small pill with emoji + short label
- **Badge tap:** Opens a mini-sheet showing all active instructions with "Clear" buttons
- **No new screens:** Everything happens in copilot conversation
- **Voice-friendly:** "Thai this week" works identically via voice input
- **Haptic feedback:** Light haptic on instruction save confirmation

### Free vs Plus

| Feature | Free | Plus |
|---|---|---|
| Say cuisine preferences | ✅ (copilot acknowledges) | ✅ |
| Weekly instructions persist | ❌ (upgrade prompt) | ✅ |
| Instructions shape Tonight | ❌ | ✅ |
| Instructions shape Plan | ❌ | ✅ |
| Badge indicator | ❌ | ✅ |
| "Forget" / manage instructions | ❌ | ✅ |
| Permanent preference saving | ❌ (upgrade prompt) | ✅ |

---

## PART 8 — THE HONEST ANSWER

Would adding this feature make MealEase:

### More magical: **YES**

The gap between "I told it Thai this week and it remembered across every touchpoint" and "I have to re-specify Thai every time I interact" is the gap between an assistant and a search box. The existing infrastructure (learning signals, preference snapshots, context injection) is 80% there. The missing 20% is the *temporal instruction layer* — the ability to say "right now I want X" and have it stick for a defined period.

### More useful: **YES**

Real households have weekly rhythms. "This is a busy week — quick meals only." "We're trying to eat healthier this week." "The kids are gone — let's do date-night food all week." These are real, common, high-value use cases that the current system cannot serve without the user repeating themselves every interaction.

### More sticky: **YES**

Weekly instructions create a **weekly engagement ritual**. The user opens MealEase Sunday evening, tells copilot what kind of week they want, and then the system delivers on that promise all week. This is the kind of habit loop (trigger → action → reward → investment) that drives long-term retention.

### OR would it add complexity without meaningful value?

**No.** The implementation is minimal (1 table, 1 tool, ~100 tokens in prompt, 1 badge component). The existing architecture already supports 90% of this — the context injection pipeline, the learning system, the preference-aware Tonight engine, the tool-calling pattern. What's missing is literally just a "temporary instruction" concept with auto-expiry.

The risk of *not* building this is higher than the risk of building it: without temporal preferences, the copilot feels like it has amnesia within the same week. Users will say "I already told you Thai" and feel frustrated.

### Final Honest Assessment:

This is one of those rare features where the implementation cost is low, the infrastructure is already there, the user need is real and frequent, and the emotional payoff is high. The copilot already has memory (learning signals, preference snapshots, schedule constraints). It just doesn't have *weekly intent* memory. Adding it completes the memory hierarchy: permanent preferences → learned affinities → weekly instructions → conversation context. Each layer serves a different time horizon, and the weekly layer is the missing middle.

---

## PART 9 — FINAL RECOMMENDATION

| # | Dimension | Assessment |
|---|---|---|
| 1 | **Current copilot quality** | **7.5/10** — Excellent architecture, strong personality, rich context awareness, good tool coverage. Missing temporal preference layer and variety awareness. |
| 2 | **Should this feature exist** | **YES (minimal version)** — Build the weekly instruction layer. Don't build preference management UI, cuisine calendars, or rotation algorithms. |
| 3 | **Why** | The copilot already has permanent preferences and learned affinities. The missing piece is "what do I want *this week*" — a temporal instruction that shapes all touchpoints for 7 days then disappears. This completes the memory hierarchy without adding complexity. |
| 4 | **Best UX** | **Conversational + badge indicator + auto-expiry.** User says it in chat, copilot confirms, badge shows it's active, Sunday night it expires. No settings screens. No management UI. Say "forget it" to clear. |
| 5 | **What to avoid** | Cuisine calendars, preference sliders, rotation algorithms, multi-week planning, analytics dashboards, automatic inference, conflict resolution UI, dedicated memory management screens. |
| 6 | **Ideal memory behavior** | Three-tier: (1) Permanent preferences from onboarding/explicit saves → always active. (2) Learned affinities from behavior → soft boost/penalty. (3) Weekly instructions from conversation → strong boost for 7 days then gone. Explicit request in conversation always overrides all layers. |
| 7 | **Suggested architecture** | 1 new table (`copilot_weekly_instructions`), 1 new tool (`set_weekly_instruction`), ~100 tokens added to system prompt, 1 badge component in copilot header, modify `loadPersonalizationContext()` to read active instructions. Total: 2-3 days implementation. |
| 8 | **Retention impact** | **HIGH** — Creates weekly ritual, compounds "it understands us" feeling, makes copilot feel like it has continuity across the week. |
| 9 | **Monetization impact** | **MEDIUM** — Natural Plus upgrade moment when free users try to set weekly preferences. Not a primary conversion driver but a strong supporting signal. |
| 10 | **Final recommendation** | **Build the weekly instruction layer as the next copilot enhancement.** It's low-cost, high-impact, architecturally clean, and completes the memory hierarchy. Ship it as a Plus feature with a clear free-tier upgrade moment. Implement in this order: (1) table + extraction logic, (2) tool definition + executor, (3) prompt injection, (4) Tonight engine integration, (5) badge UI component. |

---

## APPENDIX: Implementation Priority Order

```
Week 1 (2-3 days):
├── Create copilot_weekly_instructions table + RLS policies
├── Build extractWeeklyInstruction() detection logic
├── Add set_weekly_instruction tool to COPILOT_TOOLS
├── Implement tool executor in route.ts
├── Inject active instructions into system prompt
└── Add to PLUS_ONLY_COPILOT_TOOL_NAMES

Week 2 (1-2 days):
├── Modify loadPersonalizationContext() to read active instructions
├── Add instruction-aware priority in Tonight engine
├── Build InstructionBadge component for copilot header
├── Add "forget" / clear instruction handling
└── Add free-tier upgrade message for instruction attempts

Future (optional):
├── Variety tracking (what cuisines served this week)
├── "No repeat" rule enforcement in Tonight engine
├── Sunday evening "set your week" proactive nudge
└── Instruction suggestions based on past weekly patterns
```

---

*End of analysis. This document is actionable — if the decision is to build, the architecture section is implementable as-is.*