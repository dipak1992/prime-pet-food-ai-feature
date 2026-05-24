'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Bookmark, Pencil, Trash2, Globe, Lock, Calendar, Search, PlusCircle, ChefHat, ShoppingCart, MoreHorizontal, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ShareButton } from '@/components/content/ShareButton'
import { EditMealModal } from '@/components/content/EditMealModal'
import type { SavedMealSummary } from '@/lib/content/types'
import type { SmartMealResult } from '@/lib/engine/types'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { MealPillar, PILLAR_LABELS, pillarLabel } from '@/lib/recipes/canonical'

const CUISINE_EMOJI: Record<string, string> = {
  italian: '🍝',
  mexican: '🌮',
  asian: '🥢',
  american: '🍔',
  indian: '🍛',
  mediterranean: '🥗',
  comfort: '🫕',
  global: '🌏',
  nepali: '🏔️',
}

function cuisineEmoji(type?: string | null) {
  const key = (type ?? '').toLowerCase().split(' ')[0]
  return CUISINE_EMOJI[key] ?? '🍽️'
}

export default function SavedMealsPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<SavedMealSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<SavedMealSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavedMealSummary | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | MealPillar>('all')
  const [sortMode, setSortMode] = useState<'newest' | 'favorites'>('newest')
  const { plan, selectedDayIndex, setPlan, setSelectedDayIndex, addCustomItem } = useWeeklyPlanStore()

  useEffect(() => {
    fetch('/api/content/meals')
      .then((r) => r.json())
      .then((data: { meals?: SavedMealSummary[] }) => setMeals(data.meals ?? []))
      .catch(() => toast.error('Could not load saved meals.'))
      .finally(() => setLoading(false))
  }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    const meal = deleteTarget
    setDeleteTarget(null)
    const res = await fetch(`/api/content/meals/${meal.id}`, { method: 'DELETE' })
    if (res.ok) {
      setMeals((prev) => prev.filter((m) => m.id !== meal.id))
      toast.success('Meal deleted.')
    } else {
      toast.error('Could not delete meal.')
    }
  }

  async function togglePrivacy(meal: SavedMealSummary) {
    const newPublic = !meal.is_public
    setMeals((prev) => prev.map((m) => m.id === meal.id ? { ...m, is_public: newPublic } : m))
    const res = await fetch(`/api/content/meals/${meal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: newPublic }),
    })
    if (!res.ok) {
      setMeals((prev) => prev.map((m) => m.id === meal.id ? { ...m, is_public: meal.is_public } : m))
      toast.error('Could not update privacy.')
    }
  }

  function handleEditSaved(id: string, updates: Partial<SavedMealSummary>) {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  async function fetchMealData(id: string): Promise<SmartMealResult | null> {
    const res = await fetch(`/api/content/meals/${id}`)
    if (!res.ok) return null
    const data = await res.json() as { meal?: { meal_data?: SmartMealResult } }
    return data.meal?.meal_data ?? null
  }

  function addMealGroceries(mealData: SmartMealResult) {
    const items = mealData.shoppingList?.length
      ? mealData.shoppingList
      : mealData.ingredients.filter((item) => !item.fromPantry).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        }))

    for (const item of items) {
      addCustomItem({
        name: item.name,
        quantity: Number.parseFloat(String(item.quantity)) || 1,
        unit: item.unit || 'unit',
        category: item.category || 'other',
      })
    }
    toast.success('Ingredients added to grocery list.')
  }

  async function handleCookAgain(meal: SavedMealSummary) {
    const mealData = await fetchMealData(meal.id)
    if (!mealData) {
      toast.error('Could not load meal details.')
      return
    }
    sessionStorage.setItem('tonight-meal', JSON.stringify(mealData))
    sessionStorage.setItem('recipe-back', '/saved')
    sessionStorage.setItem('recipe-source', (meal.pillar_source as MealPillar | undefined) ?? 'saved')
    router.push('/tonight/recipe')
  }

  async function handleAddGroceries(meal: SavedMealSummary) {
    const mealData = await fetchMealData(meal.id)
    if (!mealData) {
      toast.error('Could not load meal details.')
      return
    }
    addMealGroceries(mealData)
  }

  async function handleAddToWeek(meal: SavedMealSummary) {
    const mealData = await fetchMealData(meal.id)
    if (!mealData) {
      toast.error('Could not load meal details.')
      return
    }

    const targetDay = plan.days.find((d) => d.meal === null)?.dayIndex ?? selectedDayIndex ?? 0
    const nextPlan = {
      ...plan,
      days: plan.days.map((d) => d.dayIndex === targetDay ? { ...d, meal: mealData } : d),
      generatedAt: new Date().toISOString(),
    }

    setPlan(nextPlan)
    setSelectedDayIndex(targetDay)
    toast.success('Added to weekly plan', { description: `Placed on ${new Date(nextPlan.days[targetDay].date).toLocaleDateString('en-US', { weekday: 'long' })}.` })
    router.push('/planner')
  }

  function handleShare(meal: SavedMealSummary) {
    if (!meal.slug) return
    const url = `${window.location.origin}/share/meal/${meal.slug}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied!', { description: url }),
      () => toast.info('Share this link', { description: url }),
    )
  }

  const filteredMeals = meals
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => sourceFilter === 'all' || m.pillar_source === sourceFilter)
    .sort((a, b) => {
      if (sortMode === 'favorites') return a.title.localeCompare(b.title)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" />
            Saved Meals
          </h1>
          {!loading && (
            <p className="text-muted-foreground text-sm mt-1">
              {meals.length} {meals.length === 1 ? 'meal' : 'meals'} saved
            </p>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/planner">Go to Planner</Link>
        </Button>
      </div>

      {/* Search */}
      {!loading && meals.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved meals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | MealPillar)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Filter by pillar"
            >
              <option value="all">All pillars</option>
              {(Object.keys(PILLAR_LABELS) as MealPillar[]).map((pillar) => (
                <option key={pillar} value={pillar}>{PILLAR_LABELS[pillar]}</option>
              ))}
            </select>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as 'newest' | 'favorites')}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Sort saved meals"
            >
              <option value="newest">Newest first</option>
              <option value="favorites">Favorites A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Meals grid */}
      {!loading && meals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Card body */}
              <div className="flex items-start gap-3 p-4">
                <span className="text-3xl flex-shrink-0 mt-0.5">
                  {cuisineEmoji(meal.cuisine_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {meal.cuisine_type && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {meal.cuisine_type}
                      </Badge>
                    )}
                    {meal.pillar_source && (
                      <Badge variant="outline" className="text-xs">
                        {pillarLabel(meal.pillar_source)}
                      </Badge>
                    )}
                    <button
                      onClick={() => togglePrivacy(meal)}
                      className="focus:outline-none"
                      title={meal.is_public ? 'Click to make private' : 'Click to make public'}
                    >
                      {meal.is_public ? (
                        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50 gap-1 cursor-pointer hover:bg-emerald-100 transition-colors">
                          <Globe className="h-3 w-3" /> Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground gap-1 cursor-pointer hover:bg-muted transition-colors">
                          <Lock className="h-3 w-3" /> Private
                        </Badge>
                      )}
                    </button>
                  </div>
                  <p className="font-semibold text-sm leading-snug line-clamp-2">{meal.title}</p>
                  {meal.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {meal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(meal.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border/40 px-3 pb-3 pt-2">
                <div className="flex items-center gap-1 sm:hidden">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 flex-1 gap-1.5"
                    onClick={() => void handleAddToWeek(meal)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add to week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1 gap-1.5"
                    onClick={() => void handleCookAgain(meal)}
                  >
                    <ChefHat className="h-3.5 w-3.5" />
                    Cook
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-medium transition-all hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label={`More actions for ${meal.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {meal.is_public && (
                        <DropdownMenuItem onClick={() => handleShare(meal)} className="gap-2 px-3 py-2">
                          <Share2 className="h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setEditTarget(meal)} className="gap-2 px-3 py-2">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void handleAddGroceries(meal)} className="gap-2 px-3 py-2">
                        <ShoppingCart className="h-4 w-4" />
                        Groceries
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(meal)}
                        variant="destructive"
                        className="gap-2 px-3 py-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="hidden items-center gap-1 sm:flex">
                  {meal.is_public && (
                    <ShareButton slug={meal.slug} type="meal" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setEditTarget(meal)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => void handleAddToWeek(meal)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add to this week
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => void handleCookAgain(meal)}
                  >
                    <ChefHat className="h-3.5 w-3.5" />
                    Cook again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => void handleAddGroceries(meal)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Groceries
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive ml-auto"
                    onClick={() => setDeleteTarget(meal)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && meals.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-25" />
          <p className="font-medium mb-1">No saved meals yet</p>
          <p className="text-sm mb-6">
            Tap the bookmark icon on any meal in your planner to save it here.
          </p>
          <Button asChild variant="outline">
            <Link href="/planner">Open Planner</Link>
          </Button>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditMealModal
          meal={editTarget}
          open
          onClose={() => setEditTarget(null)}
          onSaved={(updates) => handleEditSaved(editTarget.id, updates)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this meal?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
