'use client'

import { useCallback, useEffect, useState } from 'react'
import { FREE_TONIGHT_SWIPE_LIMIT } from '@/lib/paywall/config'
import type { ClientPaywallStatus } from '@/lib/paywall/use-paywall-status'

type SwapState = {
  date: string
  count: number
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function storageKey(scope: string) {
  return `mealease:${scope}:swap-limit`
}

export function useDailySwapLimit(
  status: ClientPaywallStatus,
  scope = 'tonight',
) {
  const [count, setCount] = useState(() => readSwapCount(scope))
  const limit = status.freeTonightSwipeLimit || FREE_TONIGHT_SWIPE_LIMIT
  const isUnlimited = status.isPro

  useEffect(() => {
    if (typeof window === 'undefined') return
    const timeout = window.setTimeout(() => {
      const key = storageKey(scope)
      const today = todayKey()
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? (JSON.parse(raw) as SwapState) : null
      if (!parsed || parsed.date !== today) {
        window.localStorage.setItem(key, JSON.stringify({ date: today, count: 0 }))
        setCount(0)
        return
      }
      setCount(parsed.count)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [scope])

  const recordSwap = useCallback(() => {
    if (isUnlimited || typeof window === 'undefined') return true
    if (count >= limit) return false
    const next = count + 1
    setCount(next)
    window.localStorage.setItem(
      storageKey(scope),
      JSON.stringify({ date: todayKey(), count: next }),
    )
    return next <= limit
  }, [count, isUnlimited, limit, scope])

  return {
    count,
    limit,
    remaining: isUnlimited ? Infinity : Math.max(0, limit - count),
    canSwap: isUnlimited || count < limit,
    isUnlimited,
    recordSwap,
  }
}

function readSwapCount(scope: string) {
  if (typeof window === 'undefined') return 0
  const key = storageKey(scope)
  const today = todayKey()
  const raw = window.localStorage.getItem(key)
  const parsed = raw ? (JSON.parse(raw) as SwapState) : null
  return parsed?.date === today ? parsed.count : 0
}
