import type { ChangelogEntry, ChangeType } from '@/lib/changelog/entries'
import { Sparkles, TrendingUp, Wrench } from 'lucide-react'

const TYPE_CONFIG: Record<
  ChangeType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  new: {
    label: 'New',
    icon: Sparkles,
    color: 'bg-[#D97757]/10 text-[#D97757]',
  },
  improved: {
    label: 'Improved',
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  fixed: {
    label: 'Fixed',
    icon: Wrench,
    color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
}

export function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="relative pl-8 md:pl-12">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#D97757] ring-4 ring-white dark:ring-neutral-950" />

      <div className="mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-[#D97757]/10 text-[#D97757] text-xs font-semibold px-2.5 py-1">
            v{entry.version}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatDate(entry.date)}
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-2">
          {entry.title}
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {entry.summary}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {entry.changes.map((c, i) => {
          const cfg = TYPE_CONFIG[c.type]
          const Icon = cfg.icon
          return (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shrink-0 mt-0.5 ${cfg.color}`}
              >
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{c.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
