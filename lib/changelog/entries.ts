export type ChangeType = 'new' | 'improved' | 'fixed'

export type ChangelogEntry = {
  version: string
  date: string // YYYY-MM-DD
  title: string
  summary: string
  changes: Array<{
    type: ChangeType
    text: string
  }>
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0',
    date: '2024-12-15',
    title: 'The big rebuild',
    summary:
      'We rebuilt MealEase from the ground up around five core questions your kitchen asks every week. Simpler, faster, and more honest.',
    changes: [
      { type: 'new', text: "Tonight Suggestions — one dinner, picked for you every evening" },
      { type: 'new', text: 'Snap & Cook — unified camera tool for fridge, menus, and food' },
      { type: 'new', text: 'Weekly Autopilot — one tap, seven dinners planned' },
      { type: 'new', text: "Leftovers AI — turns yesterday's meal into today's new dinner" },
      { type: 'new', text: 'Budget Intelligence — real grocery budget tracking' },
      { type: 'improved', text: 'Completely redesigned dashboard with all 5 pillars in one view' },
      { type: 'improved', text: '30-second onboarding — down from ~4 minutes' },
      { type: 'improved', text: 'Household sharing on Plus' },
    ],
  },
  {
    version: '0.9',
    date: '2024-11-20',
    title: 'Beta polish',
    summary:
      'Dozens of quality improvements from beta feedback. Thanks to everyone who sent bug reports.',
    changes: [
      { type: 'improved', text: 'Fridge scanner accuracy up from 87% to 94% on common ingredients' },
      { type: 'improved', text: 'Faster dashboard load — LCP under 1.5s on 4G' },
      { type: 'fixed', text: 'Leftover expiry timing corrected for cooked rice and grains' },
      { type: 'fixed', text: 'Budget bar showed wrong color on Safari — resolved' },
    ],
  },
  {
    version: '0.8',
    date: '2024-11-01',
    title: 'Leftovers, for real this time',
    summary:
      'Leftovers AI entered closed beta. It became obvious this was our #1 differentiator.',
    changes: [
      { type: 'new', text: 'Closed beta of Leftovers AI with 50 households' },
      { type: 'new', text: "'Any leftovers?' prompt after every cooked meal" },
      { type: 'new', text: 'Expiration reminders — in-app and email' },
    ],
  },
]
