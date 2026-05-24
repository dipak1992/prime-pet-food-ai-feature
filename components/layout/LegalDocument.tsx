import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

export function LegalDocument({
  title,
  intro,
  lastUpdated,
  children,
}: {
  title: string
  intro: string
  lastUpdated: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen gradient-cream">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <Badge className="mb-4 border-0 bg-primary/10 text-primary">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
        <article className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm sm:p-8">
          <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-[15px]">
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}