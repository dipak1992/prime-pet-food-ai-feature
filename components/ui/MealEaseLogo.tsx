import { cn } from '@/lib/utils'

interface MealEaseLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  /** Show the small "AI" badge next to the text */
  showBadge?: boolean
  /** Force white text (e.g. on dark/photo backgrounds) */
  invertText?: boolean
}

const sizeMap = {
  sm: { icon: 28, text: 'text-[15px]', gap: 'gap-1.5' },
  md: { icon: 34, text: 'text-[18px]', gap: 'gap-2' },
  lg: { icon: 42, text: 'text-[22px]', gap: 'gap-2.5' },
  xl: { icon: 56, text: 'text-[28px]', gap: 'gap-3' },
}

export function MealEaseLogo({
  className,
  size = 'md',
  showText = true,
  showBadge = false,
  invertText = false,
}: MealEaseLogoProps) {
  const bgId = 'me-logo-bg'
  const leafId = 'me-logo-leaf'
  const bowlId = 'me-logo-bowl'
  const clipId = 'me-logo-clip'
  const { icon, text, gap } = sizeMap[size]

  return (
    <span className={cn('inline-flex items-center font-bold select-none', gap, className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={bgId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="58%" stopColor="#063F32" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>
          <linearGradient id={leafId} x1="16" y1="15" x2="25" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id={bowlId} x1="7" y1="22" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDF8EA" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="1.5" y="1.5" width="37" height="37" rx="9" />
          </clipPath>
        </defs>

        <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill={`url(#${bgId})`} />

        <g clipPath={`url(#${clipId})`}>
          <path
            d="M-5 14C2 8 8 8 14 10c4 1 7 1 11-3 4-3 8-4 14-2"
            stroke="#2DD4BF"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.18"
          />
          <path
            d="M-4 25c5-5 11-6 17-3 6 3 9 2 14-3 5-4 11-3 17 1"
            stroke="#2DD4BF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.16"
          />
          <path
            d="M0 36c5-6 12-7 20-3 7 3 12 2 20-4"
            stroke="#2DD4BF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.14"
          />

          <path
            d="M8 22.5c3.8 6.1 20.2 6.1 24 0"
            stroke={`url(#${bowlId})`}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M6.6 25.8c5.2 8.2 21.6 8.2 26.8 0"
            stroke="#10B981"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M10.1 30.1c5.1 4.4 14.9 4.4 19.8 0"
            stroke="#34D399"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M19.3 25.5c-2.6-6.2 1.5-11 5.6-11.7 2.8 4.4 2.6 10.4-3.6 13.5"
            fill={`url(#${leafId})`}
          />
          <path
            d="M21.1 26.5c-.7-3.8.5-7 3.8-10.4"
            stroke="#064E3B"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.7"
          />

          <path
            d="M14.4 16.2c2.1 1.4 3 3.1 3.7 5-2.5-.7-4.2-1.8-5.2-3.7-.4-.8.7-1.8 1.5-1.3Z"
            fill="#F59E0B"
          />
          <path
            d="M20 13.2c1.2 2.3 1.1 4.3 0 6.6-1.1-2.3-1.2-4.3 0-6.6Z"
            fill="#F59E0B"
          />
          <path
            d="M25.6 16.2c-2.1 1.4-3 3.1-3.7 5 2.5-.7 4.2-1.8 5.2-3.7.4-.8-.7-1.8-1.5-1.3Z"
            fill="#F59E0B"
          />
        </g>

        <rect x="1.5" y="1.5" width="37" height="37" rx="9" stroke="white" strokeOpacity="0.14" />
      </svg>

      {showText && (
        <span className={cn('leading-none', text)}>
          <span style={{ color: invertText ? 'white' : '#1F2937' }}>Meal</span>
          <span style={{ color: invertText ? '#34D399' : '#059669' }}>Ease</span>

          {showBadge && (
            <sup
              className="ml-0.5 inline-flex items-center rounded px-[3px] py-px text-[8px] font-bold leading-none border align-super"
              style={{
                background: 'rgba(16,185,129,0.1)',
                color: invertText ? '#A7F3D0' : '#047857',
                borderColor: 'rgba(16,185,129,0.25)',
              }}
            >
              AI
            </sup>
          )}
        </span>
      )}
    </span>
  )
}
