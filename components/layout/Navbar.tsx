'use client'

import type { SubscriptionTier } from '@/types'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  LogOut,
  User,
  Crown,
  BarChart2,
  Gift,
  Home,
  CalendarDays,
  Camera,
  DollarSign,
  Recycle,
  Utensils,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'
import { cn } from '@/lib/utils'

// Five-job spine: Tonight, Cook, Plan, Leftovers, Budget
const coreNav = [
  { href: '/dashboard/tonight', label: 'Tonight', icon: Utensils },
  { href: '/dashboard/cook', label: 'Cook', icon: Camera },
  { href: '/planner', label: 'Plan', icon: CalendarDays },
  { href: '/leftovers', label: 'Leftovers', icon: Recycle },
  { href: '/budget', label: 'Budget', icon: DollarSign },
] as const

export function Navbar({ userEmail, subscriptionTier = 'free' }: { userEmail?: string; subscriptionTier?: SubscriptionTier }) {
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isPro = subscriptionTier === 'pro'
  const isPaid = isPro

  function isNavActive(href: string) {
    return pathname?.startsWith(href)
  }

  // Close menu on click outside or Escape
  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(e: PointerEvent) {
      // Ignore clicks on the toggle button itself — the onClick handler manages that
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  async function handleSignOut() {
    setSigningOut(true)
    closeMenu()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'ME'

  return (
    <header className="sticky top-0 z-[70] w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl dark:bg-neutral-950/80 dark:border-neutral-800/60 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <MealEaseLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Core app navigation">
          {coreNav.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-ring',
                  active
                    ? 'bg-[#FDF6F1] text-[#D97757]'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                )}
              >
                <Icon className={cn('h-4 w-4', active && 'stroke-[2.5]')} aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side — tier badge + upgrade + account */}
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Badge
              variant="outline"
              className="inline-flex border-amber-300 bg-amber-50 text-amber-800"
            >
              <Crown className="mr-1.5 h-3 w-3" />
              Plus Member
            </Badge>
          ) : (
            <>
              <Badge
                variant="outline"
                className="inline-flex border-[#D97757]/20 bg-[#D97757]/5 text-[#D97757]"
              >
                Free
              </Badge>
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full bg-[#D97757] hover:bg-[#c4684a] text-white border-0 shadow-sm transition-all duration-200 hover:shadow-md">
                <Link href="/upgrade">Upgrade to Plus</Link>
              </Button>
            </>
          )}

          {/* Account menu */}
          <div className="relative" ref={menuRef}>
            <button
              ref={buttonRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full p-0 border-0 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 focus-visible:outline-none focus-ring"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D97757]/10 text-[#D97757] text-xs font-semibold transition-transform duration-150 hover:scale-105">
                {initials}
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="fixed right-4 top-16 z-[80] w-52 rounded-xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl py-1 shadow-xl shadow-neutral-950/8 dark:border-neutral-800 dark:bg-neutral-950/95 sm:absolute sm:right-0 sm:top-full sm:mt-2"
              >
                {userEmail && (
                  <div className="px-3 py-2 text-xs text-neutral-500 truncate border-b border-neutral-200/60 dark:border-neutral-800">
                    {userEmail}
                  </div>
                )}
                <button
                  role="menuitem"
                  onClick={() => { closeMenu(); router.push('/settings') }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#FDF6F1] dark:hover:bg-neutral-800 transition-colors duration-150"
                >
                  <User className="h-4 w-4" />
                  Profile &amp; Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => { closeMenu(); router.push('/dashboard/household') }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#FDF6F1] dark:hover:bg-neutral-800 transition-colors duration-150"
                >
                  <Home className="h-4 w-4" />
                  Household
                </button>
                <button
                  role="menuitem"
                  onClick={() => { closeMenu(); router.push('/insights') }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#FDF6F1] dark:hover:bg-neutral-800 transition-colors duration-150"
                >
                  <BarChart2 className="h-4 w-4" />
                  Insights
                </button>
                {!isPaid && (
                  <button
                    role="menuitem"
                    onClick={() => { closeMenu(); router.push('/upgrade') }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#FDF6F1] dark:hover:bg-neutral-800 transition-colors duration-150"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade to Plus
                  </button>
                )}
                <button
                  role="menuitem"
                  onClick={() => { closeMenu(); router.push('/referral') }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#FDF6F1] dark:hover:bg-neutral-800 transition-colors duration-150"
                >
                  <Gift className="h-4 w-4" />
                  Refer Friends
                </button>
                <div className="border-t border-neutral-200/60 dark:border-neutral-800 my-1" />
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors duration-150 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
