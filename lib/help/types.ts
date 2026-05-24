export type HelpCategoryId =
  | 'getting-started'
  | 'tonight'
  | 'snap-cook'
  | 'leftovers'
  | 'autopilot'
  | 'budget'
  | 'billing'
  | 'account'
  | 'troubleshooting'

export type HelpCategory = {
  id: HelpCategoryId
  title: string
  description: string
  icon: string
}

export type HelpArticle = {
  slug: string
  category: HelpCategoryId
  title: string
  description: string
  body: string // markdown-lite (paragraphs + headings)
  updatedAt: string
  relatedSlugs?: string[]
}
