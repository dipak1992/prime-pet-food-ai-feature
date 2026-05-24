'use client'

import { useMemo, useState } from 'react'
import { Camera, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

export function ShareMealCard({
  title,
  meals,
  source,
}: {
  title: string
  meals: string[]
  source: string
}) {
  const [copied, setCopied] = useState(false)
  const shareText = useMemo(
    () => `${title}\n\n${meals.slice(0, 4).map((meal) => `- ${meal}`).join('\n')}\n\nPlanned with MealEase`,
    [meals, title],
  )

  async function share() {
    trackEvent('share_card_created', { source, type: 'meal_plan_card' })
    if (navigator.share) {
      await navigator.share({ title, text: shareText, url: window.location.href }).catch(() => {})
      return
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function copyPinPrompt() {
    const prompt = `Pinterest pin: ${title}. Show a premium dinner calendar with these meals: ${meals.join(', ')}. Add MealEase branding and a CTA to plan dinner free.`
    await navigator.clipboard.writeText(prompt)
    trackEvent('pinterest_pin_generated', { source, type: 'prompt_copy' })
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="aspect-[2/3] rounded-lg bg-[#123C35] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F3B18E]">MealEase plan</p>
        <h3 className="mt-3 font-serif text-3xl font-bold leading-tight">{title}</h3>
        <div className="mt-5 space-y-2">
          {meals.slice(0, 4).map((meal) => (
            <div key={meal} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium">
              {meal}
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-white/72">Plan tonight, shop smarter, waste less.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={share} className="h-10">
          <Share2 className="mr-2 h-4 w-4" />
          {copied ? 'Copied' : 'Share'}
        </Button>
        <Button variant="outline" onClick={copyPinPrompt} className="h-10">
          <Camera className="mr-2 h-4 w-4" />
          Pin prompt
        </Button>
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(shareText)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[#D97757]"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy plain text
      </button>
    </div>
  )
}
