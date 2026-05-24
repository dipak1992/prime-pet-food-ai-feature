export type BlogCategory =
  | 'tonight'
  | 'leftovers'
  | 'budget'
  | 'weekly'
  | 'pantry'
  | 'commercial'
  | 'autopilot'
  | 'snap'
  | 'household'

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  tonight: 'Tonight',
  leftovers: 'Leftovers',
  budget: 'Budget',
  weekly: 'Weekly Planning',
  pantry: 'Pantry & Fridge',
  commercial: 'Meal Planning Apps',
  autopilot: 'Autopilot',
  snap: 'Snap & Cook',
  household: 'Household',
}

export type BlogFrontmatter = {
  title: string
  description: string
  publishedAt: string // YYYY-MM-DD
  updatedAt?: string
  author: string
  category: BlogCategory
  tags?: string[]
  coverImage?: string
  draft?: boolean
}

export type BlogPost = BlogFrontmatter & {
  slug: string
  readingTimeMinutes: number
  wordCount: number
}
