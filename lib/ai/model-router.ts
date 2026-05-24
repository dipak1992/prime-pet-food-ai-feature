/**
 * AI Model Router — Cost-optimized model selection
 *
 * Routes AI requests to the cheapest model that can handle the task.
 * Priority: rule-engine (free) → gpt-4o-mini (cheap) → gpt-4o (quality) → claude (fallback)
 *
 * Model tiers:
 *   - FAST:     gpt-4o-mini  — structured JSON, simple generation ($0.15/1M input)
 *   - QUALITY:  gpt-4o       — complex reasoning, vision ($2.50/1M input)
 *   - FALLBACK: claude-sonnet — when OpenAI is down
 */

import logger from '@/lib/logger'

// ── Model Definitions ─────────────────────────────────────────────────────────

export type ModelTier = 'fast' | 'quality' | 'fallback'

export interface ModelConfig {
  provider: 'openai' | 'anthropic'
  model: string
  maxTokens: number
  costPer1MInput: number   // USD per 1M input tokens
  costPer1MOutput: number  // USD per 1M output tokens
}

const MODELS: Record<ModelTier, ModelConfig> = {
  fast: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 8192,
    costPer1MInput: 0.15,
    costPer1MOutput: 0.60,
  },
  quality: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 8192,
    costPer1MInput: 2.50,
    costPer1MOutput: 10.00,
  },
  fallback: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
  },
}

// ── Task → Model Mapping ──────────────────────────────────────────────────────

export type AITask =
  | 'weekly-plan'        // Generate 7-day meal plan
  | 'autopilot'          // Weekly autopilot planning
  | 'budget-swap'        // Budget swap suggestions
  | 'meal-regenerate'    // Regenerate a single meal
  | 'vision'             // Image analysis (fridge scan)
  | 'leftover-transform' // Transform leftovers into meals
  | 'copilot'            // Conversational copilot (Plus only)
  | 'general'            // Generic text generation

const TASK_TIER_MAP: Record<AITask, ModelTier> = {
  'weekly-plan': 'fast',          // Structured JSON output — mini handles well
  'autopilot': 'fast',            // Same as weekly-plan
  'budget-swap': 'fast',          // Simple comparison/suggestion
  'meal-regenerate': 'fast',      // Single meal modification
  'vision': 'quality',            // Vision requires gpt-4o
  'leftover-transform': 'fast',   // Simple creative task
  'copilot': 'fast',              // Conversational — mini is fast + cheap (max 500 tokens)
  'general': 'fast',              // Default to cheapest
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the recommended model configuration for a given task.
 * Falls back gracefully if the preferred provider's key is missing.
 */
export function getModelForTask(task: AITask): ModelConfig {
  const preferredTier = TASK_TIER_MAP[task]
  const config = MODELS[preferredTier]

  // Check if the preferred provider's API key is available
  if (config.provider === 'openai' && !process.env.OPENAI_API_KEY) {
    logger.warn(`[model-router] OpenAI key missing for task "${task}", falling back to Anthropic`)
    return MODELS.fallback
  }
  if (config.provider === 'anthropic' && (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock')) {
    logger.warn(`[model-router] Anthropic key missing for task "${task}", falling back to OpenAI`)
    return MODELS.fast
  }

  return config
}

/**
 * Get model config by explicit tier (for manual override).
 */
export function getModelByTier(tier: ModelTier): ModelConfig {
  return MODELS[tier]
}

/**
 * Estimate cost for a request given approximate token counts.
 */
export function estimateCost(
  config: ModelConfig,
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * config.costPer1MInput +
    (outputTokens / 1_000_000) * config.costPer1MOutput
  )
}

/**
 * Log cost after a completed request.
 */
export function logCost(
  task: AITask,
  config: ModelConfig,
  inputTokens: number,
  outputTokens: number,
): void {
  const cost = estimateCost(config, inputTokens, outputTokens)
  logger.info('[model-router] AI call completed', {
    task,
    model: config.model,
    provider: config.provider,
    inputTokens,
    outputTokens,
    estimatedCostUSD: cost.toFixed(6),
  })
}
