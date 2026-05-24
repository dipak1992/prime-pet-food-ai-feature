import Link from 'next/link'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'
import { productStory } from '@/lib/marketing/stats'

const links = {
  Product: [
    { label: 'Tonight Suggestions', href: '/features/tonight-suggestions' },
    { label: 'Snap & Cook', href: '/features/snap-and-cook' },
    { label: 'Weekly Autopilot', href: '/features/weekly-autopilot' },
    { label: 'Leftovers AI', href: '/features/leftovers-ai' },
    { label: 'Budget Intelligence', href: '/features/budget-intelligence' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Resources: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Help Center', href: '/help' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
}

export function Footer() {
  return (
    <footer
      className="bg-neutral-950 text-neutral-400 pt-16 pb-10"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: brand + nav */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" prefetch={false} aria-label="MealEase home" className="inline-flex items-center">
              <MealEaseLogo size="md" invertText showBadge />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              {productStory}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              MealEase is a product of DDS Supply LLC.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p suppressHydrationWarning>© {new Date().getFullYear()} DDS Supply LLC. All rights reserved.</p>
          <p>Made with ♥ for households everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
