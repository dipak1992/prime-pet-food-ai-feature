import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementScanUsage } from '@/lib/scan/gating'
import { validateScanImageStrict } from '@/lib/scan/upload-validation'
import { analyzeMenuImage } from '@/lib/scan/openai-vision'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check plan for gating
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const isPlusMember = profile?.subscription_tier === 'plus' || profile?.subscription_tier === 'pro'

  // Gate check (3 menu scans/month for free users)
  const gateReason = await checkAndIncrementScanUsage(user.id, 'menu', isPlusMember)
  if (gateReason) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', reason: gateReason },
      { status: 429 }
    )
  }

  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null

    const imageError = await validateScanImageStrict(image)
    if (imageError) return imageError

    const result = await analyzeMenuImage(image!)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/scan/menu]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
