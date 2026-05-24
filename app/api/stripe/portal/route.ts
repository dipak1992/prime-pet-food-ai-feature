import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/seo'
import { stripe } from '@/lib/stripe/client'

// ─── POST /api/stripe/portal ──────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
    }

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      'https://mealeaseai.com',
      'https://www.mealeaseai.com',
      'http://localhost:3000',
    ].filter(Boolean) as string[]
    const rawOrigin = req.headers.get('origin') ?? ''
    const origin = allowedOrigins.includes(rawOrigin)
      ? rawOrigin.replace(/\/$/, '')
      : getSiteUrl().replace(/\/$/, '')

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
