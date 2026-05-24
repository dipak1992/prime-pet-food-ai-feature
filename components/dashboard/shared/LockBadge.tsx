import { Lock } from 'lucide-react'

export function LockBadge({ label = 'Plus' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757]/10 text-[#D97757] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
      <Lock className="w-2.5 h-2.5" />
      {label}
    </span>
  )
}
