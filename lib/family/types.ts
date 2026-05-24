export type FamilyMemberRole = 'adult' | 'teen' | 'child' | 'toddler' | 'baby'
export type InviteStatus = 'none' | 'pending' | 'accepted' | 'revoked'
export type InviteRole = 'viewer' | 'editor'
export type WeightGoal = 'lose' | 'maintain' | 'gain' | 'build_muscle'

export interface FamilyMemberRecord {
  id: string
  household_id: string
  user_id: string
  member_name?: string
  first_name: string
  role: FamilyMemberRole
  age_years: number | null
  age_range: string | null
  dietary_type: string | null
  allergies_json: string[]
  foods_loved_json: string[]
  foods_disliked_json: string[]
  protein_preferences_json: string[]
  cuisine_likes_json: string[]
  spice_tolerance: 'none' | 'mild' | 'medium' | 'high' | null
  picky_eater_level: number
  portion_size: 'small' | 'medium' | 'large' | null
  school_lunch_needed: boolean
  snack_frequency: string | null
  texture_sensitivity: string | null
  foods_accepted_json: string[]
  foods_rejected_json: string[]
  allergy_notes: string | null
  notes: string | null
  is_primary_shopper: boolean
  is_primary_cook: boolean
  display_order: number
  // Future shared-login columns (migration 021)
  invited_email: string | null
  invited_user_id: string | null
  invite_status: InviteStatus
  invite_role: InviteRole
  // Personal nutrition goal
  weight_goal: WeightGoal | null
  created_at: string
  updated_at: string
}

export interface FamilyHouseholdSummary {
  totalMembers: number
  adults: number
  kids: number
  toddlers: number
  babies: number
  vegetarians: number
  pickyEaters: number
  nutFreeHousehold: boolean
  headline: string
  bullets: string[]
}

export interface FamilyEngineOverrides {
  household: {
    adultsCount: number
    kidsCount: number
    toddlersCount: number
    babiesCount: number
  }
  allergies: string[]
  dietaryRestrictions: string[]
  dislikedFoods: string[]
  preferredProteins: string[]
  cuisinePreferences: string[]
  pickyEater: {
    active: boolean
    dislikedFoods?: string[]
  }
  familyMode: {
    active: boolean
    guidance: string[]
  }
  memberCount: number
}
