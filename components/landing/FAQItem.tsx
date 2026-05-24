'use client'

import { useState } from 'react'

export function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const id = `faq-${index}`

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-[#D97757] transition-colors">
          {q}
        </span>
        <span
          aria-hidden
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <div
        id={id}
        role="region"
        hidden={!open}
        className="pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm"
      >
        {a}
      </div>
    </div>
  )
}
