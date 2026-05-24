import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy | MealEase',
  description: 'How MealEase uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2025</p>

      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help us
            remember your preferences, keep you signed in, and understand how you use MealEase so we
            can improve it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Cookies we use</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Essential cookies</strong> — Required for authentication and core app
              functionality. These cannot be disabled.
            </li>
            <li>
              <strong>Analytics cookies</strong> — We use PostHog to understand feature usage and
              improve the product. Data is anonymised where possible.
            </li>
            <li>
              <strong>Preference cookies</strong> — Store your UI preferences (e.g. billing toggle
              state) so you don&apos;t have to re-select them on every visit.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Third-party cookies</h2>
          <p>
            We use Stripe for payment processing. Stripe may set cookies on checkout pages to
            prevent fraud and ensure secure transactions. See{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stripe&apos;s Privacy Policy
            </a>{' '}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Managing cookies</h2>
          <p>
            You can control cookies through your browser settings. Disabling essential cookies may
            prevent you from signing in or using core features. Most browsers allow you to block
            third-party cookies without affecting essential functionality.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Questions about our cookie use? Email us at{' '}
            <a href="mailto:hello@mealeaseai.com" className="text-primary hover:underline">
              hello@mealeaseai.com
            </a>
            .
          </p>
        </section>

        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </main>
  )
}
