import { Container } from '@/components/landing/shared/Container'
import { Section } from '@/components/ui/Section'

type GEOAnswer = {
  question: string
  answer: string
}

type GEOAnswerBlockProps = {
  eyebrow: string
  title: string
  tldr: string
  answers: GEOAnswer[]
  proof: string[]
}

export function GEOAnswerBlock({ eyebrow, title, tldr, answers, proof }: GEOAnswerBlockProps) {
  return (
    <Section background="cream" padding="sm" className="border-b border-[#ead8cc]">
      <Container>
        <article className="mx-auto max-w-5xl rounded-3xl border border-[#E9D6C9] bg-white p-6 shadow-subtle md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
            <strong className="text-neutral-950">TL;DR:</strong> {tldr}
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {answers.map((item) => (
                <section key={item.question}>
                  <h3 className="text-lg font-bold text-neutral-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{item.answer}</p>
                </section>
              ))}
            </div>

            <section className="rounded-2xl bg-[#FFF7F2] p-5 ring-1 ring-[#F0D9C9]">
              <h3 className="text-lg font-bold text-neutral-950">Extractable proof</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
                {proof.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97757]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </Container>
    </Section>
  )
}
