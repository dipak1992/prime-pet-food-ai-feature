import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateScanImageStrict } from '@/lib/scan/upload-validation'
import { classifyScanImage } from '@/lib/scan/openai-vision'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null
    const rawMode = formData.get('mode')
    const mode = rawMode === 'fridge' || rawMode === 'menu' || rawMode === 'food' ? rawMode : 'auto'

    const imageError = await validateScanImageStrict(image)
    if (imageError) return imageError

    const result = await classifyScanImage(image!, mode)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/scan/classify]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
