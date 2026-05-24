'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, ClipboardList, Mail, Share2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackEvent } from '@/lib/analytics'
import type { GrowthTool } from '@/lib/growth/content'
import { buildMacroTargetPlan, buildPregnancySafePlan } from '@/lib/nutrition/specialized-workflows'

type GeneratedResult = {
  title: string
  lines: string[]
  savings?: string
}

const dinnerIdeas = [
  'Garlic chicken rice bowls with cucumber salad',
  'Egg fried rice with frozen vegetables',
  'Turkey taco skillet with tortillas',
  'Creamy tomato pasta with spinach',
  'Sheet-pan sausage, potatoes, and peppers',
]

const pantryIdeas = [
  'Pantry bowl with your grain, protein, sauce, and the most perishable vegetable',
  'Fried rice or skillet hash using eggs as the binder',
  'Quesadillas, wraps, or melts with a crisp side',
  'Soup using broth, beans, rice, and leftover vegetables',
]

function pick(items: string[], seed: string) {
  const score = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return items[score % items.length]
}

function generateResult(tool: GrowthTool, input: string, budget: string, household: string): GeneratedResult {
  const text = input.trim() || tool.sampleInputs.join(', ')
  const people = Number(household) || 4
  const budgetValue = Number(budget) || 100
  const perDinner = Math.max(8, Math.round(budgetValue / 5))

  if (tool.mode === 'macro') {
    const macroPlan = buildMacroTargetPlan(text, people, budgetValue)
    return {
      title: macroPlan.title,
      savings: macroPlan.savings,
      lines: [macroPlan.summary, ...macroPlan.lines],
    }
  }

  if (tool.mode === 'pregnancy') {
    const pregnancyPlan = buildPregnancySafePlan(text, people)
    return {
      title: pregnancyPlan.title,
      savings: pregnancyPlan.summary,
      lines: pregnancyPlan.lines,
    }
  }

  if (tool.mode === 'budget' || tool.mode === 'cost') {
    return {
      title: tool.mode === 'cost' ? 'Dinner cost estimate' : 'Budget dinner plan',
      savings: `Target: about $${perDinner} per dinner for ${people} people`,
      lines: [
        'Anchor two meals with rice, beans, pasta, eggs, or potatoes.',
        'Use one flexible protein across two dinners.',
        'Reserve one leftovers lunch so the grocery spend stretches further.',
        `Start with ${pick(dinnerIdeas, text)}.`,
      ],
    }
  }

  if (tool.mode === 'pantry') {
    return {
      title: 'Pantry-first dinner ideas',
      lines: [
        pick(pantryIdeas, text),
        'Use the ingredient that will expire first.',
        'Add only one missing item: sauce, greens, tortillas, or yogurt.',
        'Save this pantry combo in MealEase so next week starts faster.',
      ],
    }
  }

  if (tool.mode === 'leftovers') {
    return {
      title: 'Leftovers transformation',
      lines: [
        'Change the format: bowl, wrap, soup, skillet, or salad.',
        'Add one fresh texture and one sauce so it feels new.',
        `Tonight idea: ${pick(['leftover chicken tacos', 'rice fritter bowls', 'vegetable fried rice', 'pasta frittata'], text)}.`,
        'Save the before and after card for easy sharing.',
      ],
    }
  }

  if (tool.mode === 'scanner') {
    return {
      title: 'Scanner teaser result',
      lines: [
        'Meal scan preview: balanced plate estimate, protein cue, and swap idea.',
        'Create a free account to save scan history and household preferences.',
        'Use the result to plan the next dinner instead of logging food in isolation.',
      ],
    }
  }

  if (tool.mode === 'family') {
    return {
      title: 'Family meal plan starter',
      lines: [
        'Monday: sheet-pan chicken and vegetables',
        'Tuesday: turkey taco bowls',
        'Wednesday: pasta with spinach and pantry sauce',
        'Thursday: leftovers remix night',
        'Friday: egg fried rice or breakfast-for-dinner',
      ],
    }
  }

  return {
    title: "Tonight's dinner pick",
    lines: [
      pick(dinnerIdeas, `${text}-${people}`),
      'Use one pantry staple and one quick vegetable.',
      'Plan enough for lunch leftovers if the budget allows.',
      'Create a free MealEase account to save and personalize this result.',
    ],
  }
}

export function GrowthToolClient({ tool }: { tool: GrowthTool }) {
  const [input, setInput] = useState(tool.sampleInputs.join(', '))
  const [budget, setBudget] = useState('100')
  const [household, setHousehold] = useState('4')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [copied, setCopied] = useState(false)

  const needsBudget = tool.mode === 'budget' || tool.mode === 'cost'
  const placeholder = useMemo(() => {
    if (tool.mode === 'pantry') return 'eggs, rice, chicken, spinach'
    if (tool.mode === 'leftovers') return 'leftover chicken, rice, roasted carrots'
    if (tool.mode === 'scanner') return 'chicken bowl with rice and vegetables'
    if (tool.mode === 'macro') return 'lighter dinner, protein-forward, chicken, rice, vegetables'
    if (tool.mode === 'pregnancy') return 'due 2026-10-15, chicken, rice, spinach, nausea-friendly'
    return '20 minutes, tired, kid-friendly, chicken in fridge'
  }, [tool.mode])

  function handleGenerate() {
    const generated = generateResult(tool, input, budget, household)
    setResult(generated)
    trackEvent('tool_completion', {
      tool: tool.slug,
      cluster: tool.cluster,
      mode: tool.mode,
    })
  }

  async function shareResult() {
    if (!result) return
    const text = `${result.title}\n\n${result.lines.map((line) => `- ${line}`).join('\n')}\n\nGenerated with MealEase`
    trackEvent('share_card_created', { source: tool.slug, type: 'tool_result' })
    if (navigator.share) {
      await navigator.share({ title: result.title, text, url: window.location.href }).catch(() => {})
      return
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function handleEmailCapture() {
    trackEvent('email_captured', { source: tool.slug, email_present: Boolean(email) })
    window.location.href = `/signup?source=${encodeURIComponent(tool.slug)}`
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 md:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D97757]" />
          <h2 className="font-serif text-2xl font-bold">Free generator</h2>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">
            What should MealEase know?
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={placeholder}
              className="mt-2 min-h-28 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#D97757] focus:ring-3 focus:ring-[#D97757]/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Household size
              <Input value={household} onChange={(event) => setHousehold(event.target.value)} inputMode="numeric" className="mt-2 h-10" />
            </label>
            <label className="block text-sm font-semibold">
              {tool.mode === 'macro' ? 'Weekly grocery budget' : needsBudget ? 'Weekly dinner budget' : 'Budget target'}
              <Input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" className="mt-2 h-10" />
            </label>
          </div>
          <Button
            onClick={handleGenerate}
            className="h-11 w-full bg-[#D97757] text-white hover:bg-[#c4664a]"
          >
            <Calculator className="mr-2 h-4 w-4" />
            {tool.cta}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#D97757]" />
          <h2 className="font-serif text-2xl font-bold">Result</h2>
        </div>
        {result ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-white p-4 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
              <p className="text-sm font-bold text-[#D97757]">{result.title}</p>
              {result.savings && <p className="mt-2 text-sm font-semibold">{result.savings}</p>}
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                {result.lines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#D97757]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={shareResult} variant="outline" className="h-10 bg-white dark:bg-neutral-950">
                <Share2 className="mr-2 h-4 w-4" />
                {copied ? 'Copied' : 'Share result'}
              </Button>
              <Link
                href={`/signup?source=${tool.slug}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#123C35] px-4 text-sm font-bold text-white hover:bg-[#0d302a]"
              >
                Save free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
              <label className="text-sm font-semibold">
                Send this to your inbox
                <div className="mt-2 flex gap-2">
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    className="h-10"
                  />
                  <Button onClick={handleEmailCapture} className="h-10">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm leading-6 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            Generate once for free. Then save, share, or turn the result into a full MealEase account.
          </div>
        )}
      </section>
    </div>
  )
}
