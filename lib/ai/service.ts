/**
 * Unified AI text-generation service.
 *
 * Uses the model router for cost-optimized model selection.
 * Provider priority: OpenAI → Anthropic (automatic fallback).
 * Each call is wrapped with a 30-second AbortSignal timeout.
 */
import logger from '@/lib/logger'
import { getModelForTask, logCost, type AITask, type ModelConfig } from './model-router'

const TIMEOUT_MS = 30_000

export interface AITextOptions {
  /** System instruction */
  system: string
  /** User message */
  user: string
  /** Max output tokens (default from model config) */
  maxTokens?: number
  /** AI task for model routing (default: 'general') */
  task?: AITask
  /** Force JSON response format (OpenAI only) */
  jsonMode?: boolean
  /** Temperature (0-2, default provider default) */
  temperature?: number
}

export interface AITokenUsage {
  prompt_tokens: number
  completion_tokens: number
}

export interface AITextResult {
  text: string
  provider: 'openai' | 'anthropic'
  model: string
  usage?: AITokenUsage
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(opts: AITextOptions, config: ModelConfig): Promise<AITextResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await client.chat.completions.create(
      {
        model: config.model,
        max_tokens: opts.maxTokens ?? config.maxTokens,
        ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
        ...(opts.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      },
      { signal: controller.signal }
    )

    const text = response.choices[0]?.message?.content ?? ''
    const usage = response.usage
      ? { prompt_tokens: response.usage.prompt_tokens ?? 0, completion_tokens: response.usage.completion_tokens ?? 0 }
      : undefined

    if (usage) {
      logCost(opts.task ?? 'general', config, usage.prompt_tokens, usage.completion_tokens)
    }

    return { text, provider: 'openai', model: config.model, usage }
  } finally {
    clearTimeout(timer)
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

async function callAnthropic(opts: AITextOptions, config: ModelConfig): Promise<AITextResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'mock') throw new Error('ANTHROPIC_API_KEY not set')

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const message = await client.messages.create(
      {
        model: config.model,
        max_tokens: opts.maxTokens ?? config.maxTokens,
        ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      },
      { signal: controller.signal }
    )

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected Anthropic response type')

    const usage = message.usage
      ? { prompt_tokens: message.usage.input_tokens, completion_tokens: message.usage.output_tokens }
      : undefined

    if (usage) {
      logCost(opts.task ?? 'general', config, usage.prompt_tokens, usage.completion_tokens)
    }

    return { text: content.text, provider: 'anthropic', model: config.model, usage }
  } finally {
    clearTimeout(timer)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Call AI with automatic model routing and provider fallback.
 * Uses the model router to select the cheapest appropriate model for the task.
 */
export async function generateText(opts: AITextOptions): Promise<AITextResult> {
  const task = opts.task ?? 'general'
  const config = getModelForTask(task)

  // Try the routed provider first
  if (config.provider === 'openai') {
    try {
      return await callOpenAI(opts, config)
    } catch (err) {
      logger.warn('[ai/service] OpenAI failed, falling back to Anthropic', {
        task,
        model: config.model,
        error: err instanceof Error ? err.message : String(err),
      })
      // Fall back to Anthropic
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (anthropicKey && anthropicKey !== 'mock') {
        const fallbackConfig: ModelConfig = {
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          maxTokens: config.maxTokens,
          costPer1MInput: 3.0,
          costPer1MOutput: 15.0,
        }
        return await callAnthropic(opts, fallbackConfig)
      }
      throw err
    }
  }

  // Anthropic primary
  try {
    return await callAnthropic(opts, config)
  } catch (err) {
    logger.warn('[ai/service] Anthropic failed, falling back to OpenAI', {
      task,
      model: config.model,
      error: err instanceof Error ? err.message : String(err),
    })
    // Fall back to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const fallbackConfig: ModelConfig = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: config.maxTokens,
        costPer1MInput: 0.15,
        costPer1MOutput: 0.60,
      }
      return await callOpenAI(opts, fallbackConfig)
    }
    throw err
  }
}

/**
 * Strip markdown code fences from an AI JSON response.
 */
export function stripJsonFences(text: string): string {
  let clean = text.trim()
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return clean
}
