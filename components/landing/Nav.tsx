import Link from 'next/link'
import { Camera, ChevronDown, Menu } from 'lucide-react'
import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { site } from '@/config/site'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60">
      <Container>
        <input id="landing-nav-toggle" type="checkbox" className="peer sr-only lg:hidden" />
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" aria-label="MealEase home" className="flex items-center">
            <MealEaseLogo size="md" showBadge />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-7">
            <div
              className="group relative"
            >
              <button
                type="button"
                aria-haspopup="menu"
                className="inline-flex min-h-10 items-center gap-1 text-sm text-neutral-700 transition-colors hover:text-[#D97757] dark:text-neutral-300"
              >
                Features
                <ChevronDown
                  className="h-4 w-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  aria-hidden
                />
              </button>
              <div
                className="invisible absolute left-1/2 top-full z-50 w-[440px] -translate-x-1/2 -translate-y-1 pt-3 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
              >
                <div
                  role="menu"
                  className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl shadow-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="grid gap-1">
                    {site.features.map((feature) => (
                      <Link
                        key={feature.href}
                        href={feature.href}
                        role="menuitem"
                        className="rounded-xl px-4 py-3 transition-colors hover:bg-[#FDF6F1] focus:bg-[#FDF6F1] focus:outline-none dark:hover:bg-neutral-900 dark:focus:bg-neutral-900"
                      >
                        <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {feature.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {feature.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#D97757] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/start" className="h-10 min-h-[40px] px-5 text-sm">
              Plan dinner free
            </Button>
          </div>

          <label
            htmlFor="landing-nav-toggle"
            className="-mr-2 flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </label>
        </nav>

        {/* Mobile menu */}
        <div className="hidden pb-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 peer-checked:flex flex-col gap-4 lg:hidden">
            <Link
              href="/demo/scan"
              className="flex items-center gap-3 rounded-2xl bg-neutral-950 p-4 text-white shadow-xl shadow-neutral-950/10 dark:bg-white dark:text-neutral-950"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757] text-white">
                <Camera className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold">Try the fridge scanner free</span>
                <span className="mt-0.5 block text-xs text-white/68 dark:text-neutral-600">
                  Get a dinner idea before creating an account.
                </span>
              </span>
            </Link>
            <div className="rounded-2xl bg-[#FDF6F1] p-3 dark:bg-neutral-900">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
                Features
              </p>
              <div className="grid gap-1">
                {site.features.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="rounded-xl px-2 py-2.5"
                  >
                    <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {feature.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {feature.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base text-neutral-800 dark:text-neutral-200 py-2 min-h-[48px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/start" className="mt-2">
              Plan dinner free
            </Button>
        </div>
      </Container>
    </header>
  )
}
