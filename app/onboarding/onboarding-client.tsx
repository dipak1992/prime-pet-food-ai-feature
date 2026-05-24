'use client'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import StepHouseholdSize from '@/components/onboarding/StepHouseholdSize'
import StepCookingGoal from '@/components/onboarding/StepCookingGoal'
import StepDietary from '@/components/onboarding/StepDietary'

// ─── Step map ─────────────────────────────────────────────────────────────────

const STEP_COMPONENTS = {
  household: StepHouseholdSize,
  dietary:   StepDietary,
  goal:      StepCookingGoal,
} as const

// ─── Client ───────────────────────────────────────────────────────────────────

export function OnboardingClient() {
  const step          = useOnboardingStore((s) => s.step)
  const householdSize = useOnboardingStore((s) => s.data.householdSize)
  const cookingGoal   = useOnboardingStore((s) => s.data.cookingGoal)

  // Determine whether the current step allows proceeding
  const canProceed: boolean = (() => {
    switch (step) {
      case 'household': return householdSize >= 1
      case 'dietary':   return true
      case 'goal':      return Boolean(cookingGoal)
      default:          return true
    }
  })()

  const StepComponent = STEP_COMPONENTS[step as keyof typeof STEP_COMPONENTS]

  return (
    <OnboardingShell canProceed={canProceed}>
      {StepComponent ? <StepComponent /> : null}
    </OnboardingShell>
  )
}
