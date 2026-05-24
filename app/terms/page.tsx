import { buildMetadata } from '@/lib/seo'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { LegalShell } from '@/components/legal/LegalShell'
import Link from 'next/link'

const UPDATED_AT = '2024-12-15'

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'The rules of the road for using MealEase. Readable, not legalese.',
  path: '/terms',
  keywords: ['MealEase terms', 'MealEase terms of service', 'meal planning app terms'],
})

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main>
        <LegalShell
          title="Terms of Service"
          intro="The rules of the road for using MealEase. Readable, not legalese."
          updatedAt={UPDATED_AT}
          sections={[
            {
              id: 'acceptance',
              title: 'Acceptance of terms',
              content: (
                <>
                  <p>
                    By creating a MealEase account or using the service, you agree
                    to these terms. If you don&apos;t agree, please don&apos;t use MealEase.
                  </p>
                  <p>
                    &ldquo;MealEase,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo; means the MealEase service, operated by
                    the founders. &ldquo;You&rdquo; means you, the person using the service.
                  </p>
                </>
              ),
            },
            {
              id: 'your-account',
              title: 'Your account',
              content: (
                <>
                  <p>
                    You need an account to use most features. You must be at least
                    13 years old. You&apos;re responsible for your account — don&apos;t
                    share your login, use a strong password (or Google sign-in),
                    and tell us if you think your account&apos;s been compromised.
                  </p>
                  <p>
                    One account per person. No bots. No scraping. No trying to
                    break things.
                  </p>
                </>
              ),
            },
            {
              id: 'what-you-can-do',
              title: 'What you can do',
              content: (
                <>
                  <p>
                    Use MealEase for planning and cooking meals for yourself and
                    your household. Share the app with friends. Take screenshots.
                    Tell the world.
                  </p>
                  <p>
                    You own your data (meal history, preferences, notes). You give
                    us a limited license to process it so we can give you the
                    service.
                  </p>
                </>
              ),
            },
            {
              id: 'what-you-cant-do',
              title: "What you can't do",
              content: (
                <>
                  <p>A non-exhaustive list:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Use MealEase to harass anyone or post illegal content</li>
                    <li>
                      Try to reverse-engineer, scrape, or copy the service to
                      build a competitor
                    </li>
                    <li>
                      Abuse our AI features (e.g., spam our servers, attempt
                      prompt injection)
                    </li>
                    <li>Share your account with strangers</li>
                    <li>Resell MealEase as your own product</li>
                    <li>
                      Use MealEase in ways that violate your local laws
                    </li>
                  </ul>
                  <p>
                    We may suspend or terminate accounts that do any of the above.
                    We&apos;ll always try to be fair, and we&apos;ll tell you what went
                    wrong.
                  </p>
                </>
              ),
            },
            {
              id: 'plans-and-billing',
              title: 'Plans and billing',
              content: (
                <>
                  <p>
                    <strong>Free plan.</strong> Free forever, with limits as
                    described on the{' '}
                    <Link href="/pricing" className="text-[#D97757] hover:underline">
                      pricing page
                    </Link>
                    .
                  </p>
                  <p>
                    <strong>Plus.</strong> Paid monthly or yearly via Stripe.
                    Your plan renews automatically until you cancel. Prices may
                    change, but we&apos;ll email you 30 days before any price increase
                    affects you.
                  </p>
                  <p>
                    <strong>Cancellation.</strong> Cancel anytime from Settings →
                    Billing. Your plan stays active until the end of the billing
                    period. No refunds for partial months, except as required by
                    law.
                  </p>
                  <p>
                    <strong>Refunds.</strong> Full refund within 14 days of your
                    first paid charge, no questions asked. After that, contact us
                    and we&apos;ll do the right thing.
                  </p>
                  <p>
                    <strong>Taxes.</strong> Prices don&apos;t include sales tax or VAT.
                    Stripe handles the math if your region requires it.
                  </p>
                </>
              ),
            },
            {
              id: 'ai-and-accuracy',
              title: 'AI-generated content and accuracy',
              content: (
                <>
                  <p>
                    MealEase uses AI to identify ingredients, generate recipes,
                    estimate costs, and suggest plans. AI gets things wrong
                    sometimes. Nutrition estimates, cost estimates, and recipe
                    suggestions are estimates — not medical, dietary, or
                    financial advice.
                  </p>
                  <p>
                    Always use common sense. If something smells off, it probably
                    is. If an ingredient identification looks wrong, correct it.
                    We can&apos;t guarantee every recipe suits every dietary need, so
                    double-check if you have severe allergies.
                  </p>
                  <p>
                    We are not responsible for cooking injuries, food poisoning,
                    or kitchen disasters. Please be careful.
                  </p>
                </>
              ),
            },
            {
              id: 'service-availability',
              title: 'Service availability',
              content: (
                <>
                  <p>
                    We work hard to keep MealEase running, but we can&apos;t promise
                    100% uptime. Stuff breaks. We fix it. If the service is down
                    for more than 24 hours and you&apos;re on a paid plan, email us
                    and we&apos;ll credit you.
                  </p>
                  <p>
                    We may change or remove features over time. When we remove
                    something people rely on, we&apos;ll give notice.
                  </p>
                </>
              ),
            },
            {
              id: 'liability',
              title: 'Limits of liability',
              content: (
                <>
                  <p>
                    To the maximum extent permitted by law, MealEase is provided
                    &ldquo;as is.&rdquo; We&apos;re not liable for indirect damages — lost income,
                    ruined dinner parties, disappointed relatives, or similar.
                  </p>
                  <p>
                    Our total liability to you for any claim is limited to the
                    amount you&apos;ve paid us in the 12 months before the claim, or
                    $100 if you&apos;re on the Free plan.
                  </p>
                  <p>
                    Some jurisdictions don&apos;t allow these limits. If that&apos;s you,
                    the limits apply to the extent the law allows.
                  </p>
                </>
              ),
            },
            {
              id: 'termination',
              title: 'Termination',
              content: (
                <>
                  <p>
                    You can delete your account anytime in Settings → Your data.
                  </p>
                  <p>
                    We may suspend or terminate your account for violations of
                    these terms. When we do, we&apos;ll tell you why and give you a
                    chance to export your data.
                  </p>
                </>
              ),
            },
            {
              id: 'changes',
              title: 'Changes to these terms',
              content: (
                <p>
                  We&apos;ll update these terms occasionally. For material changes,
                  we&apos;ll email you at least 30 days before they take effect.
                  Continued use after the effective date means you accept the
                  new terms.
                </p>
              ),
            },
            {
              id: 'misc',
              title: 'The legal catch-all',
              content: (
                <>
                  <p>
                    These terms are governed by the laws of the State of Texas,
                    United States, without regard to conflict-of-law principles.
                    Disputes go to courts in Texas, unless we both agree
                    otherwise.
                  </p>
                  <p>
                    If any part of these terms is found unenforceable, the rest
                    stays in effect. If we don&apos;t enforce a term right away, it
                    doesn&apos;t mean we&apos;ve waived it.
                  </p>
                </>
              ),
            },
            {
              id: 'contact-terms',
              title: 'Contact us',
              content: (
                <p>
                  Questions about these terms?{' '}
                  <a
                    href="mailto:hello@mealeaseai.com"
                    className="text-[#D97757] hover:underline"
                  >
                    hello@mealeaseai.com
                  </a>
                </p>
              ),
            },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
