'use client'

import { UpgradeModal } from '@/components/paywall/UpgradeModal'

interface PaywallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  isAuthenticated: boolean
  redirectPath?: string
  /** Feature name for analytics (e.g. "Autopilot", "Leftovers AI") */
  feature?: string
}

export function PaywallDialog({
  open,
  onOpenChange,
  title,
  description,
  isAuthenticated,
  feature,
}: PaywallDialogProps) {
  return (
    <UpgradeModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      isAuthenticated={isAuthenticated}
      feature={feature}
    />
  )
}
