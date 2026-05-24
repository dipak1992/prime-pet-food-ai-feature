/**
 * Tonight Module — Public API
 * 
 * Unified Tonight meal suggestion system for MealEase.
 * Serves both landing page (conversion) and dashboard (retention).
 */

export { getLandingTonightMeal } from './engine'
export { getFreeTonightSuggestion, getPlusTonightSuggestion, getSwapSuggestion, regenerateTonight } from './engine'
export { TONIGHT_CATALOG, WEEKDAY_THEMES, getMealImage, getMealsByTheme, getTodayTheme } from './catalog'
export { trackTonightEvent } from './analytics'
export type { LandingTonightMeal } from './engine'
export type { CuratedMeal, MealCategory, WeekdayTheme } from './catalog'
