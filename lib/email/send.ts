import { resend, EMAIL_FROM, EMAIL_REPLY_TO, EMAIL_ALERTS } from './client'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  replyTo?: string
  /** If true, skip logging to DB (e.g. admin-to-admin alerts) */
  skipLog?: boolean
  /** Idempotency key — prevents duplicate sends */
  idempotencyKey?: string
  /** Extra headers (e.g. List-Unsubscribe) */
  headers?: Record<string, string>
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 800

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Core send utility with retry logic and DB logging.
 */
export async function sendEmail(options: SendEmailOptions, attempt = 0): Promise<SendResult> {
  const { to, subject, react, replyTo, skipLog, idempotencyKey, headers } = options

  // Idempotency guard — check for a recent matching log
  if (idempotencyKey && !skipLog) {
    try {
      const supabase = createSupabaseServiceClient()
      const { data: existing } = await supabase
        .from('email_logs')
        .select('id, status')
        .eq('idempotency_key', idempotencyKey)
        .eq('status', 'sent')
        .maybeSingle()

      if (existing) {
        console.log(`[email] Duplicate suppressed — key: ${idempotencyKey}`)
        return { success: true, messageId: existing.id }
      }
    } catch {
      // Non-fatal — proceed with send
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo: replyTo ?? EMAIL_REPLY_TO,
      ...(headers ? { headers } : {}),
    })

    if (error) throw new Error(error.message)

    const messageId = data?.id ?? 'unknown'

    if (!skipLog) {
      await logEmail({
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        status: 'sent',
        messageId,
        idempotencyKey,
      })
    }

    return { success: true, messageId }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (attempt + 1))
      return sendEmail(options, attempt + 1)
    }

    // Log failure
    if (!skipLog) {
      await logEmail({
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        status: 'failed',
        error: errorMsg,
        idempotencyKey,
      })
    }

    // Alert admin of critical email failure (but don't recurse)
    await alertAdminEmailFailure(
      Array.isArray(to) ? to.join(', ') : to,
      subject,
      errorMsg,
    )

    return { success: false, error: errorMsg }
  }
}

// ─── DB Logging ────────────────────────────────────────────────────────────

async function logEmail(params: {
  to: string
  subject: string
  status: 'sent' | 'failed'
  messageId?: string
  error?: string
  idempotencyKey?: string
}) {
  try {
    const supabase = createSupabaseServiceClient()
    await supabase.from('email_logs').insert({
      recipient: params.to,
      subject: params.subject,
      status: params.status,
      resend_message_id: params.messageId,
      error_message: params.error,
      idempotency_key: params.idempotencyKey,
    })
  } catch (e) {
    console.error('[email] Failed to log email:', e)
  }
}

// ─── Admin failure alert (plain text, no retry loop) ─────────────────────

async function alertAdminEmailFailure(to: string, subject: string, error: string) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [EMAIL_ALERTS],
      subject: `[MealEase] Email delivery failure`,
      html: `<p><strong>Failed to deliver email</strong></p>
             <p><strong>To:</strong> ${to}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Error:</strong> ${error}</p>
             <p><em>Sent at ${new Date().toISOString()}</em></p>`,
    })
  } catch {
    // Swallow — avoid infinite loop
  }
}
