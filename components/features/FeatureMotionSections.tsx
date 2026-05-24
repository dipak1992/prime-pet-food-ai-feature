'use client'

import Link from 'next/link'
import { Container } from '@/components/landing/shared/Container'
import { ScrollReveal, StaggerGroup, HoverCard } from '@/components/motion'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

type Step = { n: string; title: string; body: string }
type Benefit = { icon: string; title: string; body: string }
type RelatedFeature = { href: string; label: string; desc: string }

interface FeatureMotionSectionsProps {
  problemTitle: string
  problemBody: string
  solutionTitle: string
  solutionBody: string
  howItWorksTitle?: string
  howItWorksSubtitle: string
  steps: Step[]
  benefitsTitle: string
  benefits: Benefit[]
  relatedFeatures: RelatedFeature[]
  ctaTitle: React.ReactNode
  ctaSubtitle: string
  ctaPrimaryHref: string
  ctaPrimaryLabel: string
  ctaSecondaryHref: string
  ctaSecondaryLabel: string
  children?: React.ReactNode
}

export function FeatureMotionSections({
  problemTitle,
  problemBody,
  solutionTitle,
  solutionBody,
  howItWorksTitle = 'How it works',
  howItWorksSubtitle,
  steps,
  benefitsTitle,
  benefits,
  relatedFeatures,
  ctaTitle,
  ctaSubtitle,
  ctaPrimaryHref,
  ctaPrimaryLabel,
  ctaSecondaryHref,
  ctaSecondaryLabel,
  children,
}: FeatureMotionSectionsProps) {
  return (
    <>
      {/* Problem → Solution */}
      <Section background="white" padding="md">
        <Container>
          <StaggerGroup className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8" staggerDelay={0.15}>
            <HoverCard className="rounded-2xl bg-red-50 border border-red-100 p-7 shadow-subtle hover:shadow-medium transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">The problem</p>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-3">{problemTitle}</h2>
              <p className="text-neutral-600 leading-relaxed">{problemBody}</p>
            </HoverCard>
            <HoverCard className="rounded-2xl bg-[#FDF6F1] border border-[#D97757]/20 p-7 shadow-subtle hover:shadow-medium transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D97757] mb-3">The solution</p>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-3">{solutionTitle}</h2>
              <p className="text-neutral-600 leading-relaxed">{solutionBody}</p>
            </HoverCard>
          </StaggerGroup>
        </Container>
      </Section>

      {/* How it works */}
      <Section background="cream" padding="lg">
        <Container>
          <ScrollReveal>
            <SectionHeader
              title={howItWorksTitle}
              subtitle={howItWorksSubtitle}
            />
          </ScrollReveal>
          <StaggerGroup className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerDelay={0.12}>
            {steps.map((s) => (
              <HoverCard key={s.n} className="relative rounded-2xl bg-white border border-neutral-200 p-7 shadow-subtle hover:shadow-medium transition-shadow">
                <span className="text-5xl font-bold text-[#D97757]/15 font-serif absolute top-5 right-6 select-none">{s.n}</span>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{s.body}</p>
              </HoverCard>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* Benefits */}
      <Section background="white" padding="lg">
        <Container>
          <ScrollReveal>
            <SectionHeader title={benefitsTitle} />
          </ScrollReveal>
          <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto" staggerDelay={0.08}>
            {benefits.map((b) => (
              <HoverCard key={b.title} className="rounded-2xl bg-neutral-50 border border-neutral-100 p-6 shadow-subtle hover:shadow-medium transition-shadow">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-1">{b.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{b.body}</p>
              </HoverCard>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      {/* Extra sections (Free vs Plus, grocery workflow, etc.) */}
      {children}

      {/* Related features */}
      <Section background="white" padding="md">
        <Container>
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-8 text-center">Explore more features</h2>
              <StaggerGroup className="grid sm:grid-cols-3 gap-4" staggerDelay={0.1}>
                {relatedFeatures.map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-[#D97757]/40 hover:bg-[#FDF6F1] hover:shadow-medium transition-all"
                  >
                    <p className="font-semibold text-neutral-900 group-hover:text-[#D97757] transition-colors mb-1">{f.label}</p>
                    <p className="text-sm text-neutral-500">{f.desc}</p>
                  </Link>
                ))}
              </StaggerGroup>
            </div>
          </ScrollReveal>
        </Container>
      </Section>

      {/* CTA */}
      <Section background="dark" padding="lg">
        <Container>
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                {ctaTitle}
              </h2>
              <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
                {ctaSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={ctaPrimaryHref}
                  className="inline-flex items-center justify-center rounded-xl bg-[#D97757] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#D97757]/25 hover:bg-[#c4664a] hover:shadow-glow-coral transition-all"
                >
                  {ctaPrimaryLabel}
                </Link>
                <Link
                  href={ctaSecondaryHref}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-8 py-3.5 text-base font-semibold text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
                >
                  {ctaSecondaryLabel}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </Section>
    </>
  )
}
