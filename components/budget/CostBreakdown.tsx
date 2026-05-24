'use client'

import type { CategorySpend, IngredientCategory } from '@/lib/budget/types'

// ─── Category display config ──────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<IngredientCategory, { label: string; emoji: string; color: string }> = {
  produce: { label: 'Produce', emoji: '🥦', color: '#22c55e' },
  meat: { label: 'Meat', emoji: '🥩', color: '#ef4444' },
  seafood: { label: 'Seafood', emoji: '🐟', color: '#3b82f6' },
  dairy: { label: 'Dairy', emoji: '🧀', color: '#f59e0b' },
  grains: { label: 'Grains', emoji: '🌾', color: '#d97706' },
  pantry: { label: 'Pantry', emoji: '🫙', color: '#8b5cf6' },
  frozen: { label: 'Frozen', emoji: '🧊', color: '#06b6d4' },
  beverages: { label: 'Beverages', emoji: '🥤', color: '#ec4899' },
  other: { label: 'Other', emoji: '🛒', color: '#6b7280' },
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({ breakdown, total }: { breakdown: CategorySpend[]; total: number }) {
  const size = 120
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const segments = breakdown.reduce<Array<{ item: CategorySpend; dashArray: number; dashOffset: number }>>(
    (acc, item) => {
      const previousPercent = acc.reduce((sum, segment) => sum + segment.dashArray / circumference, 0)
      const pct = total > 0 ? item.amount / total : 0
      acc.push({
        item,
        dashArray: circumference * pct,
        dashOffset: circumference * (1 - previousPercent),
      })
      return acc
    },
    [],
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-neutral-100 dark:text-neutral-800"
      />

      {segments.map(({ item, dashArray, dashOffset }) => {
        const config = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.other

        return (
          <circle
            key={item.category}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashArray} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )
      })}

      {/* Center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-neutral-900 dark:fill-neutral-50"
        style={{ fontSize: 14, fontWeight: 700 }}
      >
        ${total.toFixed(0)}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        className="fill-neutral-500"
        style={{ fontSize: 9 }}
      >
        total
      </text>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  breakdown: CategorySpend[]
  total: number
}

export function CostBreakdown({ breakdown, total }: Props) {
  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-neutral-500 text-center py-4">
        No spending data yet this week.
      </p>
    )
  }

  return (
    <div className="flex items-start gap-5">
      {/* Donut chart */}
      <div className="flex-shrink-0">
        <DonutChart breakdown={breakdown} total={total} />
      </div>

      {/* Category list */}
      <div className="flex-1 space-y-2 min-w-0">
        {breakdown.map((item) => {
          const config = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.other
          return (
            <div key={item.category} className="flex items-center gap-2">
              <span className="text-sm">{config.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {config.label}
                  </span>
                  <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
