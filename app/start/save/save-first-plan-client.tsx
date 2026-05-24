'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { MealEaseLogo } from '@/components/ui/MealEaseLogo'

export function SaveFirstPlanClient() {
  const router = useRouter()
  const [message, setMessage] = useState('Saving your first dinner plan...')

  useEffect(() => {
    async function save() {
      const raw = window.localStorage.getItem('mealease:first-plan')
      if (!raw) {
        router.replace('/onboarding')
        return
      }

      try {
        const parsed = JSON.parse(raw) as {
          plan?: unknown
          groceryList?: unknown
          activation?: unknown
          weekStart?: string
        }
        const res = await fetch('/api/start-plan/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setMessage('Saved. Opening your grocery list...')
        router.replace('/grocery-list')
      } catch {
        setMessage('We saved your account. Finish setup and your next plan will be saved automatically.')
        router.replace('/onboarding')
      }
    }

    void save()
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBFAF3] px-4 text-center">
      <MealEaseLogo size="lg" showBadge />
      <Loader2 className="mt-8 h-6 w-6 animate-spin text-[#D97757]" />
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </main>
  )
}
