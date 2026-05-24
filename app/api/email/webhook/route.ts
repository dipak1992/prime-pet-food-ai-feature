import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { resend, EMAIL_ALERTS, EMAIL_FROM } from '@/lib/email/client'

// Resend sends a `svix-signature` header for verification
// https://resend.com/docs/dashboard/webhooks/introduction

interface ResendWebhookPayload {
  type: string
  created_at: string
  data: {
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
    bounce?: { message: string }
    complaint?: { userAgent: string }
    [key: string]: unknown
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // ── Signature verification ───────────────────────────────────────────────
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('svix-signature')
    const msgId = request.headers.get('svix-id')
    const msgTs = request.headers.get('svix-timestamp')

    if (!signature || !msgId || !msgTs) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    try {
      const { Webhook } = await import('svix')
      const wh = new Webhook(webhookSecret)
      wh.verify(rawBody, {
        'svix-id': msgId,
        'svix-timestamp': msgTs,
        'svix-signature': signature,
      })
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: ResendWebhookPayload
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, data } = payload
  const emailId = data?.email_id
  const recipient = data?.to?.[0] ?? 'unknown'

  // ── Idempotency — skip duplicate events ──────────────────────────────────
  const supabase = createSupabaseServiceClient()

  const resendEventId = request.headers.get('svix-id')
  if (resendEventId) {
    const { data: existing } = await supabase
      .from('email_webhook_events')
      .select('id')
      .eq('resend_event_id', resendEventId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true })
    }
  }

  // ── Store event ──────────────────────────────────────────────────────────
  await supabase.from('email_webhook_events').insert({
    resend_event_id: resendEventId,
    event_type: type,
    email_id: emailId,
    recipient,
    payload,
  })

  // ── Update email_logs if we have a resend message ID ─────────────────────
  if (emailId) {
    if (type === 'email.bounced') {
      await supabase
        .from('email_logs')
        .update({ status: 'bounced' })
        .eq('resend_message_id', emailId)
    } else if (type === 'email.complained') {
      await supabase
        .from('email_logs')
        .update({ status: 'complained' })
        .eq('resend_message_id', emailId)
    } else if (type === 'email.failed') {
      await supabase
        .from('email_logs')
        .update({ status: 'failed' })
        .eq('resend_message_id', emailId)
    }
  }

  if (type === 'email.bounced' || type === 'email.complained') {
    const userId = await findUserIdByEmail(supabase, recipient)
    if (userId) {
      await supabase
        .from('notification_preferences')
        .update({
          dinner_reminders: false,
          weekly_reminders: false,
          referral_emails: false,
          product_updates: false,
        })
        .eq('user_id', userId)
    }
  }

  // ── Alert admin on critical events ───────────────────────────────────────
  if (type === 'email.bounced' || type === 'email.complained' || type === 'email.failed') {
    const label = type === 'email.bounced'
      ? 'Bounce'
      : type === 'email.complained'
        ? 'Spam complaint'
        : 'Delivery failure'

    const reason =
      data.bounce?.message ?? data.complaint?.userAgent ?? 'No detail provided'
    const safeLabel = escapeHtml(label)
    const safeEmailId = escapeHtml(emailId ?? 'N/A')
    const safeRecipient = escapeHtml(recipient)
    const safeReason = escapeHtml(reason)
    const safeType = escapeHtml(type)

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [EMAIL_ALERTS],
        subject: `[MealEase] ⚠️ ${label} — ${recipient}`,
        html: `
          <p><strong>${safeLabel}</strong></p>
          <p><strong>Email ID:</strong> ${safeEmailId}</p>
          <p><strong>Recipient:</strong> ${safeRecipient}</p>
          <p><strong>Reason:</strong> ${safeReason}</p>
          <p><strong>Event type:</strong> ${safeType}</p>
          <p><em>${new Date().toISOString()}</em></p>
        `,
      })
    } catch {
      // Non-fatal — best effort
    }
  }

  return NextResponse.json({ ok: true })
}

async function findUserIdByEmail(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  email: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  const row = data as { id?: string } | null
  return row?.id ?? null
}
