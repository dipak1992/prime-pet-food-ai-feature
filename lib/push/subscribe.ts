'use client'

import { publicEnv } from '@/lib/env'
import { urlBase64ToUint8Array } from '@/lib/push/client'

export async function subscribeForPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  if (!publicEnv.webPushPublicKey) return false

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicEnv.webPushPublicKey) as unknown as BufferSource,
    })
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  return res.ok
}
