import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { ContactClient } from './contact-client'

export const metadata = {
  title: 'Contact | MealEase',
  description:
    'Got a question, feature idea, or just want to say hi? The founders read every message.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="relative pt-16 pb-12 md:pt-24 md:pb-16">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FDF6F1] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
          />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm font-medium text-[#D97757] uppercase tracking-wider mb-4">
                Say hi
              </p>
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.05]">
                We&apos;d love to{' '}
                <span className="italic text-[#D97757]">hear from you.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
                Questions, feedback, feature ideas, or just want to say hello? The founders read
                every message.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ContactClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
