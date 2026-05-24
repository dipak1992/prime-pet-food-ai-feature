import { publicEnv } from '@/lib/env'
import { serverEnv } from '@/lib/server-env'

export function hasPushVapidConfig() {
  return Boolean(
    publicEnv.webPushPublicKey
    && serverEnv.webPushPrivateKey
    && serverEnv.webPushSubject,
  )
}

export function getPublicVapidKey() {
  return publicEnv.webPushPublicKey
}

export function getServerVapidConfig() {
  if (!hasPushVapidConfig()) {
    return null
  }

  return {
    publicKey: publicEnv.webPushPublicKey,
    privateKey: serverEnv.webPushPrivateKey,
    subject: serverEnv.webPushSubject,
  }
}
