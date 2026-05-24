'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ChevronDown, ChevronUp, Clock, Users, ChefHat, ListOrdered } from 'lucide-react'
import type { Meal } from '@/types'
import { cn } from '@/lib/utils'

interface MealCardProps {
  meal: Meal
  onRegenerate?: (mealId: string) => void
  isRegenerating?: boolean
  compact?: boolean
}

export function MealCard({ meal, onRegenerate, isRegenerating, compact }: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [recipeExpanded, setRecipeExpanded] = useState(false)

  return (
    <div className={cn('glass-card rounded-xl border border-border/60 hover:border-primary/25 transition-colors', compact ? 'p-3' : 'p-5')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="text-xs capitalize">{meal.meal_type}</Badge>
            {meal.prep_time && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{meal.prep_time} min</span>
            )}
          </div>
          <h3 className={cn('font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>{meal.title}</h3>
          {!compact && meal.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meal.description}</p>}
        </div>
        {onRegenerate && (
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={isRegenerating} onClick={() => onRegenerate(meal.id)}><RefreshCw className={cn('h-3.5 w-3.5', isRegenerating && 'animate-spin')} /></Button>
        )}
      </div>
      {!compact && meal.variations && meal.variations.length > 0 && (
        <div className="mt-3">
          <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-3.5 w-3.5" />
            {meal.variations.length} member variation{meal.variations.length !== 1 ? 's' : ''}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              {meal.variations.map((v) => (
                <div key={v.id} className="text-xs rounded-lg bg-muted/50 px-3 py-2">
                  <span className="font-medium">{v.member_name}</span>
                  {v.modifications && v.modifications.length > 0 && (
                    <p className="text-muted-foreground mt-0.5">{v.modifications.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!compact && (meal.base_ingredients?.length > 0 || meal.base_instructions?.length > 0) && (
        <div className="mt-3 border-t border-border/40 pt-3">
          <button type="button" onClick={() => setRecipeExpanded(!recipeExpanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChefHat className="h-3.5 w-3.5" />
            Recipe details
            {recipeExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {recipeExpanded && (
            <div className="mt-3 space-y-4">
              {meal.base_ingredients?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><ListOrdered className="h-3 w-3" /> Ingredients</p>
                  <ul className="space-y-1">
                    {meal.base_ingredients.map((ing, i) => (
                      <li key={i} className="text-xs rounded-md bg-muted/50 px-3 py-1.5">
                        <span className="font-medium">{ing.quantity} {ing.unit}</span> {ing.name}
                        {ing.notes && <span className="text-muted-foreground ml-1">({ing.notes})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {meal.base_instructions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><ChefHat className="h-3 w-3" /> Instructions</p>
                  <ol className="space-y-1.5">
                    {meal.base_instructions.map((step, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
