'use client'

import Image from 'next/image'

const SHORT_BIO = `Dipak and Suprabha are the husband-and-wife co-founders of MealEase. Dipak is a software engineer and entrepreneur. Suprabha is a CPA. They live in the US with their two young children (ages 3½ and 1), and built MealEase after getting tired of their own 5:47 PM fridge-stare moment.`

const LONG_BIO = `Dipak and Suprabha co-founded MealEase in 2024 after years of struggling with the same question every working parent knows: "What's for dinner?"

Dipak brings a decade of software engineering and startup experience. Suprabha is a Certified Public Accountant whose financial lens caught what most people miss — that a chaotic kitchen quietly costs families $3,000+ a year in wasted food and unplanned takeout.

Together, they built MealEase as the tool they wished existed: a meal planner that actually knows what's in your fridge, uses up leftovers before they expire, and keeps you on budget. MealEase is shaped by real household feedback and serves families of 1–8+.

They live in the United States with their two young children, ages 3½ and 1, who remain the app's most honest testers.`

export function FoundersBios() {
  return (
    <section className="py-16 bg-[#FDF6F1] dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-10">
          Founders
        </h2>

        <div className="grid md:grid-cols-12 gap-10">
          {/* Photo */}
          <div className="md:col-span-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              <Image
                src="/founders/dipak-suprabha.jpg"
                alt="Dipak & Suprabha, co-founders of MealEase"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-neutral-500 text-center">
              Dipak &amp; Suprabha, co-founders of MealEase
            </p>
            <div className="mt-3 text-center">
              <a
                href="/founders/dipak-suprabha.jpg"
                download
                className="inline-flex items-center gap-1.5 text-sm text-[#D97757] hover:text-[#C86646] font-medium"
              >
                Download JPG
              </a>
            </div>
          </div>

          {/* Bios */}
          <div className="md:col-span-8 space-y-8">
            <BioBlock
              label="Short bio"
              sublabel="~70 words — for brief mentions."
              text={SHORT_BIO}
            />
            <BioBlock
              label="Long bio"
              sublabel="~180 words — for full features and interviews."
              text={LONG_BIO}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function BioBlock({
  label,
  sublabel,
  text,
}: {
  label: string
  sublabel: string
  text: string
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-950 ring-1 ring-neutral-200 dark:ring-neutral-800 p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">{label}</p>
          <p className="text-xs text-neutral-500">{sublabel}</p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-[#D97757] hover:text-white text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          Copy
        </button>
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </div>
  )
}
