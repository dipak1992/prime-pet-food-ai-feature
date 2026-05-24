/**
 * Copilot Chat API — Streaming endpoint with function calling
 *
 * POST /api/copilot/chat
 * Body: { messages: Array<{role, content}>, screen: string }
 *
 * - Requires auth
 * - Free users get 3 basic reactive meal assists/day
 * - Plus users get voice, memory, nudges, plan refinements, budget swaps, and actions
 * - Builds context from buildUserContext() and getCrossFeatureSignals()
 * - Sends to gpt-4o-mini with function calling tools
 * - Streams the response back
 * - Rate limited: 20 messages/hour for Plus users
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { getPaywallStatus } from '@/lib/paywall/server'
import { rateLimit } from '@/lib/rate-limit'
import { enforceFeatureQuota, incrementFeatureQuota } from '@/lib/usage/feature-quota'
import { buildUserContext, formatCompactContext } from '@/lib/ai/context'
import { getCrossFeatureSignals } from '@/lib/ai/cross-feature'
import { buildCopilotSystemPrompt } from '@/lib/copilot/system-prompt'
import { COPILOT_TOOLS, SCREEN_ROUTES } from '@/lib/copilot/tools'
import {
  FREE_COPILOT_QUOTA,
  buildFreeLimitMessage,
  filterCopilotToolsForPlan,
  getFreeCopilotUpgradeMessage,
  PLUS_ONLY_COPILOT_TOOL_NAMES,
} from '@/lib/copilot/access'
import { buildConversationMemory, shouldResetCopilotSession } from '@/lib/copilot/session'
import { recordCopilotLearning } from '@/lib/copilot/learning'
import { buildPlanRefinement, type PlanRefinementRequest } from '@/lib/copilot/plan-refinement'
import { inferMemoryType, saveHouseholdMemory } from '@/lib/ai/stateful-memory'
import {
  clearWeeklyInstructions,
  extractWeeklyInstruction,
  formatWeeklyInstructionsForPrompt,
  loadActiveWeeklyInstructions,
  saveWeeklyInstruction,
  type WeeklyInstructionType,
} from '@/lib/copilot/weekly-instructions'
import { getModelForTask } from '@/lib/ai/model-router'
import logger from '@/lib/logger'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequestBody {
  messages: ChatMessage[]
  screen: string
  session?: {
    id?: string
    turnCount?: number
    summary?: string
    intent?: string
    updatedAt?: number
  }
}

function getWeekStartDate(): string {
  const date = new Date()
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

function groceryStableKey(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'copilot-item'
}

// ── Function Call Executors ────────────────────────────────────────────────────

async function executeFunctionCall(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  isPlus: boolean,
): Promise<{ result: string; action?: { type: string; payload: unknown } }> {
  if (!isPlus && PLUS_ONLY_COPILOT_TOOL_NAMES.has(name)) {
    // Specific upgrade message for weekly instruction tools
    if (name === 'set_weekly_instruction' || name === 'clear_weekly_instruction') {
      return {
        result: 'Weekly preferences are a Plus feature. Upgrade to tell MealEase what kind of week you want! 🌟',
        action: { type: 'navigate', payload: { href: '/upgrade?feature=copilot' } },
      }
    }
    return {
      result: 'That Copilot action is included in Plus. Free Copilot can answer basic meal questions; Plus turns Copilot into the household food operating layer with plan, budget, grocery, leftover, memory, voice, and proactive actions.',
      action: { type: 'navigate', payload: { href: '/upgrade?feature=copilot' } },
    }
  }

  switch (name) {
    case 'suggest_tonight_dinner': {
      const mode = (args.mode as string) || 'quick'
      const maxCookTime = (args.maxCookTime as number) || 30
      return {
        result: `I'll find a ${mode} dinner suggestion (under ${maxCookTime} min). Let me check what works for your household.`,
        action: {
          type: 'navigate',
          payload: { href: '/dashboard/tonight', params: { mode, maxCookTime } },
        },
      }
    }

    case 'swap_tonight_meal': {
      const reason = args.reason as string
      return {
        result: `Swapping your tonight meal (reason: ${reason}). Let me find something better!`,
        action: {
          type: 'trigger',
          payload: { feature: 'tonight-swap', params: { reason } },
        },
      }
    }

    case 'add_to_grocery_list': {
      const items = args.items as string[]
      if (!items?.length) {
        return { result: 'No items specified to add.' }
      }

      try {
        const supabase = await createClient()

        const weekStart = getWeekStartDate()
        const { data: groceryList, error: listError } = await supabase
          .from('grocery_lists')
          .upsert(
            {
              user_id: userId,
              week_start: weekStart,
              status: 'active',
              store_format: 'standard',
              generated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,week_start' },
          )
          .select('id')
          .single()

        if (listError || !groceryList?.id) throw listError ?? new Error('No grocery list id returned')

        const normalizedItems = items
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20)
          .map((item) => ({
            grocery_list_id: groceryList.id as string,
            stable_key: `copilot-${groceryStableKey(item)}`,
            name: item,
            quantity: 1,
            unit: 'whole',
            category: 'other',
            estimated_cost: 0,
            is_in_pantry: false,
            is_checked: false,
            is_custom: true,
            note: 'Added by MealEase Copilot',
          }))

        if (!normalizedItems.length) return { result: 'No valid grocery items were specified.' }

        const { error: itemError } = await supabase
          .from('grocery_items')
          .upsert(normalizedItems, { onConflict: 'grocery_list_id,stable_key' })

        if (itemError) throw itemError

        return {
          result: `Added ${normalizedItems.length} item${normalizedItems.length > 1 ? 's' : ''} to your active grocery list: ${normalizedItems.map((item) => item.name).join(', ')} ✓`,
          action: { type: 'navigate', payload: { href: '/grocery-list?source=copilot-added-items' } },
        }
      } catch {
        try {
          const supabase = await createClient()
          for (const item of items) {
            if (!item.trim()) continue
            await supabase
              .from('grocery_list_items')
              .insert({ user_id: userId, name: item.trim(), checked: false })
          }
          return {
            result: `Added ${items.length} item${items.length > 1 ? 's' : ''} to your grocery list: ${items.join(', ')} ✓`,
            action: { type: 'navigate', payload: { href: '/grocery-list?source=copilot-added-items' } },
          }
        } catch {
          return {
            result: 'I could not write to the grocery list yet. I’ll open the list so you can add the items manually.',
            action: { type: 'navigate', payload: { href: '/grocery-list?source=copilot-add-failed' } },
          }
        }
      }
    }

    case 'optimize_weekly_budget': {
      const targetBudget = typeof args.targetBudget === 'number' ? args.targetBudget : null
      const constraint = typeof args.constraint === 'string' ? args.constraint : ''
      const params = new URLSearchParams({
        source: 'copilot',
        refine: 'budget_optimize',
      })
      if (targetBudget !== null) params.set('budget', String(targetBudget))
      if (constraint) params.set('constraint', constraint)
      return {
        result: targetBudget
          ? `I can optimize the week toward $${targetBudget}. I’ll open budget swaps so you can review each change before applying it.`
          : `I can look for cheaper swaps across the week and show you what changes before anything is applied.`,
        action: {
          type: 'navigate',
          payload: { href: `/budget?${params.toString()}` },
        },
      }
    }

    case 'generate_weekly_plan': {
      const preferences = (args.preferences as string) || ''
      return {
        result: `I'll generate a new weekly plan${preferences ? ` with focus on: ${preferences}` : ''}. Heading to the planner now!`,
        action: {
          type: 'navigate',
          payload: { href: '/planner', params: { autoGenerate: true, preferences } },
        },
      }
    }

    case 'refine_weekly_plan': {
      const refinement = buildPlanRefinement(args as unknown as PlanRefinementRequest)
      return {
        result: refinement.message,
        action: {
          type: 'navigate',
          payload: { href: refinement.href, params: refinement.params },
        },
      }
    }

    case 'suggest_leftover_meal': {
      const leftovers = args.leftovers as string[]
      if (!leftovers?.length) {
        return { result: 'What leftovers do you have? Tell me and I\'ll suggest something!' }
      }
      return {
        result: `Let me find a meal using your ${leftovers.join(', ')}. Heading to the leftover transformer!`,
        action: {
          type: 'navigate',
          payload: { href: '/leftovers', params: { ingredients: leftovers } },
        },
      }
    }

    case 'monitor_leftovers': {
      const focus = typeof args.focus === 'string' ? args.focus : 'expiring'
      const params = new URLSearchParams({ source: 'copilot', focus })
      return {
        result: `I’ll check leftover risk and help you turn what should be used next into a practical meal. You’ll review the suggestion before saving anything.`,
        action: {
          type: 'navigate',
          payload: { href: `/leftovers?${params.toString()}` },
        },
      }
    }

    case 'save_household_preference': {
      const preference = typeof args.preference === 'string' ? args.preference.trim() : ''
      const category = typeof args.category === 'string' ? args.category : 'household_rule'
      if (!preference) return { result: 'Tell me the preference you want saved and I’ll remember it for Plus planning.' }

      try {
        const supabase = await createClient()
        const memoryType = inferMemoryType(category, preference)
        await Promise.all([
          saveHouseholdMemory(supabase, userId, {
            memoryType,
            subject: preference,
            details: { category, raw: preference },
            source: 'copilot',
            strength: memoryType.endsWith('_inventory') ? 0.9 : 0.75,
          }),
          recordCopilotLearning(
            supabase,
            userId,
            `${category}: ${preference}`,
            `tool:${Date.now()}`,
          ),
        ])
      } catch {
        return { result: 'I could not save that preference yet, but I can still use it in this conversation.' }
      }

      return {
        result: `Saved for future planning: ${preference}. I’ll use that persistent memory when shaping dinners, swaps, weekly plans, and use-soon inventory picks.`,
        action: { type: 'toast', payload: { message: 'Copilot memory saved' } },
      }
    }

    case 'set_weekly_instruction': {
      const instructionType = args.instructionType as WeeklyInstructionType
      const value = typeof args.value === 'string' ? args.value.trim() : ''
      const label = typeof args.label === 'string' ? args.label.trim() : undefined
      const emoji = typeof args.emoji === 'string' ? args.emoji.trim() : undefined

      if (!instructionType || !value) {
        return { result: 'Tell me the weekly instruction, like “Thai this week” or “no spicy this week,” and I’ll keep it active until Sunday night.' }
      }

      try {
        const saved = await saveWeeklyInstruction(await createClient(), userId, {
          instructionType,
          value,
          label,
          emoji,
        })
        return {
          result: `Got it — ${saved.label} is active for this week and resets Sunday night. I’ll use it for tonight picks, swaps, and weekly plan changes.`,
          action: { type: 'toast', payload: { message: `${saved.label} active this week` } },
        }
      } catch {
        return { result: 'I could not save that weekly instruction yet, but I can still use it in this conversation.' }
      }
    }

    case 'clear_weekly_instruction': {
      const value = typeof args.value === 'string' ? args.value.trim() : undefined
      try {
        const cleared = await clearWeeklyInstructions(await createClient(), userId, value)
        return {
          result: cleared > 0
            ? 'Cleared the active weekly instruction. I’ll stop using that temporary theme for this week.'
            : 'There were no active weekly instructions to clear.',
          action: { type: 'toast', payload: { message: cleared > 0 ? 'Weekly instruction cleared' : 'No weekly instruction active' } },
        }
      } catch {
        return { result: 'I could not clear that weekly instruction yet. Try again in a moment.' }
      }
    }

    case 'build_weekly_briefing': {
      const focus = typeof args.focus === 'string' ? args.focus : 'full_week'
      const params = new URLSearchParams({ source: 'copilot', briefing: focus })
      return {
        result: `I’ll build a weekly food briefing: plan gaps, grocery readiness, budget pressure, leftover priorities, and schedule risks in one place.`,
        action: {
          type: 'navigate',
          payload: { href: `/dashboard?${params.toString()}` },
        },
      }
    }

    case 'navigate_to_screen': {
      const screen = args.screen as string
      const href = SCREEN_ROUTES[screen] || '/dashboard'
      return {
        result: `Taking you to ${screen}!`,
        action: { type: 'navigate', payload: { href } },
      }
    }

    default:
      return { result: 'I\'m not sure how to do that yet.' }
  }
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Paywall + quota
    const paywall = await getPaywallStatus()
    const isPlus = paywall.isPro

    // 3. Rate limit
    const rl = await rateLimit({
      key: `copilot:${user.id}`,
      limit: isPlus ? 100 : 20,
      windowMs: 60 * 60 * 1000, // 1 hour
    })
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.', remaining: rl.remaining, reset: rl.reset },
        { status: 429 },
      )
    }

    // 4. Parse body
    const body = (await req.json()) as ChatRequestBody
    const { messages, screen, session } = body

    if (!messages?.length || !screen) {
      return NextResponse.json(
        { error: 'messages and screen are required' },
        { status: 400 },
      )
    }

    const latestRawUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    const detectedWeeklyInstruction = extractWeeklyInstruction(latestRawUserMessage)
    if (!isPlus) {
      if (detectedWeeklyInstruction) {
        return NextResponse.json(
          {
            error: 'Plus unlocks weekly Copilot instructions. Tell MealEase “Thai this week,” “no spicy this week,” or “under 30 minutes this week,” and Copilot keeps that active until Sunday night.',
            action: { type: 'navigate', payload: { href: '/upgrade?feature=copilot-weekly-instructions' } },
          },
          { status: 402 },
        )
      }

      const upgradeMessage = getFreeCopilotUpgradeMessage(latestRawUserMessage)
      if (upgradeMessage) {
        return NextResponse.json(
          {
            error: upgradeMessage,
            action: { type: 'navigate', payload: { href: '/upgrade?feature=copilot' } },
          },
          { status: 402 },
        )
      }

      const quotaResponse = await enforceFeatureQuota(supabase, user.id, FREE_COPILOT_QUOTA)
      if (quotaResponse) {
        return NextResponse.json(
          {
            error: buildFreeLimitMessage(),
            action: { type: 'navigate', payload: { href: '/upgrade?feature=copilot' } },
          },
          { status: 429 },
        )
      }
      await incrementFeatureQuota(supabase, FREE_COPILOT_QUOTA)
    }

    // Limit conversation history to last 10 messages for token efficiency
    const recentMessages = !isPlus
      ? messages.slice(-4).filter((m) => m.role === 'user')
      : shouldResetCopilotSession(session) ? messages.slice(-4) : messages.slice(-10)
    const latestUserMessage = [...recentMessages].reverse().find((m) => m.role === 'user')?.content

    // 5. Build context
    const [userContext, crossSignals] = await Promise.all([
      buildUserContext(supabase, user.id, { includeLearning: isPlus }),
      getCrossFeatureSignals(supabase, user.id),
    ])

    if (isPlus && latestUserMessage) {
      recordCopilotLearning(supabase, user.id, latestUserMessage, session?.id).catch((error) => {
        logger.warn('[copilot/chat] Learning capture skipped', {
          error: error instanceof Error ? error.message : String(error),
          userId: user.id,
        })
      })
    }

    const { data: scheduleRows } = isPlus
      ? await supabase
          .from('copilot_schedule_constraints')
          .select('day_of_week, constraint_label')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(8)
      : { data: [] }

    const scheduleConstraints = (scheduleRows ?? []).map((row) => ({
      dayOfWeek: String(row.day_of_week),
      constraint: String(row.constraint_label),
    }))

    // Determine time of day
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

    // 6. Build system prompt
    const systemPrompt = buildCopilotSystemPrompt({
      userName: user.user_metadata?.full_name || user.email?.split('@')[0],
      householdSize: userContext.household.size,
      dietary: userContext.household.dietary,
      pantryItems: userContext.pantry,
      budgetRemaining: userContext.budget.remainingBudget,
      currentScreen: screen,
      timeOfDay,
      conversationMemory: isPlus ? buildConversationMemory(session, recentMessages) : undefined,
      scheduleConstraints,
    })

    // Fetch active weekly instructions for Plus users
    const activeInstructions = isPlus ? await loadActiveWeeklyInstructions(supabase, user.id).catch(() => []) : []
    const instructionBlock = activeInstructions.length
      ? `\nACTIVE WEEKLY INSTRUCTIONS:\n${formatWeeklyInstructionsForPrompt(activeInstructions)}`
      : ''

    // Append compact context + cross-feature signals + weekly instructions
    const contextBlock = formatCompactContext(userContext)
    const signalBlock = crossSignals.reasonHint
      ? `\nINTELLIGENCE: ${crossSignals.reasonHint}`
      : ''
    const fullSystemPrompt = `${systemPrompt}\n\nADDITIONAL CONTEXT: ${contextBlock}${signalBlock}${instructionBlock}`

    // 7. Get model config
    const modelConfig = getModelForTask('copilot')

    // 8. Call OpenAI with streaming + tools
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: fullSystemPrompt },
      ...recentMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      max_tokens: 500,
      temperature: 0.7,
      messages: openaiMessages,
      tools: filterCopilotToolsForPlan(COPILOT_TOOLS, isPlus),
      stream: true,
    })

    // 9. Stream response back
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let functionCallName = ''
        let functionCallArgs = ''
        let hasToolCall = false

        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta

            // Handle text content streaming
            if (delta?.content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta.content })}\n\n`)
              )
            }

            // Handle tool calls
            if (delta?.tool_calls?.[0]) {
              hasToolCall = true
              const toolCall = delta.tool_calls[0]
              if (toolCall.function?.name) {
                functionCallName = toolCall.function.name
              }
              if (toolCall.function?.arguments) {
                functionCallArgs += toolCall.function.arguments
              }
            }

            // Check if stream is done
            if (chunk.choices[0]?.finish_reason === 'tool_calls' && hasToolCall) {
              // Execute the function call
              let parsedArgs: Record<string, unknown> = {}
              try {
                parsedArgs = JSON.parse(functionCallArgs)
              } catch {
                parsedArgs = {}
              }

              const { result, action } = await executeFunctionCall(
                functionCallName,
                parsedArgs,
                user.id,
                isPlus,
              )

              // Send function result as text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: result })}\n\n`)
              )

              // Send action if present
              if (action) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'action', action })}\n\n`)
                )
              }
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (err) {
          logger.error('[copilot/chat] Stream error', {
            error: err instanceof Error ? err.message : String(err),
            userId: user.id,
          })
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Something went wrong' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    logger.error('[copilot/chat] Request error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
