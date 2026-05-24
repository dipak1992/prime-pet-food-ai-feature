import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const code = await getOrCreateReferralCode(user.id)
  const stats = await getReferralStats(user.id)

  return NextResponse.json({ ...stats, code })
}
