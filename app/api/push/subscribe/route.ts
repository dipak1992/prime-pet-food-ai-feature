import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type PushSubscriptionPayload = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

function validatePayload(body: unknown): body is PushSubscriptionPayload {
  if (!body || typeof body !== 'object') return false

  const payload = body as PushSubscriptionPayload
  return Boolean(
    payload.endpoint
    && payload.keys
    && payload.keys.p256dh
    && payload.keys.auth,
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!validatePayload(body)) {
    return NextResponse.json({ error: 'Invalid push subscription payload' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        user_agent: req.headers.get('user-agent') ?? null,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to store push subscription' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object' || !('endpoint' in body)) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  const endpoint = String((body as { endpoint: string }).endpoint)

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete push subscription' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
