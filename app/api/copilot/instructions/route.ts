import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clearWeeklyInstructions, loadActiveWeeklyInstructions } from '@/lib/copilot/weekly-instructions'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ instructions: [] }, { status: 401 })
  }

  const instructions = await loadActiveWeeklyInstructions(supabase, user.id).catch(() => [])
  return NextResponse.json({ instructions })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { value } = await req.json().catch(() => ({ value: undefined }))
  const cleared = await clearWeeklyInstructions(
    supabase,
    user.id,
    typeof value === 'string' ? value : undefined,
  )
  return NextResponse.json({ success: true, cleared })
}
