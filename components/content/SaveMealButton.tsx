'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { SmartMealResult } from '@/lib/engine/types'
import type { MealPillar } from '@/lib/recipes/canonical'

interface SaveMealButtonProps {
  meal: SmartMealResult
  source?: MealPillar
  className?: string
}

export function SaveMealButton({ meal, source = 'tonight', className }: SaveMealButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (saved) return
    setLoading(true)
    try {
      const res = await fetch('/api/content/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, source }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Couldn\'t save right now')
      }
      setSaved(true)
      toast.success('Meal saved!', { description: 'Find it under Saved Meals.' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', saved && 'text-amber-500', className)}
      onClick={handleSave}
      disabled={loading || saved}
      title={saved ? 'Saved!' : 'Save this meal'}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-amber-500')} />
    </Button>
  )
}
