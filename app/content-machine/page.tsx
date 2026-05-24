import Link from 'next/link'
import { ArrowRight, CalendarDays, Image, Link2, Mail, Video } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Nav } from '@/components/landing/Nav'
import { buildMetadata } from '@/lib/seo'
import { contentRepurposingPipeline, growthClusters } from '@/lib/growth/content'

export const metadata = buildMetadata({
  title: 'MealEase Content Machine',
  description:
    'The MealEase weekly content and repurposing pipeline for SEO pages, Pinterest pins, short-form scripts, email, and internal links.',
  path: '/content-machine',
})

const weeklyPlan = [
  ['Monday', 'Cheap weekly meal plan', '$80 family meal plan short', 'Dinner calendar pin'],
  ['Tuesday', 'Pantry ingredient article', 'What to cook with rice and eggs', 'Ingredient finder pin'],
  ['Wednesday', 'Leftovers article', 'Leftovers into lunch', 'Before and after pin'],
  ['Thursday', 'Tonight dinner article', "What's for dinner in 10 sec", 'Healthy dinner board'],
  ['Friday', 'Family planning article', 'AI planned our week', 'Weekly plan pin'],
]

export default function ContentMachinePage() {
  return (
    <>
      <Nav />
      <main id="main" className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <section className="border-b border-neutral-200 bg-[#FDF6F1] py-14 dark:border-neutral-800 dark:bg-neutral-900 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97757]">
              Content repurposing pipeline
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold tracking-tight md:text-6xl">
              One useful page becomes a week of distribution.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              This system keeps production focused on intent, internal links, tool CTAs, and shareable visuals.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <h2 className="font-serif text-3xl font-bold">Repurposing chain</h2>
              <div className="mt-6 space-y-3">
                {contentRepurposingPipeline.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D97757] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#D97757]" />
                <h2 className="font-serif text-3xl font-bold">Weekly machine</h2>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    <tr>
                      <th className="py-2">Day</th>
                      <th className="py-2">SEO asset</th>
                      <th className="py-2">Short-form</th>
                      <th className="py-2">Pinterest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {weeklyPlan.map(([day, seo, short, pin]) => (
                      <tr key={day}>
                        <td className="py-3 font-bold">{day}</td>
                        <td className="py-3">{seo}</td>
                        <td className="py-3">{short}</td>
                        <td className="py-3">{pin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 py-14 dark:bg-neutral-900/60">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {[
              { icon: Link2, label: 'Internal links', href: '/tools' },
              { icon: Image, label: 'Pinterest pins', href: '/api/pinterest-pin?title=Cheap%20Weekly%20Meal%20Plan&subtitle=5%20family%20dinners%20under%20budget' },
              { icon: Video, label: 'Short scripts', href: '/dinner-ideas-tonight' },
              { icon: Mail, label: 'Email ideas', href: '/weekly-meal-planner' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-lg border border-neutral-200 bg-white p-5 hover:border-[#D97757] dark:border-neutral-800 dark:bg-neutral-950"
              >
                <Icon className="h-5 w-5 text-[#D97757]" />
                <span className="mt-4 flex items-center justify-between gap-3 text-sm font-bold">
                  {label}
                  <ArrowRight className="h-4 w-4 text-[#D97757] transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-6xl px-4 text-sm text-neutral-600 dark:text-neutral-300 sm:px-6 lg:px-8">
            Clusters active: {Object.values(growthClusters).map((cluster) => cluster.label).join(', ')}.
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
