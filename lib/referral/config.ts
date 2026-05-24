// ============================================================
// Referral reward configuration
// ============================================================

/** Extra planner days unlocked per successful referral (stacks, max 4 extra). */
export const REFERRAL_BONUS_DAYS_PER_INVITE = 1

/** Maximum bonus days earnable through referrals. */
export const REFERRAL_MAX_BONUS_DAYS = 4

/** Number of referrals needed to earn a Temp Pro grant. */
export const REFERRAL_TEMP_PRO_THRESHOLD = 3

/** Duration of each Temp Pro grant in days. */
export const REFERRAL_TEMP_PRO_DAYS = 7

/** Product-led unlock copy used by the referral page and growth dashboard. */
export const REFERRAL_REWARDS = [
  {
    referrals: 1,
    label: 'Plus trial days',
    description: 'Invite 1 friend to unlock extra planning days.',
  },
  {
    referrals: 3,
    label: 'Smart Menu Scan',
    description: 'Invite 3 friends to unlock a premium scan milestone.',
  },
] as const
