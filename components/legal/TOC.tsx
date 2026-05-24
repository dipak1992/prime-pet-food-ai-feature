'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  sections: Array<{ id: string; title: string }>
}

export function TOC({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [sections])

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'block text-sm py-1 px-2 rounded-md transition-colors',
                active === s.id
                  ? 'text-[#D97757] bg-[#D97757]/8 font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
