'use client'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { SmartMealResult } from '@/lib/engine/types'

export function ShareMealButton({ meal, className }: { meal: SmartMealResult; className?: string }) {
  async function handleShare() {
    const text = `MealEase picked this for me: ${meal.title} 🍽️\n${meal.tagline}\n\nTry it at mealease.app`
    try {
      if (navigator.share) {
        await navigator.share({ title: meal.title, text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        toast.error('Could not share')
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', className)}
      onClick={handleShare}
      title="Share this meal"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}
