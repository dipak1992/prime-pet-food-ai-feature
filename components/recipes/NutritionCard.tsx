import { Activity } from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'

type NutritionData = NonNullable<LoadedRecipe['nutrition']>

type Props = {
  nutrition: NutritionData
  perServing?: boolean
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function NutritionCard({ nutrition, perServing = true }: Props) {
  const items = [
    { label: 'Calories', value: nutrition.calories, unit: 'kcal', max: 800,  color: '#D97757' },
    { label: 'Protein',  value: nutrition.protein,  unit: 'g',    max: 60,   color: '#B8935A' },
    { label: 'Carbs',    value: nutrition.carbs,    unit: 'g',    max: 100,  color: '#6B9E78' },
    { label: 'Fat',      value: nutrition.fat,      unit: 'g',    max: 50,   color: '#8B7EC8' },
  ]

  return (
    <div className="rounded-3xl border border-orange-100/80 bg-white/88 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
        <Activity className="h-4 w-4 text-[#D97757]" />
        Nutrition
        {perServing && <span className="text-xs font-normal text-slate-500">per serving</span>}
      </h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-medium text-slate-700">
                {item.value}{item.unit}
              </span>
            </div>
            <Bar value={item.value} max={item.max} color={item.color} />
          </div>
        ))}
      </div>
    </div>
  )
}
