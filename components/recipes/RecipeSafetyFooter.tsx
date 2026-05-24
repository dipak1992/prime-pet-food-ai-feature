import { AlertTriangle, ShieldCheck, Thermometer } from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'

type Props = {
  recipe: LoadedRecipe
}

export function RecipeSafetyFooter({ recipe }: Props) {
  const hasAllergens = recipe.allergenWarnings.length > 0
  const hasRules = recipe.culinaryRules.length > 0
  const notes = recipe.safetyNotes.slice(0, 4)

  if (!hasAllergens && !hasRules && notes.length === 0) return null

  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <h2 className="text-base font-semibold text-slate-950">Smart Safety</h2>
      </div>

      <div className="space-y-3 text-sm text-slate-700">
        {hasAllergens && (
          <div className="flex gap-2 rounded-2xl bg-white/78 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              Potential allergens:{' '}
              <span className="font-semibold">
                {recipe.allergenWarnings.map((warning) => warning.allergen.replace('_', ' ')).join(', ')}
              </span>
              .
            </p>
          </div>
        )}

        {hasRules && (
          <div className="flex gap-2 rounded-2xl bg-white/78 p-3">
            <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <ul className="space-y-1">
              {recipe.culinaryRules.slice(0, 3).map((rule) => (
                <li key={rule.id}>
                  <span className="font-semibold">{rule.title}:</span> {rule.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes.length > 0 && (
          <ul className="space-y-1 text-xs text-slate-600">
            {notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
