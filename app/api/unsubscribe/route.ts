import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

/**
 * GET /api/unsubscribe?token=<userId>.<hmac>
 *
 * One-click unsubscribe — disables all reminder notifications.
 * Returns a simple HTML page confirming the action.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(html('Invalid link', 'The unsubscribe link is missing or malformed.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const userId = verifyUnsubscribeToken(token)

  if (!userId) {
    return new NextResponse(html('Invalid link', 'This unsubscribe link is invalid or has expired.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabase = createSupabaseServiceClient()

  // Disable all reminder preferences
  await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        dinner_reminders: false,
        weekly_reminders: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  // Also disable reminder schedules
  await supabase
    .from('reminder_schedules')
    .update({ dinner_enabled: false, weekly_enabled: false })
    .eq('user_id', userId)

  return new NextResponse(
    html('Unsubscribed', 'You have been unsubscribed from MealEase reminder emails. You can re-enable notifications anytime in your account settings.'),
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}

function html(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — MealEase</title>
<style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#faf9f7;color:#1a1a1a}
.card{max-width:420px;padding:2rem;text-align:center;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08)}</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`
}
