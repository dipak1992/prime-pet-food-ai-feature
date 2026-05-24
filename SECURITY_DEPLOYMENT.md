# Secure Deployment Runbook

Use this before every production launch or domain change.

## Required Vercel Environment Variables

Set production values in Vercel Project Settings, not in code:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `APP_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_AUTH_CAPTCHA_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- `UNSUBSCRIBE_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`
- `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

Only `NEXT_PUBLIC_*` values are allowed to reach the browser. Never add service
role keys, webhook secrets, AI keys, email keys, Stripe secret keys, or Upstash
tokens with a `NEXT_PUBLIC_` prefix.

## HTTPS And Trusted Origins

The app enforces HTTPS redirects in production middleware and sends HSTS:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` includes `upgrade-insecure-requests`
- API CORS is credentialed only for trusted origins

Production `APP_ALLOWED_ORIGINS` should be:

```text
https://mealeaseai.com,https://www.mealeaseai.com
```

Add a preview origin only when you intentionally need browser API calls from a
preview deployment, then remove it after testing.

## Supabase Database Network Controls

Direct PostgreSQL access cannot be restricted from the Next.js repository. Lock
it in Supabase:

1. Open Supabase Dashboard.
2. Go to Project Settings -> Database -> Network Restrictions.
3. Deny public direct database access where your plan supports it.
4. Allow only trusted operational IPs for direct database administration.
5. Prefer Supabase client APIs plus RLS for the application path.
6. Keep `SUPABASE_SERVICE_ROLE_KEY` only in Vercel server-side environment scope.
7. Rotate the database password and service role key after any accidental paste
   into tickets, logs, screenshots, or local shared files.

If static egress IPs are unavailable for the hosting tier, keep direct database
credentials out of the application and use Supabase APIs/RLS as the public
boundary.

## Logging And Detection

Production logs are structured JSON through `lib/logger.ts`. Watch for:

- `security.rate_limited`
- `security.blocked_origin`
- `security.blocked_automation_user_agent`
- `security.suspicious_path`
- `security.http_redirect`
- `security.auth_otp_ip_rate_limited`
- `security.auth_otp_email_rate_limited`
- `security.auth_signup_ip_rate_limited`
- `security.auth_reset_ip_rate_limited`
- `security.auth_reset_email_rate_limited`
- `security.auth_callback_exchange_failed`
- `api.rate_limited`
- `api.error_response`

Create alerts in Vercel Log Drains or Sentry for bursts of blocked origins,
rate limits, auth callback failures, webhook signature failures, and 5xx API
errors.

## CORS Check

From an untrusted origin, browser requests to `/api/*` should receive `403`.
From the canonical domains, responses may include:

```text
Access-Control-Allow-Origin: https://mealeaseai.com
Access-Control-Allow-Credentials: true
Vary: Origin
```

Never use `Access-Control-Allow-Origin: *` on authenticated API routes.

## Abuse Protection

All `/api/*` routes are protected by middleware-level IP rate limits. Sensitive
routes have stricter buckets:

- Auth endpoints: login, signup, OAuth, password reset, and callback
- Payment endpoints: Stripe checkout, billing portal, Stripe webhook, trial start
- AI/cost endpoints: plan generation, meal regeneration, image analysis, scan,
  pantry vision, weekly plan, smart meal, and autopilot
- Public read endpoints: recipes and published content APIs

Production requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
Without Upstash, production API requests fail closed instead of allowing
unlimited abuse on serverless instances.
