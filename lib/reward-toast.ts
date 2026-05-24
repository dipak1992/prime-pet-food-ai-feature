/**
 * Reward Toast — ephemeral positive feedback after user actions.
 *
 * Uses sonner (already installed). Fades after 3.5s.
 * Call showRewardToast('mealGenerated') after a user action.
 */

import { toast } from 'sonner'
import { rewardMessages } from '@/lib/dashboard-messages'
import { trackEvent, Analytics } from '@/lib/analytics'

type RewardKey = keyof typeof rewardMessages

export function showRewardToast(key: RewardKey): void {
  const message = rewardMessages[key]

  trackEvent(Analytics.REWARD_TOAST_SHOWN, {
    reward_key: key,
    message,
  })

  toast(message, {
    duration: 3500,
    className:
      'text-sm text-muted-foreground bg-white/95 backdrop-blur-sm border border-border/40 shadow-sm',
    position: 'bottom-center',
  })
}
