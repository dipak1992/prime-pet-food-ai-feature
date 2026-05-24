import { productStory } from '@/lib/marketing/stats'

export const site = {
  name: 'MealEase',
  tagline: productStory,
  url: 'https://mealease.ai',
  nav: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Compare', href: '/compare' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Log in', href: '/login' },
  ],
  features: [
    {
      label: 'Tonight Suggestions',
      href: '/features/tonight-suggestions',
      description: 'Pick dinner without rebuilding the context',
    },
    {
      label: 'Snap & Cook',
      href: '/features/snap-and-cook',
      description: "Start with what's already in the fridge",
    },
    {
      label: 'Weekly Autopilot',
      href: '/features/weekly-autopilot',
      description: 'Turn household preferences into a week plan',
    },
    {
      label: 'Leftovers AI',
      href: '/features/leftovers-ai',
      description: 'Turn last night into something new',
    },
    {
      label: 'Budget Intelligence',
      href: '/features/budget-intelligence',
      description: 'Stay under budget before you shop',
    },
    {
      label: '✨ Try the Scanner — Free',
      href: '/demo/scan',
      description: 'See meal ideas from a fridge photo — no signup',
    },
  ],
  brand: {
    primary: '#D97757',
    accent: '#B8935A',
  },
}
