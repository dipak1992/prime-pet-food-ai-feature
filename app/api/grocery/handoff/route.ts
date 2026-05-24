import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdForUser, ensureHousehold } from '@/lib/family/service'
import { buildGroceryHandoff } from '@/lib/grocery/handoff'
import type { GroceryList } from '@/lib/planner/types'
import type { ProviderId } from '@/lib/grocery/types'

const providerSchema = z.enum([
  'instacart',
  'amazon_fresh',
  'walmart_us',
  'walmart_ca',
  'kroger',
  'costco_us',
  'costco_ca',
  'regional_market',
])

const handoffSchema = z.object({
  providerId: providerSchema,
  weekStart: z.string().min(8).max(16).optional(),
  groceryList: z.unknown(),
}).strict()

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = handoffSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid grocery handoff payload' }, { status: 400 })
  }

  const household = await getHouseholdForUser(supabase as any, user.id)
    ?? await ensureHousehold(supabase as any, user.id)

  try {
    const groceryList = parsed.data.groceryList as GroceryList
    const result = buildGroceryHandoff(groceryList, parsed.data.providerId as ProviderId)

    await Promise.all([
      supabase.from('grocery_handoffs').insert({
        household_id: household.id,
        user_id: user.id,
        week_start: parsed.data.weekStart ?? groceryList.weekStart ?? null,
        provider: parsed.data.providerId,
        status: 'opened',
        external_cart_url: result.url,
        item_count: result.itemCount,
        estimated_total_usd: groceryList.totalEstimatedCost ?? 0,
        items: result.retailerPayload.items,
      }),
      supabase.from('household_workspace_events').insert({
        household_id: household.id,
        actor_user_id: user.id,
        event_type: 'grocery_handoff',
        subject_type: 'grocery_list',
        subject_id: parsed.data.weekStart ?? groceryList.weekStart ?? null,
        payload: {
          provider: parsed.data.providerId,
          providerName: result.providerName,
          itemCount: result.itemCount,
          mode: result.mode,
          cartHandoffMode: result.cartHandoffMode,
          pricingConfidence: result.pricingConfidence,
          availabilityConfidence: result.availabilityConfidence,
          nextBestAction: result.nextBestAction,
        },
      }),
    ])

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not prepare grocery handoff'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
