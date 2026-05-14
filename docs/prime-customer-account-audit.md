# Prime Pet Food — Customer Account Experience Audit

## Implementation-Ready Strategy Document for GPT 5.5

**Audit Date:** May 2025
**Auditor Perspective:** Ecommerce UX strategist, CRO expert, retention specialist, mobile-first designer
**Store:** theprimepetfood.com
**Brand:** Prime Pet Food — Premium Himalayan Yak Cheese Dog Chews

---

# 1. Overall Account Experience Score

| Area | Current Score | Target Score |
|---|---|---|
| **Login Page** | 4.5/10 | 9.0/10 |
| **Sign Up Page** | 3.5/10 | 9.0/10 |
| **Forgot Password** | 3.0/10 | 8.5/10 |
| **Account Dashboard** | 2.5/10 | 9.5/10 |
| **Order History** | 3.5/10 | 9.0/10 |
| **Order Detail** | 5.0/10 | 9.0/10 |
| **Address Management** | 3.0/10 | 8.5/10 |
| **Subscription Management** | 2.0/10 | 9.5/10 |
| **Mobile UX** | 3.0/10 | 9.5/10 |
| **Personalization** | 1.5/10 | 9.0/10 |
| **Retention/Reorder** | 1.0/10 | 9.5/10 |
| **Emotional Engagement** | 2.0/10 | 9.0/10 |
| **OVERALL** | **2.9/10** | **9.2/10** |

### Verdict

The customer account experience is currently **the weakest part of the entire Prime Pet Food store**. While the homepage (9.2/10), product pages, and collection pages have been elevated to premium DTC standards, the account area remains a completely default Shopify experience with zero brand customization, zero emotional engagement, and zero retention mechanics. This is the single biggest missed opportunity for repeat revenue and customer lifetime value.

---

# 2. Login Page Audit

## Current State

**Template:** `templates/customers/login.json` → `sections/main-login.liquid`

The login page uses the theme's built-in `main-login` section with an image-with-text layout. It includes:
- A hero image (product photo) on the left
- Login form on the right
- Copy: "Enter your email and password below for fast check out and exclusive discounts."
- Header text: "NO SWEAT SIGNUP FOR EXCLUSIVE DISCOUNT" (grammatically incorrect, all-caps)
- "Sign in with Shop" button enabled
- Link to register page
- Forgot password recovery form (hidden, revealed via anchor)

## Issues

### Issue 1: Generic, Discount-Focused Copy 🔴
**Current:** "Enter your email and password below for fast check out and exclusive discounts."
**Problem:** This reads like a generic ecommerce template. It doesn't mention dogs, chews, enrichment, or anything that connects to the Prime Pet Food brand. The word "discount" cheapens the premium positioning.

**Recommendation:** REDESIGN
```
Welcome back to your dog's chew routine.
Sign in to manage orders, track enrichment, and reorder your dog's favorite chews.
```

### Issue 2: "NO SWEAT SIGNUP FOR EXCLUSIVE DISCOUNT" Header 🔴
**Problem:** All-caps, grammatically incorrect ("SIGNUP" should be "SIGN UP"), discount-focused, and doesn't match the calm, premium brand voice established across the rest of the store.

**Recommendation:** REMOVE or REDESIGN to:
```
Your dog's enrichment hub
```

### Issue 3: No Trust Messaging on Login 🟠
**Problem:** No reassurance about account security, data privacy, or what the customer gains by logging in. First-time visitors who created an account see no reason to return.

**Recommendation:** ENHANCE — Add subtle trust signals:
- "🔒 Secure login"
- "Your data is never shared"
- Benefits reminder: "Track orders · Manage subscriptions · Reorder in one click"

### Issue 4: No Dog Profile Connection 🟠
**Problem:** The store has a sophisticated dog profile system (`dog-profile-dashboard.liquid`, `dog-profile.js`) but the login page makes zero reference to it. Customers don't know their dog's profile is waiting for them.

**Recommendation:** ENHANCE — Add below login form:
```
🐕 Your dog's profile is saved and ready.
Sign in to see personalized chew recommendations.
```

### Issue 5: Forgot Password UX is Hidden 🟡
**Problem:** The forgot password form is hidden behind an anchor link (`#recover`) and uses CSS `:target` to toggle visibility. This is functional but feels dated and can confuse users on mobile.

**Recommendation:** REDESIGN — Use a modal or dedicated page with clearer UX flow.

### Issue 6: No Social Proof on Login 🟡
**Problem:** No reviews, customer count, or trust indicators. The login page feels isolated from the rest of the brand experience.

**Recommendation:** ENHANCE — Add a small trust bar:
```
★★★★★ 4.9 · Trusted by 1,200+ dog parents
```

## Login Page Redesign Direction

The login page should feel like returning to a **premium wellness portal**, not a generic Shopify login. Key elements:

1. **Left panel:** Warm lifestyle image of a calm dog with a chew + brand messaging
2. **Right panel:** Clean login form with:
   - Welcome back headline with dog emoji
   - Email + password fields
   - "Sign in with Shop" button
   - Forgot password link
   - Benefits reminder strip (Track orders · Manage subscriptions · Reorder)
   - Trust badge row
3. **Mobile:** Full-width form, image becomes subtle background gradient

---

# 3. Sign Up Page Audit

## Current State

**Template:** `templates/customers/register.json` → `sections/main-register.liquid`

The registration page uses the theme's `main-register` section with:
- Copy: "Register for exclusive member-only discounts and faster checkout."
- Standard form: First name, Last name, Email, Password
- No image configured (unlike login page)
- No benefits explanation
- No dog profile integration

## Issues

### Issue 1: Zero Value Proposition 🔴
**Current:** "Register for exclusive member-only discounts and faster checkout."
**Problem:** This gives customers almost no reason to create an account. "Faster checkout" is weak. "Exclusive discounts" is generic. There's no mention of:
- Dog profile memory
- Personalized chew recommendations
- Subscription management
- Reorder convenience
- Enrichment tracking

**Recommendation:** REDESIGN with clear value stack:
```
Create your dog's account

✓ Save your dog's profile for personalized chew sizing
✓ Reorder favorite chews in one click
✓ Manage subscriptions and delivery schedules
✓ Track orders and get enrichment reminders
✓ Access subscriber-only savings
```

### Issue 2: No Image/Visual Context 🔴
**Problem:** The register page has no image configured (`"image": ""` in JSON). It's a bare form on a white background. This is the most critical conversion page for building the customer base and it has zero visual appeal.

**Recommendation:** REDESIGN — Add a warm lifestyle image showing a dog owner and their dog, reinforcing the emotional connection.

### Issue 3: Form is Too Long for Mobile 🟠
**Problem:** Four fields (first name, last name, email, password) without any visual breaks or progressive disclosure. On mobile, this feels like a wall of inputs.

**Recommendation:** SIMPLIFY — Consider:
- Making last name optional (or combining into single "Name" field)
- Adding a "What's your dog's name?" field instead (emotional hook + profile data)
- Progressive disclosure: email + password first, then profile details after account creation

### Issue 4: No Post-Registration Onboarding 🔴
**Problem:** After registration, customers land on a bare account dashboard with zero guidance. There's no:
- Welcome message
- Dog profile setup prompt
- First-order incentive
- Guided tour of account features

**Recommendation:** ENHANCE — Create a post-registration onboarding flow:
1. "Welcome to Prime Pet Food! Let's set up your dog's profile."
2. Quick dog profile wizard (name, breed, weight, chewing style)
3. Personalized chew recommendation
4. "Shop your dog's recommended chew" CTA

### Issue 5: No Social Proof or Trust 🟠
**Problem:** No reviews, customer count, or trust indicators on the registration page.

**Recommendation:** ENHANCE — Add:
```
Join 1,200+ dog parents who trust Prime Pet Food
★★★★★ "Finally a chew I don't have to worry about." — Sarah M.
```

## Sign Up Redesign Direction

Registration should feel like **joining a community**, not filling out a form:

1. **Split layout:** Lifestyle image left, form right
2. **Headline:** "Create your dog's enrichment account"
3. **Value stack:** 5 clear benefits with checkmarks
4. **Minimal form:** Name, email, password + optional "Dog's name" field
5. **Social proof:** One review quote + star rating
6. **Post-submit:** Redirect to dog profile setup wizard, not bare dashboard

---

# 4. Forgot Password / Reset Password Audit

## Current State

**Forgot Password:** Built into `main-login.liquid` via `#recover` anchor toggle
**Reset Password:** `sections/main-reset-password.liquid` — bare Shopify default
**Activate Account:** `sections/main-activate-account.liquid` — bare Shopify default

All three pages use:
- Default Shopify translation strings
- No brand styling beyond base `customer.css`
- No emotional messaging
- No trust reassurance

## Issues

### Issue 1: Reset Password Page is Completely Unstyled 🔴
**Problem:** `main-reset-password.liquid` is 98 lines of bare HTML with zero brand identity. A customer who clicks a password reset email link lands on a page that looks nothing like the rest of the Prime Pet Food experience.

**Recommendation:** REDESIGN — Match the login page's visual treatment with:
- Prime Pet Food branding
- Reassuring copy: "Almost there — set a new password and get back to your dog's chew routine."
- Trust badge

### Issue 2: Activate Account Page is Bare 🔴
**Problem:** Same issue as reset password. New customers who receive an activation email see a completely generic page.

**Recommendation:** REDESIGN — Add:
- Welcome messaging: "Welcome to Prime Pet Food! Set your password to get started."
- Preview of what's inside: "Your account includes order tracking, subscription management, and personalized chew recommendations."

### Issue 3: No Brand Continuity 🟠
**Problem:** These pages break the premium experience chain. A customer goes from a beautifully designed homepage → product page → checkout → then lands on a generic password page.

**Recommendation:** ENHANCE — Apply consistent Prime Pet Food styling (warm cream background, brand typography, orange CTAs) to all auth pages.

---

# 5. Account Dashboard Audit

## Current State

**Template:** `templates/customers/account.json` → `sections/main-account.liquid`

This is the **most critical page** for retention and it's currently the **weakest page on the entire site**. The template JSON is a single line: `{"sections":{"main":{"type":"main-account","settings":{}}},"order":["main"]}` — zero customization.

The dashboard shows:
- "My account" heading
- "View addresses" button + "Log out" button
- "Order history" heading with a data table (order number, date, payment status, fulfillment status, total)
- "Account details" section showing the default address
- That's it. Nothing else.

## Issues

### Issue 1: No Welcome/Personalization 🔴🔴
**Problem:** The dashboard doesn't even greet the customer by name. There's no "Welcome back, Sarah" or any personalization. It's a cold, transactional data dump.

**Recommendation:** REDESIGN — Add personalized welcome:
```
Welcome back, {{ customer.first_name }} 🐕
Here's your enrichment hub.
```

### Issue 2: No Dog Profile Integration 🔴🔴
**Problem:** The store has a sophisticated dog profile system (`dog-profile-dashboard.liquid` with breed detection, chew duration tracking, reorder timing, session logging) but it's **completely disconnected from the account dashboard**. The dog profile lives on a separate page (`/pages/my-dog`) and is never referenced from the account area.

**Recommendation:** REDESIGN — Make the dog profile the **centerpiece** of the account dashboard:
- Dog name, breed, weight, chewing style
- Last chew session logged
- Recommended chew size
- Days until reorder
- "Update profile" link

### Issue 3: No Subscription Visibility 🔴🔴
**Problem:** There is zero subscription management on the account dashboard. The Subscribe & Save page (`prime-subscribe-save.liquid`) has a beautiful preview card showing "Next shipment" and "Skip/Pause/Change" buttons, but the actual account dashboard has none of this. Subscription customers have no way to manage their subscriptions from their account.

**Recommendation:** REDESIGN — Add subscription card:
- Active subscription status
- Next shipment date
- Quick actions: Skip, Pause, Change frequency
- Link to full subscription management (via Shopify's subscription app or Recharge portal)

### Issue 4: No Reorder Functionality 🔴
**Problem:** The #1 action a returning customer wants to do is reorder. The current dashboard forces them to: find their order → click into it → find the product → navigate to the product page → add to cart. This is 5+ clicks for the most common action.

**Recommendation:** REDESIGN — Add "Reorder" section:
- Show last ordered product with image, size, price
- One-click "Reorder" button
- "Your usual: Medium Yak Chew — $XX.XX" with Add to Cart

### Issue 5: No Enrichment/Engagement Content 🔴
**Problem:** The dashboard is purely transactional. There's no content that makes customers want to come back. No tips, no enrichment ideas, no community connection.

**Recommendation:** ENHANCE — Add:
- "Chew tip of the week" card
- "Your dog's enrichment score" (from dog profile data)
- Link to blog content relevant to their dog's breed/size
- "Did you know?" educational snippet

### Issue 6: Order History Table is Desktop-Centric 🟠
**Problem:** The order history uses a `<table>` element that collapses to a stacked layout on mobile via CSS. While functional, it's not optimized for mobile scanning. The mobile layout uses `data-label` attributes for pseudo-labels, which works but feels dated.

**Recommendation:** REDESIGN — Replace table with card-based order list on mobile:
- Order card with: order number, date, status badge (color-coded), total, "View" button
- Most recent order highlighted at top

### Issue 7: "Account Details" Section is Minimal 🟡
**Problem:** Shows only the default address. No email, no name, no account preferences, no communication preferences.

**Recommendation:** ENHANCE — Show:
- Customer name and email
- Default address (editable)
- Communication preferences (email opt-in for enrichment tips, reorder reminders)
- Dog profile summary

### Issue 8: No Empty State Design 🟠
**Problem:** When a new customer has zero orders, the page shows `{{ 'customer.orders.none' | t }}` which renders as a plain text "You haven't placed any orders yet." — no visual treatment, no CTA to shop.

**Recommendation:** REDESIGN — Create an engaging empty state:
```
No orders yet — let's fix that! 🐕
Your dog's first chew is waiting.
[Shop Yak Chews] [Find Your Dog's Size]
```

## Account Dashboard Redesign Direction

The dashboard should be restructured as a **premium enrichment hub** with these sections:

### Section 1: Welcome Header
- Personalized greeting with customer name
- Dog profile summary (if set up) or setup prompt
- Quick stats: total orders, active subscription status, days until reorder

### Section 2: Quick Actions Bar
- 🔄 Reorder last chew (one-click)
- 📦 Track latest order
- 🐕 Update dog profile
- 💳 Manage subscription

### Section 3: Active Subscription Card (if subscriber)
- Next shipment date and product
- Skip/Pause/Change frequency buttons
- Savings summary: "You've saved $XX with Subscribe & Save"

### Section 4: Dog Profile Card
- Dog name, breed, weight, chewing style
- Recommended chew size and estimated duration
- Enrichment score
- "Log a chew session" button
- Reorder timing indicator

### Section 5: Recent Orders
- Card-based layout (not table)
- Most recent order expanded with tracking info
- "Reorder" button on each order
- "View all orders" link

### Section 6: Enrichment Hub
- Chew tip of the week
- Blog article recommendation based on dog profile
- "Your dog's chew routine" suggestions

### Section 7: Account Settings
- Name, email, default address
- Communication preferences
- "Log out" button (moved from top)

---

# 6. Order Detail Page Audit

## Current State

**Template:** `templates/customers/order.json` → `sections/main-order.liquid`

The order detail page shows:
- Back button to account
- Order title with order number
- Order date
- Cancellation info (if applicable)
- `{% render 'post-purchase-chew-education', order: order %}` — **snippet doesn't exist yet**
- Line items table (product, SKU, price, quantity, total)
- Discount allocations
- Fulfillment tracking info
- Order totals (subtotal, shipping, tax, total)
- Billing and shipping addresses

## Issues

### Issue 1: Post-Purchase Education Snippet Missing 🔴
**Problem:** The template references `post-purchase-chew-education` but this snippet doesn't exist in the `snippets/` directory. This is a missed opportunity — the order page is the perfect place to educate customers about their purchase.

**Recommendation:** CREATE — Build the snippet with:
- "How to introduce yak chews to your dog" (first-time buyers)
- "Supervision reminder" safety messaging
- "When to reorder" timing guidance
- "Microwave the nub" tip for end-of-chew
- Size-specific guidance based on ordered variant

### Issue 2: No Reorder Button 🔴
**Problem:** Customers viewing a past order have no quick way to reorder the same items.

**Recommendation:** ENHANCE — Add "Reorder this" button that adds all line items to cart.

### Issue 3: No Product Images 🟠
**Problem:** The line items table shows product titles but no images. This makes it harder to visually identify products, especially on mobile.

**Recommendation:** ENHANCE — Add product thumbnail images to line items.

### Issue 4: Tracking Info Could Be More Prominent 🟡
**Problem:** Fulfillment tracking is buried inside the line item cell. For customers checking order status, this should be the most prominent element.

**Recommendation:** REDESIGN — Add a prominent tracking card above the line items:
- Carrier name + tracking number
- "Track shipment" button (prominent)
- Estimated delivery date (if available)
- Visual progress indicator (ordered → shipped → delivered)

---

# 7. Address Management Audit

## Current State

**Template:** `templates/customers/addresses.json` → `sections/main-addresses.liquid`

Standard Shopify address management with:
- List of saved addresses
- Edit/Delete buttons per address
- Inline edit form (toggle via JS)
- "Add new address" form at bottom
- Full address form: first name, last name, company, address 1, address 2, city, country, province, zip, phone, default checkbox

## Issues

### Issue 1: Inline Edit is Confusing 🟠
**Problem:** Clicking "Edit" expands a full form inline, pushing content down. On mobile, this creates a very long page with multiple expanded forms possible simultaneously.

**Recommendation:** REDESIGN — Use a modal or dedicated edit view instead of inline expansion.

### Issue 2: No Visual Hierarchy 🟡
**Problem:** All addresses look the same. The default address isn't visually distinguished beyond a text label.

**Recommendation:** ENHANCE — Highlight default address with a badge/border and make it visually primary.

### Issue 3: Company Field Unnecessary for DTC 🟡
**Problem:** The "Company" field is shown for all addresses. For a DTC pet food brand, most customers don't need this field.

**Recommendation:** SIMPLIFY — Hide company field by default, show via "Add company name" toggle.

---

# 8. Mobile UX Audit

## Current State

The mobile account experience inherits from `customer.css` which provides basic responsive behavior:
- Tables collapse to stacked card layout via `data-label` pseudo-elements
- Login form goes full-width
- Navigation buttons wrap

## Issues

### Issue 1: No Mobile-Optimized Navigation 🔴
**Problem:** Account navigation is just two buttons ("View addresses" and "Log out") at the top. There's no mobile-friendly navigation for:
- Orders
- Addresses
- Subscriptions
- Dog profile
- Account settings

**Recommendation:** REDESIGN — Add a mobile-first account navigation:
- Tab bar or card grid with icons
- 🏠 Dashboard | 📦 Orders | 🐕 Dog Profile | 💳 Subscription | ⚙️ Settings

### Issue 2: Touch Targets Too Small 🟠
**Problem:** Table links and "Edit" buttons use default sizing. On mobile, these are hard to tap accurately.

**Recommendation:** ENHANCE — Ensure all interactive elements are minimum 44×44px touch targets.

### Issue 3: No Pull-to-Refresh or Loading States 🟡
**Problem:** No visual feedback when navigating between account pages. Pages feel static and unresponsive.

**Recommendation:** ENHANCE — Add subtle loading animations and transitions.

### Issue 4: Login Form Input Sizing 🟠
**Problem:** Form inputs use default theme sizing which may not be optimized for mobile keyboards. No `inputmode` attributes for email fields.

**Recommendation:** ENHANCE — Add `inputmode="email"` to email fields, ensure 16px+ font size to prevent iOS zoom.

---

# 9. CRO / Retention Audit

## Current State

The account area has **zero retention mechanics**. There are no:
- Reorder prompts
- Subscription upsells
- Loyalty indicators
- Engagement hooks
- Return visit incentives

## Issues

### Issue 1: No Reorder Flow 🔴🔴
**Problem:** The single most valuable action (reorder) requires 5+ clicks. There's no "Buy again" button, no "Your usual order" shortcut, no reorder reminder.

**Recommendation:** REDESIGN — Add multiple reorder touchpoints:
- Dashboard: "Reorder your last chew" card
- Order detail: "Reorder this" button
- Email: Reorder reminder based on dog profile timing

### Issue 2: No Subscription Upsell for One-Time Buyers 🔴
**Problem:** Customers who bought one-time see no prompt to subscribe. The Subscribe & Save page exists but is never referenced from the account area.

**Recommendation:** ENHANCE — Add subscription upsell card on dashboard:
```
Save up to 30% with Subscribe & Save
Your Medium Yak Chew delivered every 4 weeks.
[Subscribe & Save →]
```

### Issue 3: No Loyalty/Reward Visibility 🟠
**Problem:** The store has a referral page (`/pages/refer-a-friend`) and a loyalty section (`prime-loyalty-referral.liquid`) but these are invisible from the account dashboard.

**Recommendation:** ENHANCE — Add loyalty card:
- "Give $10, Get $10" referral prompt
- Total savings from subscriptions
- Order milestone badges (1st order, 5th order, etc.)

### Issue 4: No Win-Back for Lapsed Customers 🟠
**Problem:** Customers who haven't ordered in 60+ days see the same dashboard as active customers. No urgency, no incentive to return.

**Recommendation:** ENHANCE — Add conditional messaging:
```
It's been a while! Your dog might be ready for a new chew.
[Shop now →]
```

### Issue 5: No Cross-Sell Opportunities 🟡
**Problem:** The account area shows only what customers have ordered. There's no "You might also like" or "Customers with your dog's breed also ordered" recommendations.

**Recommendation:** ENHANCE — Add personalized product recommendations based on dog profile and order history.

---

# 10. Typography & Readability Audit

## Current State

The account pages use the theme's default typography from `customer.css`:
- Headings: Theme heading font with scale variable
- Body: 1.6rem base size
- Table headers: 1.2rem uppercase
- Buttons: Theme button styles

## Issues

### Issue 1: Typography Doesn't Match Brand 🔴
**Problem:** The rest of the Prime Pet Food store uses a carefully crafted typographic hierarchy (warm serif headings, clean sans-serif body). The account pages use generic theme defaults that feel disconnected.

**Recommendation:** REDESIGN — Apply Prime Pet Food's typographic system:
- Headings: Same warm serif as homepage
- Body: Same clean sans-serif
- Accent text: Same muted warm tones (#6f5a4b, #4d3124)

### Issue 2: Color Palette is Generic 🟠
**Problem:** Account pages use `color-scheme-2` which is a generic theme color scheme. The warm cream (#fff8ef, #fffaf2), sage green, and clay orange that define the Prime Pet Food brand are absent.

**Recommendation:** REDESIGN — Apply brand color palette:
- Background: Warm cream (#fffaf2)
- Cards: White with warm border (#eadfce)
- CTAs: Clay orange (#d2632e / #b85f32)
- Text: Deep brown (#2b1408, #24130d)
- Muted: Warm gray (#6f5a50)

### Issue 3: Spacing is Too Tight 🟡
**Problem:** Account pages feel cramped compared to the spacious, breathable layouts on the homepage and product pages.

**Recommendation:** ENHANCE — Increase vertical spacing between sections, add more padding to cards, use the same generous whitespace as the rest of the store.

---

# 11. SEO-Safe Content Recommendations

Account pages are behind authentication and not indexed by search engines, so SEO impact is minimal. However, the following public-facing elements should be SEO-conscious:

### Login Page (Public)
- Page title: "Sign In — Prime Pet Food Account"
- Meta description: "Sign in to your Prime Pet Food account to manage orders, track subscriptions, and access personalized yak chew recommendations for your dog."

### Register Page (Public)
- Page title: "Create Account — Prime Pet Food Dog Enrichment Hub"
- Meta description: "Create your free Prime Pet Food account for faster reorders, subscription management, personalized chew sizing, and enrichment tracking for your dog."

### Structured Data
- Add `WebPage` schema to login/register pages
- Ensure `BreadcrumbList` schema includes account pages

---

# 12. Remove / Simplify Recommendations

| Element | Current State | Recommendation |
|---|---|---|
| "NO SWEAT SIGNUP FOR EXCLUSIVE DISCOUNT" header | Grammatically incorrect, all-caps | **REMOVE** |
| "exclusive discounts" copy on login | Generic, cheapens brand | **REDESIGN** to enrichment-focused copy |
| "exclusive member-only discounts" on register | Generic | **REDESIGN** to value-stack benefits |
| Company field in addresses | Unnecessary for DTC | **SIMPLIFY** — hide by default |
| Order history table on mobile | Hard to scan | **REDESIGN** to card layout |
| Inline address editing | Confusing on mobile | **REDESIGN** to modal |
| "Log out" button prominence | Top-level, same weight as navigation | **SIMPLIFY** — move to settings section |
| Pagination on orders | Paginate by 20 | **KEEP** but add infinite scroll option |
| Guest checkout form on login | Adds clutter | **KEEP** but visually separate |

---

# 13. Personalization Opportunities

### Tier 1: Quick Wins (Week 1-2)
1. **Personalized greeting** — "Welcome back, {{ customer.first_name }}"
2. **Last order summary** — Show most recent order with reorder button
3. **Dog profile link** — Connect existing `/pages/my-dog` to account dashboard
4. **Subscription status** — Show active/inactive subscription state

### Tier 2: Medium Effort (Week 3-4)
5. **Reorder button** — One-click reorder from dashboard and order detail
6. **Dog profile card** — Embed dog profile summary on dashboard
7. **Chew recommendation** — Show recommended chew based on dog profile
8. **Order-based messaging** — Different dashboard for first-time vs. returning customers

### Tier 3: Advanced (Month 2+)
9. **Enrichment score** — Gamified engagement metric from chew session logging
10. **Reorder timing** — "Your dog's chew should be running low" based on purchase cadence
11. **Breed-specific content** — Blog recommendations based on dog breed
12. **Subscription optimization** — "Based on your usage, we recommend every 3 weeks" cadence suggestion
13. **Loyalty milestones** — Visual progress toward rewards/badges

---

# 14. Retention Improvement Opportunities

### Email Integration Points
1. **Post-purchase chew education** — Triggered after first order (the missing `post-purchase-chew-education` snippet)
2. **Reorder reminder** — Triggered at estimated chew depletion date
3. **Subscription win-back** — Triggered when subscription is cancelled
4. **Dog birthday** — If collected during profile setup
5. **Review request** — Triggered 7 days after delivery

### Account-Based Retention
1. **Subscription savings counter** — "You've saved $47.80 with Subscribe & Save"
2. **Order milestone celebrations** — "🎉 This is your 5th order! Your dog is a Prime Pet Food regular."
3. **Referral program visibility** — "Give $10, Get $10" card on dashboard
4. **Enrichment streak** — "You've maintained a consistent chew routine for 3 months"

### Behavioral Triggers
1. **Lapsed customer messaging** — Different dashboard state for 60+ day inactive
2. **Size-up suggestion** — "Your puppy may be ready for a larger chew"
3. **Seasonal messaging** — "Holiday travel? Don't forget your dog's chews"

---

# 15. Final 9.5/10 Account Experience Vision

### The Experience Flow

**New Customer Registration:**
1. Beautiful split-layout registration page with lifestyle image
2. Minimal form: Name, email, password, dog's name (optional)
3. Value stack showing 5 clear benefits
4. Social proof: review quote + star rating
5. Post-registration: Dog profile setup wizard (breed, weight, age, chewing style)
6. Personalized chew recommendation with "Shop now" CTA
7. Welcome email with chew introduction guide

**Returning Customer Login:**
1. Warm welcome-back page with brand imagery
2. Clean login form with "Sign in with Shop" option
3. Trust messaging and benefits reminder
4. Post-login: Personalized dashboard with dog greeting

**Account Dashboard (The Hub):**
1. **Header:** "Welcome back, Sarah 🐕" with dog profile summary
2. **Quick Actions:** Reorder | Track Order | Dog Profile | Subscription
3. **Subscription Card:** Next shipment, skip/pause controls, savings counter
4. **Dog Profile Card:** Name, breed, recommended chew, enrichment score
5. **Recent Orders:** Card layout with reorder buttons and tracking
6. **Enrichment Hub:** Chew tip, blog recommendation, routine suggestion
7. **Referral Card:** "Give $10, Get $10" with shareable link
8. **Settings:** Name, email, addresses, communication preferences

**Order Detail:**
1. Prominent tracking card with visual progress
2. Product images in line items
3. "Reorder this" button
4. Post-purchase chew education (safety, introduction, microwave tip)
5. "How was this chew?" review prompt

### The Feeling

The account should make customers feel:
- **Welcomed** — Personalized greeting, warm design
- **Remembered** — Dog profile, order history, preferences
- **Valued** — Savings counter, loyalty milestones, referral rewards
- **Confident** — Clear subscription management, easy reordering
- **Connected** — Enrichment tips, community, brand story
- **Empowered** — One-click reorder, quick actions, self-service

### The Brand Promise

> "Your account isn't just order history. It's your dog's enrichment home base — where every chew, every order, and every routine lives in one place."

---

# 16. Implementation Priority Matrix

| Priority | Feature | Effort | Impact | Who Benefits |
|---|---|---|---|---|
| 🔴 P0 | Personalized dashboard greeting | Low | High | All customers |
| 🔴 P0 | Reorder button on dashboard + order detail | Low | Very High | Returning customers |
| 🔴 P0 | Dog profile card on dashboard | Medium | Very High | All customers |
| 🔴 P0 | Subscription management card | Medium | Very High | Subscribers |
| 🔴 P0 | Post-purchase chew education snippet | Medium | High | First-time buyers |
| 🟠 P1 | Login page copy redesign | Low | High | All visitors |
| 🟠 P1 | Register page value stack + image | Medium | High | New customers |
| 🟠 P1 | Mobile account navigation (tab bar) | Medium | High | Mobile users |
| 🟠 P1 | Order history card layout (mobile) | Medium | High | Mobile users |
| 🟠 P1 | Empty state for zero orders | Low | Medium | New customers |
| 🟠 P1 | Brand color palette on account pages | Medium | High | All customers |
| 🟡 P2 | Subscription upsell card for one-time buyers | Low | High | One-time buyers |
| 🟡 P2 | Referral card on dashboard | Low | Medium | All customers |
| 🟡 P2 | Product images in order line items | Low | Medium | All customers |
| 🟡 P2 | Tracking card on order detail | Medium | High | All customers |
| 🟡 P2 | Reset/activate page brand styling | Low | Medium | New customers |
| 🟢 P3 | Enrichment hub section | High | Medium | Engaged customers |
| 🟢 P3 | Loyalty milestone badges | High | Medium | Repeat customers |
| 🟢 P3 | Lapsed customer win-back messaging | Medium | High | Lapsed customers |
| 🟢 P3 | Breed-specific content recommendations | High | Medium | Dog profile users |

---

# 17. Quick Wins (Top 10 — Implement First)

1. **Add `{{ customer.first_name }}` greeting to dashboard** — 5 minutes, massive personalization impact
2. **Add "Reorder last chew" card to dashboard** — 30 minutes, highest revenue impact
3. **Fix login page copy** — Remove "NO SWEAT SIGNUP" header, replace with brand-aligned messaging
4. **Add register page value stack** — 5 clear benefits with checkmarks, 1 hour
5. **Add register page lifestyle image** — Upload image to JSON, 10 minutes
6. **Create `post-purchase-chew-education` snippet** — Referenced but missing, 2 hours
7. **Add empty state design for zero orders** — Replace plain text with CTA, 30 minutes
8. **Add subscription status card to dashboard** — Link to subscription management, 1 hour
9. **Add dog profile link/card to dashboard** — Connect existing `/pages/my-dog`, 1 hour
10. **Apply brand color palette to account pages** — Warm cream background, orange CTAs, 2 hours

---

## Document End

**Audit completed:** May 2025
**Current overall score:** 2.9/10
**Target score after implementation:** 9.2/10
**Highest-impact single change:** Personalized dashboard with dog profile + reorder functionality
**Estimated implementation time for P0 items:** 2–3 days
**Estimated implementation time for full 9.2/10 experience:** 2–3 weeks