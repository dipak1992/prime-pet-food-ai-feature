import Link from 'next/link'
import { BookOpenCheck, Download, UserRoundCheck } from 'lucide-react'
import { CATEGORY_LABELS, type BlogPost } from '@/lib/blog/types'

const authorBios: Record<string, string> = {
  Dipak:
    'Dipak is a MealEase co-founder and product builder focused on turning daily dinner decisions into simple household workflows.',
  Suprabha:
    'Suprabha is a MealEase co-founder, CPA, and parent who writes about the practical side of feeding a busy household.',
  'MealEase Editorial':
    'The MealEase Editorial team writes practical guides based on the app workflows, household planning patterns, and common dinner problems families bring to MealEase.',
}

const commercialLinks: Record<string, Array<{ href: string; label: string }>> = {
  household: [
    { href: '/meal-prep-app', label: 'Meal prep app for families' },
    { href: '/meal-prep-app', label: 'Meal prep for parents' },
  ],
  weekly: [
    { href: '/weekly-meal-prep-with-grocery-list', label: 'Weekly meal prep with grocery list' },
    { href: '/meal-prep-app', label: 'Family meal prep app' },
  ],
  budget: [
    { href: '/meal-prep-app', label: 'Budget-aware meal prep app' },
    { href: '/ai-meal-prep-planner', label: 'AI meal prep planner' },
  ],
  leftovers: [
    { href: '/meal-prep-app', label: 'Meal prep app with leftovers support' },
    { href: '/ai-meal-prep-planner', label: 'AI planner for leftovers' },
  ],
  commercial: [
    { href: '/ai-meal-prep-planner', label: 'AI meal prep planner' },
    { href: '/compare', label: 'MealEase comparisons' },
  ],
  autopilot: [
    { href: '/weekly-meal-prep-with-grocery-list', label: 'Weekly meal prep with grocery list' },
    { href: '/ai-meal-prep-planner', label: 'AI weekly meal planner' },
  ],
  pantry: [
    { href: '/ai-meal-prep-planner', label: 'AI planner from pantry ingredients' },
    { href: '/meal-prep-app', label: 'Meal prep app for real kitchens' },
  ],
  snap: [
    { href: '/ai-meal-prep-planner', label: 'AI meal prep planner with fridge scan' },
    { href: '/meal-prep-app', label: 'Meal prep app with fridge scan' },
  ],
  tonight: [
    { href: '/ai-meal-prep-planner', label: 'AI dinner planning app' },
    { href: '/meal-prep-app', label: 'Meal prep app for busy families' },
  ],
}

const leadMagnets = [
  {
    href: '/lead-magnets/family-meal-prep-checklist.md',
    label: 'Family meal prep checklist',
  },
  {
    href: '/lead-magnets/weekly-grocery-list-template.md',
    label: 'Weekly grocery list template',
  },
  {
    href: '/lead-magnets/picky-eater-dinner-planner.md',
    label: 'Picky eater dinner planner',
  },
]

export function BlogTrustBlocks({ post }: { post: BlogPost }) {
  const bio = authorBios[post.author] ?? authorBios['MealEase Editorial']
  const links = commercialLinks[post.category] ?? commercialLinks.commercial

  return (
    <section className="my-10 space-y-4" aria-label="Article context">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex gap-3">
          <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D97757]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              About the author
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {bio}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex gap-3">
          <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D97757]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              How we created this guide
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              This guide was written from MealEase product workflows, common household meal planning patterns, and the practical questions families ask around {CATEGORY_LABELS[post.category].toLowerCase()}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="rounded-full bg-[#FDF6F1] px-3 py-1.5 text-xs font-semibold text-[#C86646] ring-1 ring-[#E7D5CB] hover:bg-[#F9E7DD]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-[#FDF6F1] p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex gap-3">
          <Download className="mt-0.5 h-5 w-5 shrink-0 text-[#D97757]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              Downloadable planning tools
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {leadMagnets.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  download
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 ring-1 ring-neutral-200 hover:text-[#D97757] dark:bg-neutral-950 dark:text-neutral-100 dark:ring-neutral-800"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
