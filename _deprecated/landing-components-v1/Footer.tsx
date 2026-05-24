import Link from 'next/link'
import { Container } from './shared/Container'

const links = {
  Product: [
    { label: 'Tonight Suggestions', href: '#pillars' },
    { label: 'Snap & Cook', href: '#pillars' },
    { label: 'Weekly Autopilot', href: '#pillars' },
    { label: 'Leftovers AI', href: '#pillars' },
    { label: 'Budget Intelligence', href: '#pillars' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'Status', href: '/status' },
    { label: 'FAQ', href: '#faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer
      className="bg-neutral-950 text-neutral-400 pt-16 pb-10"
      aria-label="Site footer"
    >
      <Container>
        {/* Top: brand + nav */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-serif text-xl font-bold text-white hover:text-[#D97757] transition-colors"
              aria-label="MealEase home"
            >
              MealEase
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              AI-powered meal planning for real households.
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
          <p>© {new Date().getFullYear()} MealEase, Inc. All rights reserved.</p>
          <p>Made with ♥ for households everywhere.</p>
        </div>
      </Container>
    </footer>
  )
}
