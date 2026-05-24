import { createClient } from '@/lib/supabase/server'
import { PricingTiers } from '@/components/pricing/PricingTiers'
import { PricingCompare } from '@/components/pricing/PricingCompare'
import { PricingFAQ } from '@/components/pricing/PricingFAQ'
import type { PlanId } from '@/lib/stripe/plans'

export const metadata = {
  title: 'Pricing — NutriNest AI',
  description: 'Choose the plan that fits your household.',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: PlanId = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    if (profile?.subscription_tier) {
      // Map existing tier names to PlanId
      const tier = profile.subscription_tier as string
      if (tier === 'pro') currentPlan = 'plus'
      else if (tier === 'family') currentPlan = 'family'
      else currentPlan = 'free'
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        {/* Tiers */}
        <PricingTiers currentPlan={currentPlan} />

        {/* Compare */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Compare plans
          </h2>
          <PricingCompare />
        </section>

        {/* FAQ */}
        <PricingFAQ />
      </div>
    </main>
  )
}
