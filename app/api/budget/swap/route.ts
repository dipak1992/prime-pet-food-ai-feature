import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { generateText, stripJsonFences } from '@/lib/ai/service'
import { buildUserContext, formatCompactContext } from '@/lib/ai/context'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'
import logger from '@/lib/logger'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetSwap {
  originalMeal: string
  swapMeal: string
  originalCost: number
  swapCost: number
  savings: number
  reason: string
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const BUDGET_SWAP_SYSTEM_PROMPT = `You are MealEase's budget intelligence assistant. Your job is to suggest cheaper meal alternatives that maintain nutrition, taste, and family appeal.

Rules:
1. Each swap must save at least $3 compared to the original.
2. Swaps must respect ALL dietary restrictions and allergies.
3. Swaps should use similar cooking techniques (don't swap a 15-min meal for a 60-min one).
4. Prefer swaps that use pantry items the user already has.
5. Keep the same general meal category (don't swap dinner for breakfast).
6. Explain WHY the swap is cheaper in plain language.
7. Use realistic grocery prices (US average 2024-2025).
8. If the user has leftovers expiring soon, suggest meals that use them.

Cost guidelines (per serving, US average):
- Chicken thighs: $1.50-2.00 | Chicken breast: $2.50-3.50
- Ground beef: $2.50-3.50 | Steak: $5.00-8.00
- Salmon: $4.00-6.00 | Tilapia/cod: $2.00-3.00
- Tofu: $0.75-1.25 | Beans/lentils: $0.30-0.60
- Pasta: $0.25-0.50 | Rice: $0.15-0.30
- Fresh vegetables: $1.00-2.50 | Frozen vegetables: $0.50-1.00

Output: Return a JSON array of swap objects. Return 2-4 swaps maximum.
If no good swaps exist (meals are already budget-friendly), return an empty array.`

// ─── POST /api/budget/swap ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 5, windowMs: 60_000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paywall = await getPaywallStatus()
  if (!paywall.isPro) {
    return NextResponse.json({ error: 'Plus plan required' }, { status: 403 })
  }

  try {
    // ── 1. Load user context ──────────────────────────────────────────────────
    const ctx = await buildUserContext(supabase, user.id, {
      includeLearning: true,
      includeWeekPlan: false,
    })

    // If no budget set, return empty (nothing to optimize)
    if (!ctx.budget.weeklyLimit) {
      return NextResponse.json({ swaps: [] })
    }

    // ── 2. Load current week's planned meals ──────────────────────────────────
    const weekStart = getWeekStartDate()
    const { data: planRow } = await supabase
      .from('week_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (!planRow) {
      return NextResponse.json({ swaps: [] })
    }

    const { data: dayRows } = await supabase
      .from('week_plan_days')
      .select('day_index, estimated_cost, recipes(name, cost_total, cost_per_serving, ingredients, tags)')
      .eq('plan_id', planRow.id)
      .order('day_index')

    if (!dayRows || dayRows.length === 0) {
      return NextResponse.json({ swaps: [] })
    }

    // Build current meals list with costs
    const currentMeals = dayRows
      .filter((d: Record<string, unknown>) => d.recipes)
      .map((d: Record<string, unknown>) => {
        const recipe = d.recipes as { name: string; cost_total: number; cost_per_serving: number; ingredients: string[]; tags: string[] }
        return {
          dayIndex: d.day_index as number,
          name: recipe.name,
          costTotal: recipe.cost_total || (d.estimated_cost as number) || 0,
          costPerServing: recipe.cost_per_serving || 0,
          ingredients: recipe.ingredients || [],
          tags: recipe.tags || [],
        }
      })
      .filter((m) => m.costTotal > 0)
      .sort((a, b) => b.costTotal - a.costTotal) // Most expensive first

    if (currentMeals.length === 0) {
      return NextResponse.json({ swaps: [] })
    }

    // Only suggest swaps for the top 4 most expensive meals
    const expensiveMeals = currentMeals.slice(0, 4)

    // ── 3. Build AI prompt ────────────────────────────────────────────────────
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const mealsText = expensiveMeals
      .map((m) => `- ${DAY_NAMES[m.dayIndex]}: ${m.name} ($${m.costTotal.toFixed(2)} total, ingredients: ${m.ingredients.slice(0, 8).join(', ')})`)
      .join('\n')

    const userPrompt = `${formatCompactContext(ctx)}

Current week's most expensive meals:
${mealsText}

Weekly budget: $${ctx.budget.weeklyLimit} | Spent so far: $${ctx.budget.spentThisWeek.toFixed(0)} | Remaining: $${ctx.budget.remainingBudget?.toFixed(0) ?? '?'}
${ctx.budget.strictMode ? '⚠️ STRICT MODE — must stay under budget' : ''}

${ctx.pantry.length > 0 ? `Pantry items available (free to use): ${ctx.pantry.join(', ')}` : ''}
${ctx.leftovers.length > 0 ? `Leftovers to use up: ${ctx.leftovers.map(l => `${l.name} (${l.expiresInDays}d left)`).join(', ')}` : ''}

Suggest 2-4 budget-friendly swaps for the expensive meals above.
Return JSON: { "swaps": [{ "originalMeal": "...", "swapMeal": "...", "originalCost": N, "swapCost": N, "savings": N, "reason": "..." }] }
If all meals are already budget-friendly (under $10 total), return { "swaps": [] }.`

    // ── 4. Call AI ────────────────────────────────────────────────────────────
    const result = await generateText({
      system: BUDGET_SWAP_SYSTEM_PROMPT,
      user: userPrompt,
      task: 'budget-swap',
      jsonMode: true,
      temperature: 0.6,
    })

    logger.info('[budget/swap] AI swap generated', {
      provider: result.provider,
      model: result.model,
      tokens: result.usage?.prompt_tokens,
    })

    // ── 5. Parse and validate response ────────────────────────────────────────
    const jsonText = stripJsonFences(result.text)
    const parsed = JSON.parse(jsonText) as { swaps: BudgetSwap[] }

    // Validate each swap has required fields and positive savings
    const validSwaps = (parsed.swaps || [])
      .filter((s) =>
        s.originalMeal &&
        s.swapMeal &&
        typeof s.originalCost === 'number' &&
        typeof s.swapCost === 'number' &&
        typeof s.savings === 'number' &&
        s.savings > 0 &&
        s.reason
      )
      .slice(0, 4) // Max 4 swaps

    return NextResponse.json({ swaps: validSwaps })
  } catch (err) {
    logger.error('[budget/swap] Failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to generate swap suggestions' }, { status: 500 })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}
