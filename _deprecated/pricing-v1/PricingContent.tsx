'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Check,
  Crown,
  Sparkles,
  Star,
  Shield,
  Users,
  Quote,
  ArrowRight,
  Zap,
  X,
  Gift,
  CreditCard,
  Clock,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'
import { PRICING_TIERS, PRO_ANNUAL_SAVINGS, FAMILY_ANNUAL_SAVINGS } from '@/lib/paywall/config'
import { cn } from '@/lib/utils'
import { AboutSnippet } from '@/components/about/AboutSnippet'

/* ─────────────────────── DATA ─────────────────────── */

const TESTIMONIALS = [
  {
    quote: 'I recommend MealEase to clients who struggle with meal planning. The allergy support and family adaptation is better than anything else I\'ve seen.',
    name: 'Priya R.',
    role: 'Registered Dietitian',
    avatar: 'PR',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    quote: "I used to spend 30 minutes every evening deciding what to cook. Now I just open MealEase and dinner is planned in seconds. My kids actually eat what I make.",
    name: 'Sarah M.',
    role: 'Mom of 3, Austin TX',
    avatar: 'SM',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    quote: 'Living solo, I used to default to the same 5 takeout places. Now I actually cook and enjoy it. The budget modes helped me save money too.',
    name: 'James K.',
    role: 'Software engineer, remote',
    avatar: 'JK',
    color: 'bg-blue-100 text-blue-700',
  },
]

const COMPARISON_FEATURES = [
  { feature: 'Tonight Dinner', free: true, pro: true, family: true },
  { feature: 'Daily meal generations', free: '3 per day', pro: 'Unlimited', family: 'Unlimited' },
  { feature: 'Simple grocery list', free: true, pro: true, family: true },
  { feature: 'Unlimited regenerations', free: false, pro: true, family: true },
  { feature: 'Weekly Planner', free: '3-day preview', pro: 'Full 7 days', family: 'Full 7 days' },
  { feature: 'Save preferences', free: false, pro: true, family: true },
  { feature: 'Member profiles †', free: '1 profile', pro: '2 profiles', family: 'Up to 6 profiles' },
  { feature: 'Household memory', free: false, pro: '1 household', family: 'Full household' },
  { feature: 'Snap & Cook scans', free: '3/week', pro: 'Unlimited', family: 'Unlimited' },
  { feature: 'Smart Menu Scan', free: false, pro: true, family: true },
  { feature: 'Food Check (calorie snap)', free: false, pro: true, family: true },
  { feature: 'Personal nutrition profile', free: false, pro: true, family: true },
  { feature: 'Budget meal mode', free: false, pro: true, family: true },
  { feature: 'Healthy mode', free: false, pro: true, family: true },
  { feature: 'Meal history', free: false, pro: true, family: true },
  { feature: 'Faster AI responses', free: false, pro: true, family: true },
  { feature: 'Pantry Mode', free: false, pro: false, family: true },
  { feature: 'Shared grocery lists', free: false, pro: false, family: true },
  { feature: 'Family dashboard', free: false, pro: false, family: true },
  { feature: 'Multi-profile balancing', free: false, pro: false, family: true },
  { feature: 'Priority support', free: false, pro: false, family: true },
]

const FAQ = [
  {
    q: 'Is this just another recipe app?',
    a: 'Not even close. Recipe apps give you a database and leave you to scroll. MealEase is a decision engine — it knows your household, your energy level, your fridge, and your kids\' quirks, then tells you exactly what to make tonight. No browsing. No decision fatigue. Just dinner, handled.',
  },
  {
    q: 'What is a household profile?',
    a: 'A household profile stores preferences, allergies, age groups, and food goals for one person in your household. Profiles are not separate logins — they are preference records that help MealEase personalize every meal for each person at your table. Free plan includes 1 profile. Pro includes 2. Family Plus supports up to 6.',
  },
  {
    q: 'Are profiles separate logins? Can my spouse use MealEase too?',
    a: 'Not yet — profiles are preference records, not separate accounts. One account manages all profiles. Your spouse\'s preferences, allergies, and food goals are stored in their profile and used to personalize every meal. Shared login support is on our roadmap for a future update.',
  },
  {
    q: 'How many family members can I add?',
    a: 'Free plan: 1 personal profile. Pro plan: up to 2 profiles (great for couples). Family Plus: up to 6 household member profiles with full preferences, allergy tracking, and cuisine preferences.',
  },
  {
    q: 'Why upgrade to Family Plus?',
    a: 'Family Plus is for households where everyone\'s preferences matter. You get up to 6 member profiles with full detail — allergies, age groups, cuisine preferences, and portion sizes. MealEase then balances all of that automatically when planning meals. Plus you get shared grocery lists, a family dashboard, and multi-profile meal balancing.',
  },
  {
    q: 'Can I share grocery lists or meal plans?',
    a: 'Yes. Family Plus includes shared grocery lists and shared meal planning — so everyone in the household stays on the same page. Pro users get personal grocery lists. Shared login support for multiple accounts is coming in a future update.',
  },
  {
    q: 'How does Household Memory work?',
    a: 'Every time you cook, save, skip, or swap a meal, MealEase quietly learns. It tracks which cuisines your family gravitates toward, what your picky eater actually ate, and which nights you tend to reach for something fast. Over weeks, your suggestions get sharper — like a sous chef who\'s been with your family for years.',
  },
  {
    q: 'What is Weekly Autopilot?',
    a: 'One tap, seven nights planned. Autopilot builds a full week of dinners tailored to your household — balancing variety, nutrition, prep time, and what you already have on hand. It generates a smart grocery list alongside it. You review, tweak if you want, and you\'re done. Sunday planning in under 60 seconds.',
  },
  {
    q: 'Can it help picky eaters?',
    a: 'This is one of the things we built MealEase to solve. The Picky Eater tool suggests meals with high acceptance likelihood based on your child\'s profile — textures they tolerate, flavors they\'ve accepted before, and gentle ways to introduce new foods. It even scores each suggestion so you know what to expect before you start cooking.',
  },
  {
    q: 'Can it help save money on groceries?',
    a: 'Yes — and most users notice it within the first two weeks. Budget Mode filters meals by cost. Pantry Mode builds dinners from what you already have, reducing waste. Weekly Autopilot minimizes impulse buys by giving you a precise shopping list before you walk into the store. Less food thrown away, fewer last-minute takeout orders.',
  },
  {
    q: 'What makes MealEase different from ChatGPT meal plans?',
    a: 'ChatGPT gives you a generic list and forgets you exist five minutes later. MealEase remembers your household — allergies, preferences, what your toddler refused last Tuesday. It integrates with your pantry, builds grocery lists, and gets smarter every week. It\'s the difference between asking a stranger for advice and having a system that actually knows your family.',
  },
  {
    q: 'Is there a free version?',
    a: 'Yes. The free plan gives you Tonight Dinner, up to three meal ideas daily, and basic grocery lists — enough to experience how MealEase thinks. When you\'re ready for Weekly Autopilot or Household Memory, upgrade anytime. All paid plans include a 7-day free trial, and you can cancel with one click.',
  },
  {
    q: 'Can MealEase help me order healthier at restaurants?',
    a: 'Yes. Smart Menu Scan lets you photograph any restaurant menu and choose a goal — lose weight, high protein, budget-friendly, or more. AI highlights exactly what to order based on your personal nutrition profile. It works with sit-down restaurants, fast food chains, takeout menus, and even handwritten specials.',
  },
  {
    q: 'How does the calorie estimation feature work?',
    a: 'Food Check uses AI vision to analyze a photo of any plate or snack. It estimates calorie ranges with a confidence level, shows protein levels, gives a goal-fit verdict (healthy, balanced, or indulgent), and suggests smarter swaps when relevant. It\'s like having a nutritionist in your pocket.',
  },
  {
    q: 'What\'s the difference between personal preferences and household settings?',
    a: 'Household settings power family meal planning — allergies, ages, and shared preferences for everyone at the table. Personal preferences are just for you — your weight goal, protein focus, and individual dietary needs. Smart Menu Scan and Food Check use your personal profile so recommendations are tailored to your body and goals, not the whole family.',
  },
]

const TRUST_SIGNALS = [
  { label: '3,200+ households', icon: Users },
  { label: '4.9/5 rating', icon: Star },
  { label: 'Cancel anytime', icon: ShieldCheck },
  { label: 'Secure checkout', icon: CreditCard },
]

/* ─────────────────────── COMPONENT ─────────────────────── */

export function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const { status, loading: paywallLoading } = usePaywallStatus()
  const router = useRouter()

  const proMonthly = PRICING_TIERS.pro.monthlyPrice
  const proAnnual = PRICING_TIERS.pro.yearlyPrice
  const familyMonthly = PRICING_TIERS.family.monthlyPrice
  const familyAnnual = PRICING_TIERS.family.yearlyPrice


  const handleStartTrial = useCallback(async () => {
    if (!status.isAuthenticated) {
      router.push('/signup?plan=pro&trial=1')
      return
    }
    if (status.isPro) {
      toast.info('You already have Pro or Family Plus!')
      return
    }
    setIsStartingTrial(true)
    try {
      const res = await fetch('/api/paywall/start-trial', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not start trial')
        return
      }
      toast.success('Your 7-day free trial is active!', {
        description: 'Enjoy full Pro access to every feature.',
      })
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsStartingTrial(false)
    }
  }, [status, router])

  const handleCheckout = useCallback(async (plan: 'pro_monthly' | 'pro_yearly' | 'family_monthly' | 'family_yearly') => {
    if (!status.isAuthenticated) {
      router.push(`/signup?plan=${plan}`)
      return
    }
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.error === 'billing_not_configured') {
        handleStartTrial()
        return
      }
      if (!res.ok) {
        toast.error(data.error || 'Could not start checkout')
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    }
  }, [status, router, handleStartTrial])

  return (
    <div className="relative">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Image src="/landing/family-dinner.jpg" alt="" fill sizes="(max-width: 767px) 0px, 100vw" className="object-cover object-center hidden md:block" quality={75} />
          <Image src="/mobile/family-mobile.jpg" alt="" fill sizes="(max-width: 767px) 100vw, 0px" className="object-cover object-[center_30%] md:hidden" quality={70} />
          <div className="absolute inset-0 bg-white/[0.94]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_20%,rgba(16,185,129,0.08),transparent_60%)]" />
        </div>

        <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Honest pricing, zero surprises
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-5">
              Choose the plan that fits{' '}
              <span className="relative inline-block">
                <span className="text-primary">your kitchen.</span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-emerald-400/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 5 Q150 10 200 3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-8">
              Whether you&apos;re cooking for one or feeding a family of six, MealEase scales to your life. Start free, upgrade when you&apos;re ready.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
              {TRUST_SIGNALS.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5">
                  <t.icon className="h-4 w-4 text-primary/60" />
                  {t.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ BILLING TOGGLE ═══════════════════ */}
      <section className="relative z-[1] py-6">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                'text-sm font-semibold px-6 py-2.5 rounded-full transition-all',
                !isAnnual ? 'bg-foreground text-white shadow-md' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                'text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center gap-2',
                isAnnual ? 'bg-foreground text-white shadow-md' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Annual
              <Badge className="border-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5">
                SAVE {FAMILY_ANNUAL_SAVINGS}%
              </Badge>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING CARDS ═══════════════════ */}
      <section className="relative z-[1] pb-16 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-5 items-start"
          >
            {/* ── FREE ── */}
            <div className="relative flex flex-col rounded-[28px] border border-border/60 bg-white p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Free</h2>
                    <p className="text-xs text-muted-foreground">Forever free</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/80 mb-6 leading-relaxed italic">
                  &ldquo;Get unstuck tonight.&rdquo;
                </p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold tracking-tight">$0</span>
                  <span className="ml-2 text-sm text-muted-foreground">/forever</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3.5">
                {['Tonight suggestions', 'Basic Snap & Cook', '3 meal ideas per day', 'Simple grocery list', '1 member profile', 'Basic dietary filters'].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
                {['Unlimited generations', 'Weekly Autopilot', 'Household Memory'].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground/50">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" size="lg" className="w-full h-13 rounded-2xl text-[15px] font-semibold border-border/80 hover:bg-muted/50">
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>

            {/* ── PRO (Best Value) ── */}
            <div className="relative flex flex-col rounded-[28px] border-2 border-primary/40 bg-white p-8 shadow-[0_20px_60px_-12px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.08)] md:scale-[1.04] md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-white tracking-wide shadow-lg shadow-primary/25">
                  <Crown className="h-3.5 w-3.5" />
                  BEST VALUE
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Pro</h2>
                    <p className="text-xs text-muted-foreground">For individuals &amp; couples</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/80 mb-6 leading-relaxed italic">
                  &ldquo;Meal planning that remembers your life.&rdquo;
                </p>
                <div>
                  {isAnnual ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tight">${(proAnnual / 12).toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                        <span className="text-sm text-muted-foreground line-through ml-1">${proMonthly}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[11px] font-bold">Save {PRO_ANNUAL_SAVINGS}%</Badge>
                        <span className="text-xs text-muted-foreground">${proAnnual}/yr billed annually</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold tracking-tight">${proMonthly}</span>
                        <span className="ml-2 text-sm text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Billed monthly</p>
                    </>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3.5">
                {[
                  '2 member profiles',
                  'Household Memory',
                  'Weekly Autopilot Lite',
                  'Smart Menu Scan ✨',
                  'Food Check (calorie snap) ✨',
                  'Budget Mode',
                  'Dinner Date Night',
                  'Pantry Mode',
                  'Saved preferences',
                  'Unlimited meal generations',
                  'Full 7-day Weekly Planner',
                  'Faster AI responses',
                  'Meal history',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {!status.isPro ? (
                  <>
                    <Button
                      size="lg"
                      className="w-full h-13 rounded-2xl text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.01] transition-all gap-2"
                      onClick={handleStartTrial}
                      disabled={isStartingTrial || paywallLoading}
                    >
                      {isStartingTrial ? 'Starting trial…' : 'Start 7-Day Free Trial'}
                      {!isStartingTrial && <ArrowRight className="h-4 w-4" />}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      7-day free trial · Cancel anytime
                    </p>
                  </>
                ) : (
                  <Button disabled size="lg" className="w-full h-13 rounded-2xl">✓ You have Pro</Button>
                )}
              </div>
            </div>

            {/* ── FAMILY PLUS ── */}
            <div className="relative flex flex-col rounded-[28px] border-2 border-amber-300/60 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 p-8 shadow-lg shadow-amber-200/20 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-4 right-8">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white tracking-wide shadow-md shadow-amber-500/20">
                  ⭐ MOST POPULAR
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Family Plus</h2>
                    <p className="text-xs text-muted-foreground">For the whole household</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground/80 mb-6 leading-relaxed italic">
                  &ldquo;A meal system for the whole household.&rdquo;
                </p>
                <div>
                  {isAnnual ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tight">${(familyAnnual / 12).toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                        <span className="text-sm text-muted-foreground line-through ml-1">${familyMonthly}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-[11px] font-bold">Save {FAMILY_ANNUAL_SAVINGS}%</Badge>
                        <span className="text-xs text-muted-foreground">${familyAnnual}/yr billed annually</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold tracking-tight">${familyMonthly}</span>
                        <span className="ml-2 text-sm text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Billed monthly</p>
                    </>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3.5">
                <li className="text-sm font-semibold text-amber-700 mb-1">Everything in Pro, plus:</li>
                {[
                  'Up to 6 household member profiles',
                  'Full Household Memory',
                  'Full Weekly Autopilot',
                  'Smart Menu Scan & Food Check ✨',
                  'Hosting Guests Tonight',
                  'Shared planning & grocery lists',
                  'Family dashboard',
                  'Multi-profile balancing',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {status.tier !== 'family' ? (
                  <>
                    <Button
                      size="lg"
                      className="w-full h-13 rounded-2xl text-[15px] font-semibold bg-gradient-to-r from-amber-500 to-orange-600 border-0 text-white hover:opacity-90 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/25 hover:scale-[1.01] transition-all gap-2"
                      onClick={() => isAnnual ? handleCheckout('family_yearly') : handleCheckout('family_monthly')}
                    >
                      Start Family Plus
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" />
                      Cancel anytime · No commitment
                    </p>
                  </>
                ) : (
                  <Button disabled size="lg" className="w-full h-13 rounded-2xl">✓ You have Family Plus</Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Annual savings nudge */}
          {!isAnnual && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <button
                onClick={() => setIsAnnual(true)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Switch to annual and save up to {PRO_ANNUAL_SAVINGS}%
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════ GUARANTEE ═══════════════════ */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[20px] border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 px-8 py-6 flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-base mb-1">Risk-free guarantee</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every paid plan includes a 7-day free trial. Cancel anytime with one click — no questions asked. Your plan stays active until the end of the current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOCIAL PROOF ═══════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">People are loving this</h2>
            <p className="mt-2 text-sm text-muted-foreground">Real feedback from real households</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, avatar, color }) => (
              <div key={name} className="rounded-2xl border border-border/50 bg-white p-6 relative hover:shadow-lg transition-shadow duration-300">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/8" />
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground mb-5">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-sm font-bold`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPARISON TABLE ═══════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Compare every feature</h2>
            <p className="text-sm text-muted-foreground">Everything you need, nothing you don&apos;t</p>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className="mx-auto mb-6 flex items-center gap-2 rounded-full border border-border/60 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-sm"
          >
            {showComparison ? 'Hide' : 'Show'} full comparison
            <ChevronDown className={cn('h-4 w-4 transition-transform', showComparison && 'rotate-180')} />
          </button>

          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-2xl border border-border/60 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-4 bg-muted/50 text-sm font-semibold sticky top-0">
                      <div className="px-5 py-3.5">Feature</div>
                      <div className="px-5 py-3.5 text-center">Free</div>
                      <div className="px-5 py-3.5 text-center text-primary">Pro</div>
                      <div className="px-5 py-3.5 text-center text-amber-600 font-bold">Family Plus</div>
                    </div>
                    {COMPARISON_FEATURES.map(({ feature, free, pro, family }, i) => (
                      <div key={feature} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                        <div className="px-5 py-3.5 font-medium">{feature}</div>
                        <div className="px-5 py-3.5 text-center text-muted-foreground">
                          {typeof free === 'boolean' ? (free ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground/40">&mdash;</span>) : free}
                        </div>
                        <div className="px-5 py-3.5 text-center font-medium">
                          {typeof pro === 'boolean' ? (pro ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground/40">&mdash;</span>) : pro}
                        </div>
                        <div className="px-5 py-3.5 text-center font-medium text-amber-700">
                          {typeof family === 'boolean' ? (family ? <Check className="mx-auto h-4 w-4 text-amber-600" /> : <span className="text-muted-foreground/40">&mdash;</span>) : family}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center py-2 sm:hidden">Swipe to see all plans &rarr;</p>
                </div>
              </div>
              {/* Footnotes */}
              <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold">†</span> Profiles store preferences, allergies, age groups, and food goals — not separate logins.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════ ABOUT SNIPPET ═══════════════════ */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AboutSnippet />
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Common Questions</h2>
          <Accordion className="space-y-2">
            {FAQ.map(({ q, a }, i) => (
              <AccordionItem key={q} value={`faq-${i}`} className="rounded-2xl border border-border/50 bg-white px-5">
                <AccordionTrigger className="font-semibold text-sm text-left py-4 hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="relative overflow-hidden py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_50%,rgba(16,185,129,0.08),transparent_60%)]" />
        </div>
        <div className="relative z-[1] mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold tracking-tight mb-3">Ready to simplify dinner?</h3>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Join 3,200+ households who stopped stressing about meals. Start free, upgrade when you&apos;re ready.
          </p>
          {!status.isAuthenticated ? (
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all gap-2"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-base font-semibold">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          )}
          <p className="text-muted-foreground text-xs mt-8">
            Questions?{' '}
            <a href="mailto:hello@mealeaseai.com" className="text-primary hover:underline">hello@mealeaseai.com</a>
          </p>
        </div>
      </section>
    </div>
  )
}
