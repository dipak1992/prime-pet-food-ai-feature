import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateScanImageStrict } from '@/lib/scan/upload-validation'
import { analyzeFoodImage } from '@/lib/scan/openai-vision'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Food scans are unlimited for all users — no gating needed

  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null

    const imageError = await validateScanImageStrict(image)
    if (imageError) return imageError

    const result = await analyzeFoodImage(image!)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/scan/food]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
