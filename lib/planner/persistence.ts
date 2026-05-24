import type { SupabaseClient } from '@supabase/supabase-js'
import type { GroceryLine, GroceryList, WeeklyPlan } from './types'

type PersistInput = {
  userId: string
  householdId?: string | null
  weekStart: string
  plan?: unknown
  groceryList?: unknown
  source: string
  activation?: unknown
}

function isWeeklyPlan(value: unknown): value is WeeklyPlan {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'days' in value &&
      Array.isArray((value as { days?: unknown }).days),
  )
}

function isGroceryList(value: unknown): value is GroceryList {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'items' in value &&
      Array.isArray((value as { items?: unknown }).items),
  )
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toItemRow(groceryListId: string, item: GroceryLine) {
  return {
    grocery_list_id: groceryListId,
    stable_key: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    estimated_cost: item.estimatedCost,
    is_in_pantry: item.isInPantry,
    is_checked: item.isChecked,
    is_custom: item.isCustom ?? false,
    user_removed: item.userRemoved ?? false,
    note: item.note ?? null,
    updated_at: new Date().toISOString(),
  }
}

export async function persistNormalizedPlanAndGrocery(
  supabase: SupabaseClient,
  input: PersistInput,
) {
  const normalizedPlan = isWeeklyPlan(input.plan) ? input.plan : null
  const normalizedList = isGroceryList(input.groceryList) ? input.groceryList : null

  let mealPlanId: string | null = null

  if (normalizedPlan) {
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .upsert(
        {
          user_id: input.userId,
          week_start: input.weekStart,
          source: input.source,
          status: 'active',
          activation_context: input.activation ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,week_start' },
      )
      .select('id')
      .single()

    if (planError) throw planError
    mealPlanId = mealPlan.id as string

    await supabase.from('meal_plan_days').delete().eq('meal_plan_id', mealPlanId)

    const dayRows = normalizedPlan.days.map((day) => ({
      meal_plan_id: mealPlanId,
      day_index: day.dayIndex,
      meal_date: day.date,
      meal_id: day.meal?.id ?? null,
      meal_title: day.meal?.title ?? null,
      meal_payload: day.meal ?? null,
      updated_at: new Date().toISOString(),
    }))

    if (dayRows.length > 0) {
      const { error: dayError } = await supabase.from('meal_plan_days').insert(dayRows)
      if (dayError) throw dayError
    }
  }

  if (!normalizedList) return

  const { data: groceryList, error: listError } = await supabase
    .from('grocery_lists')
    .upsert(
      {
          user_id: input.userId,
          household_id: input.householdId ?? null,
          meal_plan_id: mealPlanId,
        week_start: input.weekStart,
        status: 'active',
        store_format: normalizedList.storeFormat,
          total_estimated_cost: toNumber(normalizedList.totalEstimatedCost),
          updated_by: input.userId,
          generated_at: normalizedList.generatedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,week_start' },
    )
    .select('id')
    .single()

  if (listError) throw listError

  const groceryListId = groceryList.id as string
  const itemRows = normalizedList.items.map((item) => toItemRow(groceryListId, item))

  if (itemRows.length === 0) return

  const { data: savedItems, error: itemError } = await supabase
    .from('grocery_items')
    .upsert(itemRows, { onConflict: 'grocery_list_id,stable_key' })
    .select('id,stable_key')

  if (itemError) throw itemError

  const savedItemIds = (savedItems ?? []).map((item) => item.id as string)
  if (savedItemIds.length > 0) {
    await supabase.from('grocery_item_sources').delete().in('grocery_item_id', savedItemIds)
  }

  const sources = (savedItems ?? []).flatMap((savedItem) => {
    const sourceItem = normalizedList.items.find((item) => item.id === savedItem.stable_key)
    if (!sourceItem) return []

    const fromMeals = sourceItem.fromMeals.length > 0
      ? sourceItem.fromMeals
      : sourceItem.isCustom
        ? ['Custom item']
        : []

    return fromMeals.map((mealTitle) => ({
      grocery_item_id: savedItem.id,
      meal_title: mealTitle,
      source_type: sourceItem.isCustom ? 'custom' : 'meal',
    }))
  })

  if (sources.length > 0) {
    const { error: sourceError } = await supabase.from('grocery_item_sources').insert(sources)
    if (sourceError) throw sourceError
  }
}
