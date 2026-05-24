'use client'

// PostHog is initialized via instrumentation-client.ts (Next.js 15.3+ approach).
// We intentionally do NOT use PHProvider from posthog-js/react here because
// it causes React #185 (Maximum update depth exceeded) in React 19.
// Components that need posthog can import it directly: import posthog from 'posthog-js'
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
