'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : `https://mealease.ai/blog/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 mr-1">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X / Twitter"
        className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-[#D97757] hover:text-white flex items-center justify-center transition-colors"
      >
        {/* X (Twitter) icon */}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <button
        onClick={copy}
        aria-label="Copy link"
        className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-[#D97757] hover:text-white flex items-center justify-center transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}
