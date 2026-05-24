import { ArrowRight, CheckCircle2, MessageSquareText, Sparkles, XCircle } from 'lucide-react'
import { Container } from './shared/Container'
import { Button } from './shared/Button'
import { FadeIn } from './shared/FadeIn'

const genericAi = [
  'Ask every night',
  'Forgets preferences',
  'No grocery handoff',
  'No weekly system',
  'Generic answers',
]

const mealease = [
  'Remembers preferences and this-week themes',
  'Connects tonight to the week',
  'Turns plans into grocery lists',
  'Tracks leftovers after cooking',
  'Keeps budget visible',
  'Built for households',
]

const workflowProof = [
  {
    label: 'ChatGPT prompt burden',
    body: 'Tell me dietary needs, budget, ingredients, dislikes, leftovers, time limit, grocery needs, and what we ate recently.',
  },
  {
    label: 'MealEase saved once',
    body: 'Household profile, this-week Copilot instructions, fridge context, weekly plan, grocery list, leftovers, and budget stay connected.',
  },
] as const

export function ComparisonTable() {
  return (
    <section
      className="py-10 md:py-22 bg-[#FDF6F1] dark:bg-neutral-900"
      aria-labelledby="comparison-heading"
    >
      <Container>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              id="comparison-heading"
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              ChatGPT suggests dinner.{' '}
              <span className="italic text-[#D97757]">MealEase runs the dinner loop.</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Generic AI can brainstorm. MealEase remembers the household,
              changes the plan, checks leftovers, and gets groceries ready from saved context.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/5 md:hidden">
            <div className="grid gap-3">
              <div className="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <XCircle className="h-4 w-4 text-neutral-400" aria-hidden />
                  Generic AI
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  You rebuild diet, budget, pantry, leftovers, and recent meals every time you ask.
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-[#F3B18E]" aria-hidden />
                  MealEase
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-300">
                  Household profile, this-week instructions, grocery list, leftovers, and budget stay connected.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-8 hidden gap-4 rounded-3xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            {workflowProof.slice(0, 1).map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#FBFAF3] p-5 dark:bg-neutral-900">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <MessageSquareText className="h-4 w-4 text-[#D97757]" aria-hidden />
                  {item.label}
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {item.body}
                </p>
              </div>
            ))}
            <ArrowRight className="hidden h-6 w-6 text-[#D97757] md:block" aria-hidden />
            {workflowProof.slice(1).map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#FBFAF3] p-5 dark:bg-neutral-900">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <MessageSquareText className="h-4 w-4 text-[#D97757]" aria-hidden />
                  {item.label}
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {item.body}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#D97757]">
                  Dinner and groceries generated from remembered context.
                </p>
              </div>
            ))}
          </div>
          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:gap-8">
            <ComparisonBlock
              title="Generic AI"
              description="A blank chat box is useful for brainstorming, but dinner still depends on you rebuilding the context."
              items={genericAi}
              variant="muted"
            />
            <ComparisonBlock
              title="MealEase"
              description="A purpose-built dinner system that remembers the household and moves each meal toward a plan."
              items={mealease}
              variant="highlight"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Button href="/signup" ariaLabel="Try MealEase free">
              Try MealEase Free
            </Button>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              No blank prompts. No starting over. Just meals that fit your life.
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}

function ComparisonBlock({
  title,
  description,
  items,
  variant,
}: {
  title: string
  description: string
  items: string[]
  variant: 'muted' | 'highlight'
}) {
  const isHighlight = variant === 'highlight'

  return (
    <article
      className={
        isHighlight
          ? 'h-full rounded-3xl bg-neutral-900 p-7 md:p-8 text-white shadow-xl ring-1 ring-neutral-900 dark:bg-neutral-950 dark:ring-white/10'
          : 'h-full rounded-3xl bg-white p-7 md:p-8 ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/5'
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            isHighlight
              ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D97757] text-white'
              : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300'
          }
          aria-hidden
        >
          {isHighlight ? <Sparkles className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </span>
        <div>
          <h3
            className={
              isHighlight
                ? 'font-serif text-2xl font-bold text-white'
                : 'font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50'
            }
          >
            {title}
          </h3>
          <p
            className={
              isHighlight
                ? 'mt-2 text-sm leading-relaxed text-neutral-300'
                : 'mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'
            }
          >
            {description}
          </p>
        </div>
      </div>

      <ul className="mt-7 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3">
            {isHighlight ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#F3B18E]" aria-hidden />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-neutral-300 dark:text-neutral-700" aria-hidden />
            )}
            <span
              className={
                isHighlight
                  ? 'text-sm font-medium text-white'
                  : 'text-sm font-medium text-neutral-700 dark:text-neutral-300'
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
