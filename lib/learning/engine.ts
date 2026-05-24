// ============================================================
// Adaptive Learning Engine
// Computes preference signals from feedback history
// ============================================================

import type { MealFeedback, PreferenceSignal, LearnedBoosts } from './types'

// ── Thresholds ──────────────────────────────────────────────

const MIN_INTERACTIONS = 3         // need at least this many to produce signals
const REJECT_DISLIKE_THRESHOLD = 2 // cuisine/protein rejected N+ times → penalty
const MAX_HISTORY = 200            // cap stored events

// ── Scoring Weights for Learned Boosts ──────────────────────

const LW = {
  LIKED_CUISINE: 12,
  LIKED_PROTEIN: 10,
  LIKED_TAG: 6,
  REJECTED_CUISINE: -18,
  REJECTED_PROTEIN: -15,
  REJECTED_TAG: -8,
  REJECTED_MEAL: -35,
  DIFFICULTY_MATCH: 8,
  TIME_MATCH: 6,
  PICKY_KID_FRIENDLY: 3,
}

// ── Compute Preference Signal ───────────────────────────────

export function computePreferenceSignal(history: MealFeedback[]): PreferenceSignal {
  const recent = history.slice(-MAX_HISTORY)
  const likes = recent.filter(f => f.action === 'like' || f.action === 'save')
  const rejects = recent.filter(f => f.action === 'reject')
  const total = recent.length

  // Cuisine affinities
  const cuisineLikes: Record<string, number> = {}
  const cuisineRejects: Record<string, number> = {}
  for (const f of likes) {
    if (f.cuisineType) cuisineLikes[f.cuisineType] = (cuisineLikes[f.cuisineType] ?? 0) + 1
  }
  for (const f of rejects) {
    if (f.cuisineType) cuisineRejects[f.cuisineType] = (cuisineRejects[f.cuisineType] ?? 0) + 1
  }

  const cuisineAffinities: Record<string, number> = {}
  for (const [c, count] of Object.entries(cuisineLikes)) {
    cuisineAffinities[c] = Math.min(count / Math.max(likes.length, 1), 1)
  }

  const rejectedCuisines: Record<string, number> = {}
  for (const [c, count] of Object.entries(cuisineRejects)) {
    rejectedCuisines[c] = count / Math.max(rejects.length, 1)
  }

  // Protein affinities
  const proteinLikes: Record<string, number> = {}
  const proteinRejects: Record<string, number> = {}
  for (const f of likes) {
    if (f.proteinType) proteinLikes[f.proteinType] = (proteinLikes[f.proteinType] ?? 0) + 1
  }
  for (const f of rejects) {
    if (f.proteinType) proteinRejects[f.proteinType] = (proteinRejects[f.proteinType] ?? 0) + 1
  }

  const proteinAffinities: Record<string, number> = {}
  for (const [p, count] of Object.entries(proteinLikes)) {
    proteinAffinities[p] = Math.min(count / Math.max(likes.length, 1), 1)
  }

  const rejectedProteins: Record<string, number> = {}
  for (const [p, count] of Object.entries(proteinRejects)) {
    rejectedProteins[p] = count / Math.max(rejects.length, 1)
  }

  // Tag affinities
  const tagLikes: Record<string, number> = {}
  for (const f of likes) {
    for (const tag of f.tags) {
      tagLikes[tag] = (tagLikes[tag] ?? 0) + 1
    }
  }
  const tagAffinities: Record<string, number> = {}
  for (const [t, count] of Object.entries(tagLikes)) {
    tagAffinities[t] = Math.min(count / Math.max(likes.length, 1), 1)
  }

  // Difficulty preference
  const diffCounts: Record<string, number> = {}
  for (const f of likes) {
    if (f.difficulty) diffCounts[f.difficulty] = (diffCounts[f.difficulty] ?? 0) + 1
  }
  let preferredDifficulty: 'easy' | 'moderate' | 'hard' | null = null
  let maxDiff = 0
  for (const [d, count] of Object.entries(diffCounts)) {
    if (count > maxDiff) { maxDiff = count; preferredDifficulty = d as 'easy' | 'moderate' | 'hard' }
  }

  // Time preference
  let preferredTimeRange: { min: number; max: number } | null = null
  if (likes.length >= MIN_INTERACTIONS) {
    const times = likes.map(f => f.totalTime).filter(t => t > 0).sort((a, b) => a - b)
    if (times.length >= 2) {
      preferredTimeRange = { min: times[0], max: times[times.length - 1] }
    }
  }

  // Picky score = reject ratio
  const pickyScore = total > 0 ? rejects.length / total : 0

  // Time-context: weekday vs weekend cooking-time preferences
  const weekdayLikes = likes.filter(f => f.dayOfWeek != null && f.dayOfWeek >= 1 && f.dayOfWeek <= 5)
  const weekendLikes = likes.filter(f => f.dayOfWeek != null && (f.dayOfWeek === 0 || f.dayOfWeek === 6))
  const weekdayAvgTime = weekdayLikes.length >= 2
    ? Math.round(weekdayLikes.reduce((s, f) => s + f.totalTime, 0) / weekdayLikes.length)
    : null
  const weekendAvgTime = weekendLikes.length >= 2
    ? Math.round(weekendLikes.reduce((s, f) => s + f.totalTime, 0) / weekendLikes.length)
    : null

  // Chip signals: count how often each chip is used
  const chipSignals: Record<string, number> = {}
  for (const f of recent) {
    if (f.chipUsed) chipSignals[f.chipUsed] = (chipSignals[f.chipUsed] ?? 0) + 1
  }

  return {
    cuisineAffinities,
    proteinAffinities,
    tagAffinities,
    rejectedMealIds: rejects.map(f => f.mealId),
    rejectedCuisines,
    rejectedProteins,
    preferredDifficulty,
    preferredTimeRange,
    pickyScore,
    weekdayAvgTime,
    weekendAvgTime,
    chipSignals,
    totalInteractions: total,
    lastUpdated: Date.now(),
  }
}

// ── Convert Signal to Scoring Boosts ────────────────────────

export function computeLearnedBoosts(signal: PreferenceSignal): LearnedBoosts {
  if (signal.totalInteractions < MIN_INTERACTIONS) {
    return emptyBoosts()
  }

  // Cuisine boost/penalty
  const cuisineBoost: Record<string, number> = {}
  for (const [c, affinity] of Object.entries(signal.cuisineAffinities)) {
    cuisineBoost[c] = Math.round(affinity * LW.LIKED_CUISINE)
  }
  for (const [c, ratio] of Object.entries(signal.rejectedCuisines)) {
    if ((signal.rejectedMealIds.length) >= REJECT_DISLIKE_THRESHOLD) {
      cuisineBoost[c] = (cuisineBoost[c] ?? 0) + Math.round(ratio * LW.REJECTED_CUISINE)
    }
  }

  // Protein boost/penalty
  const proteinBoost: Record<string, number> = {}
  for (const [p, affinity] of Object.entries(signal.proteinAffinities)) {
    proteinBoost[p] = Math.round(affinity * LW.LIKED_PROTEIN)
  }
  for (const [p, ratio] of Object.entries(signal.rejectedProteins)) {
    if ((signal.rejectedMealIds.length) >= REJECT_DISLIKE_THRESHOLD) {
      proteinBoost[p] = (proteinBoost[p] ?? 0) + Math.round(ratio * LW.REJECTED_PROTEIN)
    }
  }

  // Tag boost
  const tagBoost: Record<string, number> = {}
  for (const [t, affinity] of Object.entries(signal.tagAffinities)) {
    tagBoost[t] = Math.round(affinity * LW.LIKED_TAG)
  }

  // Picky multiplier — amplifies kid-friendly scoring
  const pickyMultiplier = 1 + signal.pickyScore

  return {
    cuisineBoost,
    proteinBoost,
    tagBoost,
    mealPenalties: signal.rejectedMealIds,
    difficultyBoost: signal.preferredDifficulty ? LW.DIFFICULTY_MATCH : 0,
    timeBoost: signal.preferredTimeRange ? LW.TIME_MATCH : 0,
    pickyMultiplier,
  }
}

function emptyBoosts(): LearnedBoosts {
  return {
    cuisineBoost: {},
    proteinBoost: {},
    tagBoost: {},
    mealPenalties: [],
    difficultyBoost: 0,
    timeBoost: 0,
    pickyMultiplier: 1,
  }
}

// ── Apply Boosts to a Meal Score ────────────────────────────
// Called inside the scoring loop in engine.ts

export function applyLearnedBoosts(
  boosts: LearnedBoosts,
  mealId: string,
  cuisineType: string,
  proteinType: string,
  tags: string[],
  difficulty: string,
  totalTime: number,
  preferredDifficulty: string | null,
  preferredTimeRange: { min: number; max: number } | null,
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Rejected meal penalty
  if (boosts.mealPenalties.includes(mealId)) {
    score += LW.REJECTED_MEAL
    reasons.push('Previously rejected')
  }

  // Cuisine boost
  const cb = boosts.cuisineBoost[cuisineType]
  if (cb) {
    score += cb
    if (cb > 0) reasons.push(`Learned preference: ${cuisineType}`)
  }

  // Protein boost
  const pb = boosts.proteinBoost[proteinType]
  if (pb) {
    score += pb
    if (pb > 0) reasons.push(`Preferred protein: ${proteinType}`)
  }

  // Tag boost
  for (const tag of tags) {
    const tb = boosts.tagBoost[tag]
    if (tb) score += tb
  }

  // Difficulty match
  if (preferredDifficulty && difficulty === preferredDifficulty) {
    score += boosts.difficultyBoost
  }

  // Time range match
  if (preferredTimeRange && totalTime >= preferredTimeRange.min && totalTime <= preferredTimeRange.max) {
    score += boosts.timeBoost
  }

  return { score, reasons }
}
