import Image from 'next/image'
import {
  Camera,
  CalendarDays,
  ChevronRight,
  Clock3,
  DollarSign,
  Home,
  RefreshCcw,
  Recycle,
  ShieldCheck,
  Sparkles,
  Utensils,
  Users,
} from 'lucide-react'
import { getLandingTonightMeal } from '@/lib/tonight/engine'
import {
  LandingHeroGreeting,
  LandingHeroPromptMessage,
  LandingHeroPromptTime,
  LandingHeroStatusTime,
  LandingHeroWeekdayBadge,
} from './LandingHeroLiveMeta'

const navItems = [
  { label: 'Tonight', icon: Utensils, active: true },
  { label: 'Cook', icon: Camera },
  { label: 'Plan', icon: CalendarDays },
  { label: 'Leftovers', icon: Recycle },
  { label: 'Budget', icon: DollarSign },
]

function formatDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export function LandingTonightPreview() {
  const meal = getLandingTonightMeal()
  const cost = `~$${meal.costPerServing.toFixed(2)}/serving`
  const difficulty = formatDifficulty(meal.difficulty)

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#FFFDF8]">
      <div className="flex items-center justify-between px-8 pt-5 text-neutral-950">
        <LandingHeroStatusTime />
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-1 rounded-full bg-neutral-300" />
          <span className="h-3.5 w-1 rounded-full bg-neutral-400" />
          <span className="h-4.5 w-1 rounded-full bg-neutral-700" />
          <span className="text-[10px] font-bold">20</span>
        </div>
      </div>

      <div className="flex items-start justify-between px-8 pb-2 pt-4">
        <div>
          <p className="text-[14px] font-black uppercase tracking-[0.16em] text-[#D97757]">
            MealEase
          </p>
          <LandingHeroGreeting />
        </div>
        <span className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#D97757] shadow-lg shadow-orange-100 ring-1 ring-orange-100">
          <Home className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="px-8">
        <LandingHeroWeekdayBadge />
        <p className="mt-3 text-[13px] font-medium text-neutral-500">
          <LandingHeroPromptTime /> <span className="px-1">·</span> <LandingHeroPromptMessage />
        </p>
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-neutral-900/10 ring-1 ring-neutral-200">
        <div className="relative h-56 overflow-hidden bg-neutral-900">
          <Image
            src={meal.image}
            alt={`${meal.name} dinner preview`}
            fill
            sizes="(max-width: 768px) 260px, 300px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/22 via-neutral-950/38 to-neutral-950/72" />
          <div className="absolute left-4 right-4 top-4 flex gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Tonight&apos;s Pick
            </span>
            {meal.chefVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Chef-Verified
              </span>
            )}
          </div>

          <div className="absolute inset-x-4 bottom-3 text-white">
            <h4 className="font-serif text-[28px] font-bold leading-[0.98]">
              {meal.name}
            </h4>
            <div className="mt-3 flex items-center gap-3 text-[12px] font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-[#F3B18E]" aria-hidden />
                {meal.cookTimeMin} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4 text-[#F3B18E]" aria-hidden />
                {meal.servings} servings
              </span>
              <span>{difficulty}</span>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-emerald-700 px-3 py-1.5 text-[12px] font-bold">
              {cost}
            </span>
            <p className="mt-2 text-[12px] font-semibold text-white/86">3 swaps left today</p>
          </div>
        </div>

        <div className="p-4">
          <div className="border-l-4 border-[#D97757] pl-3">
            <p className="text-[14px] leading-5 text-neutral-700">
              <span className="font-bold text-neutral-950">Why this?</span> {meal.reason}
            </p>
          </div>

          <button className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#D97757] to-[#D86B42] text-[15px] font-bold text-white shadow-lg shadow-orange-200/60">
            Cook this
            <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
          </button>
          <button className="mt-2.5 flex h-10 w-full items-center justify-center rounded-full bg-neutral-50 text-[14px] font-bold text-neutral-800 shadow-inner ring-1 ring-neutral-200">
            <RefreshCcw className="mr-2 h-4 w-4" aria-hidden />
            Show another
          </button>

          <p className="mt-3 max-w-[190px] text-[12px] font-semibold leading-4 text-[#D97757]">
            Want meals based on your preferences, groceries, and leftovers?
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-neutral-200 bg-white/92 px-4 pb-4 pt-3 backdrop-blur">
        <div className="grid grid-cols-5 gap-1 text-center">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={item.active ? 'text-[#D97757]' : 'text-neutral-500'}
              >
                <Icon className="mx-auto h-5 w-5" aria-hidden />
                <p className="mt-1 text-[10px] font-semibold">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
