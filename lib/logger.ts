/**
 * Structured JSON logger — Vercel-compatible (writes to stdout/stderr).
 * Every log line is a single JSON object for easy ingestion by log aggregators.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogPayload {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  [key: string]: unknown
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  const line = JSON.stringify(payload)

  if (level === 'error' || level === 'warn') {
    console.error(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write('debug', message, meta),
  info:  (message: string, meta?: Record<string, unknown>) => write('info',  message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => write('warn',  message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
}

export default logger
