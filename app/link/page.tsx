import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Utensils,
  CalendarDays,
  ShoppingCart,
  Recycle,
  DollarSign,
  BookOpen,
  Camera,
  ArrowRight,
} from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'MealEase AI · Dinner Planner — Free for Families',
  description: 'AI that answers "what\'s for dinner?" — weekly plans, grocery lists, leftovers & more. Free forever.',
  openGraph: {
    title: 'MealEase AI · Dinner Planner',
    description: 'AI that answers "what\'s for dinner?" Built for busy families. Free forever.',
    url: 'https://mealeaseai.com/link',
  },
}

const LINKS = [
  {
    icon: Utensils,
    label: "Plan Tonight's Dinner",
    sublabel: 'Free — no sign-up required',
    href: '/signup',
    primary: true,
  },
  {
    icon: Camera,
    label: 'Snap & Cook Demo',
    sublabel: 'See AI detect your fridge ingredients',
    href: '/demo/scan',
    primary: false,
  },
  {
    icon: CalendarDays,
    label: 'Get Your Weekly Meal Plan',
    sublabel: 'AI-generated for your whole family',
    href: '/features/weekly-autopilot',
    primary: false,
  },
  {
    icon: ShoppingCart,
    label: 'Build Your Grocery List',
    sublabel: 'Budget-smart, store-ready',
    href: '/features/budget-intelligence',
    primary: false,
  },
  {
    icon: Recycle,
    label: 'Use Your Leftovers Tonight',
    sublabel: 'Turn fridge scraps into dinner',
    href: '/features/leftovers-ai',
    primary: false,
  },
  {
    icon: DollarSign,
    label: 'See Pricing',
    sublabel: 'Free forever plan available',
    href: '/pricing',
    primary: false,
  },
  {
    icon: BookOpen,
    label: 'Dinner Ideas Blog',
    sublabel: 'Recipes, tips & meal planning guides',
    href: '/blog',
    primary: false,
  },
]

export default function LinkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF6F1] via-white to-white flex flex-col items-center px-4 py-12 sm:py-16">
      {/* Profile section */}
      <div className="flex flex-col items-center mb-8 text-center">
        {/* Logo / avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D97757] to-[#E8895A] flex items-center justify-center shadow-lg shadow-orange-200/60 mb-4">
          <Utensils className="h-9 w-9 text-white" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          MealEase AI
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          @mealeaseai
        </p>

        {/* Tagline */}
        <p className="mt-3 text-sm text-neutral-700 max-w-xs leading-relaxed">
          🍽️ AI that answers &ldquo;what&rsquo;s for dinner?&rdquo;<br />
          Weekly plans · grocery lists · leftovers<br />
          Built for busy families. <span className="font-semibold text-[#D97757]">Free forever.</span>
        </p>
      </div>

      {/* Links */}
      <div className="w-full max-w-sm space-y-3">
        {LINKS.map(({ icon: Icon, label, sublabel, href, primary }) => (
          <Link
            key={href}
            href={href}
            className={
              primary
                ? 'flex items-center gap-4 w-full rounded-2xl px-5 py-4 bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] text-white shadow-md shadow-orange-200/50 transition-all active:scale-[0.98]'
                : 'flex items-center gap-4 w-full rounded-2xl px-5 py-4 bg-white border border-neutral-200 hover:border-[#D97757]/40 hover:bg-orange-50/30 text-neutral-900 shadow-sm transition-all active:scale-[0.98]'
            }
          >
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${primary ? 'bg-white/20' : 'bg-[#FDF6F1]'}`}>
              <Icon className={`h-5 w-5 ${primary ? 'text-white' : 'text-[#D97757]'}`} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`font-semibold text-sm leading-tight ${primary ? 'text-white' : 'text-neutral-900'}`}>
                {label}
              </p>
              <p className={`text-xs mt-0.5 truncate ${primary ? 'text-white/80' : 'text-neutral-500'}`}>
                {sublabel}
              </p>
            </div>
            <ArrowRight className={`shrink-0 h-4 w-4 ${primary ? 'text-white/80' : 'text-neutral-400'}`} />
          </Link>
        ))}
      </div>

      {/* Product proof */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-400">
          500+ curated recipes &bull; Free forever &bull; No credit card required
        </p>
      </div>

      {/* Instagram follow CTA */}
      <div className="mt-6 flex items-center gap-2">
        <a
          href="https://instagram.com/mealeaseai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-[#D97757] transition-colors"
        >
          <InstagramIcon className="h-3.5 w-3.5" />
          Follow @mealeaseai on Instagram
        </a>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[11px] text-neutral-300">
        &copy; {new Date().getFullYear()} MealEase AI
      </p>
    </main>
  )
}
