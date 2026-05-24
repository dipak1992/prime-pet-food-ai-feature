import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { BlogFrontmatter, BlogPost } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as BlogFrontmatter

  if (fm.draft && process.env.NODE_ENV === 'production') return null

  const rt = readingTime(content)

  return {
    ...fm,
    slug,
    readingTimeMinutes: Math.max(1, Math.round(rt.minutes)),
    wordCount: rt.words,
  }
}

export function getAllPosts(): BlogPost[] {
  return getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => p !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug)
  if (!post) return []
  return getAllPosts()
    .filter(
      (p) =>
        p.slug !== slug &&
        (p.category === post.category ||
          p.tags?.some((t) => post.tags?.includes(t)))
    )
    .slice(0, limit)
}
