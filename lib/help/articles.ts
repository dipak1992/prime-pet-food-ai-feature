import type { HelpArticle, HelpCategory } from './types'

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Set up your household and get your first dinner suggestion.',
    icon: '🌱',
  },
  {
    id: 'tonight',
    title: 'Tonight Suggestions',
    description: "Your daily 'what's for dinner' answer.",
    icon: '🍽️',
  },
  {
    id: 'snap-cook',
    title: 'Snap & Cook',
    description: 'Scanning your fridge, menus, and food.',
    icon: '📸',
  },
  {
    id: 'leftovers',
    title: 'Leftovers AI',
    description: 'Saving leftovers and turning them into new meals.',
    icon: '🍱',
  },
  {
    id: 'autopilot',
    title: 'Weekly Autopilot',
    description: 'Generating and editing your weekly plan.',
    icon: '📅',
  },
  {
    id: 'budget',
    title: 'Budget Intelligence',
    description: 'Setting a budget and tracking spending.',
    icon: '💰',
  },
  {
    id: 'billing',
    title: 'Billing & plans',
    description: 'Subscriptions, payments, and refunds.',
    icon: '💳',
  },
  {
    id: 'account',
    title: 'Account & privacy',
    description: 'Profile, data, household members.',
    icon: '👤',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: "When something doesn't work the way it should.",
    icon: '🔧',
  },
]

export const HELP_ARTICLES: HelpArticle[] = [
  // --- Getting started ---
  {
    slug: 'what-is-mealease',
    category: 'getting-started',
    title: 'What is MealEase?',
    description: 'The 30-second overview.',
    updatedAt: '2024-12-15',
    body: `MealEase is a household meal planner. It answers five real questions your kitchen asks every week:

**1. What's for dinner?** Open the app — we've picked tonight's meal for you.
**2. What's in my fridge?** Point your camera at it and we'll find a recipe.
**3. What's this week?** One tap, seven dinners planned.
**4. What do I do with leftovers?** We turn them into new meals automatically.
**5. What will it cost?** See your week's grocery total before you shop.

That's it. No counting calories, no shame, no endless recipe feed to scroll.`,
  },
  {
    slug: 'set-up-household',
    category: 'getting-started',
    title: 'Setting up your household',
    description: 'The 30-second onboarding that makes everything else work.',
    updatedAt: '2024-12-15',
    body: `When you sign up, we ask five quick questions:

**Household size** — solo, couple, or family? This sets portion sizes.
**Dietary needs** — vegetarian, gluten-free, anything else. We respect these absolutely.
**Dislikes** — ingredients to avoid. We'll never suggest them.
**Skill level** — are you comfortable with a 10-ingredient recipe, or do you want simple?
**Budget** — optional weekly number. Skip if you're not ready.

Takes about 30 seconds. You can change everything later in Settings.`,
    relatedSlugs: ['what-is-mealease', 'change-preferences'],
  },
  {
    slug: 'change-preferences',
    category: 'getting-started',
    title: 'Changing your preferences later',
    description: 'Update household size, diet, or dislikes anytime.',
    updatedAt: '2024-12-15',
    body: `Head to Settings → Cooking preferences. You can:

- Change household size (1 to 6+)
- Add or remove dietary needs
- Add ingredients to avoid
- Change your skill level
- Redo onboarding from scratch if a lot has changed

Changes apply immediately to the next suggestion you get.`,
  },

  // --- Tonight ---
  {
    slug: 'how-tonight-works',
    category: 'tonight',
    title: 'How Tonight Suggestions work',
    description: 'Why we picked this specific meal for you.',
    updatedAt: '2024-12-15',
    body: `Every evening we look at a few things:

- **Your household** — size, preferences, dislikes
- **Your pantry** — if you've scanned recently
- **Your active leftovers** — if any are expiring
- **Day of the week** — weeknight vs. weekend prep time
- **Variety** — what you've cooked recently

We pick one meal. Not a feed of 50. One. If you don't love it, tap "Show another" and we'll pick again.`,
    relatedSlugs: ['why-this-recipe', 'show-another'],
  },
  {
    slug: 'why-this-recipe',
    category: 'tonight',
    title: "Why did we suggest this recipe?",
    description: "Understanding the 'Why this?' line.",
    updatedAt: '2024-12-15',
    body: `Every suggestion includes a short reason. For example:

*"Based on the chicken in your fridge + an easy weeknight prep window."*

That line tells you exactly what we factored in. If it doesn't fit your mood, tap "Show another" and we'll pick a different one with a different reason.`,
  },
  {
    slug: 'show-another',
    category: 'tonight',
    title: "I don't like tonight's suggestion",
    description: 'Get a different pick in one tap.',
    updatedAt: '2024-12-15',
    body: `Tap "Show another" below the recipe card. We'll pick a different meal from the same pool, factoring in why the first one didn't fit.

If you keep getting suggestions you don't love, it usually means your preferences need an update. Head to Settings → Cooking preferences and add anything we're missing.`,
  },

  // --- Snap & Cook ---
  {
    slug: 'how-to-scan-fridge',
    category: 'snap-cook',
    title: 'How to scan your fridge',
    description: 'Best practices for accurate recognition.',
    updatedAt: '2024-12-15',
    body: `A few tips for the best results:

**Good lighting.** Open the fridge, turn on the kitchen light, don't rely on just the fridge bulb.

**Items facing forward.** We can't read labels on things tucked behind the milk.

**One photo, not a video.** Hold the camera steady for a second before tapping.

**Shelf by shelf is fine.** If your fridge is packed, take two or three scans. We'll combine them.

We recognize the 500+ most common ingredients with about 94% accuracy. You can always tap to correct — and we learn from your corrections.`,
    relatedSlugs: ['scan-limits', 'fix-wrong-ingredient'],
  },
  {
    slug: 'scan-limits',
    category: 'snap-cook',
    title: 'Free vs. Plus scan limits',
    description: 'How many scans you get per week and month.',
    updatedAt: '2024-12-15',
    body: `**Free plan:**
- 3 Snap & Cook scans per week (fridge, menu, food)

**Plus plan:**
- Unlimited Snap & Cook scans
- Unlimited Leftovers AI suggestions
- Budget Intelligence tracking

Counters reset Monday at midnight your local time. If you hit a limit, we'll tell you clearly — no surprises, no silent failures.`,
    relatedSlugs: ['how-to-scan-fridge'],
  },
  {
    slug: 'fix-wrong-ingredient',
    category: 'snap-cook',
    title: 'The scan got an ingredient wrong',
    description: 'How to correct it in two taps.',
    updatedAt: '2024-12-15',
    body: `After any scan, you can tap any ingredient chip to:

- **Remove it** (we misread it)
- **Rename it** (it's close but not quite right)

Then tap "+ Add ingredient" to add anything we missed. Every correction makes future scans better.`,
  },

  // --- Leftovers ---
  {
    slug: 'how-leftovers-work',
    category: 'leftovers',
    title: 'How Leftovers AI works',
    description: 'From cooked meal to new meal, automatically.',
    updatedAt: '2024-12-15',
    body: `When you mark a meal as cooked, we'll ask:

> "Any leftovers to save for tomorrow?"

If yes, tell us roughly how many servings. We'll remember:

- What it was (recipe + main ingredients)
- When you cooked it
- When it's likely to expire
- Roughly what it cost

Then, when you open the app over the next few days, we'll nudge you to use it — and suggest 2–3 new meals that transform it into something new (tacos, stir-fry, fried rice, soup, whatever fits).`,
    relatedSlugs: ['leftover-expiry', 'leftover-suggestions-limit'],
  },
  {
    slug: 'leftover-expiry',
    category: 'leftovers',
    title: 'When do leftovers expire?',
    description: 'How we calculate the expiration date.',
    updatedAt: '2024-12-15',
    body: `We use USDA-backed food safety guidelines. Rough shelf life (refrigerated, properly stored):

- **Fish:** 2 days
- **Poultry, cooked meat:** 3 days
- **Casseroles, pasta bakes:** 3 days
- **Soups, stews, chili:** 4 days
- **Cooked rice, grains:** 4–5 days

The expiration date is set from the ingredient with the shortest shelf life. Always use your senses too — if something smells or looks off, trust that.`,
  },
  {
    slug: 'leftover-suggestions-limit',
    category: 'leftovers',
    title: 'How many leftover ideas can I get?',
    description: 'Free vs. Plus limits on AI suggestions.',
    updatedAt: '2024-12-15',
    body: `**Free:** 2 AI recipe ideas per week across all your leftovers.
**Plus:** Unlimited.

You can always view, edit, and mark leftovers as used — those are free forever. The limit is only on AI-generated new recipes.`,
  },

  // --- Autopilot ---
  {
    slug: 'how-autopilot-works',
    category: 'autopilot',
    title: 'How Weekly Autopilot works',
    description: 'Seven dinners, one tap.',
    updatedAt: '2024-12-15',
    body: `Tap "Run Autopilot" on the Plan page. We'll consider:

- Your household size and dietary needs
- Active leftovers (we'll use them first)
- What's in your pantry
- Your weekly budget (if set)
- Variety — no chicken 3 nights in a row
- Skill level on weekdays, a touch more on weekends

You'll get 7 dinners in about 10 seconds. Drag to reorder, tap to swap, or lock a meal to keep it when you re-run.`,
    relatedSlugs: ['swap-meal', 'lock-meal'],
  },
  {
    slug: 'swap-meal',
    category: 'autopilot',
    title: "Swapping a meal you don't want",
    description: 'Tap, pick an alternative, done.',
    updatedAt: '2024-12-15',
    body: `On the Plan page, tap any day. You'll see 5 ranked alternatives. Each shows:

- Cost (per meal and per serving)
- Prep time
- Whether it uses a leftover
- Whether it fits your budget
- A one-line reason why we ranked it

Pick one. It replaces that day. No other days change.`,
  },
  {
    slug: 'lock-meal',
    category: 'autopilot',
    title: 'Locking a meal',
    description: 'Keep a specific day when re-running Autopilot.',
    updatedAt: '2024-12-15',
    body: `Tap the lock icon on any day card. That meal is pinned — Autopilot won't replace it, even if you re-run.

Unlock by tapping the icon again. Locked meals show a small terracotta lock badge so you can see at a glance which days are fixed.`,
  },

  // --- Budget ---
  {
    slug: 'set-budget',
    category: 'budget',
    title: 'Setting a weekly budget',
    description: 'How to set and change your target.',
    updatedAt: '2024-12-15',
    body: `Go to Settings → Budget, or tap the budget bar on the dashboard. Pick a weekly number from the slider or type one in.

**Most households:**
- 1–2 people: $90–$130/week
- 3–4 people: $160–$220/week
- 5+ people: $240–$320/week

The number is a guardrail, not a limit. We warn you when you're trending over, but we never stop you from cooking what you want.`,
    relatedSlugs: ['strict-mode', 'over-budget'],
  },
  {
    slug: 'strict-mode',
    category: 'budget',
    title: 'What is strict mode?',
    description: 'Hard budget cap vs. soft guardrail.',
    updatedAt: '2024-12-15',
    body: `**Soft mode (default):** We show warnings when you're close to or over budget, but Autopilot can still suggest meals that exceed it.

**Strict mode:** Autopilot will refuse to generate any plan that goes over your weekly budget. If nothing fits, we'll tell you and suggest you raise the budget.

Toggle in Settings → Budget → Strict mode. Most households start soft and stay soft.`,
  },
  {
    slug: 'over-budget',
    category: 'budget',
    title: "I'm over budget — what do I do?",
    description: 'Swap to cheaper meals in one tap.',
    updatedAt: '2024-12-15',
    body: `When you're over budget, the budget bar turns red and the dashboard shows a nudge: "Want us to swap the rest of the week to lower-cost meals?"

Tap it, and Autopilot re-optimizes only the un-cooked, un-locked days with cheaper alternatives. Your locked meals and anything you've already cooked stay untouched.

You can also manually swap any day — see the Autopilot section.`,
  },

  // --- Billing ---
  {
    slug: 'upgrade-plan',
    category: 'billing',
    title: 'Upgrading to Plus or Family',
    description: 'Two taps, secured by Stripe.',
    updatedAt: '2024-12-15',
    body: `Go to [Pricing](/pricing) or tap any "Upgrade" prompt in the app. Pick your plan, click the button, and Stripe handles the rest.

Your plan upgrades immediately — you don't lose your current trial or billing cycle.`,
    relatedSlugs: ['cancel-plan', 'billing-issues'],
  },
  {
    slug: 'cancel-plan',
    category: 'billing',
    title: 'Canceling your subscription',
    description: 'Two taps, no calls, no guilt.',
    updatedAt: '2024-12-15',
    body: `Go to Settings → Billing → Manage billing. That opens the Stripe customer portal, where you can cancel in two taps.

Your plan stays active until the end of the billing period. No early cancellation fees, ever. All your data stays — you just drop back to the Free plan.`,
  },
  {
    slug: 'billing-issues',
    category: 'billing',
    title: 'My payment failed',
    description: 'What happens and how to fix it.',
    updatedAt: '2024-12-15',
    body: `If a payment fails, Stripe retries automatically over 7 days. During that window:

- Your plan stays active
- You'll get an email with a link to update your payment method
- The app shows a soft warning in Settings → Billing

If the retry window ends without success, your plan drops to Free. Update your card and upgrade again — your data is waiting.

Contact hello@mealeaseai.com if you get stuck.`,
  },
  {
    slug: 'refunds',
    category: 'billing',
    title: 'Refunds',
    description: 'Our refund policy in plain English.',
    updatedAt: '2024-12-15',
    body: `We offer a full refund within 14 days of your first paid charge, no questions asked. Email hello@mealeaseai.com with your account email and we'll process it within 2 business days.

For refunds beyond 14 days, contact us and tell us what happened. We're human and we'll do the right thing.`,
  },

  // --- Account ---
  {
    slug: 'household-members',
    category: 'account',
    title: 'Adding household members',
    description: 'Share plans, lists, and leftovers.',
    updatedAt: '2024-12-15',
    body: `On Plus, you can add 1 additional member. On Family, up to 6.

Settings → Household → Invite someone. They get an email with a link to join your household. Once they accept, you share:

- The weekly meal plan
- The grocery list
- Leftover tracking
- Preferences (dietary, dislikes)

Each member has their own login. The household owner manages billing.`,
  },
  {
    slug: 'export-data',
    category: 'account',
    title: 'Exporting your data',
    description: 'Get everything as a JSON file.',
    updatedAt: '2024-12-15',
    body: `Settings → Your data → Export. You get a JSON file containing:

- Profile and preferences
- All meal plans (past and current)
- Leftover history
- Budget history
- Scan history (metadata, not images)

It's your data. Take it with you anytime.`,
  },
  {
    slug: 'delete-account',
    category: 'account',
    title: 'Deleting your account',
    description: 'Soft delete with a 30-day recovery window.',
    updatedAt: '2024-12-15',
    body: `Settings → Your data → Delete my account. You'll need to type DELETE to confirm.

**What happens:**
1. Your account is marked for deletion immediately
2. You're logged out
3. Your data is kept for 30 days — email us within that window to recover
4. After 30 days, everything is permanently deleted

If you change your mind within 30 days, email hello@mealeaseai.com from the account's email address.`,
  },

  // --- Troubleshooting ---
  {
    slug: 'scan-not-working',
    category: 'troubleshooting',
    title: "The scanner isn't working",
    description: 'Camera permissions and common fixes.',
    updatedAt: '2024-12-15',
    body: `**If the camera doesn't open:**
1. Check browser permissions — camera access must be allowed for mealeaseai.com
2. On iOS, open in Safari (not in-app browsers)
3. Make sure nothing else is using the camera (close other tabs)

**If scans keep failing:**
1. Check your internet connection
2. Try better lighting — dim fridges don't photograph well
3. Upload a photo instead of using the live camera (tap the gallery icon)

Still stuck? Email hello@mealeaseai.com with your device and browser info.`,
  },
  {
    slug: 'autopilot-failing',
    category: 'troubleshooting',
    title: "Autopilot isn't generating anything",
    description: 'Usually a strict-mode or preferences issue.',
    updatedAt: '2024-12-15',
    body: `If Autopilot returns "No plan possible," it's usually one of:

**Strict mode + tight budget:** Turn off strict mode, or raise your weekly budget.

**Too many restrictions:** If you have many dietary needs + dislikes, the pool shrinks. Try relaxing one.

**No household info:** Make sure Settings → Cooking preferences has at least a household size.

**Temporary issue on our end:** Try again in a minute. If it keeps failing, email us.`,
  },
  {
    slug: 'notifications-not-working',
    category: 'troubleshooting',
    title: "I'm not getting notifications",
    description: 'Check preferences and browser permissions.',
    updatedAt: '2024-12-15',
    body: `**Email notifications:**
1. Check Settings → Notifications — the toggles you want must be on
2. Check your spam folder
3. Make sure hello@mealeaseai.com is in your contacts

**Push notifications:**
Push is in beta — it's coming soon but not fully wired up yet. For now, rely on email + in-app nudges.`,
  },
]

export function getCategory(id: string) {
  return HELP_CATEGORIES.find((c) => c.id === id) ?? null
}

export function getArticlesInCategory(id: string) {
  return HELP_ARTICLES.filter((a) => a.category === id)
}

export function getArticle(categoryId: string, slug: string) {
  return (
    HELP_ARTICLES.find((a) => a.category === categoryId && a.slug === slug) ??
    null
  )
}

export function getRelatedArticles(article: HelpArticle) {
  if (!article.relatedSlugs) return []
  return article.relatedSlugs
    .map((s) => HELP_ARTICLES.find((a) => a.slug === s))
    .filter((a): a is HelpArticle => !!a)
}
