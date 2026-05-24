'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Camera, DollarSign, Recycle, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'

// Five-job spine: the 5 core jobs users hire MealEase for.
const TABS = [
  { href: '/dashboard/tonight', label: 'Tonight',   icon: Utensils },
  { href: '/dashboard/cook',    label: 'Cook',      icon: Camera },
  { href: '/planner',           label: 'Plan',      icon: CalendarDays },
  { href: '/leftovers',         label: 'Leftovers', icon: Recycle },
  { href: '/budget',            label: 'Budget',    icon: DollarSign },
]

export function MobileTabBar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname?.startsWith(href)
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200/60 bg-white/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Main app navigation"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-200 active:scale-[0.95] focus-visible:outline-none focus-ring',
                active
                  ? 'text-[#D97757]'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <Icon
                className={cn(
                  'h-[22px] w-[22px] transition-all duration-200',
                  active && 'stroke-[2.5]'
                )}
                aria-hidden="true"
              />
              <span>{label}</span>
              {/* Active dot indicator */}
              {active && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#D97757]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
