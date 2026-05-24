import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  background?: 'white' | 'cream' | 'dark' | 'gradient'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const bgMap = {
  white: 'bg-white',
  cream: 'bg-[#FDF6F1]',
  dark: 'bg-neutral-950 text-white',
  gradient: 'bg-gradient-to-b from-[#FDF6F1] to-white',
}

const paddingMap = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-20',
  lg: 'py-20 md:py-28',
  xl: 'py-24 md:py-32',
}

export function Section({ children, className, id, background = 'white', padding = 'md' }: SectionProps) {
  return (
    <section id={id} className={cn(bgMap[background], paddingMap[padding], 'relative overflow-hidden', className)}>
      {children}
    </section>
  )
}
