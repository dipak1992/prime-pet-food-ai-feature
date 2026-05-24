import { cn } from '@/lib/utils'

export function Container({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 sm:px-8',
        wide ? 'max-w-[1400px]' : 'max-w-[1200px]',
        className
      )}
    >
      {children}
    </div>
  )
}
