import Image from 'next/image'
import { Clock, Users, DollarSign, ChefHat, ShieldCheck } from 'lucide-react'
import type { LoadedRecipe } from '@/app/recipes/[id]/loader'

type Props = {
  recipe: LoadedRecipe
}

export function RecipeHero({ recipe }: Props) {
  const totalTime = recipe.prepTimeMin + recipe.cookTimeMin

  const difficultyColor = {
    easy: 'text-emerald-200',
    medium: 'text-amber-200',
    hard: 'text-red-200',
  }[recipe.difficulty]

  return (
    <div className="relative">
      {/* Hero image */}
      <div className="relative h-64 w-full overflow-hidden rounded-3xl sm:h-80">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50 text-6xl">
            🍽️
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/16 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Tags */}
        {(recipe.tags.length > 0 || recipe.verifiedStatus !== 'unverified') && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {recipe.verifiedStatus !== 'unverified' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3" />
                {recipe.verifiedStatus === 'chef_verified' ? 'Chef-Verified' : 'Safety Reviewed'}
              </span>
            )}
            {recipe.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-2xl font-bold text-white sm:text-3xl">{recipe.name}</h1>
        {recipe.description && (
          <p className="mt-1 text-sm text-white/70">{recipe.description}</p>
        )}

        {/* Stats row */}
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Clock className="h-4 w-4 text-[#D97757]" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Users className="h-4 w-4 text-[#D97757]" />
            <span>Serves {recipe.servings}</span>
          </div>
          {recipe.costTotal > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <DollarSign className="h-4 w-4 text-[#B8935A]" />
              <span>${recipe.costTotal.toFixed(2)}</span>
            </div>
          )}
          <div className={['flex items-center gap-1.5 text-sm', difficultyColor].join(' ')}>
            <ChefHat className="h-4 w-4" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
