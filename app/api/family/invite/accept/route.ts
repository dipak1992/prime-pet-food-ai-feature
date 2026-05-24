import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/family/invite/accept?code=xxx — Validate an invite code (public)
 * Returns invite info without requiring auth
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code || code.length < 8) {
    return NextResponse.json({ valid: false, error: 'Invalid invite code' })
  }

  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('co_chef_invites')
    .select('id, household_id, inviter_id, invite_role, status')
    .eq('invite_code', code)
    .single()

  if (!invite || invite.status !== 'pending') {
    return NextResponse.json({ valid: false, error: 'Invite expired or already used' })
  }

  // Get household name
  const { data: household } = await supabase
    .from('households')
    .select('name')
    .eq('id', invite.household_id)
    .single()

  // Get inviter name
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', invite.inviter_id)
    .single()

  return NextResponse.json({
    valid: true,
    householdName: household?.name || 'A household',
    inviterName: inviterProfile?.display_name || inviterProfile?.email?.split('@')[0] || null,
    role: invite.invite_role,
  })
}

/**
 * POST /api/family/invite/accept — Accept an invite (requires auth)
 * Body: { code: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Please sign in to accept this invite' },
      { status: 401 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const code = typeof body.code === 'string' ? body.code.trim() : ''

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing invite code' }, { status: 400 })
  }

  // Find the invite
  const { data: invite } = await supabase
    .from('co_chef_invites')
    .select('*')
    .eq('invite_code', code)
    .eq('status', 'pending')
    .single()

  if (!invite) {
    return NextResponse.json({ success: false, error: 'Invite not found or already used' })
  }

  // Don't allow self-invite
  if (invite.inviter_id === user.id) {
    return NextResponse.json({ success: false, error: 'You cannot accept your own invite' })
  }

  // Check if user is already in this household
  const { data: existingMember } = await supabase
    .from('family_members')
    .select('id')
    .eq('household_id', invite.household_id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    // Mark invite as accepted anyway
    await supabase
      .from('co_chef_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), accepted_by: user.id })
      .eq('id', invite.id)

    return NextResponse.json({ success: true, alreadyMember: true })
  }

  // Get current member count for display_order
  const { count } = await supabase
    .from('family_members')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', invite.household_id)

  // Add user as a family member
  const { error: memberError } = await supabase.from('family_members').insert({
    id: crypto.randomUUID(),
    household_id: invite.household_id,
    user_id: user.id,
    first_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Co-Chef',
    role: 'adult',
    display_order: (count ?? 0),
    invited_email: invite.invited_email,
    invited_user_id: user.id,
    invite_status: 'accepted',
    invite_role: invite.invite_role,
    picky_eater_level: 0,
    portion_size: 'medium',
    is_primary_cook: false,
    is_primary_shopper: false,
    school_lunch_needed: false,
    allergies_json: [],
    foods_loved_json: [],
    foods_disliked_json: [],
    protein_preferences_json: [],
    cuisine_likes_json: [],
    foods_accepted_json: [],
    foods_rejected_json: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (memberError) {
    console.error('[invite/accept] Member insert error:', memberError)
    return NextResponse.json({ success: false, error: 'Failed to join household' }, { status: 500 })
  }

  // Mark invite as accepted
  await supabase
    .from('co_chef_invites')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq('id', invite.id)

  return NextResponse.json({ success: true })
}
