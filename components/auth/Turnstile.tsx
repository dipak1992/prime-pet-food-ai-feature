'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
          theme?: 'light' | 'dark' | 'auto'
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

type Props = {
  onToken: (token: string | null) => void
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export function Turnstile({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetRef = useRef<string | null>(null)
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && Boolean(window.turnstile))

  useEffect(() => {
    if (!siteKey) return
    if (window.turnstile) {
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => setReady(true), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [siteKey])

  useEffect(() => {
    if (!siteKey || !ready || !containerRef.current || !window.turnstile || widgetRef.current) return
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'auto',
      callback: (token) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
    })
  }, [onToken, ready, siteKey])

  if (!siteKey) return null
  return <div ref={containerRef} className="min-h-[65px]" />
}
