import webpush from 'web-push'
import { getServerVapidConfig } from '@/lib/push/vapid'

type PushSubscriptionRow = {
  endpoint: string
  p256dh: string
  auth: string
}

export async function sendPushToSubscription(
  subscription: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string },
): Promise<boolean> {
  const vapid = getServerVapidConfig()
  if (!vapid) return false

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(payload),
  )

  return true
}
