import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContactPayload, ContactTopic } from '@/lib/contact/types'
import { alertAdminContactForm, sendSupportConfirmationEmail } from '@/lib/email/triggers'
import { rateLimit, rateLimitKeyFromRequest } from '@/lib/rate-limit'
import { apiRateLimited } from '@/lib/api-response'

export const runtime = 'nodejs'

const VALID_TOPICS: ContactTopic[] = [
  'general',
  'support',
  'billing',
  'partnership',
  'press',
  'feedback',
]

export async function POST(req: NextRequest) {
  // 5 messages per hour per IP — backed by Upstash Redis in production (survives cold starts)
  const rl = await rateLimit({ key: rateLimitKeyFromRequest(req), limit: 5, windowMs: 60 * 60 * 1000 })
  if (!rl.success) return apiRateLimited(rl.reset)

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const body = (await req.json().catch(() => ({}))) as Partial<ContactPayload>
  const { name, email, topic, message } = body

  // Validation
  if (!name || name.trim().length < 1) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!topic || !VALID_TOPICS.includes(topic as ContactTopic)) {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
  }
  if (!message || message.trim().length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: 'Message must be 10–2000 characters' },
      { status: 400 }
    )
  }

  // Store to Supabase
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('contact_messages').insert({
    user_id: user?.id ?? null,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    topic,
    message: message.trim(),
    ip,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  if (error) {
    console.error('[contact] insert failed:', error)
    return NextResponse.json(
      { error: "Couldn't save. Please email hello@mealeaseai.com instead." },
      { status: 500 }
    )
  }

  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()
  const cleanMessage = message.trim()

  void sendSupportConfirmationEmail({
    to: cleanEmail,
    firstName: cleanName.split(' ')[0],
  })

  void alertAdminContactForm({
    senderEmail: cleanEmail,
    senderName: cleanName,
    message: `[${topic}] ${cleanMessage}`,
  })

  return NextResponse.json({ ok: true })
}
