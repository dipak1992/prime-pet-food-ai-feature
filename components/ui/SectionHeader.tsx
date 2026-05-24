import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({ badge, title, subtitle, align = 'center', className }: SectionHeaderProps) {
  return (
    <div className={cn(
      'max-w-2xl mb-12 md:mb-16',
      align === 'center' ? 'mx-auto text-center' : '',
      className
    )}>
      {badge && (
        <span className="inline-block mb-3 px-3 py-1 text-caption font-medium uppercase tracking-wider text-[#D97757] bg-[#D97757]/8 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="text-heading font-semibold text-neutral-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-body-lg text-neutral-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
