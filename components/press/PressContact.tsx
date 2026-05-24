import { Mail } from 'lucide-react'

export function PressContact() {
  return (
    <section className="py-16 bg-[#FDF6F1] dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Get in touch
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            For interviews, commentary, or custom assets — the founders respond directly. We aim
            for a 24-hour reply.
          </p>

          <div className="space-y-4">
            <ContactRow
              icon={<Mail className="w-4 h-4 text-[#D97757]" />}
              label="Email"
              value="press@mealeaseai.com"
              href="mailto:press@mealeaseai.com"
            />
            <ContactRow
              icon={
                <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
              label="Twitter / X"
              value="@mealeaseai"
              href="https://twitter.com/mealeaseai"
            />
            <ContactRow
              icon={
                <svg className="w-4 h-4 text-[#D97757]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              }
              label="LinkedIn"
              value="MealEase"
              href="https://linkedin.com/company/mealeaseai"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
        <a
          href={href}
          target={href.startsWith('mailto') ? undefined : '_blank'}
          rel={href.startsWith('mailto') ? undefined : 'noreferrer'}
          className="text-sm font-medium text-neutral-900 dark:text-neutral-50 hover:text-[#D97757] transition-colors"
        >
          {value}
        </a>
      </div>
    </div>
  )
}
