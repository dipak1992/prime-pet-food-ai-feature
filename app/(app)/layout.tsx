import AppLayout from '@/components/layout/AppLayout'
import { getPaywallStatus } from '@/lib/paywall/server'
import { ScanModal } from '@/components/scan/ScanModal'
import { GlobalCookedPrompt } from '@/components/leftovers/GlobalCookedPrompt'
import { QueryProvider } from '@/components/providers'
import { PushSubscriptionManager } from '@/components/pwa/PushSubscriptionManager'
import { ProgressiveProfilePrompt } from '@/components/onboarding/ProgressiveProfilePrompt'
import { Copilot } from '@/components/copilot/Copilot'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const paywall = await getPaywallStatus()

  return (
    <QueryProvider>
      <AppLayout subscriptionTier={paywall.tier}>
        {children}
        <ScanModal />
        <GlobalCookedPrompt />
        <ProgressiveProfilePrompt />
        <PushSubscriptionManager />
        <Copilot />
      </AppLayout>
    </QueryProvider>
  )
}
