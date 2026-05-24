import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'
import { marketingStats } from '@/lib/marketing/stats'

type Props = {
  title: string
  subtitle: string
  footerText: string
  footerLink: { label: string; href: string }
  children: ReactNode
}

export function AuthShell({
  title,
  subtitle,
  footerText,
  footerLink,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF6F1] to-white dark:from-neutral-950 dark:to-neutral-950">
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Form side — mobile: image bg + glass card; desktop: clean white */}
        <div className="relative flex flex-col justify-center px-4 py-6 lg:px-12 xl:px-20 lg:py-12">
          {/* Mobile-only background image (hidden on lg+) */}
          <div className="absolute inset-0 lg:hidden">
            <Image
              src="/images/auth_hero_mobile.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              fetchPriority="high"
            />
            {/* Stronger overlay + slight blur boost so card pops cleanly */}
            <div className="absolute inset-0 bg-neutral-900/65 dark:bg-neutral-950/78" />
          </div>

          {/* Mobile: glassmorphism card wrapping the form; desktop: plain container */}
          <div className="relative z-10 mx-auto w-full max-w-sm">
            <div className="lg:contents">
              {/* Glass card — mobile only; premium elevated card on desktop */}
              <div className="rounded-3xl bg-white/92 dark:bg-neutral-900/92 backdrop-blur-xl shadow-2xl shadow-black/30 ring-1 ring-white/60 dark:ring-white/10 px-6 py-8 lg:bg-white lg:shadow-elevated lg:ring-1 lg:ring-neutral-100 lg:dark:ring-neutral-800 lg:backdrop-blur-none lg:px-8 lg:py-10 lg:rounded-3xl">
                {/* Logo */}
                <Link href="/" aria-label="MealEase home" className="inline-flex items-center mb-6">
                  <MealEaseLogo size="md" showBadge />
                </Link>

                <div className="mb-6">
                  <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1.5 tracking-tight">
                    {title}
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {subtitle}
                  </p>
                </div>

                {children}

                <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {footerText}{' '}
                  <Link
                    href={footerLink.href}
                    className="font-medium text-[#D97757] hover:underline"
                  >
                    {footerLink.label}
                  </Link>
                </p>

                {/* Trust signals */}
                <div className="mt-5 flex items-center justify-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                  <span>Free forever</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                  <span>2-minute setup</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                  <span>No card needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual side — auth hero: family staring at takeout with full fridge */}
        <div className="hidden lg:flex flex-col justify-end px-12 xl:px-20 pb-16 relative overflow-hidden">
          {/* Hero image — 146KB optimized JPEG, next/image serves WebP/AVIF at runtime */}
          <div className="absolute inset-0">
            <Image
              src="/images/auth_hero.jpg"
              alt="Family with a full fridge still ordering takeout — the problem MealEase solves"
              fill
              sizes="50vw"
              className="object-cover object-[30%_center]"
              fetchPriority="high"
            />
          </div>

          {/* Gradient layers for text readability over warm kitchen scene */}
          {/* Left-side dark band where quote sits */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          {/* Bottom darkening for stats */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

          {/* Content — bottom-left, darkest zone */}
          <div className="relative z-10 max-w-xs">
            {/* Brand accent */}
            <div className="w-8 h-0.5 rounded-full bg-[#D97757] mb-5" />

            <blockquote className="text-white text-lg font-serif leading-relaxed mb-5 drop-shadow-sm">
              &ldquo;We had a fridge full of food and still ordered takeout three
              nights a week.&rdquo;
            </blockquote>
            <div className="text-white/75 text-sm">
              <p className="font-semibold text-white">— Dipak &amp; Suprabha</p>
              <p className="mt-0.5">Co-founders. Parents of two. Former takeout enthusiasts.</p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-5">
              <Stat label="Household size" value={marketingStats.householdCount} />
              <Stat label="Recipes" value={marketingStats.dinnersPlanned} />
              <Stat label="Budget" value={marketingStats.savings} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer — copyright hidden on mobile (auth page glass card fills viewport) */}
      <footer className="hidden lg:block border-t border-neutral-200 dark:border-neutral-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} MealEase</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-neutral-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-white font-semibold text-lg drop-shadow-sm">{value}</p>
    </div>
  )
}
