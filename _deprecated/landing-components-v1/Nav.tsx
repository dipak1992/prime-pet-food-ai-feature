'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { site } from '@/config/site'

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60">
      <Container>
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50"
          >
            MealEase
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#D97757] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/signup" className="h-10 min-h-[40px] px-5 text-sm">
              Start Free
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col gap-4">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base text-neutral-800 dark:text-neutral-200 py-2 min-h-[48px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/signup" className="mt-2">
              Start Free
            </Button>
          </div>
        )}
      </Container>
    </header>
  )
}
