import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stringArraySchema, validationError } from '@/lib/validation/input'
import { z } from 'zod'

const onboardingSchema = z.object({
  householdSize: z.coerce.number().int().min(1).max(20),
  cookingGoal: z.string().max(80).nullable().optional(),
  dietary: stringArraySchema(30, 80).default([]),
  cuisinePreferences: stringArraySchema(20, 80).default([]),
  spiceTolerance: z.enum(['none', 'mild', 'medium', 'hot']).default('mild'),
  budgetStyle: z.coerce.number().int().min(1).max(5).default(2),
  pickyEaterMode: z.coerce.boolean().default(false),
  dislikes: stringArraySchema(60, 80).default([]),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  weeklyBudget: z.coerce.number().min(0).max(5000).nullable().optional(),
}).strict()

// ─── POST /api/onboarding ─────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = onboardingSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    const body = parsed.data

    // Check subscription tier to decide whether to persist preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const isPaid = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'plus'

    // Only save preferences for paid users
    if (isPaid) {
      const { error: prefError } = await supabase
        .from('household_preferences')
        .upsert(
          {
            user_id: user.id,
            household_size: body.householdSize,
            dietary_restrictions: body.dietary,
            cuisine_preferences: body.cuisinePreferences,
            spice_tolerance: body.spiceTolerance,
            budget_style: body.budgetStyle,
            family_mode_enabled: body.pickyEaterMode,
            disliked_ingredients: body.dislikes,
            skill_level: body.skillLevel,
            weekly_budget: body.weeklyBudget,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (prefError) {
        console.error('[onboarding] preference save error:', prefError.message)
        // Non-fatal for onboarding completion
      }
    }

    // Always mark onboarding complete regardless of tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('[onboarding] profile update error:', profileError.message)
      // If profile update fails, still return ok so user isn't stuck
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[onboarding] unexpected error:', message)
    // Return ok anyway to prevent user from being stuck in onboarding loop
    return NextResponse.json({ ok: true })
  }
}
