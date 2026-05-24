'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/planner', label: 'Plan', icon: Calendar },
  { href: '/meals', label: 'Recipes', icon: BookOpen },
  { href: '/settings', label: 'Profile', icon: User },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50"
          >
            MealEase
          </Link>
          <nav className="flex items-center gap-6" aria-label="Primary navigation">
            {tabs.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + '/')
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    'text-sm transition-colors',
                    active
                      ? 'text-[#D97757] font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary navigation"
      >
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = pathname === t.href || pathname.startsWith(t.href + '/')
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 min-h-[56px] text-[11px] transition-colors',
                    active
                      ? 'text-[#D97757]'
                      : 'text-neutral-500 dark:text-neutral-400'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  {t.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
