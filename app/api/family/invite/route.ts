import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cleanString, validationError } from '@/lib/validation/input'
import { ensureHousehold } from '@/lib/family/service'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email().max(254).optional(),
  role: z.enum(['viewer', 'editor']).default('editor'),
  firstName: cleanString(80).optional(),
}).strict()

/**
 * POST /api/family/invite — Generate a co-chef invite link
 * Body: { email?: string, role?: 'viewer' | 'editor', firstName?: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = inviteSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })

  const household = await ensureHousehold(supabase as any, user.id)
  const token = randomBytes(24).toString('base64url')
  const email = parsed.data.email?.toLowerCase() || null
  const role = parsed.data.role

  // Check existing pending invite for this email
  if (email) {
    const { data: existing } = await supabase
      .from('co_chef_invites')
      .select('*')
      .eq('household_id', household.id)
      .eq('invited_email', email)
      .eq('status', 'pending')
      .single()

    if (existing) {
      const origin = req.headers.get('origin') || ''
      return NextResponse.json({
        ok: true,
        inviteCode: existing.invite_code,
        inviteLink: `${origin}/invite/${existing.invite_code}`,
        invitedEmail: email,
        alreadyExists: true,
        householdName: household.name,
      })
    }
  }

  // Generate invite code
  const inviteCode = token.slice(0, 12)

  // Insert into co_chef_invites table
  const { error } = await supabase.from('co_chef_invites').insert({
    id: crypto.randomUUID(),
    household_id: household.id,
    inviter_id: user.id,
    invited_email: email,
    invite_code: inviteCode,
    invite_role: role,
    status: 'pending',
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[family/invite] insert failed', error.message)
    return NextResponse.json({ error: 'Unable to create invite' }, { status: 500 })
  }

  // Also add a placeholder member row for tracking
  if (email) {
    await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: user.id,
        first_name: parsed.data.firstName || email.split('@')[0],
        member_name: parsed.data.firstName || email.split('@')[0],
        role: 'adult',
        invited_email: email,
        invite_status: 'pending',
        invite_role: role,
        display_order: 99,
      })
  }

  const origin = req.headers.get('origin') || ''

  return NextResponse.json({
    ok: true,
    inviteCode,
    inviteLink: `${origin}/invite/${inviteCode}`,
    invitedEmail: email,
    householdName: household.name,
    reward: 'When your co-chef joins, both accounts are eligible for one free Plus month.',
  })
}

/**
 * GET /api/family/invite — List pending invites for current user's household
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const household = await ensureHousehold(supabase as any, user.id)

  const { data: invites } = await supabase
    .from('co_chef_invites')
    .select('id, invite_code, invited_email, invite_role, status, created_at')
    .eq('household_id', household.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ invites: invites ?? [] })
}
