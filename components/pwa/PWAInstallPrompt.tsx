'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { publicEnv } from '@/lib/env'
import { subscribeForPush } from '@/lib/push/subscribe'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  const isWebkit = /WebKit/.test(ua)
  const isCriOS = /CriOS/.test(ua)
  return isIOS && isWebkit && !isCriOS
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isEnablingPush, setIsEnablingPush] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.localStorage.getItem('mealease_pwa_prompt_dismissed') === '1') {
      setDismissed(true)
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || ((window.navigator as Navigator & { standalone?: boolean }).standalone === true)
    setIsStandalone(standalone)

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const showIosHint = useMemo(
    () => !isStandalone && !dismissed && isIosSafari(),
    [isStandalone, dismissed],
  )

  const showAndroidPrompt = useMemo(
    () => !isStandalone && !dismissed && !!deferredPrompt,
    [isStandalone, dismissed, deferredPrompt],
  )

  if (!showIosHint && !showAndroidPrompt) return null

  const canEnablePush = !!publicEnv.webPushPublicKey && typeof Notification !== 'undefined'

  const onInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome !== 'accepted') {
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const dismissPrompt = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mealease_pwa_prompt_dismissed', '1')
    }
  }

  const onEnablePush = async () => {
    if (!canEnablePush || isEnablingPush) return

    setIsEnablingPush(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await subscribeForPush()
      }
    } finally {
      setIsEnablingPush(false)
    }
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur md:bottom-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Install MealEase App</p>
          {showAndroidPrompt ? (
            <p className="mt-0.5 text-xs text-muted-foreground">Faster launch, offline shell, native app feel.</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">On iPhone: tap Share, then Add to Home Screen.</p>
          )}
          <div className="mt-2 flex gap-2">
            {showAndroidPrompt ? (
              <Button size="sm" className="h-8" onClick={() => void onInstall()}>
                Install
              </Button>
            ) : null}
            {canEnablePush && Notification.permission !== 'granted' ? (
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                onClick={() => void onEnablePush()}
                disabled={isEnablingPush}
              >
                {isEnablingPush ? 'Enabling...' : 'Enable Alerts'}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={dismissPrompt}
            >
              Later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissPrompt}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
