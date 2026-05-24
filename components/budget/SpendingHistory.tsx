'use client'

import type { SpendingHistoryWeek } from '@/lib/budget/types'

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  history: SpendingHistoryWeek[]
  weeklyLimit: number | null
}

export function SpendingHistory({ history, weeklyLimit }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-neutral-500 text-center py-4">
        No spending history yet.
      </p>
    )
  }

  // Show up to 8 weeks, most recent last
  const weeks = [...history].slice(-8)
  const maxSpent = Math.max(...weeks.map((w) => Math.max(w.spent, w.estimated)), weeklyLimit ?? 0, 1)

  const chartHeight = 80
  const barWidth = 24
  const gap = 8
  const totalWidth = weeks.length * (barWidth + gap) - gap

  function formatWeekLabel(weekStart: string): string {
    const d = new Date(weekStart)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={chartHeight + 28}
        viewBox={`0 0 ${totalWidth} ${chartHeight + 28}`}
        aria-label="Weekly spending history"
        role="img"
        className="min-w-full"
      >
        {/* Budget limit line */}
        {weeklyLimit != null && (
          <>
            <line
              x1={0}
              y1={chartHeight - (weeklyLimit / maxSpent) * chartHeight}
              x2={totalWidth}
              y2={chartHeight - (weeklyLimit / maxSpent) * chartHeight}
              stroke="#D97757"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            <text
              x={totalWidth - 2}
              y={chartHeight - (weeklyLimit / maxSpent) * chartHeight - 3}
              textAnchor="end"
              style={{ fontSize: 8, fill: '#D97757' }}
            >
              limit
            </text>
          </>
        )}

        {weeks.map((week, i) => {
          const x = i * (barWidth + gap)
          const spentH = Math.max((week.spent / maxSpent) * chartHeight, 2)
          const estimatedH = week.estimated > 0
            ? Math.max((week.estimated / maxSpent) * chartHeight, 2)
            : 0

          const isOver = weeklyLimit != null && week.spent > weeklyLimit
          const barColor = isOver ? '#ef4444' : '#22c55e'

          return (
            <g key={week.weekStart}>
              {/* Estimated bar (lighter, behind) */}
              {estimatedH > 0 && (
                <rect
                  x={x}
                  y={chartHeight - estimatedH}
                  width={barWidth}
                  height={estimatedH}
                  rx={4}
                  fill="#D97757"
                  opacity={0.2}
                />
              )}

              {/* Actual spend bar */}
              <rect
                x={x}
                y={chartHeight - spentH}
                width={barWidth}
                height={spentH}
                rx={4}
                fill={barColor}
                opacity={0.85}
              />

              {/* Week label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                style={{ fontSize: 9, fill: '#9ca3af' }}
              >
                {formatWeekLabel(week.weekStart)}
              </text>

              {/* Amount label on top */}
              {week.spent > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - spentH - 3}
                  textAnchor="middle"
                  style={{ fontSize: 8, fill: '#6b7280' }}
                >
                  ${week.spent.toFixed(0)}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-85" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#D97757] opacity-20" />
          <span>Estimated</span>
        </div>
        {weeklyLimit != null && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-t border-dashed border-[#D97757]" />
            <span>Limit</span>
          </div>
        )}
      </div>
    </div>
  )
}
