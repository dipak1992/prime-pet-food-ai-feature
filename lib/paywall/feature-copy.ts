export type UpgradeFeature =
  | 'budget'
  | 'grocery'
  | 'household'
  | 'leftovers'
  | 'planner'
  | 'scan'
  | 'weekly_autopilot'
  | 'guided_cooking'
  | 'insights'
  | string

type FeatureCopy = {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
}

const FEATURE_COPY: Record<string, FeatureCopy> = {
  budget: {
    eyebrow: 'Recovered grocery money',
    title: 'Make Plus pay for itself with cheaper weeks',
    description: 'See meal costs before you shop, catch budget drift early, and swap one pricey dinner before it turns into takeout.',
    bullets: ['Budget-aware swaps', 'Weekly spend alerts', 'One avoided takeout night can cover the month'],
  },
  grocery: {
    eyebrow: 'Grocery utility',
    title: 'Turn plans into grocery lists',
    description: 'Generate a full weekly grocery list with pantry deductions, quantities, and shopping-ready organization.',
    bullets: ['Auto-built lists', 'Pantry deductions', 'Store-friendly grouping'],
  },
  household: {
    eyebrow: 'Household memory',
    title: 'Stop re-explaining your food life',
    description: 'Plus keeps your household context attached to every Tonight pick, weekly plan, and grocery decision.',
    bullets: ['Shared preferences', 'Household profiles', 'Better repeat suggestions'],
  },
  leftovers: {
    eyebrow: 'Waste less, recover more',
    title: 'Use leftovers before they expire',
    description: 'Plus tracks leftovers, alerts you at the right time, and turns extras into practical next meals before food becomes sunk cost.',
    bullets: ['Use-before-expiry nudges', 'Leftover recipe ideas', 'Reduce wasted groceries'],
  },
  planner: {
    eyebrow: 'Weekly rhythm',
    title: 'Unlock the full 7-day plan',
    description: 'Plan all seven dinners, preview the grocery impact, and keep the week moving with one planning ritual.',
    bullets: ['7 dinners in one tap', 'Locked-day previews', 'Weekly grocery planning'],
  },
  weekly_autopilot: {
    eyebrow: 'Weekly rhythm',
    title: 'Let Autopilot handle the week',
    description: 'Plus plans seven dinners around preferences, budget, leftovers, and what your household actually eats.',
    bullets: ['Full-week planning', 'Unlimited swaps', 'Personalized Autopilot'],
  },
  scan: {
    eyebrow: 'Cook what you have',
    title: 'Unlock unlimited Snap & Cook',
    description: 'Keep scanning your fridge and pantry to turn what is already there into real dinner options.',
    bullets: ['Unlimited scans', 'Pantry meals', 'Leftover-aware ideas'],
  },
  guided_cooking: {
    eyebrow: 'Cook mode',
    title: 'Unlock guided cooking with Plus',
    description: 'The recipe is yours. Plus adds step-by-step Cook Mode, leftover tracking, and smarter follow-up meals.',
    bullets: ['Step-by-step Cook Mode', 'Cook completion tracking', 'Leftover follow-ups'],
  },
  insights: {
    eyebrow: 'Progress',
    title: 'See what MealEase is learning',
    description: 'Plus turns meal history into patterns: cuisines, cook times, household fit, and weekly progress.',
    bullets: ['Weekly insights', 'Household trends', 'Progress recaps'],
  },
  copilot: {
    eyebrow: 'Household food ROI',
    title: 'Let Copilot protect the food budget',
    description: 'Plus turns Copilot from basic meal help into the action layer for planning, groceries, leftovers, budget, schedule, and household memory.',
    bullets: ['Weekly food briefings and proactive nudges', 'Voice plus household memory', 'Plan, budget, grocery, leftover, and schedule actions'],
  },
}

export function getUpgradeFeatureCopy(feature?: string | null): FeatureCopy {
  if (!feature) {
    return {
      eyebrow: 'Plus',
      title: 'Upgrade when MealEase can recover the cost',
      description: 'Get personalized meals, weekly planning, leftovers, grocery lists, and budget intelligence designed to prevent one expensive dinner mistake.',
      bullets: ['Weekly Autopilot', 'Unlimited swaps and scans', 'Leftovers, groceries, and budget tools'],
    }
  }

  return FEATURE_COPY[feature] ?? {
    eyebrow: 'Plus',
    title: 'Unlock this with Plus',
    description: 'Upgrade to unlock this feature and the full MealEase planning system around it.',
    bullets: ['Premium meal planning', 'Smarter personalization', 'Recover value through less takeout and less waste'],
  }
}
