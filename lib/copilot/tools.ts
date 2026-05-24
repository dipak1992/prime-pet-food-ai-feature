/**
 * Copilot Function Calling Tool Definitions
 *
 * These tools map to existing MealEase APIs and allow the copilot
 * to take actions on behalf of the user (suggest meals, add to grocery, etc.)
 */

import type { ChatCompletionTool } from 'openai/resources/chat/completions'

export const COPILOT_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'suggest_tonight_dinner',
      description: 'Get a dinner suggestion for tonight based on preferences',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['quick', 'vegetarian', 'budget', 'comfort', 'healthy'],
            description: 'Type of meal to suggest',
          },
          maxCookTime: {
            type: 'number',
            description: 'Maximum cook time in minutes',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'swap_tonight_meal',
      description: 'Swap the current tonight suggestion for a different one',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: ['too-complex', 'too-expensive', 'not-in-mood', 'dietary', 'quicker'],
            description: 'Why the user wants to swap',
          },
        },
        required: ['reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_grocery_list',
      description: 'Add items to the grocery list',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            description: 'Items to add',
          },
        },
        required: ['items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_weekly_plan',
      description: 'Generate a new weekly meal plan',
      parameters: {
        type: 'object',
        properties: {
          preferences: {
            type: 'string',
            description: 'Any specific preferences for this week',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'refine_weekly_plan',
      description: 'Refine an existing weekly plan across one or more days, such as swapping Thursday, filling empty nights, rebalancing budget, or keeping selected days while regenerating the rest',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['swap_day', 'rebalance_week', 'fill_gaps', 'budget_optimize', 'lock_and_regenerate'],
            description: 'The plan refinement operation to perform',
          },
          day: {
            type: 'string',
            description: 'Specific day to adjust, if the request names one',
          },
          constraint: {
            type: 'string',
            description: 'Natural language constraint, such as quicker, impressive for guests, Mediterranean, under 30 minutes, or lower cost',
          },
          keepDays: {
            type: 'array',
            items: { type: 'string' },
            description: 'Days the user wants to keep unchanged',
          },
          theme: {
            type: 'string',
            description: 'Cuisine, style, or weekly theme to apply',
          },
          budgetCap: {
            type: 'number',
            description: 'Budget cap mentioned by the user',
          },
        },
        required: ['operation'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'optimize_weekly_budget',
      description: 'Find budget-saving opportunities across the weekly plan and route the user to the budget swap workflow',
      parameters: {
        type: 'object',
        properties: {
          targetBudget: {
            type: 'number',
            description: 'Weekly food budget target mentioned by the user',
          },
          constraint: {
            type: 'string',
            description: 'Budget constraint or preference, such as keep Friday, save $15, or avoid repeats',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_leftover_meal',
      description: 'Suggest a meal using leftover ingredients',
      parameters: {
        type: 'object',
        properties: {
          leftovers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Leftover ingredients to use',
          },
        },
        required: ['leftovers'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'monitor_leftovers',
      description: 'Review leftover risk and route the user to leftover monitoring or reuse workflow',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            enum: ['expiring', 'lunch', 'dinner', 'freeze'],
            description: 'What the user wants to do with leftovers',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_household_preference',
      description: 'Save a household preference, dislike, schedule pattern, or planning rule from the conversation',
      parameters: {
        type: 'object',
        properties: {
          preference: {
            type: 'string',
            description: 'The household memory to save',
          },
          category: {
            type: 'string',
            enum: ['like', 'dislike', 'schedule', 'budget', 'cooking_time', 'allergy', 'calorie_goal', 'household_rule', 'pantry_inventory', 'leftover_inventory'],
            description: 'The type of household memory',
          },
        },
        required: ['preference', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_weekly_instruction',
      description: 'Save a temporary current-week instruction such as a cuisine theme, no spicy food, quick meals, budget target, or no repeated cuisines. It expires Sunday night.',
      parameters: {
        type: 'object',
        properties: {
          instructionType: {
            type: 'string',
            enum: ['cuisine_boost', 'avoid', 'time_constraint', 'budget_override', 'variety_rule'],
            description: 'The type of temporary instruction',
          },
          value: {
            type: 'string',
            description: 'The instruction value, such as thai, spicy, 30, 80, or no_repeat_cuisine',
          },
          label: {
            type: 'string',
            description: 'Short human-readable badge label, such as Thai week or No spicy',
          },
          emoji: {
            type: 'string',
            description: 'Optional badge emoji',
          },
        },
        required: ['instructionType', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_weekly_instruction',
      description: 'Clear active current-week Copilot instructions when the user asks to forget, clear, remove, or reset the weekly theme or temporary preferences.',
      parameters: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            description: 'Optional specific instruction value to clear. Omit to clear all active weekly instructions.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'build_weekly_briefing',
      description: 'Create a concise weekly food operating briefing that summarizes plan, groceries, budget, leftovers, and schedule risks',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            enum: ['sunday_plan', 'budget', 'leftovers', 'schedule', 'full_week'],
            description: 'What the weekly briefing should emphasize',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_screen',
      description: 'Navigate the user to a specific screen in the app',
      parameters: {
        type: 'object',
        properties: {
          screen: {
            type: 'string',
            enum: ['tonight', 'cook', 'plan', 'leftovers', 'budget', 'grocery', 'settings'],
            description: 'Screen to navigate to',
          },
        },
        required: ['screen'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_weekly_instruction',
      description: 'Set a temporary weekly preference/instruction that affects all meal suggestions for the next 7 days. Use when the user expresses a temporary preference like "Thai this week", "quick meals only", "no chicken this week". Do NOT use for permanent preferences.',
      parameters: {
        type: 'object',
        properties: {
          instruction: {
            type: 'string',
            description: 'The instruction in natural language, e.g. "Focus on Thai cuisine", "Only quick meals under 30 minutes", "Avoid chicken"',
          },
          category: {
            type: 'string',
            enum: ['cuisine', 'speed', 'dietary', 'avoidance', 'general'],
            description: 'Category of the instruction',
          },
          duration_days: {
            type: 'number',
            description: 'How many days this instruction should last (default 7, max 14)',
          },
        },
        required: ['instruction', 'category'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_weekly_instruction',
      description: 'Clear/remove a weekly instruction. Use when user says "forget that", "nevermind about Thai week", "clear my preferences", "go back to normal".',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['cuisine', 'speed', 'dietary', 'avoidance', 'general', 'all'],
            description: 'Which category to clear, or "all" to clear everything',
          },
        },
        required: ['category'],
      },
    },
  },
]

/**
 * Map of screen names to their app routes.
 */
export const SCREEN_ROUTES: Record<string, string> = {
  tonight: '/dashboard/tonight',
  cook: '/dashboard/cook',
  plan: '/planner',
  leftovers: '/leftovers',
  budget: '/budget',
  grocery: '/grocery-list',
  settings: '/settings',
}
