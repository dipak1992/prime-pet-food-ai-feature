'use client'

import { useEffect } from 'react'
import { subscribeForPush } from '@/lib/push/subscribe'

export function PushSubscriptionManager() {
  useEffect(() => {
    const notificationApi = typeof window !== 'undefined' ? window.Notification : undefined
    if (!notificationApi) return

    if (notificationApi.permission === 'granted') {
      void subscribeForPush()
    }

    const onPermissionChange = () => {
      if (notificationApi.permission === 'granted') {
        void subscribeForPush()
      }
    }

    document.addEventListener('visibilitychange', onPermissionChange)
    return () => document.removeEventListener('visibilitychange', onPermissionChange)
  }, [])

  return null
}
