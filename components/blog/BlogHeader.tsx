import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'
import { CATEGORY_LABELS, type BlogPost } from '@/lib/blog/types'

export function BlogHeader({ post }: { post: BlogPost }) {
  return (
    <header className="pt-10 pb-10 md:pt-16 md:pb-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#D97757] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
          <Link
            href={`/blog/category/${post.category}`}
            className="uppercase tracking-wider font-medium text-[#D97757] hover:text-[#C86646]"
          >
            {CATEGORY_LABELS[post.category]}
          </Link>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.05]">
          {post.title}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {post.description}
        </p>

        <div className="mt-6 flex items-center gap-3 text-sm text-neutral-500">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D97757] to-[#B8935A]" />
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {post.author}
            </div>
            <time dateTime={post.publishedAt} className="text-xs">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
        </div>

        {post.coverImage && (
          <div className="mt-10 relative aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800">
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              className="object-cover"
            />
          </div>
        )}
      </div>
    </header>
  )
}
