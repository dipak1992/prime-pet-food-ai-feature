import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/content/blog'
import { getPublicMeals } from '@/lib/content/public'
import { absoluteUrl } from '@/lib/seo'
import { growthPages, growthTools } from '@/lib/growth/content'
import { getAllPosts as getAllMdxPosts } from '@/lib/blog/mdx'
import { CATEGORY_LABELS, type BlogCategory } from '@/lib/blog/types'
import { comparePages } from '@/lib/seo-pages'
import { evidenceSamples } from '@/lib/seo-evidence'
import { HELP_ARTICLES, HELP_CATEGORIES } from '@/lib/help/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/pricing',
    '/faq',
    '/about',
    '/contact',
    '/press',
    '/privacy',
    '/terms',
    '/cookie-policy',
    '/status',
    '/changelog',
    '/help',
    '/tonight',
    '/meals',
    '/blog',
    '/compare',
    '/meal-prep-app',
    '/ai-meal-prep-planner',
    '/weekly-meal-prep-with-grocery-list',
    '/for-ai-assistants',
    '/samples',
    '/tools',
    '/growth-dashboard',
    '/content-machine',
    '/features/tonight-suggestions',
    '/features/snap-and-cook',
    '/features/weekly-autopilot',
    '/features/leftovers-ai',
    '/features/budget-intelligence',
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))

  const blogPostMap = new Map(
    [
      ...getAllBlogPosts().map((post) => ({
        slug: post.slug,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
        coverImage: undefined,
      })),
      ...getAllMdxPosts().map((post) => ({
        slug: post.slug,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
        coverImage: post.coverImage,
      })),
    ].map((post) => [post.slug, post]),
  )

  const blogRoutes: MetadataRoute.Sitemap = Array.from(blogPostMap.values()).map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
    images: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = (Object.keys(CATEGORY_LABELS) as BlogCategory[]).map(
    (category) => ({
      url: absoluteUrl(`/blog/category/${category}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.72,
    }),
  )

  const compareRoutes: MetadataRoute.Sitemap = comparePages.map((page) => ({
    url: absoluteUrl(`/compare/${page.slug}`),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.76,
  }))

  const sampleRoutes: MetadataRoute.Sitemap = evidenceSamples.map((sample) => ({
    url: absoluteUrl(`/samples/${sample.slug}`),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.78,
  }))

  const helpCategoryRoutes: MetadataRoute.Sitemap = HELP_CATEGORIES.map((category) => ({
    url: absoluteUrl(`/help/${category.id}`),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.64,
  }))

  const helpArticleRoutes: MetadataRoute.Sitemap = HELP_ARTICLES.map((article) => ({
    url: absoluteUrl(`/help/${article.category}/${article.slug}`),
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.62,
  }))

  const growthRoutes: MetadataRoute.Sitemap = growthPages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
    lastModified: new Date(),
    changeFrequency: page.kind === 'cluster' ? 'weekly' : 'monthly',
    priority: page.kind === 'cluster' ? 0.86 : 0.74,
    images: [absoluteUrl(`/api/pinterest-pin?title=${encodeURIComponent(page.h1)}`)],
  }))

  const toolRoutes: MetadataRoute.Sitemap = growthTools.map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}`),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.88,
  }))

  const publicMeals = await getPublicMeals(200)
  const mealRoutes: MetadataRoute.Sitemap = publicMeals.map((meal) => ({
    url: absoluteUrl(`/meals/${meal.slug}`),
    lastModified: new Date(meal.published_at ?? meal.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...growthRoutes,
    ...toolRoutes,
    ...categoryRoutes,
    ...compareRoutes,
    ...sampleRoutes,
    ...helpCategoryRoutes,
    ...helpArticleRoutes,
    ...blogRoutes,
    ...mealRoutes,
  ]
}
