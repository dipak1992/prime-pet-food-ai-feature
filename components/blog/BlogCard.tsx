import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { CATEGORY_LABELS, type BlogPost } from '@/lib/blog/types'

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={featured ? 'lg:grid lg:grid-cols-2 lg:gap-8 group' : 'group'}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800 aspect-[16/10]`}
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes={featured ? '50vw' : '(max-width: 768px) 100vw, 33vw'}
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D97757] to-[#B8935A] flex items-center justify-center text-white/70 font-serif text-4xl">
              {post.title[0]}
            </div>
          )}
        </div>
      </Link>

      <div className={featured ? 'mt-5 lg:mt-0 lg:py-4' : 'mt-4'}>
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
          <span className="uppercase tracking-wider font-medium text-[#D97757]">
            {CATEGORY_LABELS[post.category]}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3
            className={`font-serif font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-[#D97757] transition-colors leading-tight ${
              featured ? 'text-2xl md:text-3xl' : 'text-xl'
            }`}
          >
            {post.title}
          </h3>
        </Link>

        <p
          className={`mt-2 text-neutral-600 dark:text-neutral-400 ${
            featured ? 'text-base' : 'text-sm'
          } leading-relaxed`}
        >
          {post.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
      </div>
    </article>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
