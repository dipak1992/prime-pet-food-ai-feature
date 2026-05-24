'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Camera, Check, Loader2, ShoppingCart, Sparkles, Upload } from 'lucide-react'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'
import type { GroceryList, WeeklyPlan } from '@/lib/planner/types'
import type { SmartMealResult } from '@/lib/engine/types'
import type { FridgeResult } from '@/lib/scan/types'

type Goal = 'quick' | 'budget' | 'healthy' | 'picky' | 'leftovers'

type StartResult = {
  meal: SmartMealResult
  plan: WeeklyPlan
  groceryList: GroceryList
  activation: {
    householdSize: number
    dietary: string[]
    goal: Goal
    pantryItems: string[]
  }
}

const sampleItems = ['eggs', 'spinach', 'cheddar cheese', 'rice', 'chicken breast', 'bell pepper']
const dietaryOptions = ['vegetarian', 'gluten_free', 'dairy_free', 'nut_free']
const goals: Array<{ id: Goal; label: string }> = [
  { id: 'quick', label: 'Quick dinner' },
  { id: 'budget', label: 'Stay on budget' },
  { id: 'healthy', label: 'Healthier meals' },
  { id: 'picky', label: 'Picky eaters' },
  { id: 'leftovers', label: 'Use leftovers' },
]

export function StartFlowClient() {
  const [householdSize, setHouseholdSize] = useState(3)
  const [dietary, setDietary] = useState<string[]>([])
  const [goal, setGoal] = useState<Goal>('quick')
  const [pantryItems, setPantryItems] = useState<string[]>([])
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'ready' | 'error'>('idle')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StartResult | null>(null)

  const visibleItems = pantryItems.length > 0 ? pantryItems : sampleItems
  const previewItems = useMemo(() => visibleItems.slice(0, 8), [visibleItems])

  async function scanImage(file: File) {
    setError(null)
    setScanState('scanning')
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch('/api/scan/demo', { method: 'POST', body: formData })
    if (!res.ok) {
      setScanState('error')
      setError('The scan did not work. You can still use the sample fridge.')
      return
    }
    const data = (await res.json()) as FridgeResult
    const names = data.ingredients.map((item) => item.name).filter(Boolean)
    setPantryItems(names.length > 0 ? names : sampleItems)
    setScanState('ready')
  }

  async function generatePlan(items = visibleItems) {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/start-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdSize, dietary, goal, pantryItems: items }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as StartResult
      setResult(data)
      window.localStorage.setItem('mealease:first-plan', JSON.stringify({
        ...data,
        weekStart: data.plan.weekStart,
      }))
    } catch {
      setError('MealEase could not build that plan. Try again with the sample fridge.')
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleDiet(id: string) {
    setDietary((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <main className="min-h-screen bg-[#FBFAF3] text-slate-950">
      <header className="border-b border-orange-100 bg-white/88 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="MealEase home">
            <MealEaseLogo size="md" showBadge />
          </Link>
          <Link href="/signup" className="text-sm font-medium text-slate-600 hover:text-[#D97757]">
            Save account
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97757]">
              First-use demo
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Scan, pick 3 preferences, get dinner and groceries.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Try the core MealEase loop before creating an account. Use a fridge photo
              or the sample ingredients below.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Camera className="h-4 w-4 text-[#D97757]" />
              Fridge or pantry
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-center text-sm font-medium text-slate-700 hover:border-[#D97757]">
                <Upload className="mb-2 h-5 w-5 text-[#D97757]" />
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void scanImage(file)
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setPantryItems(sampleItems)
                  setScanState('ready')
                }}
                className="min-h-28 rounded-2xl border border-orange-100 bg-white p-4 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-[#D97757]"
              >
                Use sample fridge
                <span className="mt-2 block text-xs font-normal text-slate-500">
                  Eggs, spinach, cheddar, rice, chicken, bell pepper.
                </span>
              </button>
            </div>
            {scanState === 'scanning' && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Reading ingredients...
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="grid gap-4">
              <label className="text-sm font-semibold text-slate-800">
                Household size
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={householdSize}
                  onChange={(event) => setHouseholdSize(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 text-base outline-none focus:border-[#D97757]"
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-slate-800">Dietary needs</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDiet(option)}
                      className={`rounded-full border px-3 py-2 text-sm font-medium ${
                        dietary.includes(option)
                          ? 'border-[#D97757] bg-[#D97757]/10 text-[#9f4f32]'
                          : 'border-orange-100 bg-white text-slate-600'
                      }`}
                    >
                      {option.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Main goal</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {goals.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                        goal === item.id
                          ? 'border-[#D97757] bg-[#D97757]/10 text-[#9f4f32]'
                          : 'border-orange-100 bg-white text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void generatePlan()}
              disabled={isGenerating}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D97757] px-5 py-3 font-semibold text-white shadow-lg shadow-[#D97757]/20 hover:bg-[#C86646] disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Build my first plan
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Privacy note: uploaded photos are used to detect visible ingredients for this demo.
              The first-use demo result is saved only if you create an account and choose to save it.
            </p>
          </div>
        </div>

        <div
          data-marketing-shot="first-result"
          className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40"
        >
          {!result ? (
            <div className="flex min-h-[560px] flex-col justify-center rounded-3xl bg-[#FBFAF3] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D97757]">
                Ingredients ready
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewItems.map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm leading-6 text-slate-500">
                MealEase will use these ingredients, your household size, and your goal
                to generate one dinner plus a grocery list preview.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl bg-[#FBFAF3] p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#9f4f32]">
                  <Check className="h-3.5 w-3.5" />
                  Dinner picked
                </div>
                <h2 className="font-serif text-3xl font-bold">{result.meal.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result.meal.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
                  <span className="rounded-2xl bg-white px-2 py-3">{result.meal.totalTime} min</span>
                  <span className="rounded-2xl bg-white px-2 py-3">{result.meal.servings} servings</span>
                  <span className="rounded-2xl bg-white px-2 py-3">${result.meal.estimatedCost.toFixed(0)} est.</span>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 p-5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-serif text-2xl font-bold">Grocery list preview</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {result.groceryList.items.slice(0, 9).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="text-slate-500">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup?next=/start/save"
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D97757] px-5 py-3 font-semibold text-white shadow-lg shadow-[#D97757]/20 hover:bg-[#C86646]"
              >
                Save this plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
