'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLightOnboardingStore } from '@/lib/store'
import type {
  UserDietaryPreferences,
  EatingStyle,
  KidsSpiceTolerance,
} from '@/lib/meal-engine/preferences-types'
import { DEFAULT_PREFS } from '@/lib/meal-engine/preferences-types'

const COOKING_TIME_OPTIONS = [
  { label: '< 20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: 'No limit', value: 120 },
]

// ── Option definitions ────────────────────────────────────────────────────────

const EATING_STYLES: { value: EatingStyle; label: string; emoji: string }[] = [
  { value: 'omnivore', label: 'Omnivore', emoji: '🍖' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  { value: 'halal', label: 'Halal', emoji: '🌙' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
]

const AVOID_FOODS = [
  { value: 'beef', label: '🐄 Beef' },
  { value: 'pork', label: '🐖 Pork' },
  { value: 'eggs', label: '🥚 Eggs' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'seafood', label: '🦐 Seafood' },
  { value: 'mushrooms', label: '🍄 Mushrooms' },
  { value: 'cilantro', label: '🌿 Cilantro' },
  { value: 'onion', label: '🧅 Onion' },
  { value: 'garlic', label: '🧄 Garlic' },
  { value: 'spicy', label: '🌶️ Spicy' },
]

const ALLERGIES = [
  { value: 'peanuts', label: '🥜 Peanuts' },
  { value: 'tree_nuts', label: '🌰 Tree Nuts' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'eggs', label: '🥚 Eggs' },
  { value: 'soy', label: '🫘 Soy' },
  { value: 'gluten', label: '🌾 Gluten' },
  { value: 'sesame', label: '🌼 Sesame' },
  { value: 'shellfish', label: '🦞 Shellfish' },
  { value: 'fish', label: '🐟 Fish' },
]

const PROTEINS = [
  { value: 'chicken', label: '🍗 Chicken' },
  { value: 'fish', label: '🐟 Fish' },
  { value: 'paneer', label: '🧀 Paneer' },
  { value: 'tofu', label: '🫘 Tofu' },
  { value: 'lentils', label: '🫛 Lentils' },
  { value: 'beans', label: '🫘 Beans' },
  { value: 'turkey', label: '🦃 Turkey' },
  { value: 'shrimp', label: '🦐 Shrimp' },
  { value: 'beef', label: '🐄 Beef' },
  { value: 'pork', label: '🐖 Pork' },
]

const CUISINES = [
  { value: 'nepali', label: '🏔️ Nepali' },
  { value: 'indian', label: '🍛 Indian' },
  { value: 'italian', label: '🍝 Italian' },
  { value: 'mexican', label: '🌮 Mexican' },
  { value: 'american', label: '🍔 American' },
  { value: 'korean', label: '🍜 Korean' },
  { value: 'japanese', label: '🍱 Japanese' },
  { value: 'mediterranean', label: '🫒 Mediterranean' },
  { value: 'thai', label: '🥢 Thai' },
  { value: 'chinese', label: '🥟 Chinese' },
  { value: 'french', label: '🥐 French' },
  { value: 'middle_eastern', label: '🧆 Middle Eastern' },
]

const GOALS = [
  { value: 'save_money', label: '💰 Save Money' },
  { value: 'high_protein', label: '💪 High Protein' },
  { value: 'healthy_eating', label: '🥦 Healthy Eating' },
  { value: 'quick_meals', label: '⚡ Quick Meals' },
  { value: 'family_harmony', label: '👨‍👩‍👧 Family Harmony' },
  { value: 'reduce_waste', label: '♻️ Reduce Waste' },
  { value: 'weight_management', label: '⚖️ Weight Management' },
]

const SPICE_LEVELS: { value: KidsSpiceTolerance; label: string }[] = [
  { value: 'none', label: '❄️ None' },
  { value: 'mild', label: '😊 Mild' },
  { value: 'medium', label: '🌶️ Medium' },
  { value: 'spicy', label: '🔥 Spicy' },
]

// ── Chip component ────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted hover:bg-muted/80 text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="glass-card rounded-xl border border-border/60 p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DietaryPreferencesTabProps {
  hasKids?: boolean
}

export function DietaryPreferencesTab({ hasKids = false }: DietaryPreferencesTabProps) {
  const { cookingTimeMinutes, setCookingTimeMinutes } = useLightOnboardingStore()
  const [prefs, setPrefs] = useState<Omit<UserDietaryPreferences, 'user_id' | 'updated_at'>>(
    DEFAULT_PREFS,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    fetch('/api/dietary-preferences')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setPrefs({
            eating_style: data.eating_style ?? DEFAULT_PREFS.eating_style,
            avoid_foods: data.avoid_foods ?? [],
            allergies: data.allergies ?? [],
            favorite_proteins: data.favorite_proteins ?? [],
            cuisine_love: data.cuisine_love ?? [],
            goals: data.goals ?? [],
            kids_spice_tolerance: data.kids_spice_tolerance ?? DEFAULT_PREFS.kids_spice_tolerance,
            kids_foods_love: data.kids_foods_love ?? [],
            kids_foods_reject: data.kids_foods_reject ?? [],
          })
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback(
    (patch: Partial<typeof prefs>) => {
      setPrefs(prev => ({ ...prev, ...patch }))
      setDirty(true)
    },
    [],
  )

  function toggleMulti(key: keyof typeof prefs, value: string) {
    const current = (prefs[key] as string[]) ?? []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    update({ [key]: next })
  }

  async function savePreferences() {
    setSaving(true)
    try {
      const res = await fetch('/api/dietary-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) throw new Error('Save failed')
      setDirty(false)
      toast.success('Dietary preferences saved')
    } catch {
      toast.error('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
        Loading your preferences…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Eating Style */}
      <SectionCard
        title="Eating Style"
        description="We'll filter every suggestion to match your dietary lifestyle."
      >
        <div className="flex flex-wrap gap-2">
          {EATING_STYLES.map(opt => (
            <Chip
              key={opt.value}
              label={`${opt.emoji} ${opt.label}`}
              selected={prefs.eating_style === opt.value}
              onClick={() => update({ eating_style: opt.value })}
            />
          ))}
        </div>
      </SectionCard>

      {/* Allergies */}
      <SectionCard
        title="Allergies"
        description="These are hard rules — we will never suggest meals containing these ingredients."
      >
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={prefs.allergies.includes(opt.value)}
              onClick={() => toggleMulti('allergies', opt.value)}
            />
          ))}
        </div>
        {prefs.allergies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {prefs.allergies.map(a => (
              <Badge key={a} className="bg-red-100 text-red-700 border-0 text-xs">
                ⚠️ {a}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Avoid Foods */}
      <SectionCard
        title="Foods to Avoid"
        description="Soft avoidances — we'll skip these but can suggest substitutes if needed."
      >
        <div className="flex flex-wrap gap-2">
          {AVOID_FOODS.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={prefs.avoid_foods.includes(opt.value)}
              onClick={() => toggleMulti('avoid_foods', opt.value)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Favorite Proteins */}
      <SectionCard
        title="Favorite Proteins"
        description="We'll prioritize these proteins in meal suggestions."
      >
        <div className="flex flex-wrap gap-2">
          {PROTEINS.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={prefs.favorite_proteins.includes(opt.value)}
              onClick={() => toggleMulti('favorite_proteins', opt.value)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Cuisine Love */}
      <SectionCard
        title="Loved Cuisines"
        description="AI suggestions will lean toward these cuisine styles."
      >
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={prefs.cuisine_love.includes(opt.value)}
              onClick={() => toggleMulti('cuisine_love', opt.value)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Goals */}
      <SectionCard
        title="Meal Goals"
        description="What matters most to you? We'll factor these into every recommendation."
      >
        <div className="flex flex-wrap gap-2">
          {GOALS.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={prefs.goals.includes(opt.value)}
              onClick={() => toggleMulti('goals', opt.value)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Max Cooking Time */}
      <SectionCard
        title="Max Cooking Time"
        description="We'll only suggest meals you can realistically make."
      >
        <div className="flex flex-wrap gap-2">
          {COOKING_TIME_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={cookingTimeMinutes === opt.value}
              onClick={() => {
                setCookingTimeMinutes(opt.value)
                fetch('/api/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ cookingTimeMinutes: opt.value }),
                }).catch(() => null)
              }}
            />
          ))}
        </div>
      </SectionCard>

      {/* Kids settings (only when household has kids) */}
      {hasKids && (
        <SectionCard
          title="Kids Settings"
          description="Customise how we handle kids' meal suggestions."
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Spice Tolerance</p>
              <div className="flex flex-wrap gap-2">
                {SPICE_LEVELS.map(opt => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={prefs.kids_spice_tolerance === opt.value}
                    onClick={() => update({ kids_spice_tolerance: opt.value })}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Foods kids love (comma-separated)
              </p>
              <input
                type="text"
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. pasta, chicken nuggets, rice"
                value={prefs.kids_foods_love.join(', ')}
                onChange={e => {
                  const list = e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                  update({ kids_foods_love: list })
                }}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Foods kids refuse (comma-separated)
              </p>
              <input
                type="text"
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. broccoli, mushrooms, onions"
                value={prefs.kids_foods_reject.join(', ')}
                onChange={e => {
                  const list = e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                  update({ kids_foods_reject: list })
                }}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Save button */}
      <div className="flex items-center justify-between pt-2">
        {dirty && (
          <p className="text-xs text-muted-foreground">You have unsaved changes</p>
        )}
        <div className="ml-auto">
          <Button
            onClick={savePreferences}
            disabled={saving || !dirty}
            className="gradient-sage text-white border-0"
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  )
}
