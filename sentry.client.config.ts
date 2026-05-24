import * as Sentry from '@sentry/nextjs'

const sensitiveReplayRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/pricing',
  '/upgrade',
  '/settings',
]
const path = typeof window === 'undefined' ? '' : window.location.pathname
const replayDisabled = sensitiveReplayRoutes.some((route) => path.startsWith(route))

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Replay for session debugging (browser only)
  replaysSessionSampleRate: replayDisabled ? 0 : 0.05,
  replaysOnErrorSampleRate: replayDisabled ? 0 : 1.0,

  integrations: replayDisabled
    ? []
    : [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
})
