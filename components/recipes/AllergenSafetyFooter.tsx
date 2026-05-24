import { AlertTriangle, ShieldCheck, Info } from 'lucide-react'
import type { SmartVariation } from '@/lib/engine/types'

interface AllergenSafetyFooterProps {
  /** Allergen warnings from variations or direct meal data */
  allergyWarnings?: string[]
  /** Variations that may contain per-member allergen info */
  variations?: SmartVariation[]
  /** Optional: user's household allergens for personalized messaging */
  householdAllergens?: string[]
  /** Compact mode for inline use (e.g., in cards) */
  compact?: boolean
}

/**
 * Dynamic allergen safety footer shown at the bottom of recipe/meal pages.
 * Aggregates allergen warnings, displays safety disclaimers, and builds trust
 * by showing MealEase takes food safety seriously.
 */
export function AllergenSafetyFooter({
  allergyWarnings = [],
  variations = [],
  householdAllergens = [],
  compact = false,
}: AllergenSafetyFooterProps) {
  // Aggregate all allergen warnings from variations
  const variationWarnings = variations.flatMap((v) => v.allergyWarnings ?? [])
  const allWarnings = [...new Set([...allergyWarnings, ...variationWarnings])].filter(Boolean)

  // Determine safety level
  const hasWarnings = allWarnings.length > 0
  const hasHouseholdConflict = householdAllergens.length > 0 && allWarnings.some((w) =>
    householdAllergens.some((a) => w.toLowerCase().includes(a.toLowerCase()))
  )

  if (compact) {
    return (
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 p-3 mt-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Always verify ingredients against your household&apos;s allergies. MealEase filters known allergens but cannot guarantee safety for severe allergies.
          </p>
        </div>
      </div>
    )
  }

  return (
    <footer className="mt-8 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-800/40 p-5 md:p-6" role="contentinfo" aria-label="Allergen safety information">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
          Allergen &amp; Safety Information
        </h3>
      </div>

      {/* Allergen warnings list */}
      {hasWarnings && (
        <div className="mb-4 space-y-1.5">
          {allWarnings.map((warning, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                hasHouseholdConflict && householdAllergens.some((a) => warning.toLowerCase().includes(a.toLowerCase()))
                  ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                  : 'bg-white/70 dark:bg-neutral-900/50 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/30'
              }`}
            >
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Household conflict alert */}
      {hasHouseholdConflict && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              ⚠️ Household allergen conflict detected
            </p>
            <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
              This recipe may contain allergens that conflict with your household profiles. Please review carefully before serving.
            </p>
          </div>
        </div>
      )}

      {/* No warnings — positive safety signal */}
      {!hasWarnings && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              No common allergen warnings detected
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              This recipe passed our allergen screening. Always verify ingredients if you have severe allergies.
            </p>
          </div>
        </div>
      )}

      {/* Safety disclaimer */}
      <div className="border-t border-amber-200/50 dark:border-amber-800/30 pt-3 mt-3">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-amber-600/70 dark:text-amber-500/70 mt-0.5 shrink-0" />
          <div className="space-y-1.5">
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              <span className="font-semibold">How MealEase handles allergens:</span> Our AI filters recipes based on your household&apos;s allergy profiles, checking ingredients against a database of 200+ allergen triggers and cross-contamination sources.
            </p>
            <p className="text-[11px] text-amber-700/60 dark:text-amber-400/60 leading-relaxed">
              <span className="font-semibold">Important:</span> MealEase is a meal planning assistant, not a medical device. For severe or life-threatening allergies, always verify ingredient labels and consult your allergist. We cannot guarantee the absence of trace allergens from manufacturing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
